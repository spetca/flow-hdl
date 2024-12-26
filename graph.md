graph TD
subgraph UI["User Interface Layer"]
App["App.jsx\n(Main Application)"]
CP["ControlPanel.jsx\n(Top Controls)"]
BL["BlockLibrary.jsx\n(Block Palette)"]
KS["KeyboardShortcuts.jsx\n(Shortcuts Panel)"]
FD["FileDrawer.jsx\n(Generated Files View)"]
end

    subgraph Core["Core Components"]
        FG["FlowGraph.jsx\n(Main Canvas)"]
        HDN["HDLNode.jsx\n(Block Implementation)"]
        BC["BlockConfiguration.jsx\n(Block Settings)"]
    end

    subgraph Blocks["Block Definitions"]
        BF["BlockFactory.jsx\n(Block Creator)"]
        BR["blockRegistry\n(Available Blocks)"]
        subgraph BlockTypes["Block Types"]
            IB[InPort Block]
            OB[OutPort Block]
            AB[Adder Block]
            MB[Multiplier Block]
            DB[Delay Block]
            SB["SubFlow Block\n(Hierarchical)"]
        end
    end

    subgraph State["State Management"]
        HF["useHDLFlow Hook\n(Flow State)"]
        FM["useFileManager Hook\n(File Operations)"]
    end

    subgraph Utils["Utilities"]
        SVG["SystemVerilogGenerator\n(HDL Generation)"]
        SU["shapeUtils\n(Block Shapes)"]
        PU["parameterUtils\n(Block Parameters)"]
        NI["nodeInitialization\n(Block Setup)"]
    end

    %% Connections
    App --> CP
    App --> BL
    App --> KS
    App --> FD
    App --> FG

    FG --> HDN
    HDN --> BC

    BF --> BR
    BR --> BlockTypes
    BlockTypes --> HDN

    App --> HF
    App --> FM

    HF --> FG
    FM --> SVG

    HDN --> SU
    HDN --> PU
    HDN --> NI

    %% New Features
    subgraph NewFeatures["New/Updated Features"]
        style NewFeatures fill:#e1f5fe,stroke:#01579b
        BW["Bitwidth Display\nand Validation"]
        CS["Connection Styling\n(Sign + Width Labels)"]
        SF["SubFlow Navigation\nand Generation"]
        VP["Verilog\nParameterization"]
    end

    HDN --> BW
    FG --> CS
    SB --> SF
    SVG --> VP

    %% Flow Validation
    subgraph Validation["Connection Validation"]
        style Validation fill:#f3e5f5,stroke:#4a148c
        CV["Connection Validator\n(Sign + Width Check)"]
        CH["Connection Highlighter\n(Visual Feedback)"]
    end

    FG --> CV
    CV --> CH
