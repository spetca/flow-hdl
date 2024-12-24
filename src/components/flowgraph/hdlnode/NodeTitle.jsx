// components/flowgraph/NodeTitle.jsx
import React from "react";

export const NodeTitle = ({ config, name, isSpecialShape, shapeStyles }) => {
  const getNodeColor = () => {
    switch (config.type) {
      case "inport":
        return "bg-blue-500";
      case "outport":
        return "bg-pink-500";
      default:
        return "bg-purple-500";
    }
  };

  const getPortDisplayValues = (port) => ({
    width: port.width?.default || port.width || 32,
    signed:
      typeof port.signed === "object" ? port.signed.default : !!port.signed,
  });

  return (
    <div
      className={`text-center text-white ${getNodeColor()} ${
        isSpecialShape
          ? "h-full flex flex-col items-center justify-center"
          : "rounded-t-lg py-2 px-3 font-bold"
      }`}
      style={isSpecialShape ? shapeStyles : undefined}
    >
      <div className="font-bold">{name || config.name}</div>
      {isSpecialShape && (
        <SpecialShapePorts
          config={config}
          getPortDisplayValues={getPortDisplayValues}
        />
      )}
    </div>
  );
};

const SpecialShapePorts = ({ config, getPortDisplayValues }) => {
  if (config.type === "inport") {
    return Object.entries(config.ports.outputs || {}).map(([portId, port]) => {
      const { width, signed } = getPortDisplayValues(port);
      return (
        <div key={`output-${portId}`} className="text-sm mt-1">
          [{width - 1}:0]{signed && "(s)"}
        </div>
      );
    });
  }

  if (config.type === "outport") {
    return Object.entries(config.ports.inputs || {}).map(([portId, port]) => {
      const { width, signed } = getPortDisplayValues(port);
      return (
        <div key={`input-${portId}`} className="text-sm mt-1">
          [{width - 1}:0]{signed && "(s)"}
        </div>
      );
    });
  }

  return null;
};
