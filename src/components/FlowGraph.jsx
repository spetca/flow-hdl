import React, { useCallback, useState, useEffect } from "react";
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ConnectionLineType,
  MiniMap,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import { getBlockConfig, blockRegistry } from "./blockHelpers";
import HDLNode from "./blockHelpers/HDLNode";
import FileDrawer from "./FileDrawer";
import FileExplorer from "./FileExplorer";
import SystemVerilogGenerator from "./generators/SystemVerilogGenerator";

import "@xyflow/react/dist/style.css";

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
  const [hierarchicalBlocks, setHierarchicalBlocks] = useState(new Map());

  const handleEnterSubsystem = (subsystemId, subsystemName) => {
    // Save current nodes/edges to current level
    setNavigationStack((stack) => {
      const newStack = [...stack];
      newStack[currentLevel] = {
        ...newStack[currentLevel],
        nodes,
        edges,
      };
      return newStack;
    });

    // Push new level to stack
    setNavigationStack((stack) => [
      ...stack,
      {
        id: subsystemId,
        name: subsystemName,
        nodes: [],
        edges: [],
      },
    ]);
    setCurrentLevel((prev) => prev + 1);

    // Clear current view for new subsystem
    setNodes([]);
    setEdges([]);
  };

  const handleNavigateUp = () => {
    if (currentLevel === 0) return;

    // Save current subsystem state
    setNavigationStack((stack) => {
      const newStack = [...stack];
      newStack[currentLevel] = {
        ...newStack[currentLevel],
        nodes,
        edges,
      };
      return newStack;
    });
    // Go up one level
    setCurrentLevel((prev) => prev - 1);

    // Restore parent level's nodes/edges
    const parentLevel = navigationStack[currentLevel - 1];
    setNodes(parentLevel.nodes);
    setEdges(parentLevel.edges);
  };

  const Breadcrumbs = () => (
    <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100">
      {navigationStack.slice(0, currentLevel + 1).map((level, index) => (
        <React.Fragment key={level.id}>
          {index > 0 && <span className="text-gray-500">/</span>}
          <button
            onClick={() => {
              if (index < currentLevel) {
                // Save current state
                const newStack = [...navigationStack];
                newStack[currentLevel] = {
                  ...newStack[currentLevel],
                  nodes,
                  edges,
                };
                setNavigationStack(newStack);

                // Jump to clicked level
                setCurrentLevel(index);
                setNodes(newStack[index].nodes);
                setEdges(newStack[index].edges);
              }
            }}
            className={`hover:text-blue-500 ${
              index === currentLevel ? "font-bold" : ""
            }`}
          >
            {level.name}
          </button>
        </React.Fragment>
      ))}
    </div>
  );

  const [navigationStack, setNavigationStack] = useState([
    {
      id: "top",
      name: "Top Level",
      nodes: [],
      edges: [],
    },
  ]);
  const [currentLevel, setCurrentLevel] = useState(0);
  const currentSystem = navigationStack[currentLevel];

  const { fitView, zoomIn, zoomOut } = useReactFlow();

  useEffect(() => {
    const onKeyDown = (event) => {
      // Fit view: Ctrl+Alt+F or Ctrl+Alt+0
      if (event.key === " " || event.code === "Space") {
        event.preventDefault(); // Prevent page scroll
        fitView({ padding: 0.1 });
      }

      // Zoom in: Ctrl++ or Ctrl+=
      if (
        (event.ctrlKey || event.metaKey) &&
        (event.key === "+" || event.key === "=")
      ) {
        event.preventDefault();
        zoomIn();
      }

      // Zoom out: Ctrl+-
      if ((event.ctrlKey || event.metaKey) && event.key === "-") {
        event.preventDefault();
        zoomOut();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [fitView, zoomIn, zoomOut]);

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
    const isHierarchical = type === "hierarchical";

    // Generate default unique name based on type
    const blockCount = nodes.filter((n) => n.data.config.type === type).length;
    const defaultName = `${type}${blockCount}`;

    const newNode = {
      id: `${type}_${Date.now()}`,
      type: "hdlNode",
      position,
      data: {
        config,
        name: defaultName, // Add default name here
        params: {},
        isHierarchical,
        internalNodes: [],
        internalEdges: [],
        onParameterChange: handleParameterChange,
      },
    };

    // Initialize storage for hierarchical block if needed
    if (isHierarchical) {
      setHierarchicalBlocks(
        (prev) =>
          new Map(
            prev.set(newNode.id, {
              nodes: [],
              edges: [],
              ports: {
                inputs: {},
                outputs: {},
              },
            })
          )
      );
    }

    setNodes((nodes) => [...nodes, newNode]);
  };

  const handleParameterChange = (nodeId, updates) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          const newData = {
            ...node.data,
            config: updates.config,
            params: updates.params,
            name: updates.name, // Update the name in the node data
          };

          // If this is a hierarchical block and ports were updated
          if (node.data.isHierarchical && updates.ports) {
            setHierarchicalBlocks((prev) => {
              const blockData = prev.get(nodeId) || { nodes: [], edges: [] };
              return new Map(
                prev.set(nodeId, {
                  ...blockData,
                  ports: updates.ports,
                })
              );
            });
          }

          return {
            ...node,
            data: newData,
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

          // Handle hierarchical blocks differently
          if (node.data.isHierarchical) {
            const hierarchicalData = hierarchicalBlocks.get(node.id);
            if (hierarchicalData) {
              const blockModule = blockConfig.generateVerilog(
                {
                  name: node.data.name,
                  ...node.data.params,
                },
                hierarchicalData.nodes,
                hierarchicalData.edges
              );
              files[`${node.data.name}.sv`] = blockModule;
            }
          } else {
            // Regular block handling
            const blockModule = blockConfig.generateVerilog({
              name: node.data.name,
              ...node.data.params,
            });
            files[`${node.data.name}.sv`] = blockModule;
          }
        }
      });
    };
    files[
      `${moduleName}.sv`
    ] = `${generateModuleHeader()}\n\n${generateBlockInstances()}\n\nendmodule`;
    generateBlockModules();

    return files;
  }, [nodes, edges, moduleName]);

  // Replace the generateSystemVerilog and handleGenerateHDL functions with:
  const handleGenerateHDL = () => {
    // Create a new generator instance
    const generator = new SystemVerilogGenerator(
      nodes,
      edges,
      moduleName,
      hierarchicalBlocks
    );

    // Generate the files
    const files = generator.generate();

    // Clear existing states
    setIsDrawerOpen(false);
    setSelectedFile(null);

    // Set new files and open drawer
    setGeneratedFiles(files);
    setIsDrawerOpen(true);
  };

  // Update drawer close handler
  const toggleFileDrawer = () => {
    if (!isDrawerOpen) {
      setIsDrawerOpen(true);
    } else {
      setIsDrawerOpen(false);
      setSelectedFile(null);
    }
  };

  return (
    <div className="h-screen">
      {" "}
      {/* or whatever height you need */}
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
            onClick={toggleFileDrawer}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={Object.keys(generatedFiles).length === 0}
          >
            {isDrawerOpen ? "Close" : "Open"} File Explorer
          </button>
        </div>

        <Breadcrumbs />

        <div className="w-full h-[calc(90vh-64px)]">
          {" "}
          {/* Adjust 64px based on your header/navbar height */}
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
            className="w-full h-full"
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
          <FileDrawer
            isOpen={isDrawerOpen}
            files={generatedFiles}
            selectedFile={selectedFile}
            onFileSelect={setSelectedFile}
            onClose={() => {
              toggleFileDrawer();
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default FlowGraph;
