// src/components/flowgraph/hooks/useFlowEdges.jsx
import { useEdgesState, addEdge } from "reactflow";
import { useCallback } from "react";

export const useFlowEdges = ({ nodes }) => {
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params) => {
      const sourceNode = nodes.find((n) => n.id === params.source);
      const targetNode = nodes.find((n) => n.id === params.target);
      const sourcePort =
        sourceNode.data.config.ports.outputs[params.sourceHandle];
      const targetPort =
        targetNode.data.config.ports.inputs[params.targetHandle];

      // Validate connection
      if (sourcePort.width.default !== targetPort.width.default) {
        alert(
          `Cannot connect: Port widths don't match (${sourcePort.width.default} != ${targetPort.width.default})`
        );
        return;
      }
      if (sourcePort.signed.default !== targetPort.signed.default) {
        alert("Cannot connect: Port signs don't match");
        return;
      }

      // Check for existing connections
      const existingConnection = edges.find(
        (e) =>
          e.target === params.target && e.targetHandle === params.targetHandle
      );
      if (existingConnection) {
        alert("This input port is already connected!");
        return;
      }

      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "default",
            animated: true,
            style: { stroke: "#333" },
          },
          eds
        )
      );
    },
    [nodes, edges, setEdges]
  );

  return {
    edges,
    setEdges,
    onEdgesChange,
    onConnect,
  };
};
