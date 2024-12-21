export class VerilogGenerator {
  constructor() {
    this.modules = new Map();
    this.wireCounter = 0;
  }

  generateWireName(source, target, portName) {
    return `wire_${source}_${target}_${portName}`;
  }

  generateModuleVerilog(moduleId, nodes, edges, isTopLevel = false) {
    // Collect all ports
    const ports = this.collectPorts(nodes, isTopLevel);

    // Generate wire declarations
    const wires = this.generateWireDeclarations(edges);

    // Generate module instantiations
    const instances = this.generateInstances(nodes, edges);

    // Generate the complete module
    const moduleVerilog = `module ${moduleId} (
    ${ports.join(",\n  ")}
  );
  
  ${wires.join("\n")}
  
  ${instances.join("\n\n")}
  
  endmodule`;

    this.modules.set(moduleId, moduleVerilog);
    return moduleVerilog;
  }

  collectPorts(nodes, isTopLevel) {
    const ports = [];

    // For top level modules, only include external ports
    if (isTopLevel) {
      const inputNodes = nodes.filter((n) => n.data.config.type === "inport");
      const outputNodes = nodes.filter((n) => n.data.config.type === "outport");

      inputNodes.forEach((node) => {
        const port = node.data.config.ports.outputs.out;
        ports.push(
          `input ${port.signed ? "signed " : ""}[${port.width - 1}:0] ${
            node.data.name
          }`
        );
      });

      outputNodes.forEach((node) => {
        const port = node.data.config.ports.inputs.in;
        ports.push(
          `output ${port.signed ? "signed " : ""}[${port.width - 1}:0] ${
            node.data.name
          }`
        );
      });
    }

    return ports;
  }

  generateWireDeclarations(edges) {
    return edges.map((edge) => {
      const width = edge.data.width || 32; // Default to 32 bits if not specified
      return `wire [${width - 1}:0] ${edge.data.wireName};`;
    });
  }

  generateInstances(nodes, edges) {
    return nodes
      .filter((node) => !["inport", "outport"].includes(node.data.config.type))
      .map((node) => {
        const portMappings = this.generatePortMappings(node, edges);
        const instanceName = `${node.data.config.type}_${node.id}`;

        return `  ${node.data.config.type} ${instanceName} (
      ${portMappings.join(",\n    ")}
    );`;
      });
  }

  generatePortMappings(node, edges) {
    const mappings = [];

    // Input port mappings
    Object.entries(node.data.config.ports.inputs).forEach(
      ([portName, port]) => {
        const edge = edges.find(
          (e) => e.target === node.id && e.targetHandle === portName
        );
        const wireName = edge ? edge.data.wireName : portName;
        mappings.push(`.${portName}(${wireName})`);
      }
    );

    // Output port mappings
    Object.entries(node.data.config.ports.outputs).forEach(
      ([portName, port]) => {
        const edge = edges.find(
          (e) => e.source === node.id && e.sourceHandle === portName
        );
        const wireName = edge ? edge.data.wireName : portName;
        mappings.push(`.${portName}(${wireName})`);
      }
    );

    return mappings;
  }

  getGeneratedModules() {
    return Object.fromEntries(this.modules);
  }
}

// Helper function to traverse hierarchical blocks
export const traverseHierarchy = (nodes, edges, onVisitNode) => {
  const visited = new Set();

  const visit = (nodeId) => {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    // Visit connected nodes
    edges.forEach((edge) => {
      if (edge.source === nodeId) visit(edge.target);
      if (edge.target === nodeId) visit(edge.source);
    });

    // Process the node
    onVisitNode(node);
  };

  // Start traversal from all root nodes (nodes with no incoming edges)
  nodes
    .filter((node) => !edges.some((edge) => edge.target === node.id))
    .forEach((node) => visit(node.id));
};
