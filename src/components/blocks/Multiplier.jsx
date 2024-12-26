// Multiplier.jsx
import { createBlock } from "../blockHelpers/BlockFactory";

const config = {
  name: "Multiplier",
  synchronous: false,
  description: "Multiplies two numbers",
  params: {
    DEFAULT_WIDTH: {
      type: "number",
      default: 8,
      min: 1,
      max: 32,
      description: "Default port width",
    },
    SIGNED: {
      type: "boolean",
      default: true,
      description: "Whether the multiplier is signed",
    },
  },
  ports: {
    inputs: {
      a: {
        width: { default: 8, min: 1, max: 32 },
        signed: true,
        description: "First input operand",
      },
      b: {
        width: { default: 8, min: 1, max: 32 },
        signed: true,
        description: "Second input operand",
      },
    },
    outputs: {
      product: {
        width: { default: 16, min: 2, max: 64 }, // Note: output is twice the width
        signed: true,
        description: "Product of inputs",
      },
    },
  },
};

const generateVerilog = ({ name = "multiplier", ports, params }) => {
  const portA = ports?.inputs?.a || {
    width: config.params.DEFAULT_WIDTH.default,
    signed: config.params.SIGNED.default,
  };
  const portB = ports?.inputs?.b || {
    width: config.params.DEFAULT_WIDTH.default,
    signed: config.params.SIGNED.default,
  };
  const portProduct = ports?.outputs?.product || {
    width: config.params.DEFAULT_WIDTH.default * 2,
    signed: config.params.SIGNED.default,
  };

  return `module ${name} #(
    parameter WIDTH = ${portA.width}
)(
    input wire ${portA.signed ? "signed " : ""}[WIDTH-1:0] a,
    input wire ${portB.signed ? "signed " : ""}[WIDTH-1:0] b,
    output wire ${portProduct.signed ? "signed " : ""}[WIDTH*2-1:0] product
);
    // Multiplication logic
    assign product = a * b;
endmodule`;
};

export default createBlock({ config, generateVerilog });