// Updated components/flowgraph/NodePorts.jsx
import React from "react";
import { Handle, Position } from "reactflow";

export const NodePorts = ({ config, isSpecialShape }) => {
  const calculatePortPosition = (index, total) => {
    if (total === 1) return 0.5;
    if (total === 2) return index === 0 ? 0.3 : 0.7;
    const padding = 0.15;
    return padding + index * ((1 - 2 * padding) / (total - 1));
  };

  const getPortDisplayValues = (port) => ({
    width: port.width?.default || port.width || 32,
    signed:
      typeof port.signed === "object" ? port.signed.default : !!port.signed,
  });

  const renderPort = (portId, port, index, total, isInput) => {
    const { width, signed } = getPortDisplayValues(port);
    const position = calculatePortPosition(index, total);
    const side = isInput ? "left" : "right";

    return (
      <div
        key={`${isInput ? "input" : "output"}-${portId}`}
        className={`absolute ${side}-0 transform -translate-y-1/2 flex items-center group ${
          isInput ? "" : "justify-end"
        }`}
        style={{
          top: `${position * 100}%`,
          maxWidth: "45%",
          zIndex: 1,
        }}
      >
        {!isSpecialShape && (
          <span
            className={`text-sm ${
              isInput ? "ml-2" : "mr-2"
            } truncate text-gray-600 group-hover:text-gray-900 transition-colors`}
          >
            {portId} [{width - 1}:0]
            {signed && <span className="text-gray-400 ml-1">(s)</span>}
          </span>
        )}
        <Handle
          type={isInput ? "target" : "source"}
          position={isInput ? Position.Left : Position.Right}
          id={portId}
          className="w-3 h-3 rounded-full bg-gray-400 border-2 border-white transition-colors hover:bg-blue-400"
          style={{ [side]: isSpecialShape ? -6 : -8 }}
        />
      </div>
    );
  };

  return (
    <>
      {Object.entries(config.ports.inputs || {}).map(([portId, port], index) =>
        renderPort(
          portId,
          port,
          index,
          Object.keys(config.ports.inputs || {}).length,
          true
        )
      )}
      {Object.entries(config.ports.outputs || {}).map(([portId, port], index) =>
        renderPort(
          portId,
          port,
          index,
          Object.keys(config.ports.outputs || {}).length,
          false
        )
      )}
    </>
  );
};
