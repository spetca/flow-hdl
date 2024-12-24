// index.jsx
import AdderBlock from "../blocks/Adder";
import MultiplierBlock from "../blocks/Multiplier";
import InPortBlock from "../blocks/InPort";
import OutPortBlock from "../blocks/OutPort";
import DelayBlock from "../blocks/Delay";
import HDLNode from "../flowgraph/hdlnode/HDLNode";
import BlockConfiguration from "../configuration/BlockConfiguration";

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
    config: InPortBlock.blockConfig,
  },
  outport: {
    type: BlockTypes.OUTPORT,
    component: OutPortBlock,
    config: OutPortBlock.blockConfig,
  },
  delay: {
    type: BlockTypes.PRIMITIVE,
    component: DelayBlock,
    config: DelayBlock.blockConfig,
    generateVerilog: DelayBlock.generateVerilog,
  },
  adder: {
    type: BlockTypes.PRIMITIVE,
    component: AdderBlock,
    config: AdderBlock.blockConfig,
    generateVerilog: AdderBlock.generateVerilog,
  },
  multiplier: {
    type: BlockTypes.PRIMITIVE,
    component: MultiplierBlock,
    config: MultiplierBlock.blockConfig,
    generateVerilog: MultiplierBlock.generateVerilog,
  },
};

console.log("blockRegistry created:", blockRegistry);

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
export const generateBlockVerilog = (type, params) => {
  const block = blockRegistry[type];
  if (!block?.generateVerilog) return null;

  return block.generateVerilog(params);
};

// Export all components and utilities
export { HDLNode, BlockConfiguration };
