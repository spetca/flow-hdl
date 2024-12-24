import { useEffect } from "react";
import { useReactFlow, getConnectedEdges } from "reactflow";

export const useFlowKeyboardShortcuts = ({
  setNodes,
  setEdges,
  generateHDL,
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
          // Handle Copy
          const selectedNodes = getNodes().filter((node) => node.selected);
          if (selectedNodes.length === 0) return;

          // Only include edges where both source and target nodes are selected
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
            })),
            edges: selectedEdges,
          };

          localStorage.setItem("flowClipboard", JSON.stringify(clipboard));
        }

        if (event.key === "v") {
          // Handle Paste
          try {
            const clipboard = JSON.parse(localStorage.getItem("flowClipboard"));
            if (!clipboard) return;

            const now = Date.now();
            const idMap = {};

            // Create new nodes with offset positions
            const newNodes = clipboard.nodes.map((node) => {
              const newId = `${node.type}_${now}_${Math.random()
                .toString(36)
                .substr(2, 9)}`;
              idMap[node.id] = newId;

              const { x, y } = project({
                x: node.position.x + 50,
                y: node.position.y + 50,
              });

              // Create a new name for the copied node
              const existingNodes = getNodes();
              const baseNodeName = node.data.config.type;
              let nameCounter = existingNodes.length;
              let newNodeName;

              // Keep incrementing counter until we find a unique name
              do {
                newNodeName = `${baseNodeName}${nameCounter}`;
                nameCounter++;
              } while (existingNodes.some((n) => n.data.name === newNodeName));

              return {
                ...node,
                id: newId,
                position: { x, y },
                selected: false,
                data: {
                  ...node.data,
                  name: newNodeName,
                  // Reset any connection-specific data
                  connections: [],
                },
              };
            });

            // Only create edges if we copied multiple nodes
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
  ]);
};
