// src/components/flowgraph/hooks/useFlow.jsx
import { useFlowNodes } from "./useFlowNodes";
import { useFlowEdges } from "./useFlowEdges";
import { useFlowSubflows } from "./useFlowSubflows";
import { useFlowIO } from "./useFlowIO";

export const useFlow = () => {
  // Start with subflows since other hooks depend on its state
  const {
    flowStack,
    setFlowStack,
    currentLevel,
    setCurrentLevel,
    subflowStack,
    setSubflowStack,
    currentSubflowId,
    setCurrentSubflowId,
    hierarchicalBlocks,
    setHierarchicalBlocks,
    parentState,
    setParentState,
    navigateToChild,
    navigateToParent,
    onNavigateToSubflow,
    onNavigateBack,
  } = useFlowSubflows();

  // Node management
  const {
    nodes,
    setNodes,
    onNodesChange,
    onDrop,
    onDragOver,
    onParameterChange,
  } = useFlowNodes({
    onNavigateToSubflow,
    setHierarchicalBlocks,
  });

  // Edge management
  const { edges, setEdges, onEdgesChange, onConnect } = useFlowEdges({ nodes });

  // IO operations
  const { moduleName, setModuleName, exportFlow, importFlow, clearGraph } =
    useFlowIO({
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
    });

  return {
    // Node operations
    nodes,
    setNodes,
    onNodesChange,
    onDrop,
    onDragOver,
    onParameterChange,

    // Edge operations
    edges,
    setEdges,
    onEdgesChange,
    onConnect,

    // Subflow navigation
    currentSubflowId,
    onNavigateToSubflow,
    onNavigateBack,
    navigateToChild,
    navigateToParent,

    // Flow management
    moduleName,
    setModuleName,
    exportFlow,
    importFlow,
    clearGraph,

    // System info
    currentSystem: flowStack[currentLevel],
  };
};
