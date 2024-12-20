import React, { memo, useState, useEffect, useCallback } from "react";
import { Handle, Position, NodeResizer } from "reactflow";
import BlockDialog from "./BlockDialog";

const HDLNode = ({ data, id, selected }) => {
  const { config, onParameterChange } = data;
  const [nodeHeight, setNodeHeight] = useState(0);
  const [nodeDimensions, setNodeDimensions] = useState({
    width: 200,
    height: 150,
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDoubleClick = (e) => {
    e.preventDefault();
    setIsDialogOpen(true);
  };

  // Function to calculate port positions
  const getPortPosition = useCallback((index, total, height) => {
    if (total === 1) {
      return height / 2; // Center single port
    }
    // Distribute ports evenly
    const spacing = height / (total + 1);
    return spacing * (index + 1);
  }, []);

  // Validation function
  const validateConnection = (connection) => {
    const sourcePort = data.config.ports.outputs?.[connection.sourceHandle];
    const targetPort = data.config.ports.inputs?.[connection.targetHandle];
    return sourcePort?.width === targetPort?.width;
  };

  const nodeStyle = {
    width: nodeDimensions.width,
    height: nodeDimensions.height,
  };

  return (
    <>
      <div
        className="relative border-2 border-gray-200 rounded-md bg-white"
        style={nodeStyle}
        onDoubleClick={handleDoubleClick}
      >
        {/* NodeResizer */}
        {selected && (
          <NodeResizer
            minWidth={200}
            minHeight={Math.max(
              Object.keys(config.ports.inputs).length * 40 + 80,
              Object.keys(config.ports.outputs).length * 40 + 80
            )}
            onResize={(_, newDimensions) => {
              setNodeDimensions(newDimensions);
            }}
            isVisible={selected}
            lineClassName="border-2 border-blue-500"
            handleClassName="h-3 w-3 bg-white border-2 border-blue-500"
          />
        )}

        {/* Node Title */}
        <div className="absolute top-4 left-0 right-0 px-4">
          <input
            type="text"
            value={data.name || ""}
            onChange={(e) => onParameterChange(id, { name: e.target.value })}
            className="w-full font-bold text-center border rounded px-2 py-1"
          />
        </div>

        {/* Input Ports */}
        <div className="absolute left-0 top-0 bottom-0">
          {Object.entries(config.ports.inputs).map(([portId, port], index) => {
            const yPos = getPortPosition(
              index,
              Object.keys(config.ports.inputs).length,
              nodeDimensions.height
            );

            return (
              <div
                key={`input-${portId}`}
                className="absolute left-0 transform -translate-y-1/2 flex items-center"
                style={{ top: yPos }}
              >
                <Handle
                  type="target"
                  position={Position.Left}
                  id={portId}
                  className="w-3 h-3 !bg-blue-500 -left-5"
                  isValidConnection={validateConnection}
                />
                <div className="ml-2 text-sm whitespace-nowrap">
                  <span className="font-medium">{portId}</span>
                  <span className="ml-2 text-gray-600">
                    [{port.width - 1}:0]{port.signed ? " (s)" : ""}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Output Ports */}
        <div className="absolute right-0 top-0 bottom-0">
          {Object.entries(config.ports.outputs).map(([portId, port], index) => {
            const yPos = getPortPosition(
              index,
              Object.keys(config.ports.outputs).length,
              nodeDimensions.height
            );

            return (
              <div
                key={`output-${portId}`}
                className="absolute right-0 transform -translate-y-1/2 flex items-center"
                style={{ top: yPos }}
              >
                <div className="mr-2 text-sm whitespace-nowrap">
                  <span className="font-medium">{portId}</span>
                  <span className="ml-2 text-gray-600">
                    [{port.width - 1}:0]{port.signed ? " (s)" : ""}
                  </span>
                </div>
                <Handle
                  type="source"
                  position={Position.Right}
                  id={portId}
                  className="w-3 h-3 !bg-blue-500 -right-5"
                  isValidConnection={validateConnection}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Block Configuration Dialog */}
      {isDialogOpen && (
        <BlockDialog
          block={{ id, params: data.params }}
          config={config}
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onUpdate={(updates) => {
            onParameterChange(id, updates);
            setIsDialogOpen(false);
          }}
        />
      )}
    </>
  );
};

export default memo(HDLNode);
