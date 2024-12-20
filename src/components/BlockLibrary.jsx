import React from "react";
import { blockRegistry } from "./blockHelpers";

const BlockLibrary = () => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData("application/json", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="h-full overflow-y-auto p-4 bg-gray-50 border-l">
      <h2 className="text-lg font-semibold mb-4">Block Library</h2>
      <div className="space-y-2">
        {Object.entries(blockRegistry).map(([type, { config }]) => (
          <div
            key={type}
            className="p-3 bg-white rounded-lg shadow-sm border cursor-grab hover:bg-gray-50"
            onDragStart={(e) => onDragStart(e, type)}
            draggable
          >
            <h3 className="font-medium">{config.name}</h3>
            <p className="text-sm text-gray-600">{config.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlockLibrary;
