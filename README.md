# flow hdl

flow hdl is an open source web-based flowgraph HDL generator inspired by tools like Simulink HDL Coder and GNU Radio. flow graphs can easily be exported and imported via a common json structure.  

The first goal of the project is to generate decent system verilog from complex hierarchical flowgraphs. 

flow is in its **infancy** and any contribution is greatly appreciated - check out [how to contribute](#how-to-contribute)

<img width="1429" alt="image" src="https://github.com/user-attachments/assets/59273d91-ff1b-4c2c-81aa-b9a7ed7fa1aa" />

## What it can do 
- create simple HDL from predfined user blocks
- do some very crude error checking (sign/bitwidth matching on source and destinations)

## What it cannot do (yet)
- robust error checking - it can generate unsynth-able code
- simulate
- create test benches 

## quickstart keyboard shortcuts

- `spacebar` fits graph to view
- `ctrl + -` zoom out
- `ctrl + +` zoom in
  
## Flow is in its infancy!

Please contribute if you are a web, react/vite, react flow, or HDL guru! We need a lot of help simplifying logic, components, and how blocks are created. this was bootstrapped with a lot of help from AI (sorry, im not a web dev by day) and will need some TLC to get to a sane state. 

### Top priorities
- [ ] more sane UI styling
- [ ] decent appearance on mobile, although not super high priority
- [ ] better user defined block experience. a web-laymen, but HDL expert, should be able to quickly add blocks via a well defined structure without much web-code overhead. 
- [ ] better editor features/styling (like resizing editor pane)
- [ ] better block explorer pane that can be hidden
- [ ] better styling for react flow
     - [ ] highlight when wires clicks
     - [ ] better block appearance
     - [ ] fix flowgraph bugs: blocks pulled into flowgraph go out of view, resize blocks doesnt work, text on block and ports need organized better
- [ ] simplifying logic, components, and how blocks are created. this was bootstrapped with a lot of help from AI and will need some TLC to get to a sane state
- [ ] error checking bugs
     - [ ] blocks should not allow connection if sign and bitwidth do not match source to destination
     - [ ] blocks should highlight a connection red if an error occurs after connection (sign/bitwidth changes and does not match anymore)
     - [ ] clicking signed in dailogs doesnt propogate state correctly
- [ ] hierarchy needs added, you should be able to create subsystems like in simulink. i.e. flowgraphs within flowgraphs
## [DEMO](https://flow-hdl.netlify.app)

## get started with dev

1. clone
2. `npm i`
3. `npm run dev`

# Concept

1. build flowgraph
2. generate hdl
3. simulate however the hell you want

# How to add functional blocks

Blocks are located in `/components/blocks/`. users define the interface and the underlying hdl. See `/components/blocks/adder` for a good example


# Contributing Guide

First time contributors should:

1. Fork the repository
2. Set up the development environment (provide specific steps for your project)
3. Create a new branch for your work: git checkout -b feature/your-feature-name

## PR Title and Description Format
```
Title: Start with type of change (feat/fix/docs/refactor) followed by concise description
Description template:

markdownCopy## What does this PR do?
[Concise explanation]

## Related Issue
[Link to GitHub issue if applicable]

## Changes Made
[Key changes and rationale]

## Screenshots (if applicable)
[Any relevant screenshots]
PR Review Flow

Maintainers will review PRs in order of submission
Address review comments promptly
Squash commits before merging
PRs require at least one approving review before merge
```
## Branch Organization

- main - production-ready code
- develop - integration branch for features
- Feature branches: feature/feature-name

## Issue Labels

- bug - confirmed bugs
- enhancement - new features
- documentation - docs improvements
- help wanted - extra attention needed

# Structure 
This is only here so i can continually explain my project layout to AI. 

```
src/
├── components/
│   ├── blockHelpers/
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
