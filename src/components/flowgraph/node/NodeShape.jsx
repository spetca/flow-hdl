// components/flowgraph/NodeShape.jsx
import React from "react";
import { getShapeStyles } from "../../../lib/shapeUtils";

export const NodeShape = ({
  config,
  children,
  selected,
  nodeSize,
  onDoubleClick,
}) => (
  <div
    className={`relative bg-white shadow-lg transition-shadow duration-200 ${
      selected ? "ring-2 ring-blue-400 shadow-xl" : "ring-1 ring-gray-200"
    }`}
    style={getShapeStyles(nodeSize, config)}
    onDoubleClick={onDoubleClick}
  >
    {children}
  </div>
);
