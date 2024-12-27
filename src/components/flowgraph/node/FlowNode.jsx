import React, { memo } from "react";
import { NodeShape } from "./NodeShape";
import { NodeTitle } from "./NodeTitle";
import { NodePorts } from "./NodePorts";
import { NodeParameters } from "./NodeParameters";
import { useNodeConfig } from "../hooks/useNodeConfig";
import { useNodeResize } from "../hooks/useNodeResize";
import { useNodeNavigation } from "../hooks/useNodeNavigation";
import BlockConfiguration from "../../configuration/BlockConfiguration";
import NodeIcon from "./NodeIcon";

const FlowNode = ({ data, id, selected }) => {
  const { config, isConfigOpen, setIsConfigOpen, handleUpdate } = useNodeConfig(
    {
      config: data.config,
      onParameterChange: data.onParameterChange,
      id,
    }
  );

  const { nodeSize, handleResize } = useNodeResize(config);
  const { handleDoubleClick, handleSubflowDoubleClick } = useNodeNavigation(
    data,
    id,
    setIsConfigOpen
  );

  const isSpecialShape = config.shape?.type !== undefined;

  console.log("flownode data", data);
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
          instanceName={data.instanceName}
          isSpecialShape={isSpecialShape}
        />
        <NodeIcon config={config} isSpecialShape={isSpecialShape} />
        <NodePorts config={config} isSpecialShape={isSpecialShape} />
        <NodeParameters config={config} />
      </NodeShape>

      {isConfigOpen && (
        <BlockConfiguration
          data={{
            config,
            name: data.name,
            instanceName: data.instanceName,
            onParameterChange: data.onParameterChange,
          }}
          isOpen={isConfigOpen}
          onClose={() => setIsConfigOpen(false)}
          onUpdate={handleUpdate}
        />
      )}
    </>
  );
};

export default memo(FlowNode);
