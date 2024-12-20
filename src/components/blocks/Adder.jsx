import React from "react";
import BaseBlock from "../blockHelpers/BaseBlock";

// Just define the interface and HDL
export const blockConfig = {
  type: "adder",
  name: "Adder",
  description: "Adds two numbers together",
  params: {
    DEFAULT_WIDTH: { type: "number", default: 8, min: 1, max: 64 },
    SIGNED: { type: "boolean", default: true },
  },
  ports: {
    inputs: {
      a: { width: 8, signed: true },
      b: { width: 8, signed: true },
    },
    outputs: {
      sum: { width: 8, signed: true },
    },
  },
};

export const generateVerilog = (params) => `
module ${params.name} #(
    parameter WIDTH = ${params.DEFAULT_WIDTH}
)(
    input ${params.SIGNED ? "signed" : "unsigned"} [WIDTH-1:0] a,
    input ${params.SIGNED ? "signed" : "unsigned"} [WIDTH-1:0] b,
    output ${params.SIGNED ? "signed" : "unsigned"} [WIDTH-1:0] sum
);
    assign sum = a + b;
endmodule
`;

// The actual component just wraps BaseBlock
const AdderBlock = (props) => <BaseBlock {...props} config={blockConfig} />;

export default AdderBlock;
