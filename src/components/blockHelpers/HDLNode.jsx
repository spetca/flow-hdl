import React, { memo, useState, useEffect } from "react";
import { Handle, Position } from "reactflow";
import BlockConfiguration from "./BlockConfiguration";

const HDLNode = ({ data, id, selected }) => {
  const { config, onParameterChange } = data;
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [currentConfig, setCurrentConfig] = useState(config);
  const [nodeSize, setNodeSize] = useState(() => {
    if (config.shape) {
      return {
        width: config.shape.width || 200,
        height: config.shape.height || 150,
      };
    }
    return { width: 200, height: 150 };
  });

  // Normalize config to ensure consistent structure
  const normalizeConfig = (config) => {
    const normalizedConfig = { ...config };

    // Normalize ports
    if (normalizedConfig.ports) {
      ["inputs", "outputs"].forEach((portType) => {
        if (normalizedConfig.ports[portType]) {
          Object.keys(normalizedConfig.ports[portType]).forEach((portName) => {
            const port = normalizedConfig.ports[portType][portName];

            // Ensure width is an object with default
            if (typeof port.width !== "object") {
              port.width = { default: port.width || 32 };
            }

            // Ensure signed is an object with default
            if (typeof port.signed !== "object") {
              port.signed = { default: port.signed || false };
            }
          });
        }
      });
    }

    // Normalize params
    if (normalizedConfig.params) {
      Object.keys(normalizedConfig.params).forEach((paramName) => {
        const param = normalizedConfig.params[paramName];

        // If param is not an object, convert it to an object with default
        if (typeof param !== "object") {
          normalizedConfig.params[paramName] = { default: param };
        }
        // Ensure default exists
        if (param && param.default === undefined) {
          param.default = param.type === "boolean" ? false : 0;
        }
      });
    }

    return normalizedConfig;
  };

  // Get shape-specific styles
  const getShapeStyles = () => {
    const baseStyles = {
      width: nodeSize.width,
      height: nodeSize.height,
    };

    if (!currentConfig.shape) {
      return {
        ...baseStyles,
        borderRadius: "0.5rem",
      };
    }

    switch (currentConfig.shape.type) {
      case "oval":
        return {
          ...baseStyles,
          width: 75,
          height: 65,
          borderRadius: "25%",
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

  // Handle resize mouse events
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!currentConfig.shape?.lockAspectRatio) {
        e.preventDefault();
        const dx = e.movementX;
        const dy = e.movementY;

        setNodeSize((prev) => ({
          width: Math.max(200, prev.width + dx),
          height: Math.max(150, prev.height + dy),
        }));
      }
    };

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [currentConfig.shape]);

  const handleDoubleClick = (e) => {
    e.preventDefault();
    setIsConfigOpen(true);
  };

  const handleUpdate = (updates) => {
    // Normalize the updates
    const normalizedUpdates = {
      name: updates.name || currentConfig.name,
      config: {
        ...currentConfig,
        name: updates.name || currentConfig.name,
        ports: updates.ports || currentConfig.ports,
        params: updates.config?.params || currentConfig.params,
      },
      params: updates.params || {},
    };

    // Convert params to correct structure
    if (normalizedUpdates.config.params) {
      normalizedUpdates.config.params = Object.fromEntries(
        Object.entries(normalizedUpdates.config.params).map(([key, value]) => [
          key,
          typeof value === "object"
            ? { ...value, default: value.default }
            : { default: value },
        ])
      );
    }

    console.log("Normalized Updates:", normalizedUpdates);

    // Update local state
    setCurrentConfig(normalizedUpdates.config);

    // Call parameter change with normalized updates
    onParameterChange(id, normalizedUpdates);
  };

  // Use normalized config for state
  useEffect(() => {
    setCurrentConfig(normalizeConfig(config));
  }, [config]);

  // Calculate port positions with even distribution and spacing
  const calculatePortPosition = (index, total) => {
    if (total === 1) return 0.5;
    if (total === 2) return index === 0 ? 0.3 : 0.7;
    const padding = 0.15;
    const usableSpace = 1 - 2 * padding;
    return padding + index * (usableSpace / (total - 1));
  };

  // Get the main parameter value for center display
  const getMainParameter = () => {
    if (!currentConfig.params) return null;

    // Priority parameters by block type
    const paramMap = {
      delay: "DELAY",
      adder: "DELAY_OUT",
      // Add more block types and their main parameters here
    };

    const mainParamKey = paramMap[currentConfig.type];
    if (!mainParamKey) return null;

    const param = currentConfig.params[mainParamKey];
    if (!param) return null;

    return {
      name: mainParamKey,
      value: param.default,
    };
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
              {!isSpecialShape && (
                <span className="text-sm ml-2 truncate text-gray-600 group-hover:text-gray-900 transition-colors">
                  {portId} [{width - 1}:0]
                  {signed && <span className="text-gray-400 ml-1">(s)</span>}
                </span>
              )}
              <Handle
                type="target"
                position={Position.Left}
                id={portId}
                className="w-3 h-3 rounded-full bg-gray-400 border-2 border-white transition-colors hover:bg-blue-400"
                style={{ left: isSpecialShape ? -6 : -8 }}
              />
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
  const mainParam = getMainParameter();

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
        </div>

        {/* Main Parameter Display */}
        {!isSpecialShape && mainParam && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-2xl font-bold text-gray-500">
              {mainParam.value}
            </div>
          </div>
        )}

        {/* Parameters Section - Only show for regular blocks */}
        {!isSpecialShape &&
          currentConfig.params &&
          Object.keys(currentConfig.params).length > 0 && (
            <div className="text-xs bg-gray-50 px-3 py-1 text-gray-600 border-b border-gray-200">
              {Object.entries(currentConfig.params)
                .map(([name, param]) => `${name}: ${param.default}`)
                .join(", ")}
            </div>
          )}

        {/* Ports */}
        {renderPorts()}
      </div>

      {isConfigOpen && (
        <BlockConfiguration
          data={{ config: currentConfig, name: data.name }}
          isOpen={isConfigOpen}
          onClose={() => setIsConfigOpen(false)}
          onUpdate={handleUpdate}
        />
      )}
    </>
  );
};

export default memo(HDLNode);
