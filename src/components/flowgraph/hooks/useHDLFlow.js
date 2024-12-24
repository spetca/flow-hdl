import { useState, useCallback } from "react";
import { useNodesState, useEdgesState, addEdge } from "reactflow";
import { getBlockConfig } from "../../blockHelpers";
import { createInitializedNode } from "../../../lib/nodeInitialization";

export const useHDLFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [moduleName, setModuleName] = useState("top_module");
  const [flowStack, setFlowStack] = useState([
    { id: "top", name: "Top Level", nodes: [], edges: [] },
  ]);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [hierarchicalBlocks, setHierarchicalBlocks] = useState(new Map());

  const currentSystem = flowStack[currentLevel];

  const onParameterChange = useCallback((nodeId, updates) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          const newNode = {
            ...node,
            data: {
              ...node.data,
              config: updates.config,
              params: updates.params,
              name: updates.name,
            },
          };

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

          return newNode;
        }
        return node;
      })
    );
  }, []);

  // Helper function to initialize port configurations
  // Helper function to initialize port configurations with proper default handling
  const initializePortConfigs = (config) => {
    const ports = {
      inputs: {},
      outputs: {},
    };

    // Initialize input ports
    Object.entries(config.ports.inputs || {}).forEach(
      ([portName, portConfig]) => {
        ports.inputs[portName] = {
          width: {
            default:
              typeof portConfig.width === "object"
                ? portConfig.width.default
                : portConfig.width || 32,
          },
          signed: {
            default:
              typeof portConfig.signed === "object"
                ? portConfig.signed.default
                : portConfig.signed || false,
          },
        };
      }
    );

    // Initialize output ports
    Object.entries(config.ports.outputs || {}).forEach(
      ([portName, portConfig]) => {
        ports.outputs[portName] = {
          width: {
            default:
              typeof portConfig.width === "object"
                ? portConfig.width.default
                : portConfig.width || 32,
          },
          signed: {
            default:
              typeof portConfig.signed === "object"
                ? portConfig.signed.default
                : portConfig.signed || false,
          },
        };
      }
    );

    return ports;
  };

  // Helper function to initialize parameters
  const initializeParams = (config) => {
    const params = {};

    if (config.params) {
      Object.entries(config.params).forEach(([paramName, paramConfig]) => {
        params[paramName] = paramConfig.default;
      });
    }

    return params;
  };

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
          `Cannot connect: Port widths don't match (${sourcePort.width} != ${targetPort.width})`
        );
        return;
      }
      if (sourcePort.signed.default !== targetPort.signed.default) {
        alert("Cannot connect: Port signs don't match");
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
            type: "bezier",
            animated: true,
            style: { stroke: "#333" },
          },
          eds
        )
      );
    },
    [nodes, edges]
  );

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/json");
      const isHierarchical = type === "hierarchical";
      const reactFlowBounds = event.target
        .closest(".react-flow")
        .getBoundingClientRect();
      const position = {
        x: (event.clientX - reactFlowBounds.left - 100) / 1.5,
        y: (event.clientY - reactFlowBounds.top - 50) / 1.5,
      };

      const config = getBlockConfig(type);
      const newNodeId = `${type}_${Date.now()}`;
      const nodeName = `${type}${nodes.length}`;

      const newNode = createInitializedNode({
        id: newNodeId,
        type,
        position,
        config,
        name: nodeName,
        onParameterChange,
        isHierarchical,
      });

      if (isHierarchical) {
        const initializedPorts = newNode.data.config.ports;
        setHierarchicalBlocks(
          (prev) =>
            new Map(
              prev.set(newNodeId, {
                nodes: [],
                edges: [],
                ports: initializedPorts,
              })
            )
        );
      }

      setNodes((nds) => [...nds, newNode]);
    },
    [nodes, onParameterChange]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const navigateToChild = useCallback(
    (childId, childName) => {
      setFlowStack((stack) => [
        ...stack,
        {
          id: childId,
          name: childName,
          nodes: [],
          edges: [],
          parent: currentSystem,
        },
      ]);
      setCurrentLevel((prev) => prev + 1);
      setNodes([]);
      setEdges([]);
    },
    [currentSystem]
  );

  const navigateToParent = useCallback(() => {
    if (currentLevel === 0) return;

    setFlowStack((stack) => {
      const newStack = [...stack];
      newStack[currentLevel] = { ...newStack[currentLevel], nodes, edges };
      return newStack;
    });

    setCurrentLevel((prev) => prev - 1);
    const parentLevel = flowStack[currentLevel - 1];
    setNodes(parentLevel.nodes);
    setEdges(parentLevel.edges);
  }, [currentLevel, nodes, edges, flowStack]);

  const exportFlow = useCallback(() => {
    const flowData = {
      nodes,
      edges,
      moduleName,
      hierarchicalBlocks: Array.from(hierarchicalBlocks.entries()),
      flowStack,
      currentLevel,
    };

    const blob = new Blob([JSON.stringify(flowData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${moduleName}_flowgraph.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [nodes, edges, moduleName, hierarchicalBlocks, flowStack, currentLevel]);

  const importFlow = useCallback((flowData) => {
    // Reinitialize nodes with proper configuration handling
    const reinitializedNodes = flowData.nodes.map((node) => {
      const type = node.id.split("_")[0];

      try {
        // Get base configuration
        const baseConfig = getBlockConfig(type);

        // Preserve existing port configurations while ensuring proper structure
        const ports = {
          inputs: {},
          outputs: {},
        };

        // Handle input ports
        Object.entries(node.data.config.ports.inputs || {}).forEach(
          ([portName, portConfig]) => {
            ports.inputs[portName] = {
              width:
                typeof portConfig.width === "number"
                  ? portConfig.width
                  : portConfig.width?.default || 32,
              signed:
                typeof portConfig.signed === "boolean"
                  ? portConfig.signed
                  : portConfig.signed?.default || false,
            };
          }
        );

        // Handle output ports
        Object.entries(node.data.config.ports.outputs || {}).forEach(
          ([portName, portConfig]) => {
            ports.outputs[portName] = {
              width:
                typeof portConfig.width === "number"
                  ? portConfig.width
                  : portConfig.width?.default || 32,
              signed:
                typeof portConfig.signed === "boolean"
                  ? portConfig.signed
                  : portConfig.signed?.default || false,
            };
          }
        );

        // Preserve existing parameters or use defaults
        const params = {};
        Object.entries(baseConfig.params || {}).forEach(
          ([paramName, paramConfig]) => {
            const existingValue = node.data.params?.[paramName];
            params[paramName] =
              existingValue !== undefined ? existingValue : paramConfig.default;
          }
        );

        return {
          ...node,
          data: {
            ...node.data,
            config: {
              ...baseConfig,
              ...node.data.config,
              ports,
            },
            params,
            name: node.data.name || `${type}${flowData.nodes.indexOf(node)}`,
            onParameterChange,
          },
        };
      } catch (error) {
        console.error(`Error reinitializing node ${type}:`, error);
        return node;
      }
    });

    setNodes(reinitializedNodes);
    setEdges(flowData.edges);
    setModuleName(flowData.moduleName);
    if (flowData.hierarchicalBlocks) {
      setHierarchicalBlocks(new Map(flowData.hierarchicalBlocks));
    }
    if (flowData.flowStack) {
      setFlowStack(flowData.flowStack);
      setCurrentLevel(flowData.currentLevel || 0);
    }
  }, []);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onDrop,
    onDragOver,
    moduleName,
    setModuleName,
    currentSystem,
    navigateToParent,
    navigateToChild,
    exportFlow,
    importFlow,
    setNodes,
    setEdges,
    onParameterChange,
  };
};
