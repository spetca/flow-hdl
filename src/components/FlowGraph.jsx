import React, { useCallback, useEffect } from "react";
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

  const defaultEdgeOptions = {
    style: { strokeWidth: 2, stroke: "#333" },
    type: "smoothstep",
    markerEnd: { type: "arrowclosed", color: "#333" },
  };

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
        defaultEdgeOptions={defaultEdgeOptions}
        connectionLineStyle={{ stroke: "black", strokeWidth: 2 }}
        connectionMode={ConnectionMode.Loose}
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
      >
        <Background variant="dots" gap={12} size={1} color="#ccc" />
        <Controls
          className="bg-white"
          showInteractive={true}
          fitViewOptions={{ padding: 0.1 }}
        />
        <MiniMap
          className="bg-white rounded-lg shadow-lg"
          nodeColor={(node) => {
            switch (node.data?.config?.type) {
              case "inport":
                return "#0050FF";
              case "outport":
                return "#FF2E8B";
              default:
                return "#A845D0";
            }
          }}
          maskColor="rgba(255, 255, 255, 0.5)"
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
    </div>
  );
};

export default FlowGraph;
