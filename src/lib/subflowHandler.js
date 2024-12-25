// utils/subflowHandler.js
import { v4 as uuidv4 } from "uuid";

export class SubflowHandler {
  static createSubflow(parentId, position, inPorts = [], outPorts = []) {
    const subflowId = `subflow_${uuidv4()}`;

    // Create inport/outport nodes for the subflow
    const inportNodes = inPorts.map((port, index) => ({
      id: `${subflowId}_in_${index}`,
      type: "hdlNode",
      position: { x: 100, y: 100 + index * 100 },
      data: {
        config: {
          type: "inport",
          name: port.name,
          ports: {
            outputs: {
              out: {
                width: port.width || 32,
                signed: port.signed || false,
              },
            },
          },
        },
      },
    }));

    const outportNodes = outPorts.map((port, index) => ({
      id: `${subflowId}_out_${index}`,
      type: "hdlNode",
      position: { x: 500, y: 100 + index * 100 },
      data: {
        config: {
          type: "outport",
          name: port.name,
          ports: {
            inputs: {
              in: {
                width: port.width || 32,
                signed: port.signed || false,
              },
            },
          },
        },
      },
    }));

    return {
      id: subflowId,
      type: "hdlNode",
      position,
      data: {
        config: {
          type: "subflow",
          name: "Subflow",
          description: "Nested flowgraph container",
          ports: {
            inputs: Object.fromEntries(
              inPorts.map((p) => [
                p.name,
                { width: p.width || 32, signed: p.signed || false },
              ])
            ),
            outputs: Object.fromEntries(
              outPorts.map((p) => [
                p.name,
                { width: p.width || 32, signed: p.signed || false },
              ])
            ),
          },
        },
        internalNodes: [...inportNodes, ...outportNodes],
        internalEdges: [],
        isSubflow: true,
      },
    };
  }

  static generateSubflowVerilog(subflow, parentModuleName) {
    const moduleName = `${parentModuleName}_${subflow.data.name.toLowerCase()}`;
    const internalNodes = subflow.data.internalNodes;
    const internalEdges = subflow.data.internalEdges;

    // Generate port declarations
    const inputs = Object.entries(subflow.data.config.ports.inputs).map(
      ([name, port]) => {
        const width = port.width || 32;
        const signed = port.signed ? "signed" : "logic";
        return `input ${signed} [${width - 1}:0] ${name}`;
      }
    );

    const outputs = Object.entries(subflow.data.config.ports.outputs).map(
      ([name, port]) => {
        const width = port.width || 32;
        const signed = port.signed ? "signed" : "logic";
        return `output ${signed} [${width - 1}:0] ${name}`;
      }
    );

    // Generate internal logic
    const internalLogic = generateInternalLogic(internalNodes, internalEdges);

    return `module ${moduleName} (
      input logic clk,
      ${inputs.join(",\n      ")},
      ${outputs.join(",\n      ")}
    );

    ${internalLogic}

    endmodule`;
  }

  static validateConnection(sourcePort, targetPort) {
    // Check bitwidth compatibility
    if (sourcePort.width !== targetPort.width) {
      return {
        valid: false,
        error: `Bitwidth mismatch: ${sourcePort.width} != ${targetPort.width}`,
      };
    }

    // Check sign compatibility
    if (sourcePort.signed !== targetPort.signed) {
      return {
        valid: false,
        error: `Sign mismatch: ${
          sourcePort.signed ? "signed" : "unsigned"
        } != ${targetPort.signed ? "signed" : "unsigned"}`,
      };
    }

    return { valid: true };
  }
}
