import React, { memo, useState, useEffect } from "react";
import { Handle, Position } from "reactflow";
import BlockDialog from "./BlockDialog";
import { isHierarchicalBlock } from ".";

const HDLNode = ({ data, id, selected }) => {
  const { config, onParameterChange } = data;
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [currentConfig, setCurrentConfig] = useState(config);

  // Update local state when data changes
  useEffect(() => {
    setCurrentConfig(config);
  }, [config]);

  const handleDoubleClick = (e) => {
    e.preventDefault();
    setIsConfigOpen(true);
  };

  const handleUpdate = (updates) => {
    // Separate parameters and ports
    const params = updates.params || {};
    const ports = updates.ports || currentConfig.ports;

    // Update both local state and parent
    const newConfig = {
      ...currentConfig,
      ports: ports,
      // Merge new params with existing config
      params: {
        ...currentConfig.params,
        ...Object.fromEntries(
          Object.entries(params).map(([key, value]) => [
            key,
            { default: value },
          ])
        ),
      },
    };

    setCurrentConfig(newConfig);
    onParameterChange(id, {
      config: newConfig,
      params: params,
    });
  };

  // Render parameters as a string
  const renderParameters = () => {
    if (!currentConfig.params) return null;
    return Object.entries(currentConfig.params)
      .map(([name, param]) => `${name}: ${param.default}`)
      .join(", ");
  };

  // Use currentConfig instead of config for rendering
  return (
    <>
      <div
        className="relative border-2 border-gray-200 rounded-md bg-white p-4"
        onDoubleClick={handleDoubleClick}
      >
        {/* Node Title */}
        <div className="text-center font-bold mb-2">
          {data.name || currentConfig.name}
        </div>

        {/* Display Parameters if they exist */}
        {currentConfig.params &&
          Object.keys(currentConfig.params).length > 0 && (
            <div className="text-xs text-gray-600 mb-2 text-center">
              {renderParameters()}
            </div>
          )}

        {/* Input Ports */}
        {Object.entries(currentConfig.ports.inputs || {}).map(
          ([portId, port]) => (
            <div key={`input-${portId}`} className="my-2">
              <Handle
                type="target"
                position={Position.Left}
                id={portId}
                className="w-3 h-3 bg-blue-500"
              />
              <span className="text-sm ml-4">
                {portId} [{port.width - 1}:0]
                {port.signed ? " (s)" : ""}
              </span>
            </div>
          )
        )}

        {/* Output Ports */}
        {Object.entries(currentConfig.ports.outputs || {}).map(
          ([portId, port]) => (
            <div key={`output-${portId}`} className="my-2 text-right">
              <span className="text-sm mr-4">
                {portId} [{port.width - 1}:0]
                {port.signed ? " (s)" : ""}
              </span>
              <Handle
                type="source"
                position={Position.Right}
                id={portId}
                className="w-3 h-3 bg-blue-500"
              />
            </div>
          )
        )}
      </div>

      {/* Configuration Dialog */}
      {isConfigOpen && (
        <BlockDialog
          block={{ id, params: data.params }}
          config={currentConfig}
          isOpen={isConfigOpen}
          onClose={() => setIsConfigOpen(false)}
          onUpdate={handleUpdate}
        />
      )}
    </>
  );
};

export default memo(HDLNode);
