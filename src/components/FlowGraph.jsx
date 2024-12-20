import React, { useCallback, useState } from "react";
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ConnectionLineType,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { getBlockConfig, blockRegistry } from "./blockHelpers";
import HDLNode from "./blockHelpers/HDLNode";
import FileDrawer from "./FileDrawer";

const nodeTypes = {
  hdlNode: HDLNode,
};

const FlowGraph = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [moduleName, setModuleName] = useState("top_module");
  const [generatedFiles, setGeneratedFiles] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const onConnect = useCallback(
    (params) => {
      // Get source and target node data
      const sourceNode = nodes.find((n) => n.id === params.source);
      const targetNode = nodes.find((n) => n.id === params.target);

      const sourcePort =
        sourceNode.data.config.ports.outputs[params.sourceHandle];
      const targetPort =
        targetNode.data.config.ports.inputs[params.targetHandle];

      // Validate connection
      if (sourcePort.width !== targetPort.width) {
        alert(
          `Cannot connect: Port widths don't match (${sourcePort.width} != ${targetPort.width})`
        );
        return;
      }
      if (sourcePort.signed !== targetPort.signed) {
        alert(`Cannot connect: Port signs don't match`);
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

      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "step",
            style: { stroke: "#333" },
          },
          eds
        )
      );
    },
    [nodes, edges]
  );

  const handleAddBlock = (type, position) => {
    const config = getBlockConfig(type);
    const newNode = {
      id: `${type}_${Date.now()}`,
      type: "hdlNode",
      position,
      data: {
        config,
        name: "",
        params: {},
        onParameterChange: handleParameterChange,
      },
    };
    setNodes((nodes) => [...nodes, newNode]);
  };

  const handleParameterChange = (nodeId, updates) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...updates,
            },
          };
        }
        return node;
      })
    );
  };

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const type = event.dataTransfer.getData("application/json");

    // Get the drop position relative to the viewport
    const reactFlowBounds = event.currentTarget.getBoundingClientRect();
    const position = {
      x: (event.clientX - reactFlowBounds.left - 100) / 1.5,
      y: (event.clientY - reactFlowBounds.top - 50) / 1.5,
    };

    handleAddBlock(type, position);
  }, []);

  const generateSystemVerilog = useCallback(() => {
    const files = {};
    const generateModuleHeader = () => {
      const inputPorts = nodes
        .filter((node) => node.data.config.type === "inport")
        .map(
          (node) =>
            `input ${
              node.data.config.ports.outputs.out.signed ? "signed" : ""
            } [${node.data.config.ports.outputs.out.width - 1}:0] ${
              node.data.name
            }`
        );

      const outputPorts = nodes
        .filter((node) => node.data.config.type === "outport")
        .map(
          (node) =>
            `output ${
              node.data.config.ports.inputs.in.signed ? "signed" : ""
            } [${node.data.config.ports.inputs.in.width - 1}:0] ${
              node.data.name
            }`
        );

      return `module ${moduleName} (\n${[...inputPorts, ...outputPorts].join(
        ",\n"
      )}\n);`;
    };

    const generateBlockInstances = () => {
      const instanceCounts = {}; // Track the number of instances per module type

      return nodes
        .filter(
          (node) =>
            node.data.config.type !== "inport" &&
            node.data.config.type !== "outport"
        )
        .map((node) => {
          // Determine instance number
          const moduleType = node.data.config.type;
          if (!instanceCounts[moduleType]) {
            instanceCounts[moduleType] = 0;
          }
          const instanceNumber = instanceCounts[moduleType]++;
          const instanceName = `u_${moduleType}_${instanceNumber}`;

          // Port mappings
          const portMappings = Object.entries(node.data.config.ports)
            .flatMap(([portType, ports]) =>
              Object.entries(ports).map(([portId, port]) => {
                const connectedEdge = edges.find(
                  (edge) =>
                    (edge.source === node.id && edge.sourceHandle === portId) ||
                    (edge.target === node.id && edge.targetHandle === portId)
                );
                const connectedNode = nodes.find(
                  (n) =>
                    n.id === (connectedEdge?.source ?? connectedEdge?.target)
                );
                const connectedPort = connectedNode?.data.name ?? "";

                return `\t.${portId}(${connectedPort})`;
              })
            )
            .join(",\n");

          return `\t${moduleType} ${instanceName} (\n${portMappings}\n\t);`;
        })
        .join("\n\n");
    };

    const generateBlockModules = () => {
      nodes.forEach((node) => {
        if (
          node.data.config.type !== "inport" &&
          node.data.config.type !== "outport"
        ) {
          const blockConfig = blockRegistry[node.data.config.type];
          const blockModule = blockConfig.generateVerilog({
            name: node.data.name,
            ...node.data.params,
          });
          files[`${node.data.name}.sv`] = blockModule;
        }
      });
    };

    files[
      `${moduleName}.sv`
    ] = `${generateModuleHeader()}\n\n${generateBlockInstances()}\n\nendmodule`;
    generateBlockModules();

    return files;
  }, [nodes, edges, moduleName]);

  const handleGenerateHDL = () => {
    const files = generateSystemVerilog();
    setGeneratedFiles(files);
  };

  return (
    <div className="relative w-full h-full">
      <div className="flex items-center justify-between p-4 bg-gray-200">
        <div>
          <label htmlFor="moduleName" className="mr-2">
            Top-level Module Name:
          </label>
          <input
            type="text"
            id="moduleName"
            value={moduleName}
            onChange={(e) => setModuleName(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <button
            onClick={handleGenerateHDL}
            className="ml-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Generate HDL
          </button>
        </div>
        <button
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={Object.keys(generatedFiles).length === 0}
        >
          {isDrawerOpen ? "Close" : "Open"} File Explorer
        </button>
      </div>
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
        connectionLineStyle={{ strokeDasharray: "5 5" }}
        snapToGrid={true}
        snapGrid={[20, 20]}
        defaultViewport={{ x: 0, y: 0, zoom: 1.5 }}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
      <FileDrawer
        isOpen={isDrawerOpen}
        files={generatedFiles}
        selectedFile={selectedFile}
        onFileSelect={setSelectedFile}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
};

export default FlowGraph;
