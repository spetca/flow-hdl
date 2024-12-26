import React, { useState, useEffect } from "react";
import registry from "./blockHelpers/BlockRegistry.jsx";

const BlockLibrary = ({ isOpen, onToggle }) => {
  const [width, setWidth] = useState(20); // Default to 20% of viewport
  const [isDragging, setIsDragging] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log("BlockLibrary mounted, registry:", registry);
  }, []);

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData("application/json", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;

      const newWidth = (e.clientX / window.innerWidth) * 100;
      setWidth(Math.min(Math.max(newWidth, 15), 40));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  if (!isOpen) return null;

  return (
    <>
      {isDragging && <div className="fixed inset-0 z-20 cursor-col-resize" />}

      <div
        className="fixed top-12 right-0 bottom-0 bg-white shadow-lg flex flex-col z-20"
        style={{ width: `${width}%` }}
      >
        {/* Drag handle */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-black/20 group"
          onMouseDown={() => setIsDragging(true)}
        >
          <div className="absolute left-0 top-0 bottom-0 w-4 -translate-x-1/2 group-hover:bg-black/10" />
        </div>

        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h2 className="font-bold">Block Library</h2>
            <p className="text-xs text-gray-500 mt-1">
              Drag blocks to flowgraph
            </p>
          </div>
          <button
            onClick={onToggle}
            className="px-3 py-1.5 bg-white border border-black/80 rounded text-sm font-medium hover:bg-black hover:text-white transition-colors duration-200"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {Object.entries(registry.registry).map(([type, { config }]) => (
              <div
                key={type}
                className="px-3 py-1.5 bg-white border border-black/80 rounded text-sm font-medium hover:bg-black hover:text-white transition-colors duration-200 cursor-grab"
                onDragStart={(e) => onDragStart(e, type)}
                draggable
              >
                <h3>{config.name}</h3>
                {config.description && (
                  <p className="text-xs mt-1 opacity-80">
                    {config.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default BlockLibrary;
