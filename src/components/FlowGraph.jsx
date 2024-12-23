import React, { useCallback, useEffect, useState } from "react";
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  useReactFlow,
  Panel,
  ConnectionMode,
  SelectionMode,
  getConnectedEdges,
} from "reactflow";
import "reactflow/dist/style.css";
import HDLNode from "./blockHelpers/HDLNode";
import { useHDLFlow } from "../hooks/useHDLFlow";
import { useFileManager } from "../hooks/useFileManager";
import ModuleNameInput from "./ModuleNameInput";
import FileDrawer from "./FileDrawer";

const nodeTypes = {
  hdlNode: HDLNode,
};

const FlowGraph = () => {
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
    navigateToChild,
    exportFlow,
    importFlow,
  } = useHDLFlow();

  const {
    generatedFiles,
    selectedFile,
    isDrawerOpen,
    generateHDL,
    toggleFileDrawer,
    setSelectedFile,
  } = useFileManager(nodes, edges, moduleName);

  const { fitView, zoomIn, zoomOut, getNodes, getEdges, project } =
    useReactFlow();

  const [showClearConfirmation, setShowClearConfirmation] = useState(false);

  // Clear graph function
  const clearGraph = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setModuleName("top_module");
    setShowClearConfirmation(false);
  }, [setNodes, setEdges, setModuleName]);

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
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={clearGraph}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear Graph
          </button>
        </div>
      </div>
    </div>
  );

  // Import default flow on component mount
  useEffect(() => {
    const importDefaultFlow = async () => {
      try {
        // Dynamically import the default JSON
        const defaultFlowModule = await import("../assets/default_flow.json");
        importFlow(defaultFlowModule.default);
      } catch (error) {
        console.error("Error importing default flow:", error);
        // Optionally set up an empty initial state
        setNodes([]);
        setEdges([]);
      }
    };

    importDefaultFlow();
  }, [importFlow, setNodes, setEdges]);

  // Handle keyboard shortcuts including copy/paste
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Spacebar for fit view
      if (event.key === " " || event.code === "Space") {
        event.preventDefault();
        fitView({ padding: 0.1 });
      }

      // Ctrl + Plus/Equals for zoom in
      if (
        (event.ctrlKey || event.metaKey) &&
        (event.key === "+" || event.key === "=")
      ) {
        event.preventDefault();
        zoomIn();
      }

      // Ctrl + Minus for zoom out
      if ((event.ctrlKey || event.metaKey) && event.key === "-") {
        event.preventDefault();
        zoomOut();
      }

      // Copy/Paste functionality
      if (event.ctrlKey || event.metaKey) {
        if (event.key === "c") {
          // Handle Copy
          const selectedNodes = getNodes().filter((node) => node.selected);
          if (selectedNodes.length === 0) return;

          const selectedEdges = getConnectedEdges(selectedNodes, getEdges());

          const clipboard = {
            nodes: selectedNodes.map((node) => ({
              ...node,
              position: { ...node.position },
            })),
            edges: selectedEdges,
          };

          localStorage.setItem("flowClipboard", JSON.stringify(clipboard));
        }

        if (event.key === "v") {
          // Handle Paste
          try {
            const clipboard = JSON.parse(localStorage.getItem("flowClipboard"));
            if (!clipboard) return;

            const now = Date.now();
            const idMap = {};

            // Create new nodes with offset positions
            const newNodes = clipboard.nodes.map((node) => {
              const newId = `${node.type}_${now}_${Math.random()
                .toString(36)
                .substr(2, 9)}`;
              idMap[node.id] = newId;

              // Get viewport position for proper placement
              const { x, y } = project({
                x: node.position.x + 50,
                y: node.position.y + 50,
              });

              return {
                ...node,
                id: newId,
                position: { x, y },
                selected: false,
                data: {
                  ...node.data,
                  name: `${node.data.config.type}${getNodes().length}`,
                },
              };
            });

            // Create new edges with updated node references
            const newEdges = clipboard.edges.map((edge) => ({
              ...edge,
              id: `${edge.type}_${now}_${Math.random()
                .toString(36)
                .substr(2, 9)}`,
              source: idMap[edge.source],
              target: idMap[edge.target],
              selected: false,
            }));

            setNodes((nodes) => [...nodes, ...newNodes]);
            setEdges((edges) => [...edges, ...newEdges]);
          } catch (error) {
            console.error("Failed to paste nodes:", error);
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    fitView,
    zoomIn,
    zoomOut,
    getNodes,
    getEdges,
    project,
    setNodes,
    setEdges,
  ]);

  return (
    <div className="h-screen">
      <Panel position="top-left" className="flex gap-2">
        <ModuleNameInput value={moduleName} onChange={setModuleName} />
        <button
          onClick={generateHDL}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Generate HDL
        </button>
        <button
          onClick={exportFlow}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Export Flow
        </button>
        <button
          onClick={() => setShowClearConfirmation(true)}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Clear Graph
        </button>
        <label className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors cursor-pointer">
          Import Flow
          <input
            type="file"
            accept=".json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files[0];
              if (!file) return;

              const reader = new FileReader();
              reader.onload = (e) => {
                try {
                  const flowData = JSON.parse(e.target.result);
                  importFlow(flowData);
                } catch (error) {
                  console.error("Error importing flow graph:", error);
                  alert(
                    "Error importing flow graph. Please check the file format."
                  );
                }
              };
              reader.readAsText(file);
            }}
          />
        </label>
      </Panel>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        selectionMode={SelectionMode.Partial}
        deleteKeyCode={["Backspace", "Delete"]}
        multiSelectionKeyCode={["Control", "Meta"]}
        panOnDrag={true}
        selectionOnDrag={true}
        panOnScroll={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        selectNodesOnDrag={true}
        className="w-full h-full bg-gray-50"
        style={{ backgroundColor: "#F7F9FB" }}
      >
        <Background variant="dots" gap={10} size={1} color="#ccc" />
        <Controls
          className="bg-white"
          showInteractive={true}
          fitViewOptions={{ padding: 0.1 }}
        />

        {currentSystem && currentSystem.parent && (
          <Panel position="top-center">
            <button onClick={navigateToParent}>
              ← Back to {currentSystem.parent.name}
            </button>
          </Panel>
        )}
      </ReactFlow>

      <FileDrawer
        isOpen={isDrawerOpen}
        files={generatedFiles}
        selectedFile={selectedFile}
        onFileSelect={setSelectedFile}
        onClose={toggleFileDrawer}
      />

      {/* Confirmation Modal */}
      {showClearConfirmation && <ClearConfirmationModal />}
    </div>
  );
};

export default FlowGraph;
