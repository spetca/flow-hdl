import { useState, useCallback } from "react";
import { useNodesState, useEdgesState, addEdge } from "reactflow";
import registry from "../../blockHelpers/BlockRegistry.jsx"
import { createInitializedNode } from "../../../lib/nodeInitialization";

export const useHDLFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [moduleName, setModuleName] = useState("top_module");
  const [flowStack, setFlowStack] = useState([
    { id: "top", name: "Top Level", nodes: [], edges: [] },
  ]);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [subflowStack, setSubflowStack] = useState([]);
  const [currentSubflowId, setCurrentSubflowId] = useState(null);
  const [hierarchicalBlocks, setHierarchicalBlocks] = useState(new Map());
  const [parentState, setParentState] = useState(null);

  const currentSystem = flowStack[currentLevel];

  const onNavigateToSubflow = useCallback(
    (subflowId, subflowName) => {
      console.log("Navigating to subflow:", { subflowId, subflowName });

      // Save the current (parent) state with all node data preserved
      setParentState({
        nodes: nodes.map((node) => ({
          ...node,
          data: {
            ...node.data,
            onNavigateToSubflow,
            isSubflow: node.id.split("_")[0] === "subflow",
          },
        })),
        edges: [...edges],
      });

      // Get or create subflow state
      const subflowState = hierarchicalBlocks.get(subflowId) || {
        nodes: [],
        edges: [],
        ports: {},
      };

      console.log("Loading subflow state:", subflowState);

      // Update stack and set new state
      setSubflowStack((prev) => [
        ...prev,
        { id: subflowId, name: subflowName },
      ]);
      setCurrentSubflowId(subflowId);
      setNodes(subflowState.nodes);
      setEdges(subflowState.edges);
    },
    [nodes, edges, hierarchicalBlocks]
  );

  const onParameterChange = useCallback((nodeId, updates) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          // Create updated node
          const newNode = {
            ...node,
            data: {
              ...node.data,
              name: updates.name,
              config: updates.config,
              params: updates.params,
              onParameterChange, // Important to preserve these
              onNavigateToSubflow: node.data.onNavigateToSubflow,
              isSubflow: node.data.isSubflow,
            },
          };

          // Handle subflow updates if needed
          if (node.data.isSubflow && updates.config.ports) {
            setHierarchicalBlocks((prev) => {
              const blockData = prev.get(nodeId) || { nodes: [], edges: [] };
              return new Map(
                prev.set(nodeId, {
                  ...blockData,
                  ports: updates.config.ports,
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
      // type below is the key of the block registry, not sure how tho...
      const type = event.dataTransfer.getData("application/json");
      console.log("type of block:", type);
      const isSubflow = type === "subflow";
      const reactFlowBounds = event.target
        .closest(".react-flow")
        .getBoundingClientRect();
      const position = {
        x: (event.clientX - reactFlowBounds.left - 100) / 1.5,
        y: (event.clientY - reactFlowBounds.top - 50) / 1.5,
      };

      const config = registry.get(type);
      const newNodeId = `${type}_${Date.now()}`;
      const nodeName = `${type}${nodes.length}`;

      const newNode = createInitializedNode({
        id: newNodeId,
        position,
        config,
        name: nodeName,
        onParameterChange,
        isSubflow,
        onNavigateToSubflow,
      });

      if (isSubflow) {
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
    [nodes, onParameterChange, onNavigateToSubflow] // Added onNavigateToSubflow to dependencies
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

  const onNavigateBack = useCallback(() => {
    if (!currentSubflowId || subflowStack.length === 0) return;

    console.log("Navigating back from subflow:", currentSubflowId);

    // Save current subflow state
    setHierarchicalBlocks((prev) => {
      const newMap = new Map(prev);
      newMap.set(currentSubflowId, {
        nodes: [...nodes],
        edges: [...edges],
        ports: prev.get(currentSubflowId)?.ports || {},
      });
      return newMap;
    });

    // Restore parent state with navigation functions
    if (parentState) {
      console.log("Restoring parent state:", parentState);
      setNodes(
        parentState.nodes.map((node) => ({
          ...node,
          data: {
            ...node.data,
            onNavigateToSubflow,
            onParameterChange,
          },
        }))
      );
      setEdges(parentState.edges);
    }

    // Update navigation state
    setSubflowStack((prev) => prev.slice(0, -1));
    setCurrentSubflowId(null);
    setParentState(null);
  }, [
    nodes,
    edges,
    currentSubflowId,
    subflowStack,
    parentState,
    onNavigateToSubflow,
    onParameterChange,
  ]);

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

  // Update clearGraph function
  const clearGraph = useCallback(() => {
    // Reset everything to initial state
    setNodes([]);
    setEdges([]);
    setModuleName("top_module");
    setFlowStack([{ id: "top", name: "Top Level", nodes: [], edges: [] }]);
    setCurrentLevel(0);
    setSubflowStack([]);
    setCurrentSubflowId(null);
    setHierarchicalBlocks(new Map());
    setParentState(null);
    localStorage.removeItem("flowClipboard");
  }, []);

  const importFlow = useCallback(
    (flowData) => {
      try {
        // First reset everything
        setNodes([]);
        setEdges([]);

        // Reinitialize nodes with proper configuration handling
        const reinitializedNodes = flowData.nodes.map((node) => {
          const type = node.id.split("_")[0];
          const baseConfig = registry.get(type);

          // Preserve existing port configurations while ensuring proper structure
          const ports = {
            inputs: {},
            outputs: {},
          };

          // Handle input ports
          Object.entries(node.data.config.ports.inputs || {}).forEach(
            ([portName, portConfig]) => {
              ports.inputs[portName] = {
                width: { default: portConfig.width?.default || 32 },
                signed: { default: portConfig.signed?.default || false },
              };
            }
          );

          // Handle output ports
          Object.entries(node.data.config.ports.outputs || {}).forEach(
            ([portName, portConfig]) => {
              ports.outputs[portName] = {
                width: { default: portConfig.width?.default || 32 },
                signed: { default: portConfig.signed?.default || false },
              };
            }
          );

          // Create reinitialized node
          return {
            ...node,
            type: "hdlNode",
            data: {
              ...node.data,
              config: {
                ...baseConfig,
                ...node.data.config,
                ports,
              },
              params: node.data.params || {},
              onParameterChange,
              onNavigateToSubflow: node.data.isSubflow
                ? onNavigateToSubflow
                : undefined,
              isSubflow: node.data.isSubflow,
            },
          };
        });

        // Reinitialize edges with proper styling and animation
        const reinitializedEdges = flowData.edges.map((edge) => ({
          ...edge,
          type: "default",
          animated: true,
          style: { stroke: "#333" },
        }));

        setNodes(reinitializedNodes);
        setEdges(reinitializedEdges);
        setModuleName(flowData.moduleName);

        if (flowData.hierarchicalBlocks) {
          setHierarchicalBlocks(new Map(flowData.hierarchicalBlocks));
        }
        if (flowData.flowStack) {
          setFlowStack(flowData.flowStack);
          setCurrentLevel(flowData.currentLevel || 0);
        }
      } catch (error) {
        console.error("Error importing flow:", error);
        alert("Error importing flow. Please check the file format.");
      }
    },
    [onParameterChange, onNavigateToSubflow]
  );

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
    clearGraph,
    setNodes,
    setEdges,
    onParameterChange,
    currentSubflowId,
    onNavigateToSubflow,
    onNavigateBack,
  };
};
