// src/components/flowgraph/hooks/useFlowNodes.jsx
import { useNodesState } from "reactflow";
import { useCallback } from "react";
import registry from "../../blockHelpers/BlockRegistry";
import { createInitializedNode } from "../../../lib/nodeInitialization";

export const useFlowNodes = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);

  const onParameterChange = useCallback((nodeId, updates) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              name: updates.name,
              config: updates.config,
              params: updates.params,
              onParameterChange,
              onNavigateToSubflow: node.data.onNavigateToSubflow,
              isSubflow: node.data.isSubflow,
            },
          };
        }
        return node;
      })
    );
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/json");
      const reactFlowBounds = event.target
        .closest(".react-flow")
        .getBoundingClientRect();
      const position = {
        x: (event.clientX - reactFlowBounds.left - 100) / 1.5,
        y: (event.clientY - reactFlowBounds.top - 50) / 1.5,
      };

      const config = registry.get(type);
      const newNodeId = `${type}_${Date.now()}`;
      const nodeName = `${type}${nodes.length}`;

      const newNode = createInitializedNode({
        id: newNodeId,
        position,
        config,
        name: nodeName,
        onParameterChange,
        isSubflow: type === "subflow",
        onNavigateToSubflow: nodes[0]?.data?.onNavigateToSubflow, // Pass from existing node
      });

      setNodes((nds) => [...nds, newNode]);
    },
    [nodes, onParameterChange]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  return {
    nodes,
    setNodes,
    onNodesChange,
    onDrop,
    onDragOver,
    onParameterChange,
  };
};
