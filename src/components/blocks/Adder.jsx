// Adder.js
import { createBlock } from "../blockHelpers/BlockFactory";

const config = {
  name: "Adder",
  description: "Adds two numbers together",
  synchronous: false,
  icon: "plus",
  ports: {
    inputs: {
      a: {
        width: { default: 8, min: 1, max: 64 },
        signed: true,
        description: "First input operand",
      },
      b: {
        width: { default: 8, min: 1, max: 64 },
        signed: true,
        description: "Second input operand",
      },
    },
    outputs: {
      sum: {
        width: { default: 8, min: 1, max: 64 },
        signed: true,
        description: "Sum of inputs",
      },
    },
  },
};

const generateVerilog = ({ name = "adder", ports }) => {
  const portA = ports?.inputs?.a || { width: 8, signed: true };
  const portB = ports?.inputs?.b || { width: 8, signed: true };
  const portSum = ports?.outputs?.sum || { width: 8, signed: true };

  return `module ${name} #(
    parameter A_WIDTH = ${portA.width},
    parameter B_WIDTH = ${portB.width},
    parameter SUM_WIDTH = ${portSum.width}
)(
    input wire clk,
    input wire ${portA.signed ? "signed " : ""}[A_WIDTH-1:0] a,
    input wire ${portB.signed ? "signed " : ""}[B_WIDTH-1:0] b,
    output reg ${portSum.signed ? "signed " : ""}[SUM_WIDTH-1:0] sum
);
    
    // Addition logic
    assign sum = a + b;
    
endmodule`;
};

export default createBlock({ config, generateVerilog });
