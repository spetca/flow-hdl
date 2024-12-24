import React, { useEffect } from "react";
import ReactFlow, {
  Controls,
  Background,
  Panel,
  SelectionMode,
} from "reactflow";
import "reactflow/dist/style.css";
import HDLNode from "./hdlnode/HDLNode";
import { useFlowKeyboardShortcuts } from "./hooks/useFlowKeyboardShortcuts";

const nodeTypes = {
  hdlNode: HDLNode,
};

const FlowGraph = ({
  nodes,
  edges,
  setNodes,
  setEdges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onDrop,
  onDragOver,
  currentSystem,
  navigateToParent,
  importFlow,
}) => {
  // Use the keyboard shortcuts hook
  useFlowKeyboardShortcuts({ setNodes, setEdges });

  // Import default flow on component mount
  useEffect(() => {
    const importDefaultFlow = async () => {
      try {
        const defaultFlowModule = await import(
          "../../assets/default_flow.json"
        );
        if (defaultFlowModule.default) {
          // Use importFlow instead of directly setting nodes and edges
          importFlow(defaultFlowModule.default);
        }
      } catch (error) {
        console.error("Error importing default flow:", error);
        setNodes([]);
        setEdges([]);
      }
    };

    importDefaultFlow();
  }, [importFlow, setNodes, setEdges]);

  return (
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
          <button
            onClick={navigateToParent}
            className="px-3 py-1.5 bg-white border border-black/80 rounded text-sm font-medium hover:bg-black hover:text-white transition-colors duration-200"
          >
            ← Back to {currentSystem.parent.name}
          </button>
        </Panel>
      )}
    </ReactFlow>
  );
};

export default FlowGraph;
