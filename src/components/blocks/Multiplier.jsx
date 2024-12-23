import React from "react";
import HDLNode from "../blockHelpers/HDLNode";

export const blockConfig = {
  type: "multiplier",
  name: "Multiplier",
  synchronous: false,
  description: "Multiplies two numbers",
  params: {
    DEFAULT_WIDTH: { type: "number", default: 8, min: 1, max: 32 },
    SIGNED: { type: "boolean", default: true },
  },
  ports: {
    inputs: {
      a: { width: 8, signed: true },
      b: { width: 8, signed: true },
    },
    outputs: {
      product: { width: 16, signed: true }, // Note: output is twice the width
    },
  },
};

export const generateVerilog = (params) => `
module ${params.name} #(
    parameter WIDTH = ${params.DEFAULT_WIDTH}
)(
    input ${params.SIGNED ? "signed" : "unsigned"} [WIDTH-1:0] a,
    input ${params.SIGNED ? "signed" : "unsigned"} [WIDTH-1:0] b,
    output ${params.SIGNED ? "signed" : "unsigned"} [WIDTH*2-1:0] product
);
    assign product = a * b;
endmodule
`;

const MultiplierBlock = (props) => (
  <HDLNode
    {...props}
    data={{
      config: blockConfig,
      name: props.name,
      params: props.params,
      onParameterChange: props.onParameterChange,
    }}
  />
);

export default MultiplierBlock;
