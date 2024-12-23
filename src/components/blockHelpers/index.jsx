import AdderBlock, {
  blockConfig as adderConfig,
  generateVerilog as adderVerilog,
} from "../blocks/Adder";
import MultiplierBlock, {
  blockConfig as multiplierConfig,
  generateVerilog as multiplierVerilog,
} from "../blocks/Multiplier";
import InPortBlock, { blockConfig as inportConfig } from "../blocks/InPort";
import OutPortBlock, { blockConfig as outportConfig } from "../blocks/OutPort";
import DelayBlock, {
  blockConfig as delayConfig,
  generateVerilog as delayVerilog,
} from "../blocks/Delay";
import HDLNode from "./HDLNode";
import BlockConfiguration from "./BlockConfiguration";

// Block type constants
export const BlockTypes = {
  PRIMITIVE: "primitive",
  INPORT: "inport",
  OUTPORT: "outport",
};

// Registry of all available blocks
export const blockRegistry = {
  inport: {
    type: BlockTypes.INPORT,
    component: InPortBlock,
    config: inportConfig,
  },
  outport: {
    type: BlockTypes.OUTPORT,
    component: OutPortBlock,
    config: outportConfig,
  },
  delay: {
    type: BlockTypes.PRIMITIVE,
    component: DelayBlock,
    config: delayConfig,
    generateVerilog: delayVerilog,
  },
  adder: {
    type: BlockTypes.PRIMITIVE,
    component: AdderBlock,
    config: adderConfig,
    generateVerilog: adderVerilog,
  },
  multiplier: {
    type: BlockTypes.PRIMITIVE,
    component: MultiplierBlock,
    config: multiplierConfig,
    generateVerilog: multiplierVerilog,
  },
};

// Helper function to get block info for the library
export const getBlockLibrary = () => {
  return Object.entries(blockRegistry).map(([id, { config, type }]) => ({
    id,
    name: config.name,
    description: config.description,
    type,
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
export const generateBlockVerilog = (
  type,
  params,
  internalNodes,
  internalEdges
) => {
  const block = blockRegistry[type];
  if (!block) return null;

  return block.generateVerilog(params);
};

// Export all components and utilities
export { HDLNode, BlockConfiguration };

// Create a new VerilogGenerator instance for the entire design
export const createVerilogGenerator = () => {
  return new VerilogGenerator();
};
