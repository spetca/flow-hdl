import { useState, useCallback } from "react";
import registry from "../../blocks/helpers/BlockRegistry.jsx";
import { normalizeConfig } from "../../../lib/parameterUtils";
import { createInitializedNode } from "../../../lib/nodeInitialization";

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
  onParameterChange,
}) => {
  const [moduleName, setModuleName] = useState("top_module");

  // Export functionality remains the same...
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

  // Clear functionality remains the same...
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

  // Updated import functionality
  const importFlow = useCallback(
    (flowData, onNavigateToSubflow) => {
      try {
        // Clear current state
        setNodes([]);
        setEdges([]);

        // Reinitialize nodes with proper configuration
        const reinitializedNodes = flowData.nodes.map((node) => {
          const type = node.id.split("_")[0];
          // Use getConfig instead of get
          const baseConfig = registry.getConfig(type);

          if (!baseConfig) {
            console.warn(`No configuration found for block type: ${type}`);
            return node;
          }

          // Merge imported node data with base config
          const mergedConfig = {
            ...baseConfig,
            ...node.data.config,
          };

          // Use createInitializedNode to create the node
          return createInitializedNode({
            id: node.id,
            position: node.position,
            config: mergedConfig,
            name: node.data.name,
            instanceName: node.data.instanceName,
            onParameterChange: onParameterChange,
            onNavigateToSubflow:
              onNavigateToSubflow || node.data.onNavigateToSubflow,
            isSubflow: node.data.isSubflow,
          });
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
        alert(
          `Error importing flow: ${error.message}. Please check the file format.`
        );
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
