// src/components/flowgraph/hooks/usePortPositioning.jsx
// This came from NodePorts.jsx
export const usePortPositioning = () => {
  const calculatePortPosition = (index, total) => {
    if (total === 1) return 0.5;
    if (total === 2) return index === 0 ? 0.3 : 0.7;
    const padding = 0.15;
    return padding + index * ((1 - 2 * padding) / (total - 1));
  };

  const getPortDisplayValues = (port) => ({
    width: port.width?.default || port.width || 32,
    signed:
      typeof port.signed === "object" ? port.signed.default : !!port.signed,
  });

  return {
    calculatePortPosition,
    getPortDisplayValues,
  };
};
