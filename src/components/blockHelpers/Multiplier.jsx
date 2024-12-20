import React from "react";
import BaseBlock from "./BaseBlock";

export const blockConfig = {
  type: "multiplier",
  name: "Multiplier",
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
  <BaseBlock {...props} config={blockConfig} />
);

export default MultiplierBlock;
