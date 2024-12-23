// Adder.jsx
import React from "react";
import HDLNode from "../blockHelpers/HDLNode";

const blockConfig = {
  type: "adder",
  name: "Adder",
  synchronous: false,
  description: "Adds two numbers together",
  ports: {
    inputs: {
      a: {
        width: {
          type: "number",
          default: 8,
          min: 1,
          max: 64,
          description: "Input width for port A",
        },
        signed: {
          type: "boolean",
          default: true,
          description: "Signed/unsigned for port A",
        },
        description: "First input operand",
      },
      b: {
        width: {
          type: "number",
          default: 8,
          min: 1,
          max: 64,
          description: "Input width for port B",
        },
        signed: {
          type: "boolean",
          default: true,
          description: "Signed/unsigned for port B",
        },
        description: "Second input operand",
      },
    },
    outputs: {
      sum: {
        width: {
          type: "number",
          default: 8,
          min: 1,
          max: 64,
          description: "Output width for sum",
        },
        signed: {
          type: "boolean",
          default: true,
          description: "Signed/unsigned for sum",
        },
        description: "Sum of inputs",
      },
    },
  },
};

const generateVerilog = (params) => {
  const getPortConfig = (portType, portName) => {
    if (params.ports?.[portType]?.[portName]) {
      return params.ports[portType][portName];
    }
    return {
      width: params.WIDTH || blockConfig.ports.inputs.a.width.default,
      signed: params.SIGNED ?? blockConfig.ports.inputs.a.signed.default,
    };
  };

  const name = params.name || "adder";
  const portA = getPortConfig("inputs", "a");
  const portB = getPortConfig("inputs", "b");
  const portSum = getPortConfig("outputs", "sum");

  return `module ${name} #(
    // Port width parameters
    parameter A_WIDTH = ${portA.width},
    parameter B_WIDTH = ${portB.width},
    parameter SUM_WIDTH = ${portSum.width},
)(
    input wire clk,  // Clock signal defined in block
    input wire ${portA.signed ? "signed " : ""}[A_WIDTH-1:0] a,
    input wire ${portB.signed ? "signed " : ""}[B_WIDTH-1:0] b,
    output reg ${portSum.signed ? "signed " : ""}[SUM_WIDTH-1:0] sum
);
    
    // Addition logic with pipeline  
    assign sum = a + b;  
    
endmodule`;
};

// Helper to generate dynamic config based on port parameters
const createDynamicConfig = (props) => {
  const config = { ...blockConfig };
  const { portParams = {}, blockParams = {} } = props.params || {};

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

const AdderBlock = (props) => {
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

export default AdderBlock;
export { blockConfig, generateVerilog };
