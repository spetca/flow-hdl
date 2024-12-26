// src/components/flowgraph/hooks/useNodeNavigation.jsx
import { useCallback } from "react";

export const useNodeNavigation = (data, id, setIsConfigOpen) => {
  // This came from HDLNode's navigation logic
  const handleDoubleClick = useCallback(
    (e) => {
      e.preventDefault();
      setIsConfigOpen(true);
    },
    [setIsConfigOpen]
  );

  const handleSubflowDoubleClick = useCallback(
    (e) => {
      if (data.isSubflow && data.onNavigateToSubflow) {
        e.preventDefault();
        e.stopPropagation();
        data.onNavigateToSubflow(id, data.name);
      } else {
        handleDoubleClick(e);
      }
    },
    [data, id, handleDoubleClick]
  );

  return {
    handleDoubleClick,
    handleSubflowDoubleClick,
  };
};
