import React, { useState, useRef, useEffect } from "react";
import BlockDialog from "./BlockDialog";

const BaseBlock = ({
  id,
  x,
  y,
  onDrag,
  onPortClick,
  onUpdate,
  children,
  config,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const blockRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        e.preventDefault();
        e.stopPropagation();

        // Get SVG container and its transforms
        const svg = blockRef.current.closest("svg");
        const svgRect = svg.getBoundingClientRect();
        const containerGroup = svg.querySelector("g");
        const transform = containerGroup.transform.baseVal.getItem(0);
        const matrix = transform.matrix;

        // Calculate new position in SVG space
        const mouseX = e.clientX - svgRect.left;
        const mouseY = e.clientY - svgRect.top;
        const svgX = (mouseX - matrix.e) / matrix.a;
        const svgY = (mouseY - matrix.f) / matrix.d;

        // Calculate delta from start position
        const dx = svgX - startPos.x;

        // Apply the movement
        const newX = Math.round((x + dx) / 20) * 20;
        const newY = Math.round((y + (svgY - startPos.y)) / 20) * 20;

        // Update start position for next movement
        setStartPos({ x: svgX, y: svgY });

        onDrag(id, newX, newY);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      }
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, id, x, y, startPos, onDrag]);

  const handleMouseDown = (e) => {
    if (e.button === 0 && e.target.tagName !== "circle") {
      e.stopPropagation();

      // Get SVG container and its transforms
      const svg = blockRef.current.closest("svg");
      const svgRect = svg.getBoundingClientRect();
      const containerGroup = svg.querySelector("g");
      const transform = containerGroup.transform.baseVal.getItem(0);
      const matrix = transform.matrix;

      // Calculate start position in SVG space
      const mouseX = e.clientX - svgRect.left;
      const mouseY = e.clientY - svgRect.top;

      setStartPos({
        x: (mouseX - matrix.e) / matrix.a,
        y: (mouseY - matrix.f) / matrix.d,
      });

      setIsDragging(true);
    }
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    setIsDialogOpen(true);
  };

  const handleBlockUpdate = (updates) => {
    onUpdate(id, updates);
    setIsDialogOpen(false);
  };

  const blockWidth = 120;
  const blockHeight =
    Math.max(
      Object.keys(config.ports.inputs).length,
      Object.keys(config.ports.outputs).length
    ) *
      30 +
    40;

  return (
    <>
      <g
        ref={blockRef}
        transform={`translate(${x},${y})`}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        {/* Block body */}
        <rect
          x="0"
          y="0"
          width={blockWidth}
          height={blockHeight}
          fill={isDragging ? "rgb(180, 180, 255)" : "rgb(200, 200, 255)"}
          stroke="black"
        />

        {/* Block name */}
        <text x="10" y="20" fontWeight="bold">
          {config.name}
        </text>

        {/* Input ports */}
        {Object.entries(config.ports.inputs).map(([name, port], i) => (
          <g key={`in-${name}`} transform={`translate(0,${40 + i * 30})`}>
            <circle
              cx="0"
              cy="0"
              r="5"
              fill="black"
              onClick={(e) => {
                e.stopPropagation();
                onPortClick(id, name, "input");
              }}
              className="cursor-pointer hover:fill-red-500"
            />
            <text x="15" y="5">{`${name} [${port.width - 1}:0]${
              port.signed ? " (s)" : ""
            }`}</text>
          </g>
        ))}

        {/* Output ports */}
        {Object.entries(config.ports.outputs).map(([name, port], i) => (
          <g
            key={`out-${name}`}
            transform={`translate(${blockWidth},${40 + i * 30})`}
          >
            <circle
              cx="0"
              cy="0"
              r="5"
              fill="black"
              onClick={(e) => {
                e.stopPropagation();
                onPortClick(id, name, "output");
              }}
              className="cursor-pointer hover:fill-red-500"
            />
            <text x="-15" y="5" textAnchor="end">{`${name} [${
              port.width - 1
            }:0]${port.signed ? " (s)" : ""}`}</text>
          </g>
        ))}

        {children}
      </g>

      <BlockDialog
        block={{ id, x, y, params: {} }}
        config={config}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onUpdate={handleBlockUpdate}
      />
    </>
  );
};

export default BaseBlock;
