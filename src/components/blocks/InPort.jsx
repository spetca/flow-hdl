// InPort.jsx
import React from "react";
import HDLNode from "../blockHelpers/HDLNode";

const blockConfig = {
  type: "inport",
  name: "Input Port",
  description: "Input port for HDL module",
  ports: {
    inputs: {}, // No inputs
    outputs: {
      out: {
        width: {
          type: "number",
          default: 32,
          min: 1,
          max: 512,
          description: "Output port width",
        },
        signed: {
          type: "boolean",
          default: false,
          description: "Signed/unsigned output",
        },
        description: "Output port",
      },
    },
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

const InPortBlock = (props) => {
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

export default InPortBlock;
export { blockConfig };
