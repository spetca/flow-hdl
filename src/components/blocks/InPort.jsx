// InPort.jsx
import { createBlock } from "../blockHelpers/BlockFactory";

const config = {
  type: "inport",
  name: "Input Port",
  icon: "box",
  description: "Input port for HDL module",
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

const uiConfig = {
  shape: {
    type: "oval",
    width: 120,
    height: 80,
    lockAspectRatio: true,
  },
};

export default createBlock({ config, generateVerilog, uiConfig });
