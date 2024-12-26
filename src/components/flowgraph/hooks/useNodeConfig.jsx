// src/components/flowgraph/hooks/useNodeConfig.jsx
import { useState, useEffect, useCallback } from "react";
import { normalizeConfig } from "../../../lib/parameterUtils";

export const useNodeConfig = (data, id) => {
  // This came directly from HDLNode
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [config, setConfig] = useState(normalizeConfig(data.config));

  useEffect(() => {
    setConfig(normalizeConfig(data.config));
  }, [data.config]);

  const handleUpdate = useCallback(
    (updates) => {
      const normalizedConfig = normalizeConfig({
        ...config,
        name: updates.name,
        ports: updates.config.ports,
        params: updates.config.params,
      });

      setConfig(normalizedConfig);
      data.onParameterChange(id, {
        name: updates.name,
        config: normalizedConfig,
        params: updates.params,
      });
    },
    [config, id, data.onParameterChange]
  );

  return {
    config,
    isConfigOpen,
    setIsConfigOpen,
    handleUpdate,
  };
};
