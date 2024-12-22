import React, { memo, useState, useEffect } from "react";
import { Handle, Position } from "reactflow";
import BlockDialog from "./BlockDialog";

const HDLNode = ({ data, id, selected }) => {
  const { config, onParameterChange } = data;
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [currentConfig, setCurrentConfig] = useState(config);
  const [nodeSize, setNodeSize] = useState(() => {
    // Initialize size based on shape config or default
    if (config.shape) {
      return {
        width: config.shape.width || 200,
        height: config.shape.height || 150,
      };
    }
    return { width: 200, height: 150 };
  });
  const [isResizing, setIsResizing] = useState(false);

  // Get shape-specific styles
  const getShapeStyles = () => {
    const baseStyles = {
      width: nodeSize.width,
      height: nodeSize.height,
    };

    if (!currentConfig.shape) {
      return {
        ...baseStyles,
        borderRadius: "0.5rem", // default rounded rectangle
      };
    }

    switch (currentConfig.shape.type) {
      case "oval":
        return {
          ...baseStyles,
          borderRadius: "50%",
        };
      case "rounded":
        return {
          ...baseStyles,
          borderRadius: "1rem",
        };
      case "diamond":
        return {
          ...baseStyles,
          transform: "rotate(45deg)",
          margin: `${nodeSize.height / 4}px`,
        };
      default:
        return {
          ...baseStyles,
          borderRadius: "0.5rem",
        };
    }
  };

  const getNodeColor = () => {
    switch (currentConfig.type) {
      case "inport":
        return "bg-blue-500";
      case "outport":
        return "bg-pink-500";
      default:
        return "bg-purple-500";
    }
  };

  // Update local state when data changes
  useEffect(() => {
    setCurrentConfig(config);
    if (config.shape) {
      setNodeSize({
        width: config.shape.width || 200,
        height: config.shape.height || 150,
      });
    }
  }, [config]);

  // Handle resize mouse events
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizing && !currentConfig.shape?.lockAspectRatio) {
        e.preventDefault();
        const dx = e.movementX;
        const dy = e.movementY;

        setNodeSize((prev) => ({
          width: Math.max(200, prev.width + dx),
          height: Math.max(150, prev.height + dy),
        }));
      }
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
      }
    };

    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, currentConfig.shape]);

  const handleDoubleClick = (e) => {
    e.preventDefault();
    setIsConfigOpen(true);
  };

  const handleResizeStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
  };

  const handleUpdate = (updates) => {
    const { params = {}, ports = currentConfig.ports, name } = updates;

    const newConfig = {
      ...currentConfig,
      ports,
      params: {
        ...currentConfig.params,
        ...Object.fromEntries(
          Object.entries(params).map(([key, value]) => [
            key,
            { default: value },
          ])
        ),
      },
    };

    setCurrentConfig(newConfig);
    onParameterChange(id, {
      config: newConfig,
      params,
      name,
    });
  };

  // Calculate port positions with even distribution and spacing
  const calculatePortPosition = (index, total) => {
    if (total === 1) return 0.5;
    if (total === 2) return index === 0 ? 0.3 : 0.7;
    const padding = 0.15;
    const usableSpace = 1 - 2 * padding;
    return padding + index * (usableSpace / (total - 1));
  };

  const renderParameters = () => {
    if (!currentConfig.params) return null;
    return Object.entries(currentConfig.params)
      .map(([name, param]) => `${name}: ${param.default}`)
      .join(", ");
  };

  // Helper to get port display values
  const getPortDisplayValues = (port) => {
    const width = port.width?.default || port.width || 32;
    const signed = port.signed?.default || port.signed || false;
    return { width, signed };
  };

  const renderPorts = () => {
    const inputPorts = Object.entries(currentConfig.ports.inputs || {});
    const outputPorts = Object.entries(currentConfig.ports.outputs || {});
    const isSpecialShape = currentConfig.shape?.type === "oval";

    return (
      <>
        {/* Input Ports */}
        {inputPorts.map(([portId, port], index) => {
          const { width, signed } = getPortDisplayValues(port);
          const position = calculatePortPosition(index, inputPorts.length);
          return (
            <div
              key={`input-${portId}`}
              className="absolute left-0 transform -translate-y-1/2 flex items-center group"
              style={{
                top: `${position * 100}%`,
                maxWidth: "45%",
                zIndex: 1,
              }}
            >
              <Handle
                type="target"
                position={Position.Left}
                id={portId}
                className="w-3 h-3 rounded-full bg-gray-400 border-2 border-white transition-colors hover:bg-blue-400"
                style={{ left: isSpecialShape ? -6 : -8 }}
              />
              {!isSpecialShape && (
                <span className="text-sm ml-2 truncate text-gray-600 group-hover:text-gray-900 transition-colors">
                  {portId} [{width - 1}:0]
                  {signed && <span className="text-gray-400 ml-1">(s)</span>}
                </span>
              )}
            </div>
          );
        })}

        {/* Output Ports */}
        {outputPorts.map(([portId, port], index) => {
          const { width, signed } = getPortDisplayValues(port);
          const position = calculatePortPosition(index, outputPorts.length);
          return (
            <div
              key={`output-${portId}`}
              className="absolute right-0 transform -translate-y-1/2 flex items-center justify-end group"
              style={{
                top: `${position * 100}%`,
                maxWidth: "45%",
                zIndex: 1,
              }}
            >
              {!isSpecialShape && (
                <span className="text-sm mr-2 truncate text-gray-600 group-hover:text-gray-900 transition-colors">
                  {portId} [{width - 1}:0]
                  {signed && <span className="text-gray-400 ml-1">(s)</span>}
                </span>
              )}
              <Handle
                type="source"
                position={Position.Right}
                id={portId}
                className="w-3 h-3 rounded-full bg-gray-400 border-2 border-white transition-colors hover:bg-blue-400"
                style={{ right: isSpecialShape ? -6 : -8 }}
              />
            </div>
          );
        })}
      </>
    );
  };

  const shapeStyles = getShapeStyles();
  const isSpecialShape = currentConfig.shape?.type !== undefined;

  return (
    <>
      <div
        className={`relative bg-white shadow-lg transition-shadow duration-200 ${
          selected ? "ring-2 ring-blue-400 shadow-xl" : "ring-1 ring-gray-200"
        }`}
        style={shapeStyles}
        onDoubleClick={handleDoubleClick}
      >
        {/* Title Bar */}
        <div
          className={`text-center text-white ${getNodeColor()} ${
            isSpecialShape
              ? "h-full flex flex-col items-center justify-center"
              : "rounded-t-lg py-2 px-3 font-bold"
          }`}
          style={isSpecialShape ? shapeStyles : undefined}
        >
          <div className="font-bold">{data.name || currentConfig.name}</div>
          {isSpecialShape &&
            Object.entries(currentConfig.ports.inputs || {}).map(
              ([portId, port]) => {
                const { width, signed } = getPortDisplayValues(port);
                return (
                  <div key={portId} className="text-sm mt-1">
                    [{width - 1}:0]{signed && "(s)"}
                  </div>
                );
              }
            )}
          {isSpecialShape &&
            Object.entries(currentConfig.ports.outputs || {}).map(
              ([portId, port]) => {
                const { width, signed } = getPortDisplayValues(port);
                return (
                  <div key={portId} className="text-sm mt-1">
                    [{width - 1}:0]{signed && "(s)"}
                  </div>
                );
              }
            )}
        </div>

        {/* Parameters Section - Only show for regular blocks */}
        {!isSpecialShape &&
          currentConfig.params &&
          Object.keys(currentConfig.params).length > 0 && (
            <div className="text-xs bg-gray-50 px-3 py-2 text-gray-600 border-b border-gray-200">
              {renderParameters()}
            </div>
          )}

        {/* Ports */}
        {renderPorts()}

        {/* Resize Handle - Only show for regular blocks */}
        {!currentConfig.shape?.lockAspectRatio && (
          <div
            className={`absolute bottom-0 right-0 w-4 h-4 cursor-se-resize transition-colors ${
              selected ? "bg-blue-400" : "bg-gray-300"
            }`}
            onMouseDown={handleResizeStart}
            style={{
              borderTopLeftRadius: "4px",
              borderTop: `2px solid ${selected ? "#3b82f6" : "#9ca3af"}`,
              borderLeft: `2px solid ${selected ? "#3b82f6" : "#9ca3af"}`,
            }}
          />
        )}
      </div>

      {isConfigOpen && (
        <BlockDialog
          block={{ id, name: data.name, params: data.params }}
          config={currentConfig}
          isOpen={isConfigOpen}
          onClose={() => setIsConfigOpen(false)}
          onUpdate={handleUpdate}
        />
      )}
    </>
  );
};

export default memo(HDLNode);
