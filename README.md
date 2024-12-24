# flow hdl

flow hdl is an open source web-based flowgraph HDL generator inspired by tools like Simulink HDL Coder and GNU Radio. flow graphs can easily be exported and imported via a common json structure.

The first goal of the project is to generate decent system verilog from complex hierarchical flowgraphs.

<img width="1403" alt="image" src="https://github.com/user-attachments/assets/1e67576d-22a9-4536-8217-d0025b2aba04" />

## [DEMO - Not mobile friendly!](https://flow-hdl.netlify.app)

## why react/javascript

You might be asking, "Why build this with web tech?" The answer is simple: Web technologies, especially tools like React, have a huge and active community of developers already familiar with them. By building this HDL/Verilog generation tool as a web app, I want to make it as accessible as possible to a wide range of developers so they can contribute and help improve the tool. It's all about creating an open, collaborative environment that allows us to make real progress in generating hardware descriptions from flowgraphs. Whether you're a hardware designer or just someone who's comfortable with web dev, this platform makes it easy to get involved and move the project forward.

## What it can do

- create simple HDL from predfined user blocks
- do some very crude error checking (sign/bitwidth matching on source and destinations)

## What it cannot do (yet)

- robust error checking - it can generate unsynth-able code
- simulate
- create test benches

## contributing

flow is in its **infancy** and any contribution is greatly appreciated - check out [how to contribute](#Contributing-Guide)

## Flow is in its infancy!

Please contribute if you are a web, react/vite, react flow, or HDL guru! We need a lot of help simplifying logic, components, and how blocks are created. this was bootstrapped with a lot of help from AI (sorry, im not a web dev by day) and will need some TLC to get to a sane state.

### Top priorities

- [ ] more sane UI styling
- [ ] decent appearance on mobile, although not super high priority
- [x] better user defined block experience. a web-laymen, but HDL expert, should be able to quickly add blocks via a well defined structure without much web-code overhead.
- [x] better editor features/styling (like resizing editor pane)
- [x] better block explorer pane that can be hidden
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

# Concept

1. build flowgraph
2. generate hdl
3. simulate however the hell you want

# How to add functional blocks

Blocks are located in `/components/blocks/`. users define the interface and the underlying hdl. See `/components/blocks/adder` for a good example

# Contributing Guide

First time contributors should:

1. Fork the repository
2. Set up the development environment

- get started with dev
  1. clone
  2. `npm i`
  3. `npm run dev`

4. Create a new branch for your work from the develop branch: git checkout -b feature/your-feature-name

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
│   ├── blocks/                  # Individual block components
│   │   ├── Adder.jsx
│   │   ├── Multiplier.jsx
│   │   ├── InPort.jsx
│   │   ├── OutPort.jsx
│   │   ├── Delay.jsx
│   ├── flowgraph/               # Flowgraph-related logic
│   │   ├── FlowGraph.jsx
│   │   ├── HDLNode.jsx
│   │   ├── hooks/
│   │   │   ├── useFlowKeyboardShortcuts.jsx
│   │   │   ├── useHDLFlow.jsx
│   │   ├── BlockLibrary.jsx     # Displays available blocks
│   ├── file/                    # File-related components
│   │   ├── FileDrawer.jsx
│   │   ├── FileManager.jsx      # Wrapper component for file handling
│   ├── controls/                # User control components
│   │   ├── ControlPanel.jsx
│   │   ├── KeyoardShortcuts.jsx
│   │   ├── ModuleNameInput.jsx
│   ├── blockHelpers/            # Block-related helpers
│   │   ├── BlockFactory.jsx
├── hooks/                       # Shared hooks
│   ├── useFileManager.jsx
|── lib/
│   ├── SystemVerilogGenerator.jsx
```
