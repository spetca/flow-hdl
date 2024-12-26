// src/App.jsx
import React, { useState } from "react";
import FlowGraph from "./components/flowgraph/FlowGraph";
import BlockLibrary from "./components/BlockLibrary";
import KeyboardShortcuts from "./components/controls/KeyboardShortcuts";
import ControlPanel from "./components/controls/ControlPanel";
import FileDrawer from "./components/file/FileDrawer";
import { ReactFlowProvider } from "reactflow";
import { useFlow } from "./components/flowgraph/hooks/useFlow"; // Updated import
import { useFileManager } from "./hooks/useFileManager";

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
  } = useFlow(); // Using new useFlow hook

  const {
    generatedFiles,
    selectedFile,
    isDrawerOpen,
    generateHDL,
    toggleFileDrawer,
    setSelectedFile,
  } = useFileManager(nodes, edges, moduleName);

  const toggleLibrary = () => {
    setActivePanel((prevPanel) => (prevPanel === "library" ? null : "library"));
  };

  const toggleShortcuts = () => {
    setActivePanel((prevPanel) =>
      prevPanel === "shortcuts" ? null : "shortcuts"
    );
  };

  const handleGenerateHDL = () => {
    try {
      generateHDL();
    } catch (error) {
      console.error("Error generating HDL:", error);
      alert("Failed to generate HDL. Please check your flow graph for errors.");
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col">
      {/* Rest of the component remains the same */}
      <div className="h-12 border-b flex items-center px-4 bg-white">
        {/* ... existing top bar code ... */}
      </div>

      <div className="flex-1 relative">
        <ReactFlowProvider>
          <ControlPanel
            moduleName={moduleName}
            setModuleName={setModuleName}
            generateHDL={handleGenerateHDL}
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
            generateHDL={handleGenerateHDL}
            onParameterChange={onParameterChange}
          />

          <KeyboardShortcuts
            isOpen={activePanel === "shortcuts"}
            onToggle={toggleShortcuts}
          />

          <BlockLibrary
            isOpen={activePanel === "library"}
            onToggle={toggleLibrary}
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
