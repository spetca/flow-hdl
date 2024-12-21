import { blockRegistry } from "../blockHelpers";

class SystemVerilogGenerator {
  constructor(nodes, edges, moduleName, hierarchicalBlocks) {
    this.nodes = nodes;
    this.edges = edges;
    this.moduleName = moduleName;
    this.hierarchicalBlocks = hierarchicalBlocks;
    this.files = {};
    this.usedWireNames = new Set();
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

    // Add clock to input ports but only at top level
    inputPorts.unshift("input logic clk");

    return `module ${this.moduleName} (\n    ${[
      ...inputPorts,
      ...outputPorts,
    ].join(",\n    ")}\n);`;
  }

  getPortDeclaration(portConfig) {
    const signType = portConfig.signed ? "signed" : "logic";
    return `${signType} [${portConfig.width - 1}:0]`;
  }

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

  generateWireNameForConnection(sourceId, targetId) {
    const sourceNode = this.nodes.find((n) => n.id === sourceId);
    const targetNode = this.nodes.find((n) => n.id === targetId);
    return `wire_${sourceNode.data.name}_to_${targetNode.data.name}`;
  }

  generateWireDeclarations() {
    const wireDeclarations = new Set();
    const connections = this.findWiringConnections();

    connections.forEach((connection) => {
      const sourcePort = connection.sourcePort;
      const wireName = this.generateWireNameForConnection(
        connection.source,
        connection.target
      );

      const wireDecl = `logic ${sourcePort.signed ? "signed " : ""}[${
        sourcePort.width - 1
      }:0] ${wireName};`;
      wireDeclarations.add(wireDecl);

      if (connection.sourceType === "inport") {
        wireDeclarations.add(`assign ${wireName} = ${connection.sourceName};`);
      }
    });

    return Array.from(wireDeclarations).join("\n");
  }

  findWiringConnections() {
    const connections = [];
    this.edges.forEach((edge) => {
      const sourceNode = this.nodes.find((n) => n.id === edge.source);
      const targetNode = this.nodes.find((n) => n.id === edge.target);

      if (sourceNode && targetNode) {
        const sourcePort =
          sourceNode.data.config.ports.outputs[edge.sourceHandle];
        connections.push({
          source: edge.source,
          target: edge.target,
          sourceName: sourceNode.data.name || "unnamed_source",
          targetName: targetNode.data.name || "unnamed_target",
          sourcePort: sourcePort,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle,
          sourceType: sourceNode.data.config.type,
          targetType: targetNode.data.config.type,
        });
      }
    });
    return connections;
  }

  generateBlockInstances() {
    return this.nodes
      .filter(
        (node) =>
          node.data.config.type !== "inport" &&
          node.data.config.type !== "outport"
      )
      .map((node) => {
        const moduleType = node.data.config.type;
        const instanceName = `u_${node.data.name}`;

        // Get all port widths for parameterization
        const portParams = [];
        Object.entries(node.data.config.ports.inputs || {}).forEach(
          ([portName, port]) => {
            portParams.push(
              `        .${portName.toUpperCase()}_WIDTH(${port.width})`
            );
          }
        );
        Object.entries(node.data.config.ports.outputs || {}).forEach(
          ([portName, port]) => {
            portParams.push(
              `        .${portName.toUpperCase()}_WIDTH(${port.width})`
            );
          }
        );

        // Add other block parameters
        Object.entries(node.data.params || {}).forEach(([paramName, value]) => {
          const formattedValue =
            typeof value === "boolean" ? (value ? "1" : "0") : value;
          portParams.push(`        .${paramName}(${formattedValue})`);
        });

        const parameterList =
          portParams.length > 0 ? ` #(\n${portParams.join(",\n")}\n    )` : "";

        // Generate port mappings (excluding clock - it will be added separately)
        const portMappings = Object.entries(node.data.config.ports).flatMap(
          ([portType, ports]) =>
            Object.entries(ports).map(([portId, port]) => {
              const connection = this.edges.find(
                (edge) =>
                  (edge.source === node.id && edge.sourceHandle === portId) ||
                  (edge.target === node.id && edge.targetHandle === portId)
              );

              if (connection) {
                const wireName = this.generateWireNameForConnection(
                  connection.source,
                  connection.target
                );
                return `        .${portId}(${wireName})`;
              }
              return `        .${portId}()`;
            })
        );

        // Add clock to port mappings
        portMappings.push("        .clk(clk)");

        return `    ${moduleType}${parameterList} ${instanceName} (\n${portMappings.join(
          ",\n"
        )}\n    );`;
      })
      .join("\n\n");
  }

  generateBlockModules() {
    const processedTypes = new Set();

    this.nodes.forEach((node) => {
      if (
        node.data.config.type !== "inport" &&
        node.data.config.type !== "outport"
      ) {
        const blockType = node.data.config.type;

        if (!processedTypes.has(blockType)) {
          processedTypes.add(blockType);

          const blockConfig = blockRegistry[blockType];
          // Use the block's own Verilog generation - no clock injection needed
          const blockModule = blockConfig.generateVerilog({
            name: blockType,
            ports: node.data.config.ports,
            params: {},
          });

          this.files[`${blockType}.sv`] = blockModule;
        }
      }
    });
  }

  addClockToBlockModule(moduleCode) {
    // Add clock to module port list if it's not already there
    const moduleMatch = moduleCode.match(
      /module\s+\w+\s*#?\s*\([^)]*\)\s*\([^;]*\)/s
    );
    if (moduleMatch) {
      const moduleHeader = moduleMatch[0];
      if (!moduleHeader.includes("clk")) {
        const insertPoint = moduleHeader.lastIndexOf(")");
        const newHeader =
          moduleHeader.slice(0, insertPoint) +
          (moduleHeader.slice(insertPoint - 1, insertPoint).trim() === "("
            ? ""
            : ",\n    ") +
          "input wire clk" +
          moduleHeader.slice(insertPoint);
        moduleCode = moduleCode.replace(moduleHeader, newHeader);
      }
    }
    return moduleCode;
  }

  generate() {
    this.usedWireNames.clear();

    const wireDeclarations = this.generateWireDeclarations();
    const moduleInstances = this.generateBlockInstances();

    this.files[`${this.moduleName}.sv`] = `${this.generateModuleHeader()}

// Wire declarations
${wireDeclarations}

// Module instances
${moduleInstances}

endmodule`;

    this.generateBlockModules();
    return this.files;
  }
}

export default SystemVerilogGenerator;
