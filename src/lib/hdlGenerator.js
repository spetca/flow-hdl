import { getBlockConfig } from "../components/blockHelpers";

export class HDLGenerator {
  constructor(blocks, connections, moduleName = "top") {
    this.blocks = blocks;
    this.connections = connections;
    this.moduleName = moduleName;
  }

  generateTopModule() {
    const moduleIO = this.generateModuleIO();
    const wireDeclarations = this.generateWireDeclarations();
    const blockInstantiations = this.generateBlockInstantiations();

    return `module ${this.moduleName} (
${moduleIO.join(",\n")}
);

${wireDeclarations.join("\n")}

${blockInstantiations.join("\n\n")}

endmodule`;
  }

  generateModuleIO() {
    const ports = [];

    // TODO: Add logic to determine which ports are external
    // For now, assuming unconnected input ports are module inputs
    // and unconnected output ports are module outputs

    return ports;
  }

  generateWireDeclarations() {
    const wires = [];
    this.connections.forEach((conn) => {
      const sourceBlock = this.blocks[conn.from.blockId];
      const sourceConfig = getBlockConfig(sourceBlock.type);
      const port = sourceConfig.ports.outputs[conn.from.port];

      wires.push(
        `wire ${port.signed ? "signed " : ""}[${port.width - 1}:0] w_${
          conn.from.blockId
        }_${conn.from.port};`
      );
    });
    return wires;
  }

  generateBlockInstantiations() {
    return Object.entries(this.blocks).map(([id, block]) => {
      const config = getBlockConfig(block.type);
      const paramAssignments = Object.entries(block.params || {})
        .map(([name, value]) => `.${name}(${value})`)
        .join(",\n    ");

      const portAssignments = [];

      // Handle input port connections
      Object.keys(config.ports.inputs).forEach((portName) => {
        const conn = this.connections.find(
          (c) => c.to.blockId === id && c.to.port === portName
        );
        if (conn) {
          portAssignments.push(
            `.${portName}(w_${conn.from.blockId}_${conn.from.port})`
          );
        }
      });

      // Handle output port connections
      Object.keys(config.ports.outputs).forEach((portName) => {
        const conn = this.connections.find(
          (c) => c.from.blockId === id && c.from.port === portName
        );
        if (conn) {
          portAssignments.push(`.${portName}(w_${id}_${portName})`);
        }
      });

      return `${block.type} #(
    ${paramAssignments}
) ${block.type}_${id} (
    ${portAssignments.join(",\n    ")}
);`;
    });
  }
}
