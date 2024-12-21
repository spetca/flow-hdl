import AdderBlock, {
  blockConfig as adderConfig,
  generateVerilog as adderVerilog,
} from "../blocks/Adder";
import MultiplierBlock, {
  blockConfig as multiplierConfig,
  generateVerilog as multiplierVerilog,
} from "../blocks/Multiplier";
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
  subsystem: {
    type: BlockTypes.SUBSYSTEM,
    component: HDLNode,
    config: {
      type: "subsystem",
      name: "Subsystem",
      description: "Create a nested block with its own internal components",
      ports: {
        inputs: {},
        outputs: {},
      },
      params: {
        name: { type: "string", default: "subsystem" },
      },
    },
    generateVerilog: (params, nodes, edges) => {
      const generator = new VerilogGenerator();
      return generator.generateModuleVerilog(params.name, nodes, edges);
    },
  },
  inport: {
    type: BlockTypes.INPORT,
    component: HDLNode,
    config: {
      type: "inport",
      name: "Input Port",
      description: "Input port for HDL module",
      ports: {
        inputs: {}, // No inputs
        outputs: {
          out: { width: 32, signed: false },
        },
      },
      params: {
        width: { type: "number", default: 32 },
        signed: { type: "boolean", default: false },
      },
    },
  },

  outport: {
    type: BlockTypes.OUTPORT,
    component: HDLNode,
    config: {
      type: "outport",
      name: "Output Port",
      description: "Output port for HDL module",
      ports: {
        inputs: {
          in: { width: 32, signed: false },
        },
        outputs: {}, // No outputs
      },
      params: {
        width: { type: "number", default: 32 },
        signed: { type: "boolean", default: false },
      },
    },
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
  hierarchical: {
    type: BlockTypes.HIERARCHICAL,
    component: HierarchicalBlock,
    config: {
      name: "Hierarchical Block",
      description: "Create a nested block with its own internal components",
      ports: {
        inputs: {},
        outputs: {},
      },
      params: {
        name: { type: "string", default: "nested_block" },
      },
    },
    generateVerilog: (params, internalNodes, internalEdges) => {
      const generator = new VerilogGenerator();
      return generator.generateModuleVerilog(
        params.name,
        internalNodes,
        internalEdges
      );
    },
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
