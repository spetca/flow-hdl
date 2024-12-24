// lib/parameterUtils.js
export const normalizeConfig = (config) => {
  const normalizedConfig = { ...config };

  // Normalize ports
  ["inputs", "outputs"].forEach((portType) => {
    if (normalizedConfig.ports?.[portType]) {
      Object.keys(normalizedConfig.ports[portType]).forEach((portName) => {
        const port = normalizedConfig.ports[portType][portName];
        port.width = normalizePort(port.width, 32);
        port.signed = normalizePort(port.signed, false);
      });
    }
  });

  // Normalize params
  if (normalizedConfig.params) {
    Object.entries(normalizedConfig.params).forEach(([paramName, param]) => {
      normalizedConfig.params[paramName] = normalizeParameter(param);
    });
  }

  return normalizedConfig;
};

const normalizePort = (value, defaultValue) => {
  if (typeof value === "object" && value.default !== undefined) {
    return value;
  }
  return { default: value === undefined ? defaultValue : value };
};

const normalizeParameter = (param) => {
  if (typeof param !== "object") {
    return { default: param };
  }
  if (param.default === undefined) {
    param.default = param.type === "boolean" ? false : 0;
  }
  return param;
};

export const initializePortConfigs = (config) => {
  const ports = { inputs: {}, outputs: {} };

  ["inputs", "outputs"].forEach((portType) => {
    Object.entries(config.ports[portType] || {}).forEach(
      ([portName, portConfig]) => {
        ports[portType][portName] = {
          width: {
            default:
              typeof portConfig.width === "object"
                ? portConfig.width.default
                : portConfig.width || 32,
          },
          signed: {
            default:
              typeof portConfig.signed === "object"
                ? portConfig.signed.default
                : portConfig.signed || false,
          },
        };
      }
    );
  });

  return ports;
};

export const initializeParams = (config) =>
  Object.fromEntries(
    Object.entries(config.params || {}).map(([name, param]) => [
      name,
      param.default,
    ])
  );
