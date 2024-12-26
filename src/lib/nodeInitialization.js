// Explicitly export all functions
export const initializePortConfigs = (config) => {
  const ports = {
    inputs: {},
    outputs: {},
  };

  // Initialize input ports
  Object.entries(config.ports.inputs || {}).forEach(
    ([portName, portConfig]) => {
      ports.inputs[portName] = {
        width: {
          default:
            typeof portConfig.width === "object"
              ? portConfig.width.default || portConfig.width.value || 32
              : portConfig.width || 32,
        },
        signed: {
          default:
            typeof portConfig.signed === "object"
              ? portConfig.signed.default || portConfig.signed.value || false
              : portConfig.signed || false,
        },
      };
    }
  );

  // Initialize output ports
  Object.entries(config.ports.outputs || {}).forEach(
    ([portName, portConfig]) => {
      ports.outputs[portName] = {
        width: {
          default:
            typeof portConfig.width === "object"
              ? portConfig.width.default || portConfig.width.value || 32
              : portConfig.width || 32,
        },
        signed: {
          default:
            typeof portConfig.signed === "object"
              ? portConfig.signed.default || portConfig.signed.value || false
              : portConfig.signed || false,
        },
      };
    }
  );

  return ports;
};

export const initializeParams = (config) => {
  const params = {};

  if (config.params) {
    Object.entries(config.params).forEach(([paramName, paramConfig]) => {
      params[paramName] =
        paramConfig.default !== undefined
          ? paramConfig.default
          : paramConfig.type === "boolean"
          ? false
          : 0;
    });
  }

  return params;
};

export const createInitializedNode = ({
  id,
  position,
  config,
  name,
  instanceName,
  onParameterChange,
  onNavigateToSubflow,
  isSubflow = false,
}) => {
  const initializedPorts = initializePortConfigs(config);
  const initializedParams = initializeParams(config);

  return {
    id,
    type: "hdlNode",
    position,
    data: {
      config: {
        ...config,
        ports: initializedPorts,
      },
      name,
      instanceName,
      params: initializedParams,
      isSubflow,
      internalNodes: [],
      internalEdges: [],
      onParameterChange,
      onNavigateToSubflow,
    },
  };
};
