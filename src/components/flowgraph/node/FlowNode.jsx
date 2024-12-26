// src/components/flowgraph/node/FlowNode.jsx
import React, { memo } from "react";
import { NodeShape } from "./NodeShape";
import { NodeTitle } from "./NodeTitle";
import { NodePorts } from "./NodePorts";
import { NodeParameters } from "./NodeParameters";
import { useNodeConfig } from "../hooks/useNodeConfig";
import { useNodeResize } from "../hooks/useNodeResize";
import { useNodeNavigation } from "../hooks/useNodeNavigation";
import BlockConfiguration from "../../configuration/BlockConfiguration";

const FlowNode = ({ data, id, selected }) => {
  const { config, isConfigOpen, setIsConfigOpen, handleUpdate } = useNodeConfig(
    data,
    id
  );
  const { nodeSize, handleResize } = useNodeResize(config);
  const { handleDoubleClick, handleSubflowDoubleClick } = useNodeNavigation(
    data,
    id,
    setIsConfigOpen
  );

  const isSpecialShape = config.shape?.type !== undefined;

  return (
    <>
      <NodeShape
        config={config}
        selected={selected}
        nodeSize={nodeSize}
        onDoubleClick={
          data.isSubflow ? handleSubflowDoubleClick : handleDoubleClick
        }
        onResize={handleResize}
      >
        {data.isSubflow && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-500">
            Double-click to open
          </div>
        )}
        <NodeTitle
          config={config}
          name={data.name}
          isSpecialShape={isSpecialShape}
        />
        <NodePorts config={config} isSpecialShape={isSpecialShape} />
        <NodeParameters config={config} />
      </NodeShape>

      {isConfigOpen && (
        <BlockConfiguration
          data={{ config: config, name: data.name }}
          isOpen={isConfigOpen}
          onClose={() => setIsConfigOpen(false)}
          onUpdate={handleUpdate}
        />
      )}
    </>
  );
};

export default memo(FlowNode);
