// src/components/flowgraph/hooks/useFlowNodes.jsx
import { useNodesState } from "reactflow";
import { useCallback } from "react";
import registry from "../../blockHelpers/BlockRegistry";
import { createInitializedNode } from "../../../lib/nodeInitialization";

export const useFlowNodes = ({
  onNavigateToSubflow,
  setHierarchicalBlocks,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);

  const onParameterChange = useCallback(
    (nodeId, updates) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            console.log("onparamchange", updates);

            return {
              ...node,
              data: {
                ...node.data,
                name: updates.name,
                config: updates.config,
                instanceName: updates.config.instanceName,
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

      if (updates.isSubflow && updates.config.ports) {
        setHierarchicalBlocks((prev) => {
          const blockData = prev.get(nodeId) || { nodes: [], edges: [] };
          return new Map(
            prev.set(nodeId, {
              ...blockData,
              ports: updates.config.ports,
            })
          );
        });
      }
    },
    [setHierarchicalBlocks]
  );

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
        name: config.name,
        instanceName: nodeName,
        onParameterChange,
        isSubflow: type === "subflow",
        onNavigateToSubflow,
      });

      if (type === "subflow") {
        setHierarchicalBlocks((prev) => {
          const initializedPorts = newNode.data.config.ports;
          return new Map(
            prev.set(newNodeId, {
              nodes: [],
              edges: [],
              ports: initializedPorts,
            })
          );
        });
      }

      setNodes((nds) => [...nds, newNode]);
    },
    [nodes, onParameterChange, onNavigateToSubflow, setHierarchicalBlocks]
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
