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
import SystemVerilogGenerator from "../lib/SystemVerilogGenerator";

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

  // Load default flow graph on mount
  useEffect(() => {
    const loadDefaultFlow = async () => {
      try {
        const defaultFlow = {
          nodes: [
            {
              id: "inport_1734818840577",
              type: "hdlNode",
              position: {
                x: -140,
                y: 40,
              },
              data: {
                config: {
                  type: "inport",
                  name: "Input Port",
                  description: "Input port for HDL module",
                  shape: {
                    type: "oval",
                    width: 120,
                    height: 80,
                    lockAspectRatio: true,
                  },
                  ports: {
                    inputs: {},
                    outputs: {
                      out: {
                        width: 32,
                        signed: false,
                      },
                    },
                  },
                  params: {
                    width: {
                      type: "number",
                      default: 32,
                    },
                    signed: {
                      type: "boolean",
                      default: false,
                    },
                  },
                },
                name: "inport0",
                params: {},
                isHierarchical: false,
                internalNodes: [],
                internalEdges: [],
              },
              width: 200,
              height: 150,
              selected: true,
              positionAbsolute: {
                x: -140,
                y: 40,
              },
              dragging: false,
            },
            {
              id: "adder_1734818874859",
              type: "hdlNode",
              position: {
                x: 240,
                y: 40,
              },
              data: {
                config: {
                  type: "adder",
                  name: "Adder",
                  description: "Adds two numbers together",
                  params: {
                    DELAY_OUT: {
                      default: 1,
                    },
                  },
                  ports: {
                    inputs: {
                      a: {
                        width: 32,
                        signed: false,
                        description: "First input operand",
                      },
                      b: {
                        width: 32,
                        signed: false,
                        description: "Second input operand",
                      },
                    },
                    outputs: {
                      sum: {
                        width: 64,
                        signed: false,
                        description: "Sum of inputs",
                      },
                    },
                  },
                },
                name: "adder0",
                params: {
                  DELAY_OUT: 1,
                },
                isHierarchical: false,
                internalNodes: [],
                internalEdges: [],
              },
              width: 200,
              height: 150,
              selected: false,
              positionAbsolute: {
                x: 240,
                y: 40,
              },
              dragging: false,
            },
            {
              id: "outport_1734818889177",
              type: "hdlNode",
              position: {
                x: 620,
                y: 40,
              },
              data: {
                config: {
                  type: "outport",
                  name: "Output Port",
                  description: "Output port for HDL module",
                  shape: {
                    type: "oval",
                    width: 120,
                    height: 80,
                    lockAspectRatio: true,
                  },
                  ports: {
                    inputs: {
                      in: {
                        width: 64,
                        signed: false,
                      },
                    },
                    outputs: {},
                  },
                  params: {
                    width: {
                      default: 32,
                    },
                    signed: {
                      default: false,
                    },
                  },
                },
                name: "outport0",
                params: {
                  width: 32,
                  signed: false,
                },
                isHierarchical: false,
                internalNodes: [],
                internalEdges: [],
              },
              width: 200,
              height: 150,
              selected: false,
              positionAbsolute: {
                x: 620,
                y: 40,
              },
              dragging: false,
            },
          ],
          edges: [
            {
              source: "adder_1734818874859",
              sourceHandle: "sum",
              target: "outport_1734818889177",
              targetHandle: "in",
              type: "step",
              style: {
                stroke: "#333",
              },
              id: "reactflow__edge-adder_1734818874859sum-outport_1734818889177in",
            },
            {
              source: "inport_1734818840577",
              sourceHandle: "out",
              target: "adder_1734818874859",
              targetHandle: "a",
              type: "step",
              style: {
                stroke: "#333",
              },
              id: "reactflow__edge-inport_1734818840577out-adder_1734818874859a",
            },
            {
              source: "inport_1734818840577",
              sourceHandle: "out",
              target: "adder_1734818874859",
              targetHandle: "b",
              type: "step",
              style: {
                stroke: "#333",
              },
              id: "reactflow__edge-inport_1734818840577out-adder_1734818874859b",
            },
          ],
          moduleName: "top",
          hierarchicalBlocks: [],
          navigationStack: [
            {
              id: "top",
              name: "Top Level",
              nodes: [],
              edges: [],
            },
          ],
          currentLevel: 0,
        };

        // Set the states
        setNodes(defaultFlow.nodes);
        setEdges(defaultFlow.edges);
        setModuleName(defaultFlow.moduleName);
        setHierarchicalBlocks(new Map(defaultFlow.hierarchicalBlocks));
        setNavigationStack(defaultFlow.navigationStack);
        setCurrentLevel(defaultFlow.currentLevel);
      } catch (error) {
        console.error("Error loading default flow graph:", error);
      }
    };

    loadDefaultFlow();
  }, []); // Empty dependency array means this runs once on mount
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

  // Add these new handlers
  const exportFlowGraph = () => {
    const flowData = {
      nodes,
      edges,
      moduleName,
      hierarchicalBlocks: Array.from(hierarchicalBlocks.entries()),
      navigationStack,
      currentLevel,
    };

    const blob = new Blob([JSON.stringify(flowData, null, 2)], {
      type: "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${moduleName}_flowgraph.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importFlowGraph = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const flowData = JSON.parse(e.target.result);

        // Restore state
        setNodes(flowData.nodes);
        setEdges(flowData.edges);
        setModuleName(flowData.moduleName);
        setHierarchicalBlocks(new Map(flowData.hierarchicalBlocks));
        setNavigationStack(flowData.navigationStack);
        setCurrentLevel(flowData.currentLevel);

        // Reset generated files and drawer state
        setGeneratedFiles({});
        setIsDrawerOpen(false);
        setSelectedFile(null);
      } catch (error) {
        console.error("Error importing flow graph:", error);
        alert("Error importing flow graph. Please check the file format.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="h-screen">
      <div className="relative w-full h-full">
        {/* Header Section */}
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
              className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Generate HDL
            </button>
            {/* Export/Import buttons */}
            <button
              onClick={exportFlowGraph}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Export Flow
            </button>
            <label className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors cursor-pointer">
              Import Flow
              <input
                type="file"
                accept=".json"
                onChange={importFlowGraph}
                className="hidden"
              />
            </label>
          </div>
          <button
            onClick={toggleFileDrawer}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={Object.keys(generatedFiles).length === 0}
          >
            {isDrawerOpen ? "Close" : "Open"} File Explorer
          </button>
        </div>

        <Breadcrumbs />

        {/* Flow Graph Section */}
        <div className="w-full h-[calc(90vh-64px)]">
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
            className="w-full h-full bg-gray-50"
          >
            {/* Primary Background Grid */}
            <Background color="#f2f2f2" gap={13} size={1} variant="lines" />

            {/* Secondary Background Grid */}
            <Background color="#eee" gap={130} size={2} variant="lines" />

            {/* Controls with updated positioning */}
            <Controls
              className="vertical bottom left"
              showZoom={true}
              showFitView={true}
              showInteractive={false}
            />

            {/* Enhanced MiniMap */}
            <MiniMap
              className="bottom right"
              style={{ height: 100 }}
              nodeColor={(node) => {
                // Match colors to your node types
                switch (node.data?.config?.type) {
                  case "inport":
                    return "#0050FF";
                  case "outport":
                    return "#FF2E8B";
                  default:
                    return "#A845D0";
                }
              }}
              maskColor="rgba(255, 255, 255, 0.5)"
              nodeStrokeWidth={3}
            />
          </ReactFlow>

          {/* Keep your FileDrawer component */}
          <FileDrawer
            isOpen={isDrawerOpen}
            files={generatedFiles}
            selectedFile={selectedFile}
            onFileSelect={setSelectedFile}
            onClose={toggleFileDrawer}
          />
        </div>
      </div>
    </div>
  );
};

export default FlowGraph;
