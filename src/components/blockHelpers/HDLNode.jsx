import React, { memo } from "react";
import { Handle, Position, NodeResizer } from "reactflow";
import BlockDialog from "./BlockDialog";

const HDLNode = ({ data, id }) => {
  const { config, onParameterChange } = data;
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleDoubleClick = (e) => {
    e.preventDefault();
    setIsDialogOpen(true);
  };

  return (
    <>
      <div
        className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-gray-200"
        onDoubleClick={handleDoubleClick}
      >
        <input
          type="text"
          value={data.name || ""}
          onChange={(e) => onParameterChange(id, { name: e.target.value })}
          className="font-bold mb-2 border rounded px-2 py-1"
        />

        {/* Input Ports */}
        {Object.entries(config.ports.inputs).map(([portId, port]) => (
          <div key={`input-${portId}`} className="relative my-2">
            <Handle
              type="target"
              position={Position.Left}
              id={portId}
              className="w-3 h-3 !bg-black"
              style={{ left: -8 }}
            />
            <div className="text-sm ml-3">
              {`${portId} [${port.width - 1}:0]${port.signed ? " (s)" : ""}`}
            </div>
          </div>
        ))}

        {/* Output Ports */}
        {Object.entries(config.ports.outputs).map(([portId, port]) => (
          <div key={`output-${portId}`} className="relative my-2 text-right">
            <div className="text-sm mr-3">
              {`${portId} [${port.width - 1}:0]${port.signed ? " (s)" : ""}`}
            </div>
            <Handle
              type="source"
              position={Position.Right}
              id={portId}
              className="w-3 h-3 !bg-black"
              style={{ right: -8 }}
            />
          </div>
        ))}
      </div>

      <NodeResizer minWidth={100} minHeight={60} />

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
