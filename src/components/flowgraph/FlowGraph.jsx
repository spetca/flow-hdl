// src/components/flowgraph/FlowGraph.jsx
import React, { useEffect, useCallback } from "react";
import ReactFlow, {
  Controls,
  Background,
  Panel,
  SelectionMode,
} from "reactflow";
import "reactflow/dist/style.css";
import FlowNode from "./node/FlowNode"; // Updated import
import FlowEdge from "./edges/FlowEdge"; // Updated import
import { useFlowKeyboardShortcuts } from "./hooks/useFlowKeyboardShortcuts";
import { useConnectionValidator } from "./utils/connectionValidator";

const nodeTypes = {
  hdlNode: FlowNode, // Keep the key as hdlNode for compatibility
};

const edgeTypes = {
  default: FlowEdge,
};

const defaultEdgeOptions = {
  type: "default",
  animated: true,
  style: { stroke: "#333" },
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
  currentSubflowId,
  onNavigateBack,
  importFlow,
  generateHDL,
  onParameterChange,
}) => {
  useFlowKeyboardShortcuts({
    setNodes,
    setEdges,
    generateHDL,
    onParameterChange,
  });

  const validateConnections = useConnectionValidator(edges, setEdges);

  useEffect(() => {
    if (edges?.length > 0) {
      validateConnections();
    }
  }, [nodes, edges, validateConnections]);

  // Import default flow logic remains the same
  useEffect(() => {
    const importDefaultFlow = async () => {
      try {
        const defaultFlowModule = await import(
          "../../assets/default_flow.json"
        );
        if (defaultFlowModule.default && importFlow) {
          importFlow(defaultFlowModule.default);
        }
      } catch (error) {
        console.error("Error importing default flow:", error);
        setNodes([]);
        setEdges([]);
      }
    };

    if (nodes.length === 0) {
      importDefaultFlow();
    }
  }, [importFlow, setNodes, setEdges, nodes.length]);

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
      edgeTypes={edgeTypes}
      defaultEdgeOptions={defaultEdgeOptions}
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

      {(currentSubflowId || (currentSystem && currentSystem.parent)) && (
        <Panel position="top-center">
          <button
            onClick={currentSubflowId ? onNavigateBack : navigateToParent}
            className="px-3 py-1.5 bg-white border border-black/80 rounded text-sm font-medium hover:bg-black hover:text-white transition-colors duration-200"
          >
            ← Back to{" "}
            {currentSubflowId ? "Parent Flow" : currentSystem.parent.name}
          </button>
        </Panel>
      )}
    </ReactFlow>
  );
};

export default FlowGraph;
