import React from "react";
import FlowNode from "../flowgraph/node/FlowNode";

const createDynamicConfig = (baseConfig, props, uiConfig) => {
  const config = { ...baseConfig, ...uiConfig };
  const { portParams = {}, blockParams = {} } = props.params || {};

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

export const createBlock = ({ config, generateVerilog, uiConfig }) => {
  if (!config.name) {
    throw new Error('Block config must include a "name" property');
  }

  const defaultInstanceName = config.name.toLowerCase();

  const BlockComponent = (props) => {
    const dynamicConfig = createDynamicConfig(config, props, uiConfig);

    return (
      <FlowNode
        {...props}
        data={{
          config: dynamicConfig,
          name: config.name.toLowerCase(),
          instanceName: props.instanceName || defaultInstanceName,
          params: props.params,
          onParameterChange: props.onParameterChange,
        }}
      />
    );
  };

  BlockComponent.blockConfig = {
    ...config,
    defaultInstanceName,
  };
  BlockComponent.generateVerilog = generateVerilog;

  return BlockComponent;
};
