import React from "react";

export const NodeTitle = ({ config, name, isSpecialShape }) => {
  const getNodeColor = () => {
    switch (config.type) {
      case "inport":
        return "bg-black/80 hover:bg-black";
      case "outport":
        return "bg-black/80 hover:bg-black";
      default:
        return "bg-black/80 hover:bg-black";
    }
  };

  const getPortDisplayValues = (port) => ({
    width: port.width?.default || port.width || 32,
    signed:
      typeof port.signed === "object" ? port.signed.default : !!port.signed,
  });

  const baseClasses =
    "text-center text-white backdrop-blur-sm transition-colors duration-200";
  const specialShapeClasses =
    "h-full flex flex-col items-center justify-center";
  const regularClasses =
    "absolute bottom-0 left-0 right-0 rounded-b-lg py-1.5 px-3 font-medium text-sm shadow-sm border-t border-black/20";

  return (
    <div
      className={`
        ${baseClasses}
        ${getNodeColor()}
        ${isSpecialShape ? specialShapeClasses : regularClasses}
      `}
    >
      <div className="font-medium">{name || config.name}</div>
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
  const portClassName = "text-xs mt-0.5 text-white/90";

  if (config.type === "inport") {
    return Object.entries(config.ports.outputs || {}).map(([portId, port]) => {
      const { width, signed } = getPortDisplayValues(port);
      return (
        <div key={`output-${portId}`} className={portClassName}>
          [{width - 1}:0]{signed && "(s)"}
        </div>
      );
    });
  }

  if (config.type === "outport") {
    return Object.entries(config.ports.inputs || {}).map(([portId, port]) => {
      const { width, signed } = getPortDisplayValues(port);
      return (
        <div key={`input-${portId}`} className={portClassName}>
          [{width - 1}:0]{signed && "(s)"}
        </div>
      );
    });
  }

  return null;
};
