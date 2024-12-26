// components/flowgraph/utils/connectionValidator.js
import { useCallback } from "react";
import { useReactFlow } from "reactflow";

export const useConnectionValidator = (edges, setEdges) => {
  const { getNode } = useReactFlow();

  return useCallback(() => {
    if (!edges || !setEdges) return;

    const validatedEdges = edges.map((edge) => {
      const sourceNode = getNode(edge.source);
      const targetNode = getNode(edge.target);

      if (
        !sourceNode?.data?.config?.ports?.outputs ||
        !targetNode?.data?.config?.ports?.inputs
      ) {
        return edge;
      }

      const sourcePort =
        sourceNode.data.config.ports.outputs[edge.sourceHandle];
      const targetPort = targetNode.data.config.ports.inputs[edge.targetHandle];

      if (!sourcePort || !targetPort) return edge;

      const sourceWidth =
        typeof sourcePort.width === "number"
          ? sourcePort.width
          : sourcePort.width?.default || 32;
      const targetWidth =
        typeof targetPort.width === "number"
          ? targetPort.width
          : targetPort.width?.default || 32;
      const sourceSigned =
        typeof sourcePort.signed === "boolean"
          ? sourcePort.signed
          : sourcePort.signed?.default || false;
      const targetSigned =
        typeof targetPort.signed === "boolean"
          ? targetPort.signed
          : targetPort.signed?.default || false;

      const isValid =
        sourceWidth === targetWidth && sourceSigned === targetSigned;
      const label = sourceSigned ? `sfix${sourceWidth}` : `ufix${sourceWidth}`;

      return {
        ...edge,
        style: {
          ...edge.style,
          strokeWidth: isValid ? 1 : 20,
          stroke: isValid ? "#333" : "#ff0000",
        },
        animated: true,
        label,
        data: {
          ...edge.data,
          isValid,
          error: !isValid ? "Bitwidth or sign mismatch" : null,
        },
      };
    });

    setEdges(validatedEdges);
  }, [edges, setEdges, getNode]);
};

// Custom edge component with label
export const ConnectionEdge = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  label,
  labelStyle,
  style,
}) => {
  const edgePath = `M ${sourceX},${sourceY} C ${sourceX + 50},${sourceY} ${
    targetX - 50
  },${targetY} ${targetX},${targetY}`;

  return (
    <>
      <path style={style} className="react-flow__edge-path" d={edgePath} />
      {label && (
        <text
          style={labelStyle}
          className="react-flow__edge-text"
          x={(sourceX + targetX) / 2}
          y={(sourceY + targetY) / 2 - 10}
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          {label}
        </text>
      )}
    </>
  );
};
