import React, {useState} from "react";
import FlowGraph from "./components/flowgraph/FlowGraph";
import BlockLibrary from "./components/controls/BlockLibrary.jsx";
import KeyboardShortcuts from "./components/controls/KeyboardShortcuts";
import ControlPanel from "./components/controls/ControlPanel";
import FileDrawer from "./components/controls/FileDrawer.jsx";
import {ReactFlowProvider} from "reactflow";
import {useFlow} from "./components/flowgraph/hooks/useFlow";
import {useFileManager} from "./hooks/useFileManager";
import ReferenceSection from "./components/controls/ReferenceSection.jsx";

const App = () => {
    const [activePanel, setActivePanel] = useState("library");

    const {
        nodes,
        edges,
        setNodes,
        setEdges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        onDrop,
        onDragOver,
        moduleName,
        setModuleName,
        currentSystem,
        navigateToParent,
        currentSubflowId,
        onNavigateBack,
        exportFlow,
        importFlow,
        clearGraph,
        onParameterChange,
    } = useFlow();

    const {
        generatedFiles,
        selectedFile,
        isDrawerOpen,
        generateHDL,
        toggleFileDrawer,
        setSelectedFile,
    } = useFileManager(nodes, edges, moduleName);

    return (
        <div className="w-screen h-screen flex flex-col">
            <div className="h-12 border-b flex items-center px-4 bg-white">
                <h1 className="text-xl font-semibold">flow hdl</h1>
                <ReferenceSection
                    activePanel={activePanel}
                    setActivePanel={setActivePanel}
                />
            </div>
            <div className="flex-1 relative">
                <ReactFlowProvider>
                    <ControlPanel
                        moduleName={moduleName}
                        setModuleName={setModuleName}
                        generateHDL={generateHDL}
                        exportFlow={exportFlow}
                        clearGraph={clearGraph}
                        importFlow={importFlow}
                    />

                    <FlowGraph
                        nodes={nodes}
                        edges={edges}
                        setNodes={setNodes}
                        setEdges={setEdges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        currentSystem={currentSystem}
                        navigateToParent={navigateToParent}
                        currentSubflowId={currentSubflowId}
                        onNavigateBack={onNavigateBack}
                        importFlow={importFlow}
                        generateHDL={generateHDL}
                        onParameterChange={onParameterChange}
                    />

                    <KeyboardShortcuts
                        isOpen={activePanel === "shortcuts"}
                    />

                    <BlockLibrary
                        isOpen={activePanel === "library"}
                    />

                    <FileDrawer
                        isOpen={isDrawerOpen}
                        files={generatedFiles}
                        selectedFile={selectedFile}
                        onFileSelect={setSelectedFile}
                        onClose={toggleFileDrawer}
                    />
                </ReactFlowProvider>
            </div>
        </div>
    );
};

export default App;