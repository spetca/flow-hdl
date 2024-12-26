// src/components/flowgraph/hooks/useFlowIO.jsx
import { useState, useCallback } from "react";
import registry from "../../blockHelpers/BlockRegistry";
import { normalizeConfig } from "../../../lib/parameterUtils";

export const useFlowIO = ({
  nodes,
  edges,
  flowStack,
  currentLevel,
  hierarchicalBlocks,
  setNodes,
  setEdges,
  setFlowStack,
  setCurrentLevel,
  setSubflowStack,
  setCurrentSubflowId,
  setHierarchicalBlocks,
  setParentState,
}) => {
  const [moduleName, setModuleName] = useState("top_module");

  // Export the current flow state to a JSON file
  const exportFlow = useCallback(() => {
    const flowData = {
      nodes,
      edges,
      moduleName,
      hierarchicalBlocks: Array.from(hierarchicalBlocks.entries()),
      flowStack,
      currentLevel,
    };

    const blob = new Blob([JSON.stringify(flowData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${moduleName}_flowgraph.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [nodes, edges, moduleName, hierarchicalBlocks, flowStack, currentLevel]);

  // Reset all state to initial values
  const clearGraph = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setModuleName("top_module");
    setFlowStack([{ id: "top", name: "Top Level", nodes: [], edges: [] }]);
    setCurrentLevel(0);
    setSubflowStack([]);
    setCurrentSubflowId(null);
    setHierarchicalBlocks(new Map());
    setParentState(null);
    localStorage.removeItem("flowClipboard");
  }, [
    setNodes,
    setEdges,
    setModuleName,
    setFlowStack,
    setCurrentLevel,
    setSubflowStack,
    setCurrentSubflowId,
    setHierarchicalBlocks,
    setParentState,
  ]);

  // Import a flow from a JSON file
  const importFlow = useCallback(
    (flowData) => {
      try {
        // Clear current state
        setNodes([]);
        setEdges([]);

        // Reinitialize nodes with proper configuration
        const reinitializedNodes = flowData.nodes.map((node) => {
          const type = node.id.split("_")[0];
          const baseConfig = registry.get(type);

          // Initialize ports with proper structure
          const ports = {
            inputs: {},
            outputs: {},
          };

          // Handle input ports
          Object.entries(node.data.config.ports.inputs || {}).forEach(
            ([portName, portConfig]) => {
              ports.inputs[portName] = {
                width: { default: portConfig.width?.default || 32 },
                signed: { default: portConfig.signed?.default || false },
              };
            }
          );

          // Handle output ports
          Object.entries(node.data.config.ports.outputs || {}).forEach(
            ([portName, portConfig]) => {
              ports.outputs[portName] = {
                width: { default: portConfig.width?.default || 32 },
                signed: { default: portConfig.signed?.default || false },
              };
            }
          );

          // Create reinitialized node with normalized config
          return {
            ...node,
            type: "hdlNode",
            data: {
              ...node.data,
              config: normalizeConfig({
                ...baseConfig,
                ...node.data.config,
                ports,
              }),
              params: node.data.params || {},
            },
          };
        });

        // Reinitialize edges with proper styling
        const reinitializedEdges = flowData.edges.map((edge) => ({
          ...edge,
          type: "default",
          animated: true,
          style: { stroke: "#333" },
        }));

        // Update all state
        setNodes(reinitializedNodes);
        setEdges(reinitializedEdges);
        setModuleName(flowData.moduleName);

        if (flowData.hierarchicalBlocks) {
          setHierarchicalBlocks(new Map(flowData.hierarchicalBlocks));
        }

        if (flowData.flowStack) {
          setFlowStack(flowData.flowStack);
          setCurrentLevel(flowData.currentLevel || 0);
        }
      } catch (error) {
        console.error("Error importing flow:", error);
        alert("Error importing flow. Please check the file format.");
      }
    },
    [
      setNodes,
      setEdges,
      setModuleName,
      setFlowStack,
      setCurrentLevel,
      setHierarchicalBlocks,
    ]
  );

  return {
    moduleName,
    setModuleName,
    exportFlow,
    importFlow,
    clearGraph,
  };
};
