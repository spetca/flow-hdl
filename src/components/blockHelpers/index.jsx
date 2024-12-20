import AdderBlock, {
  blockConfig as adderConfig,
  generateVerilog as adderVerilog,
} from "../blocks/Adder";
import MultiplierBlock, {
  blockConfig as multiplierConfig,
  generateVerilog as multiplierVerilog,
} from "./Multiplier";

// Registry of all available blocks
export const blockRegistry = {
  adder: {
    component: AdderBlock,
    config: adderConfig,
    generateVerilog: adderVerilog,
  },
  multiplier: {
    component: MultiplierBlock,
    config: multiplierConfig,
    generateVerilog: multiplierVerilog,
  },

  // Add more blocks here as they're created
};

// Helper function to get block info for the library
export const getBlockLibrary = () => {
  return Object.entries(blockRegistry).map(([id, { config }]) => ({
    id,
    name: config.name,
    description: config.description,
  }));
};

// Helper function to get block component
export const getBlockComponent = (type) => {
  return blockRegistry[type]?.component;
};

// Helper to get block config
export const getBlockConfig = (type) => {
  return blockRegistry[type]?.config;
};

// Helper to generate Verilog
export const generateBlockVerilog = (type, params) => {
  return blockRegistry[type]?.generateVerilog(params);
};
