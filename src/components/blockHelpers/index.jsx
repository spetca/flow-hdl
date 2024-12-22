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
import HierarchicalBlock from "./HierarchicalBlockEditor";
import HDLNode from "./HDLNode";
import BlockDialog from "./BlockDialog";

// Block type constants
export const BlockTypes = {
  PRIMITIVE: "primitive",
  HIERARCHICAL: "hierarchical",
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

  if (block.type === BlockTypes.HIERARCHICAL) {
    return block.generateVerilog(params, internalNodes, internalEdges);
  }
  return block.generateVerilog(params);
};

// Helper to check if block is hierarchical
export const isHierarchicalBlock = (type) => {
  return blockRegistry[type]?.type === BlockTypes.HIERARCHICAL;
};

// Export all components and utilities
export { HierarchicalBlock, HDLNode, BlockDialog };

// Create a new VerilogGenerator instance for the entire design
export const createVerilogGenerator = () => {
  return new VerilogGenerator();
};
