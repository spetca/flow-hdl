const SubflowBlock = {
  blockConfig: {
    name: "Subflow",
    description: "Nested flowgraph container",
    ports: {
      inputs: {}, // Dynamic ports based on configuration
      outputs: {}, // Dynamic ports based on configuration
    },
    params: {
      inPorts: {
        type: "array",
        default: [],
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            width: { type: "number", default: 32 },
            signed: { type: "boolean", default: false },
          },
        },
      },
      outPorts: {
        type: "array",
        default: [],
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            width: { type: "number", default: 32 },
            signed: { type: "boolean", default: false },
          },
        },
      },
    },
    shape: {
      type: "rectangle",
      width: 200,
      height: 150,
      color: "#E9D8FD", // Light purple to distinguish subflows
      borderColor: "#805AD5",
    },
  },

  generateVerilog: (params) => {
    // This will be handled differently since subflows generate their content
    // based on their internal blocks
    return "";
  },
};

export default SubflowBlock;
