import React, { memo } from "react";
import { Handle, Position } from "reactflow";

const InportOutport = ({ data }) => {
  const { name, type } = data;

  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-gray-200">
      <div className="font-bold">{name}</div>
      {type === "inport" ? (
        <Handle
          type="source"
          position={Position.Right}
          id="out"
          className="w-3 h-3 !bg-black"
          style={{ right: -8 }}
        />
      ) : (
        <Handle
          type="target"
          position={Position.Left}
          id="in"
          className="w-3 h-3 !bg-black"
          style={{ left: -8 }}
        />
      )}
    </div>
  );
};

export default memo(InportOutport);
