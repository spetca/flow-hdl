import React, { useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  ConnectionLineType,
} from "reactflow";

const HierarchicalBlockEditor = ({
  isOpen,
  onClose,
  blockId,
  initialNodes = [],
  initialEdges = [],
  onNodesChange: onParentNodesChange,
  onEdgesChange: onParentEdgesChange,
  ports,
  nodeTypes,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Create port blocks for the hierarchical block's inputs and outputs
  React.useEffect(() => {
    if (isOpen && nodes.length === 0) {
      const portNodes = [];
      let yOffset = 50;

      // Create input port nodes
      Object.entries(ports.inputs).forEach(([portId, config], index) => {
        portNodes.push({
          id: `input_${portId}`,
          type: "hdlNode",
          position: { x: 100, y: yOffset },
          data: {
            config: {
              type: "inport",
              name: `Input ${portId}`,
              description: "Input port",
              ports: {
                outputs: {
                  out: config,
                },
              },
            },
            name: portId,
            isInput: true,
          },
        });
        yOffset += 100;
      });

      // Create output port nodes
      yOffset = 50;
      Object.entries(ports.outputs).forEach(([portId, config], index) => {
        portNodes.push({
          id: `output_${portId}`,
          type: "hdlNode",
          position: { x: 500, y: yOffset },
          data: {
            config: {
              type: "outport",
              name: `Output ${portId}`,
              description: "Output port",
              ports: {
                inputs: {
                  in: config,
                },
              },
            },
            name: portId,
            isOutput: true,
          },
        });
        yOffset += 100;
      });

      setNodes(portNodes);
    }
  }, [isOpen, ports]);

  // Sync changes back to parent
  React.useEffect(() => {
    if (onParentNodesChange) {
      onParentNodesChange(nodes);
    }
  }, [nodes, onParentNodesChange]);

  React.useEffect(() => {
    if (onParentEdgesChange) {
      onParentEdgesChange(edges);
    }
  }, [edges, onParentEdgesChange]);

  const onConnect = useCallback(
    (params) => {
      // Validate connection
      const sourceNode = nodes.find((n) => n.id === params.source);
      const targetNode = nodes.find((n) => n.id === params.target);

      if (!sourceNode || !targetNode) return;

      // Get the port configurations
      const sourcePort =
        sourceNode.data.config.ports.outputs?.[params.sourceHandle];
      const targetPort =
        targetNode.data.config.ports.inputs?.[params.targetHandle];

      if (!sourcePort || !targetPort) return;

      // Check width compatibility
      if (sourcePort.width !== targetPort.width) {
        alert(
          `Cannot connect: Port widths don't match (${sourcePort.width} != ${targetPort.width})`
        );
        return;
      }

      // Check if target port is already connected
      const existingConnection = edges.find(
        (e) =>
          e.target === params.target && e.targetHandle === params.targetHandle
      );
      if (existingConnection) {
        alert("This input port is already connected!");
        return;
      }

      const edgeId = `e${params.source}-${params.sourceHandle}-${params.target}-${params.targetHandle}`;
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            id: edgeId,
            type: "smoothstep",
            data: {
              width: sourcePort.width,
              signed: sourcePort.signed,
            },
          },
          eds
        )
      );
    },
    [nodes, edges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback((event) => {
    event.preventDefault();

    const type = event.dataTransfer.getData("application/json");
    if (!type) return;

    // Get drop position relative to the viewport
    const reactFlowBounds = event.currentTarget.getBoundingClientRect();
    const position = {
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    };

    const newNode = {
      id: `${type}_${Date.now()}`,
      type: "hdlNode",
      position,
      data: {
        config: {
          type,
          name: `${type}_instance`,
          ports: {
            inputs: {},
            outputs: {},
          },
        },
      },
    };

    setNodes((nds) => nds.concat(newNode));
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white w-[90vw] h-[90vh] rounded-lg shadow-lg flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Edit Hierarchical Block</h2>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Close
          </button>
        </div>
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDragOver={onDragOver}
            onDrop={onDrop}
            nodeTypes={nodeTypes}
            connectionLineType={ConnectionLineType.SmoothStep}
            snapToGrid={true}
            snapGrid={[20, 20]}
            fitView
          >
            <Controls />
            <MiniMap />
            <Background gap={20} size={1} />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};

export default HierarchicalBlockEditor;
