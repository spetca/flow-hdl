// OutPort.jsx
import React from "react";
import HDLNode from "../blockHelpers/HDLNode";

const blockConfig = {
  type: "outport",
  name: "Output Port",
  description: "Output port for HDL module",
  shape: {
    type: "oval",
    width: 120,
    height: 80,
    lockAspectRatio: true,
  },
  ports: {
    inputs: {
      in: {
        width: {
          type: "number",
          default: 32,
          min: 1,
          max: 512,
          description: "Input port width",
        },
        signed: {
          type: "boolean",
          default: false,
          description: "Signed/unsigned input",
        },
        description: "Input port",
      },
    },
    outputs: {}, // No outputs
  },
};

// Helper to generate dynamic config based on port parameters
const createDynamicConfig = (props) => {
  const config = { ...blockConfig };
  const { portParams = {} } = props.params || {};

  Object.entries(portParams || {}).forEach(([portName, settings]) => {
    const [portType, portId] = portName.split(".");
    if (config.ports[portType]?.[portId]) {
      config.ports[portType][portId] = {
        ...config.ports[portType][portId],
        ...settings,
      };
    }
  });

  return config;
};

const OutPortBlock = (props) => {
  const dynamicConfig = createDynamicConfig(props);

  return (
    <HDLNode
      {...props}
      data={{
        config: dynamicConfig,
        name: props.name,
        params: props.params,
        onParameterChange: props.onParameterChange,
      }}
    />
  );
};

export default OutPortBlock;
export { blockConfig };
