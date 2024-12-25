// components/flowgraph/edges/ConnectionEdge.jsx
import React from "react";
import { BaseEdge, getBezierPath } from "reactflow";

const ConnectionEdge = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      {label && (
        <text
          x={labelX}
          y={labelY}
          className="react-flow__edge-text"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fill: style?.stroke || "#333", fontSize: "12px" }}
        >
          {label}
        </text>
      )}
    </>
  );
};

export default ConnectionEdge;
