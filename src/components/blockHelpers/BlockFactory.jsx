// blockFactory.js
import React from "react";
import HDLNode from "../flowgraph/hdlnode/HDLNode";

// Helper to generate dynamic config based on port parameters
const createDynamicConfig = (baseConfig, props) => {
  const config = { ...baseConfig };
  const { portParams = {}, blockParams = {} } = props.params || {};

  // Update ports based on parameters
  Object.entries(portParams || {}).forEach(([portName, settings]) => {
    const [portType, portId] = portName.split(".");
    if (config.ports[portType]?.[portId]) {
      config.ports[portType][portId] = {
        ...config.ports[portType][portId],
        ...settings,
      };
    }
  });

  return config;
};

// Factory function to create a new block type
export const createBlock = ({ config, generateVerilog }) => {
  const BlockComponent = (props) => {
    const dynamicConfig = createDynamicConfig(config, props);

    return (
      <HDLNode
        {...props}
        data={{
          config: dynamicConfig,
          name: props.name,
          params: props.params,
          onParameterChange: props.onParameterChange,
        }}
      />
    );
  };

  // Attach the static properties BEFORE returning
  BlockComponent.displayName = `${config.name}Block`;
  BlockComponent.blockConfig = config;
  BlockComponent.generateVerilog = generateVerilog;

  // For debugging
  console.log(`Creating ${config.name} block:`, {
    config: BlockComponent.blockConfig,
    verilog: BlockComponent.generateVerilog,
  });

  return BlockComponent;
};

// Type definitions for documentation
/**
 * @typedef {Object} PortDefinition
 * @property {Object} width - Width configuration
 * @property {number} width.default - Default width value
 * @property {number} width.min - Minimum allowed width
 * @property {number} width.max - Maximum allowed width
 * @property {boolean} signed - Whether the port is signed
 * @property {string} description - Port description
 */

/**
 * @typedef {Object} BlockConfig
 * @property {string} type - Block type identifier
 * @property {string} name - Display name of the block
 * @property {boolean} synchronous - Whether the block is synchronous
 * @property {string} description - Block description
 * @property {Object} params - Block parameters
 * @property {Object} ports - Port definitions
 * @property {Object.<string, PortDefinition>} ports.inputs - Input port definitions
 * @property {Object.<string, PortDefinition>} ports.outputs - Output port definitions
 * @property {Object} [shape] - Optional shape configuration for special blocks
 */
