import { useEffect } from "react";
import { useReactFlow, getConnectedEdges } from "reactflow";
import { createInitializedNode } from "../../../lib/nodeInitialization";

export const useFlowKeyboardShortcuts = ({
  setNodes,
  setEdges,
  generateHDL,
  onParameterChange,
}) => {
  const { fitView, zoomIn, zoomOut, getNodes, getEdges, project } =
    useReactFlow();

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Spacebar for fit view
      if (event.key === " " || event.code === "Space") {
        event.preventDefault();
        fitView({ padding: 0.1 });
      }

      // Ctrl + Plus/Equals for zoom in
      if (
        (event.ctrlKey || event.metaKey) &&
        (event.key === "+" || event.key === "=")
      ) {
        event.preventDefault();
        zoomIn();
      }

      // Ctrl + Minus for zoom out
      if ((event.ctrlKey || event.metaKey) && event.key === "-") {
        event.preventDefault();
        zoomOut();
      }

      // Ctrl + D for generating HDL
      if ((event.ctrlKey || event.metaKey) && event.key === "d") {
        event.preventDefault();
        generateHDL();
      }

      // Copy/Paste functionality
      if (event.ctrlKey || event.metaKey) {
        if (event.key === "c") {
          const selectedNodes = getNodes().filter((node) => node.selected);
          if (selectedNodes.length === 0) return;

          const selectedEdges = getConnectedEdges(
            selectedNodes,
            getEdges()
          ).filter(
            (edge) =>
              selectedNodes.some((node) => node.id === edge.source) &&
              selectedNodes.some((node) => node.id === edge.target)
          );

          const clipboard = {
            nodes: selectedNodes.map((node) => ({
              ...node,
              position: { ...node.position },
              data: {
                ...node.data,
                config: {
                  ...node.data.config,
                  type: node.data.config.type || node.type.split("_")[0],
                },
              },
            })),
            edges: selectedEdges,
          };

          localStorage.setItem("flowClipboard", JSON.stringify(clipboard));
        }

        if (event.key === "v") {
          try {
            const clipboard = JSON.parse(localStorage.getItem("flowClipboard"));
            if (!clipboard) return;

            const now = Date.now();
            const idMap = {};

            // Create new nodes with proper initialization
            const newNodes = clipboard.nodes.map((node) => {
              const type = node.data.config.type;
              const baseConfig = node.data.config;
              const newId = `${now}_${Math.random().toString(36).substr(2, 9)}`;
              idMap[node.id] = newId;

              const { x, y } = project({
                x: node.position.x + 50,
                y: node.position.y + 50,
              });

              // Create a new name for the copied node
              const existingNodes = getNodes();
              let nameCounter = existingNodes.length;
              let newNodeName;

              do {
                newNodeName = `${type}${nameCounter}`;
                nameCounter++;
              } while (existingNodes.some((n) => n.data.name === newNodeName));

              // Create new node with initialization
              const initializedNode = createInitializedNode({
                id: newId,
                position: { x, y },
                config: {
                  ...baseConfig,
                  // Preserve any customized config values from the source node
                  ...node.data.config,
                },
                name: node.data.config.name,
                instanceName: node.data.config.newNodeName,
                onParameterChange, // Use the onParameterChange from props
                isHierarchical: node.data.isHierarchical,
              });

              // Preserve any additional data properties that might be important
              return {
                ...initializedNode,
                data: {
                  ...initializedNode.data,
                  onParameterChange, // Explicitly set onParameterChange in data
                  // Preserve any other custom data properties if needed
                },
              };
            });

            let newEdges = [];
            if (clipboard.nodes.length > 1) {
              newEdges = clipboard.edges.map((edge) => ({
                ...edge,
                id: `edge_${now}_${Math.random().toString(36).substr(2, 9)}`,
                source: idMap[edge.source],
                target: idMap[edge.target],
                selected: false,
              }));
            }

            setNodes((nodes) => [...nodes, ...newNodes]);
            setEdges((edges) => [...edges, ...newEdges]);
          } catch (error) {
            console.error("Failed to paste nodes:", error);
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    fitView,
    zoomIn,
    zoomOut,
    getNodes,
    getEdges,
    project,
    setNodes,
    setEdges,
    generateHDL,
    onParameterChange,
  ]);
};
