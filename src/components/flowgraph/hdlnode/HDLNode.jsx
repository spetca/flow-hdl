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

  const handleSubflowDoubleClick = useCallback(
    (e) => {
      if (data.isSubflow && data.onNavigateToSubflow) {
        e.preventDefault();
        e.stopPropagation();
        console.log("going in");
        data.onNavigateToSubflow(id, data.name);
      } else {
        handleDoubleClick(e);
      }
    },
    [data, id, handleDoubleClick]
  );
  
  const handleUpdate = useCallback(
    (updates) => {
      const normalizedConfig = normalizeConfig({
        ...currentConfig,
        name: updates.name,
        ports: updates.config.ports, // Updates weren't being applied correctly here
        params: updates.config.params,
      });

      setCurrentConfig(normalizedConfig);
      onParameterChange(id, {
        name: updates.name,
        config: normalizedConfig,
        params: updates.params,
      });
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
        onDoubleClick={
          data.isSubflow ? handleSubflowDoubleClick : handleDoubleClick
        }
      >
        {/* ... existing node content ... */}
        {data.isSubflow && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-500">
            Double-click to open
          </div>
        )}
        <NodeTitle
          config={currentConfig}
          name={data.name}
          isSpecialShape={isSpecialShape}
          shapeStyles={getShapeStyles(nodeSize, currentConfig)}
        />
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
