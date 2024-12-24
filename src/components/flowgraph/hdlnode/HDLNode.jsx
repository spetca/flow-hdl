// components/flowgraph/HDLNode.jsx
import React, { memo, useState, useEffect, useCallback } from "react";
import { NodeShape } from "./NodeShape";
import { NodePorts } from "./NodePorts";
import { NodeTitle } from "./NodeTitle";
import { NodeParameters } from "./NodeParameters";
import BlockConfiguration from "../../configuration/BlockConfiguration";
import { normalizeConfig } from "../../../lib/parameterUtils";
import { getShapeStyles } from "../../../lib/shapeUtils";

const HDLNode = ({ data, id, selected }) => {
  const { config: initialConfig, onParameterChange } = data;
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [currentConfig, setCurrentConfig] = useState(
    normalizeConfig(initialConfig)
  );
  const [nodeSize, setNodeSize] = useState({
    width: initialConfig.shape?.width || 200,
    height: initialConfig.shape?.height || 150,
  });
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseMove = useCallback(
    (e) => {
      if (isResizing && !currentConfig.shape?.lockAspectRatio) {
        e.preventDefault();
        setNodeSize((prev) => ({
          width: Math.max(200, prev.width + e.movementX),
          height: Math.max(150, prev.height + e.movementY),
        }));
      }
    },
    [isResizing, currentConfig.shape]
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

  const handleDoubleClick = useCallback((e) => {
    e.preventDefault();
    setIsConfigOpen(true);
  }, []);

  const handleUpdate = useCallback(
    (updates) => {
      const normalizedUpdates = {
        name: updates.name || currentConfig.name,
        config: normalizeConfig({
          ...currentConfig,
          name: updates.name || currentConfig.name,
          ports: updates.ports || currentConfig.ports,
          params: updates.config?.params || currentConfig.params,
        }),
        params: updates.params || {},
      };

      setCurrentConfig(normalizedUpdates.config);
      onParameterChange(id, normalizedUpdates);
    },
    [currentConfig, id, onParameterChange]
  );

  useEffect(() => {
    setCurrentConfig(normalizeConfig(initialConfig));
  }, [initialConfig]);

  const isSpecialShape = currentConfig.shape?.type !== undefined;

  return (
    <>
      <NodeShape
        config={currentConfig}
        selected={selected}
        nodeSize={nodeSize}
        onDoubleClick={handleDoubleClick}
      >
        <NodeTitle
          config={currentConfig}
          name={data.name}
          isSpecialShape={isSpecialShape}
          shapeStyles={getShapeStyles(nodeSize, currentConfig)}
        />
        {!isSpecialShape && <NodeParameters config={currentConfig} />}
        <NodePorts config={currentConfig} isSpecialShape={isSpecialShape} />
      </NodeShape>

      {isConfigOpen && (
        <BlockConfiguration
          data={{ config: currentConfig, name: data.name }}
          isOpen={isConfigOpen}
          onClose={() => setIsConfigOpen(false)}
          onUpdate={handleUpdate}
        />
      )}
    </>
  );
};

export default memo(HDLNode);
