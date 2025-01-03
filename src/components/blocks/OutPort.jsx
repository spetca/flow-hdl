// OutPort.jsx
import { createBlock } from "./helpers/BlockFactory.jsx";

const config = {
  type: "outport",
  name: "Output Port",
  description: "Output port for HDL module",
  ports: {
    inputs: {
      in: {
        width: { default: 32, min: 1, max: 512 },
        signed: false,
        description: "Input port",
      },
    },
    outputs: {}, // No outputs
  },
};

// OutPorts don't need Verilog generation as they're handled by the parent module
const generateVerilog = null;

const uiConfig = {
  shape: {
    type: "oval",
    width: 120,
    height: 80,
    lockAspectRatio: true,
  }
};

export default createBlock({ config, generateVerilog, uiConfig });