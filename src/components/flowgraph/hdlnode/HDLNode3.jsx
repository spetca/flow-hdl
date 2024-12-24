const HDLNode = ({ data, id, selected }) => {
  const { config: initialConfig, onParameterChange } = data;
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [currentConfig, setCurrentConfig] = useState(
    normalizeConfig(initialConfig)
  );
  const [nodeSize, setNodeSize] = useState({
    width: initialConfig.shape?.width || 200,
    height: initialConfig.shape?.height || 150,
  });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!currentConfig.shape?.lockAspectRatio) {
        e.preventDefault();
        setNodeSize((prev) => ({
          width: Math.max(200, prev.width + e.movementX),
          height: Math.max(150, prev.height + e.movementY),
        }));
      }
    };

    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [currentConfig.shape]);

  const handleUpdate = (updates) => {
    const normalizedUpdates = {
      name: updates.name || currentConfig.name,
      config: normalizeConfig({
        ...currentConfig,
        name: updates.name || currentConfig.name,
        ports: updates.ports || currentConfig.ports,
        params: updates.config?.params || currentConfig.params,
      }),
      params: updates.params || {},
    };

    setCurrentConfig(normalizedUpdates.config);
    onParameterChange(id, normalizedUpdates);
  };

  useEffect(() => {
    setCurrentConfig(normalizeConfig(initialConfig));
  }, [initialConfig]);

  const isSpecialShape = currentConfig.shape?.type !== undefined;

  return (
    <>
      <NodeShape config={currentConfig} selected={selected} nodeSize={nodeSize}>
        <NodeTitle
          config={currentConfig}
          name={data.name}
          isSpecialShape={isSpecialShape}
          shapeStyles={getShapeStyles(nodeSize, currentConfig)}
        />
        {!isSpecialShape && <NodeParameters config={currentConfig} />}
        <NodePorts config={currentConfig} isSpecialShape={isSpecialShape} />
      </NodeShape>

      {isConfigOpen && (
        <BlockConfiguration
          data={{ config: currentConfig, name: data.name }}
          isOpen={isConfigOpen}
          onClose={() => setIsConfigOpen(false)}
          onUpdate={handleUpdate}
        />
      )}
    </>
  );
};

export default memo(HDLNode);
