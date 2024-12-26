import React, { useState } from "react";
import { getBezierPath, EdgeLabelRenderer, BaseEdge } from "reactflow";

const FlowEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  selected,
  data,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Calculate the path for the edge
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Dynamic edge styling
  const edgeStyle = {
    ...style,
    stroke: selected ? "blue" : isHovered ? "green" : style.stroke || "#333",
    strokeWidth: selected || isHovered ? 5 : 1,
    transition: "stroke 0.2s, stroke-width 0.2s",
  };

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={edgeStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`react-flow__edge-path ${selected ? "selected" : ""}`}
      />

      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: 12,
              fontWeight: 500,
              background: selected || isHovered ? "#f0f0f0" : "white",
              border: "1px solid #ccc",
              cursor: "pointer",
              pointerEvents: "all",
            }}
            className="nodrag nopan"
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

// CSS styles to be added to your stylesheet
const styles = `
.react-flow__edge-path {
  cursor: pointer;
}

.react-flow__edge-path.selected {
  stroke-dasharray: 5;
  animation: selected-edge 0.3s linear infinite;
}

@keyframes selected-edge {
  to {
    stroke-dashoffset: -10;
  }
}
`;

export default FlowEdge;
