import React, { useState, useCallback } from "react";
import { Library, Keyboard } from "lucide-react";
import FlowGraph from "./components/FlowGraph";
import BlockLibrary from "./components/BlockLibrary";
import KeyboardShortcuts from "./components/KeyboardShortcuts";
import ControlPanel from "./components/ControlPanel";
import FileDrawer from "./components/FileDrawer";
import { ReactFlowProvider } from "reactflow";
import { useHDLFlow } from "./hooks/useHDLFlow";
import { useFileManager } from "./hooks/useFileManager";

const App = () => {
  // UI State
  const [activePanel, setActivePanel] = useState("library"); // 'library' or 'shortcuts' or null

  // Flow State and Handlers
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
    exportFlow,
    importFlow,
  } = useHDLFlow();

  // File Management
  const {
    generatedFiles,
    selectedFile,
    isDrawerOpen,
    generateHDL,
    toggleFileDrawer,
    setSelectedFile,
  } = useFileManager(nodes, edges, moduleName);

  // Panel toggle handlers
  const toggleLibrary = () => {
    setActivePanel((prevPanel) => (prevPanel === "library" ? null : "library"));
  };

  const toggleShortcuts = () => {
    setActivePanel((prevPanel) =>
      prevPanel === "shortcuts" ? null : "shortcuts"
    );
  };

  // Clear graph handler
  const clearGraph = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setModuleName("top_module");
    localStorage.removeItem("flowClipboard");
  }, [setNodes, setEdges, setModuleName]);

  // HDL Generation handler
  const handleGenerateHDL = useCallback(() => {
    try {
      generateHDL();
    } catch (error) {
      console.error("Error generating HDL:", error);
      alert("Failed to generate HDL. Please check your flow graph for errors.");
    }
  }, [generateHDL]);

  return (
    <div className="w-screen h-screen flex flex-col">
      {/* Top Bar */}
      <div className="h-12 border-b flex items-center px-4 bg-white">
        <h1 className="text-xl font-semibold">flow hdl</h1>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={toggleShortcuts}
            className={`p-2 rounded-md flex items-center gap-2 text-sm transition-colors ${
              activePanel === "shortcuts"
                ? "bg-black text-white"
                : "hover:bg-gray-100"
            }`}
            title="Toggle Keyboard Shortcuts"
          >
            <Keyboard className="w-5 h-5" />
            <span>Shortcuts</span>
          </button>
          <button
            onClick={toggleLibrary}
            className={`p-2 rounded-md flex items-center gap-2 text-sm transition-colors ${
              activePanel === "library"
                ? "bg-black text-white"
                : "hover:bg-gray-100"
            }`}
            title="Toggle Block Library"
          >
            <Library className="w-5 h-5" />
            <span>
              {activePanel === "library" ? "Hide Library" : "Show Library"}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative">
        <ReactFlowProvider>
          <ControlPanel
            moduleName={moduleName}
            setModuleName={setModuleName}
            generateHDL={handleGenerateHDL}
            exportFlow={exportFlow}
            setShowClearConfirmation={clearGraph}
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
