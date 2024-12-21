import React from "react";
import BaseBlock from "../blockHelpers/BaseBlock";

// Define the block configuration with more explicit parameterization
export const blockConfig = {
  type: "adder",
  name: "Adder",
  description: "Adds two numbers together",
  params: {
    WIDTH: {
      type: "number",
      default: 8,
      min: 1,
      max: 64,
      description: "Bit width of input and output ports",
    },
    SIGNED: {
      type: "boolean",
      default: true,
      description: "Whether inputs and outputs are signed",
    },
  },
  ports: {
    inputs: {
      a: {
        width: 8,
        signed: true,
        description: "First input operand",
      },
      b: {
        width: 8,
        signed: true,
        description: "Second input operand",
      },
    },
    outputs: {
      sum: {
        width: 8,
        signed: true,
        description: "Sum of inputs",
      },
    },
  },
};

export const generateVerilog = (params) => {
  // Destructure with fallback to defaults
  const {
    name = "adder",
    WIDTH = blockConfig.params.WIDTH.default,
    SIGNED = blockConfig.params.SIGNED.default,
  } = params;

  return `
module ${name} #(
    parameter WIDTH = ${WIDTH},
    parameter SIGNED = ${SIGNED ? 1 : 0}
)(
    input ${SIGNED ? "signed" : ""} [WIDTH-1:0] a,
    input ${SIGNED ? "signed" : ""} [WIDTH-1:0] b,
    output ${SIGNED ? "signed" : ""} [WIDTH-1:0] sum
);
    // Perform addition with explicit width
    assign sum = a + b;
endmodule
`;
};

// The actual component wraps BaseBlock with dynamic configuration
const AdderBlock = (props) => {
  // Dynamic configuration based on passed parameters
  const dynamicConfig =
    props.params && (props.params.WIDTH || props.params.SIGNED)
      ? {
          ...blockConfig,
          ports: {
            inputs: {
              a: {
                width: props.params.WIDTH || blockConfig.params.WIDTH.default,
                signed:
                  props.params.SIGNED ?? blockConfig.params.SIGNED.default,
              },
              b: {
                width: props.params.WIDTH || blockConfig.params.WIDTH.default,
                signed:
                  props.params.SIGNED ?? blockConfig.params.SIGNED.default,
              },
            },
            outputs: {
              sum: {
                width: props.params.WIDTH || blockConfig.params.WIDTH.default,
                signed:
                  props.params.SIGNED ?? blockConfig.params.SIGNED.default,
              },
            },
          },
        }
      : blockConfig;

  return <BaseBlock {...props} config={dynamicConfig} />;
};

export default AdderBlock;
