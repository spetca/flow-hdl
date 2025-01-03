// InPort.jsx
import { createBlock } from "./helpers/BlockFactory.jsx";

const config = {
  type: "inport",
  name: "Input Port",
  icon: "x[n]",
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
