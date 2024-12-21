# flow-hdl

FlowHDL is an open source web-based flowgraph HDL generator inspired by tools like Simulink HDL Coder and GNU Radio.

<img width="1426" alt="image" src="https://github.com/user-attachments/assets/132b4761-7b5d-4200-99e4-01feb3d161c8" />

## quickstart keyboard shortcuts

- `spacebar` fits graph to view
- `ctrl + -` zoom out
- `ctrl + +` zoom in
  
## Flow is in its infancy!

Please contribute if you are a web, react/vite, react flow, or HDL guru!

### Top priorities/Low hanging fruit

- [ ] better styling for react flow
     - [ ] highlight when wires clicks
     - [ ] better block appearance
     - [ ] fix flowgraph bugs: blocks pulled into flowgraph go out of view, resize blocks doesnt work, text on block and ports need organized better
- [ ] simplifying logic, components, and how blocks are created. this was bootstrapped with a lot of help from AI and will need some TLC to get to a sane state
- [ ] error checking bugs
     - [ ] blocks should not allow connection if sign and bitwidth do not match source to destination
     - [ ] blocks should highlight a connection red if an error occurs after connection (sign/bitwidth changes and does not match anymore)
     - [ ] clicking signed in dailogs doesnt propogate state correctly
  
## [DEMO](https://flow-hdl.netlify.app)

## get started with dev

1. clone
2. `npm i`
3. `npm run dev`

# Concept

1. build flowgraph
2. generate hdl
3. simulate however the hell you want

# How to add blocks

Blocks are located in `/components/blocks/`. users define the interface and the underlying hdl. Adder example:

```
import React from "react";
import BaseBlock from "../blockHelpers/BaseBlock";

// Just define the interface and HDL
export const blockConfig = {
  type: "adder",
  name: "Adder",
  description: "Adds two numbers together",
  params: {
    DEFAULT_WIDTH: { type: "number", default: 8, min: 1, max: 64 },
    SIGNED: { type: "boolean", default: true },
  },
  ports: {
    inputs: {
      a: { width: 8, signed: true },
      b: { width: 8, signed: true },
    },
    outputs: {
      sum: { width: 8, signed: true },
    },
  },
};

export const generateVerilog = (params) => `
module ${params.name} #(
    parameter WIDTH = ${params.DEFAULT_WIDTH}
)(
    input ${params.SIGNED ? "signed" : "unsigned"} [WIDTH-1:0] a,
    input ${params.SIGNED ? "signed" : "unsigned"} [WIDTH-1:0] b,
    output ${params.SIGNED ? "signed" : "unsigned"} [WIDTH-1:0] sum
);
    assign sum = a + b;
endmodule
`;

// The actual component just wraps BaseBlock
const AdderBlock = (props) => <BaseBlock {...props} config={blockConfig} />;

export default AdderBlock;
```

```
src/
├── components/
│   ├── blockHelpers/
│   │   ├── BaseBlock.jsx          # Existing - Base block functionality
│   │   ├── BlockDialog.jsx        # Existing - Block configuration dialog
│   │   ├── HDLNode.jsx           # Existing - Visual node representation
│   │   ├── HierarchicalBlock.jsx  # New - Handles nested flow graphs
│   │   └── index.js              # Export all block helper components
│   ├── blocks/
│   │   ├── Adder.jsx          # Existing - Base block functionality
│   │   ├── Multiplier.jsx        # Existing - Block configuration dialog
│   ├── generators/
│   │   ├── SystemVerilogGenerator.jsx          # Existing - Base block functionality
│   ├── BlockLibrary.jsx          # Existing - Shows available blocks
│   ├── FileDrawer.jsx           # Existing - File management UI
│   ├── FileEditor.jsx           # Existing - Edit generated files
│   ├── FileExplorer.jsx         # Existing - Browse generated files
│   └── FlowGraph.jsx            # Existing - Main graph component
```
