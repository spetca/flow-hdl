import React, { useState, useCallback } from "react";
import { Library } from "lucide-react";
import FlowGraph from "./components/FlowGraph";
import BlockLibrary from "./components/BlockLibrary";
import ControlPanel from "./components/ControlPanel";
import FileDrawer from "./components/FileDrawer";
import { ReactFlowProvider } from "reactflow";
import { useHDLFlow } from "./hooks/useHDLFlow";
import { useFileManager } from "./hooks/useFileManager";

const App = () => {
  // UI State
  const [isLibraryOpen, setIsLibraryOpen] = useState(true);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);

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

  // Clear graph handler with undo history clearing
  const clearGraph = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setModuleName("top_module");
    setShowClearConfirmation(false);
    localStorage.removeItem("flowClipboard");
  }, [setNodes, setEdges, setModuleName]);

  // HDL Generation handler with error handling
  const handleGenerateHDL = useCallback(() => {
    try {
      generateHDL();
    } catch (error) {
      console.error("Error generating HDL:", error);
      alert("Failed to generate HDL. Please check your flow graph for errors.");
    }
  }, [generateHDL]);

  // Confirmation Modal Component
  const ClearConfirmationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <h2 className="text-xl font-bold mb-4">Clear Entire Flow Graph</h2>
        <p className="mb-4">
          Are you sure you want to clear the entire flow graph? This action
          cannot be undone.
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setShowClearConfirmation(false)}
            className="px-3 py-1.5 bg-white border border-black/80 rounded text-sm font-medium hover:bg-black hover:text-white transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={clearGraph}
            className="px-3 py-1.5 bg-white border border-red-500 text-red-500 rounded text-sm font-medium hover:bg-red-500 hover:text-white transition-colors duration-200"
          >
            Clear Graph
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-screen h-screen flex flex-col">
      {/* Top Bar */}
      <div className="h-12 border-b flex items-center px-4 bg-white">
        <h1 className="text-xl font-semibold">flow hdl</h1>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setIsLibraryOpen(!isLibraryOpen)}
            className="p-2 hover:bg-gray-100 rounded-md flex items-center gap-2 text-sm"
            title={isLibraryOpen ? "Hide Library" : "Show Library"}
          >
            <Library className="w-5 h-5" />
            <span>{isLibraryOpen ? "Hide Library" : "Show Library"}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative">
        <ReactFlowProvider>
          {/* Control Panel */}
          <ControlPanel
            moduleName={moduleName}
            setModuleName={setModuleName}
            generateHDL={handleGenerateHDL}
            exportFlow={exportFlow}
            setShowClearConfirmation={setShowClearConfirmation}
            importFlow={importFlow}
          />

          {/* Flow Graph */}
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

          {/* Block Library */}
          <BlockLibrary
            isOpen={isLibraryOpen}
            onToggle={() => setIsLibraryOpen(!isLibraryOpen)}
          />

          {/* File Drawer */}
          <FileDrawer
            isOpen={isDrawerOpen}
            files={generatedFiles}
            selectedFile={selectedFile}
            onFileSelect={setSelectedFile}
            onClose={toggleFileDrawer}
          />

          {/* Confirmation Modal */}
          {showClearConfirmation && <ClearConfirmationModal />}
        </ReactFlowProvider>
      </div>
    </div>
  );
};

export default App;
