import { useState, useEffect, useCallback } from "react";
import { normalizeConfig } from "../../../lib/parameterUtils";

export const useNodeConfig = ({
  config: initialConfig,
  onParameterChange,
  id,
}) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [config, setConfig] = useState(normalizeConfig(initialConfig));

  useEffect(() => {
    setConfig(normalizeConfig(initialConfig));
  }, [initialConfig]);

  const handleUpdate = useCallback(
    (updates) => {
      if (!onParameterChange) {
        console.error("onParameterChange is not defined");
        return;
      }

      onParameterChange(id, {
        name: updates.name,
        config: updates.config,
        params: updates.params,
      });
    },
    [id, onParameterChange]
  );

  return {
    config,
    isConfigOpen,
    setIsConfigOpen,
    handleUpdate,
  };
};
