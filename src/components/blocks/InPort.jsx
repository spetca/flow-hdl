// InPort.jsx
import { createBlock } from "../blockHelpers/BlockFactory";

const config = {
  type: "inport",
  name: "Input Port",
  description: "Input port for HDL module",
  shape: {
    type: "oval",
    width: 120,
    height: 80,
    lockAspectRatio: true,
  },
  ports: {
    inputs: {}, // No inputs
    outputs: {
      out: {
        width: { default: 32, min: 1, max: 512 },
        signed: false,
        description: "Output port",
      },
    },
  },
};

// InPorts don't need Verilog generation
const generateVerilog = null;

const InPortBlock = createBlock({ config, generateVerilog });

// Debug check
console.log("InPortBlock created:", {
  config: InPortBlock.blockConfig,
  verilog: InPortBlock.generateVerilog,
});

export default InPortBlock;
