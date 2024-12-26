// src/components/flowgraph/hooks/useFlowSubflows.jsx
import { useState, useCallback } from "react";

export const useFlowSubflows = () => {
  const [flowStack, setFlowStack] = useState([
    { id: "top", name: "Top Level", nodes: [], edges: [] },
  ]);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [subflowStack, setSubflowStack] = useState([]);
  const [currentSubflowId, setCurrentSubflowId] = useState(null);
  const [hierarchicalBlocks, setHierarchicalBlocks] = useState(new Map());
  const [parentState, setParentState] = useState(null);

  const navigateToChild = useCallback(
    (childId, childName) => {
      setFlowStack((stack) => [
        ...stack,
        {
          id: childId,
          name: childName,
          nodes: [],
          edges: [],
          parent: flowStack[currentLevel],
        },
      ]);
      setCurrentLevel((prev) => prev + 1);
    },
    [currentLevel, flowStack]
  );

  const navigateToParent = useCallback(() => {
    if (currentLevel === 0) return;

    setCurrentLevel((prev) => prev - 1);
  }, [currentLevel]);

  const onNavigateToSubflow = useCallback(
    (subflowId, subflowName) => {
      setParentState((prev) => ({
        ...prev,
        isSubflow: true,
        id: subflowId,
        name: subflowName,
      }));

      const subflowState = hierarchicalBlocks.get(subflowId) || {
        nodes: [],
        edges: [],
        ports: {},
      };

      setSubflowStack((prev) => [
        ...prev,
        { id: subflowId, name: subflowName },
      ]);
      setCurrentSubflowId(subflowId);
    },
    [hierarchicalBlocks]
  );

  const onNavigateBack = useCallback(() => {
    if (!currentSubflowId || subflowStack.length === 0) return;

    setSubflowStack((prev) => prev.slice(0, -1));
    setCurrentSubflowId(null);
    setParentState(null);
  }, [currentSubflowId, subflowStack.length]);

  return {
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
  };
};
