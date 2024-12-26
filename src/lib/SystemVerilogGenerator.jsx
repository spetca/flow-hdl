import { SubflowHandler } from "../lib/subflowHandler";
import registry from "../components/blockHelpers/BlockRegistry.jsx";

class SystemVerilogGenerator {
  constructor(flowGraphJson) {
    // Destructure directly from the JSON
    const { nodes, edges, moduleName, hierarchicalBlocks } = flowGraphJson;

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
    // Ensure we're using actual numeric values, not object references
    const width =
      typeof portConfig.width === "number"
        ? portConfig.width
        : portConfig.width?.default || 32;
    const signed =
      typeof portConfig.signed === "boolean"
        ? portConfig.signed
        : portConfig.signed?.default || false;

    const signType = signed ? "signed" : "logic";
    return `${signType} [${width - 1}:0]`;
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

  generateWireNameForConnection(
    sourceId,
    sourceHandle,
    targetId,
    targetHandle
  ) {
    const sourceNode = this.nodes.find((n) => n.id === sourceId);
    const targetNode = this.nodes.find((n) => n.id === targetId);

    return `wire_${sourceNode.data.name}_${sourceHandle}_to_${targetNode.data.name}_${targetHandle}`;
  }

  generateWireDeclarations() {
    const wireDeclarations = new Set();
    const assignDeclarations = new Set();
    const connections = this.findWiringConnections();

    connections.forEach((connection) => {
      const width =
        typeof connection.sourcePort.width === "number"
          ? connection.sourcePort.width
          : connection.sourcePort.width?.default || 32;

      const signed =
        typeof connection.sourcePort.signed === "boolean"
          ? connection.sourcePort.signed
          : connection.sourcePort.signed?.default || false;

      const wireName = this.generateWireNameForConnection(
        connection.source,
        connection.sourceHandle,
        connection.target,
        connection.targetHandle
      );

      // Add to wire declarations
      const wireDecl = `logic ${signed ? "signed " : ""}[${
        width - 1
      }:0] ${wireName};`;
      wireDeclarations.add(wireDecl);

      // Add to assign declarations if it's an input port
      if (connection.sourceType === "inport") {
        assignDeclarations.add(
          `assign ${wireName} = ${connection.sourceName};`
        );
      }
    });

    return `// Wire declarations\n${Array.from(wireDeclarations).join("\n")}
  
  // Assign declarations\n${Array.from(assignDeclarations).join("\n")}`;
  }
  findWiringConnections() {
    const connections = [];
    this.edges.forEach((edge) => {
      const sourceNode = this.nodes.find((n) => n.id === edge.source);
      const targetNode = this.nodes.find((n) => n.id === edge.target);

      if (sourceNode && targetNode) {
        const sourcePort =
          sourceNode.data.config.ports.outputs[edge.sourceHandle];
        const width =
          typeof sourcePort.width === "number"
            ? sourcePort.width
            : sourcePort.width?.default || 32;

        const signed =
          typeof sourcePort.signed === "boolean"
            ? sourcePort.signed
            : sourcePort.signed?.default || false;

        connections.push({
          source: edge.source,
          target: edge.target,
          sourceName: sourceNode.data.name || "unnamed_source",
          targetName: targetNode.data.name || "unnamed_target",
          sourcePort: {
            ...sourcePort,
            width,
            signed,
          },
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

        // Extract actual numeric values for port widths
        const portParams = [];
        Object.entries(node.data.config.ports.inputs || {}).forEach(
          ([portName, port]) => {
            const width =
              typeof port.width === "number"
                ? port.width
                : port.width?.default || 32;
            portParams.push(`    .${portName.toUpperCase()}_WIDTH(${width})`);
          }
        );

        Object.entries(node.data.config.ports.outputs || {}).forEach(
          ([portName, port]) => {
            const width =
              typeof port.width === "number"
                ? port.width
                : port.width?.default || 32;
            portParams.push(`    .${portName.toUpperCase()}_WIDTH(${width})`);
          }
        );

        // Handle block parameters
        Object.entries(node.data.params || {}).forEach(([paramName, value]) => {
          const formattedValue =
            typeof value === "boolean" ? (value ? "1" : "0") : value;
          portParams.push(`    .${paramName}(${formattedValue})`);
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
                  connection.sourceHandle,
                  connection.target,
                  connection.targetHandle
                );
                return `        .${portId}(${wireName})`;
              }
              return `        .${portId}()`;
            })
        );

        // Add clock to port mappings
        if (node.data.config.synchronous) {
          portMappings.push("        .clk(clk)");
        }

        return `${moduleType}${parameterList} ${instanceName} (\n${portMappings.join(
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

          // Use the block's own Verilog generation - no clock injection needed
          const generateVerilog = registry.getGenerateVerilog(blockType);

          this.files[`${blockType}.sv`] = generateVerilog({
            name: blockType,
            ports: node.data.config.ports,
            params: {},
          });
        }
      }
    });
  }

  generate() {
    this.usedWireNames.clear();

    const declarations = this.generateWireDeclarations();
    const moduleInstances = this.generateBlockInstances();

    this.files[`${this.moduleName}.sv`] = `${this.generateModuleHeader()}

${declarations}

// Module instances
${moduleInstances}

endmodule`;

    this.generateBlockModules();
    return this.files;
  }
}

export default SystemVerilogGenerator;
