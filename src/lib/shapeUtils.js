// lib/shapeUtils.js
export const getShapeStyles = (nodeSize, config) => {
  const baseStyles = {
    width: nodeSize?.width || config.shape?.width || 200,
    height: nodeSize?.height || config.shape?.height || 150,
  };

  if (!config.shape) return { ...baseStyles, borderRadius: "0.5rem" };

  switch (config.shape.type) {
    case "oval":
      return { ...baseStyles, width: 75, height: 65, borderRadius: "25%" };
    case "rounded":
      return { ...baseStyles, borderRadius: "1rem" };
    case "diamond":
      return {
        ...baseStyles,
        transform: "rotate(45deg)",
        margin: `${baseStyles.height / 4}px`,
      };
    default:
      return { ...baseStyles, borderRadius: "0.5rem" };
  }
};
