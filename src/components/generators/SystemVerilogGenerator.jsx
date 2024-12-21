import { blockRegistry } from "../blockHelpers";

class SystemVerilogGenerator {
  constructor(nodes, edges, moduleName, hierarchicalBlocks) {
    this.nodes = nodes;
    this.edges = edges;
    this.moduleName = moduleName;
    this.hierarchicalBlocks = hierarchicalBlocks;
    this.files = {};
    this.usedWireNames = new Set(); // Track used wire names
  }

  generateModuleHeader() {
    const inputPorts = this.nodes
      .filter((node) => node.data.config.type === "inport")
      .map((node) => {
        const portConfig = node.data.config.ports.outputs.out;
        return `input ${this.getPortDeclaration(portConfig)} ${node.data.name}`;
      });

    const outputPorts = this.nodes
      .filter((node) => node.data.config.type === "outport")
      .map((node) => {
        const portConfig = node.data.config.ports.inputs.in;
        return `output ${this.getPortDeclaration(portConfig)} ${
          node.data.name
        }`;
      });

    return `module ${this.moduleName} (\n${[...inputPorts, ...outputPorts].join(
      ",\n"
    )}\n);`;
  }

  // Helper method to generate port declaration
  getPortDeclaration(portConfig) {
    const signType = portConfig.signed ? "signed" : "logic";
    return `${signType} [${portConfig.width - 1}:0]`;
  }

  // Generate a unique wire name
  generateUniqueWireName(baseName) {
    let wireName = baseName;
    let counter = 1;
    while (this.usedWireNames.has(wireName)) {
      wireName = `${baseName}_${counter}`;
      counter++;
    }
    this.usedWireNames.add(wireName);
    return wireName;
  }

  generateWireDeclarations() {
    const wireDeclarations = new Set();

    // Find connections that require wires
    const wiringConnections = this.findWiringConnections();

    wiringConnections.forEach((connection) => {
      const sourcePort = connection.sourcePort;
      const wireName = this.generateUniqueWireName(
        `wire_${connection.sourceName}_to_${connection.targetName}`
      );

      const wireDecl = `logic ${sourcePort.signed ? "signed " : ""}[${
        sourcePort.width - 1
      }:0] ${wireName};`;
      wireDeclarations.add(wireDecl);
    });

    return Array.from(wireDeclarations).join("\n");
  }

  // Find connections that require wires
  findWiringConnections() {
    const connections = [];

    // Track all connections
    const allConnections = this.edges
      .map((edge) => ({
        source: this.nodes.find((n) => n.id === edge.source),
        target: this.nodes.find((n) => n.id === edge.target),
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
      }))
      .filter((conn) => conn.source && conn.target);

    // Determine which connections need wires
    allConnections.forEach((conn) => {
      const sourceNode = conn.source;
      const targetNode = conn.target;
      const sourcePort =
        sourceNode.data.config.ports.outputs[conn.sourceHandle];

      connections.push({
        sourceName: sourceNode.data.name || "unnamed_source",
        targetName: targetNode.data.name || "unnamed_target",
        sourcePort: sourcePort,
      });
    });

    return connections;
  }

  generateBlockInstances() {
    const instanceCounts = {};
    const wireConnections = {};

    // First, create a map of connections
    this.edges.forEach((edge) => {
      const sourceNode = this.nodes.find((n) => n.id === edge.source);
      const targetNode = this.nodes.find((n) => n.id === edge.target);

      if (sourceNode && targetNode) {
        const wireName = this.generateUniqueWireName(
          `wire_${sourceNode.data.name || "unnamed_source"}_to_${
            targetNode.data.name || "unnamed_target"
          }`
        );
        wireConnections[edge.source] = {
          wireName,
          sourceHandle: edge.sourceHandle,
        };
        wireConnections[edge.target] = {
          wireName,
          targetHandle: edge.targetHandle,
        };
      }
    });

    return this.nodes
      .filter(
        (node) =>
          node.data.config.type !== "inport" &&
          node.data.config.type !== "outport"
      )
      .map((node) => {
        const moduleType = node.data.config.type;
        if (!instanceCounts[moduleType]) {
          instanceCounts[moduleType] = 0;
        }
        const instanceNumber = instanceCounts[moduleType]++;
        const instanceName = `u_${moduleType}_${instanceNumber}`;

        // Generate parameter list with proper SystemVerilog syntax
        const parameterList = this.generateParameterList(node);

        // Generate port mappings with wire connections
        const portMappings = Object.entries(node.data.config.ports)
          .flatMap(([portType, ports]) =>
            Object.entries(ports).map(([portId, port]) => {
              // Check if this port has a wire connection
              const connection = this.edges.find(
                (edge) =>
                  (edge.source === node.id && edge.sourceHandle === portId) ||
                  (edge.target === node.id && edge.targetHandle === portId)
              );

              if (connection) {
                // Determine the wire name for this connection
                const wireName = this.generateUniqueWireName(
                  `wire_${
                    this.nodes.find((n) => n.id === connection.source).data
                      .name || "unnamed_source"
                  }_to_${
                    this.nodes.find((n) => n.id === connection.target).data
                      .name || "unnamed_target"
                  }`
                );

                return `\t\t.${portId}(${wireName})`;
              } else if (node.data.name) {
                // If not connected but has a name (e.g., input/output ports)
                return `\t\t.${portId}(${node.data.name})`;
              }

              // Unconnected port
              return `\t\t.${portId}()`;
            })
          )
          .join(",\n");

        return `\t${moduleType}${parameterList} ${instanceName} (\n${portMappings}\n\t);`;
      })
      .join("\n\n");
  }

  // Generate parameter list for module instantiation
  generateParameterList(node) {
    const params = node.data.params || {};
    const blockConfig = blockRegistry[node.data.config.type];

    if (Object.keys(params).length === 0) return "";

    const paramEntries = Object.entries(params).map(([paramName, value]) => {
      // Prioritize the actual parameter value over default
      const formattedValue =
        typeof value === "boolean" ? (value ? "1" : "0") : value;

      return `\t\t.${paramName}(${formattedValue})`;
    });

    return paramEntries.length > 0 ? ` #(\n${paramEntries.join(",\n")}\n)` : "";
  }

  generateBlockModules() {
    this.nodes.forEach((node) => {
      if (
        node.data.config.type !== "inport" &&
        node.data.config.type !== "outport"
      ) {
        const blockConfig = blockRegistry[node.data.config.type];

        if (node.data.isHierarchical) {
          const hierarchicalData = this.hierarchicalBlocks.get(node.id);
          if (hierarchicalData) {
            const blockModule = blockConfig.generateVerilog(
              {
                name: node.data.name,
                ...node.data.params,
              },
              hierarchicalData.nodes,
              hierarchicalData.edges
            );
            this.files[`${node.data.name}.sv`] = blockModule;
          }
        } else {
          const blockModule = blockConfig.generateVerilog({
            name: node.data.name,
            ...node.data.params,
          });
          this.files[`${node.data.name}.sv`] = blockModule;
        }
      }
    });
  }

  generate() {
    // Reset used wire names
    this.usedWireNames.clear();

    // Generate the main module with wire declarations
    const wireDeclarations = this.generateWireDeclarations();

    this.files[
      `${this.moduleName}.sv`
    ] = `${this.generateModuleHeader()}\n\n// Wire declarations\n${wireDeclarations}\n\n// Module instances\n${this.generateBlockInstances()}\n\nendmodule`;

    // Generate individual block modules
    this.generateBlockModules();

    return this.files;
  }
}

export default SystemVerilogGenerator;
