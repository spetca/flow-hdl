// src/components/flowgraph/hooks/useNodeResize.jsx
import { useState, useCallback, useEffect } from "react";

export const useNodeResize = (config) => {
  // This came from HDLNode's resize logic
  const [nodeSize, setNodeSize] = useState({
    width: config.shape?.width || 200,
    height: config.shape?.height || 150,
  });
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseMove = useCallback(
    (e) => {
      if (isResizing && !config.shape?.lockAspectRatio) {
        e.preventDefault();
        setNodeSize((prev) => ({
          width: Math.max(200, prev.width + e.movementX),
          height: Math.max(150, prev.height + e.movementY),
        }));
      }
    },
    [isResizing, config.shape]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return {
    nodeSize,
    setNodeSize,
    isResizing,
    setIsResizing,
  };
};
