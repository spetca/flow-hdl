// components/configuration/BlockConfiguration.jsx
import React, { useState, useEffect } from "react";
import { NodeToolbar } from "reactflow";

const BlockConfiguration = ({ data, isOpen, onClose, onUpdate }) => {
  const [config, setConfig] = useState(data.config);
  const [name, setName] = useState(data.name || "");
  const [portConfigs, setPortConfigs] = useState({
    inputs: {},
    outputs: {},
  });
  const [paramConfigs, setParamConfigs] = useState({});

  // Initialize state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setConfig(data.config);
      setName(data.name || "");

      // Initialize port configurations
      const initialPorts = {
        inputs: {},
        outputs: {},
      };

      ["inputs", "outputs"].forEach((portType) => {
        Object.entries(data.config.ports[portType] || {}).forEach(
          ([portName, port]) => {
            initialPorts[portType][portName] = {
              width:
                typeof port.width === "object"
                  ? port.width.default
                  : port.width,
              signed:
                typeof port.signed === "object"
                  ? port.signed.default
                  : port.signed,
            };
          }
        );
      });
      setPortConfigs(initialPorts);

      // Initialize parameter configurations
      const initialParams = {};
      Object.entries(data.config.params || {}).forEach(([paramName, param]) => {
        initialParams[paramName] = param.default;
      });
      setParamConfigs(initialParams);
    }
  }, [isOpen, data]);

  const handlePortConfigChange = (portType, portName, field, value) => {
    setPortConfigs((prev) => ({
      ...prev,
      [portType]: {
        ...prev[portType],
        [portName]: {
          ...prev[portType][portName],
          [field]: value,
        },
      },
    }));
  };

  const handleParamChange = (paramName, value) => {
    setParamConfigs((prev) => ({
      ...prev,
      [paramName]: value,
    }));
  };

  const handleSave = () => {
    // Construct the update object with all changes
    const updates = {
      name,
      config: {
        ...config,
        name,
        ports: {
          inputs: Object.fromEntries(
            Object.entries(config.ports.inputs || {}).map(([portName]) => [
              portName,
              {
                width: { default: portConfigs.inputs[portName].width },
                signed: { default: portConfigs.inputs[portName].signed },
              },
            ])
          ),
          outputs: Object.fromEntries(
            Object.entries(config.ports.outputs || {}).map(([portName]) => [
              portName,
              {
                width: { default: portConfigs.outputs[portName].width },
                signed: { default: portConfigs.outputs[portName].signed },
              },
            ])
          ),
        },
        params: Object.fromEntries(
          Object.entries(config.params || {}).map(([paramName]) => [
            paramName,
            {
              ...config.params[paramName],
              default: paramConfigs[paramName],
            },
          ])
        ),
      },
      params: paramConfigs,
    };

    onUpdate(updates);
    onClose();
  };

  return (
    <NodeToolbar
      isVisible={isOpen}
      position="right"
      className="bg-white rounded-lg shadow-xl p-4 min-w-[400px]"
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="text-lg font-semibold">Configure {config.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {/* Node Name */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Node Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-md p-2"
          />
        </div>

        {/* Port Configurations */}
        {["inputs", "outputs"].map((portType) => (
          <div key={portType} className="space-y-2">
            <h4 className="font-medium capitalize">{portType}</h4>
            {Object.entries(config.ports[portType] || {}).map(([portName]) => (
              <div key={portName} className="border rounded-md p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{portName}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600">
                      Bitwidth
                    </label>
                    <input
                      type="number"
                      value={portConfigs[portType][portName]?.width || 32}
                      onChange={(e) =>
                        handlePortConfigChange(
                          portType,
                          portName,
                          "width",
                          parseInt(e.target.value, 10)
                        )
                      }
                      className="w-full border rounded-md p-1"
                      min="1"
                      max="512"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">
                      Signed
                    </label>
                    <input
                      type="checkbox"
                      checked={portConfigs[portType][portName]?.signed || false}
                      onChange={(e) =>
                        handlePortConfigChange(
                          portType,
                          portName,
                          "signed",
                          e.target.checked
                        )
                      }
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* Parameters */}
        {Object.keys(config.params || {}).length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Parameters</h4>
            {Object.entries(config.params).map(([paramName, param]) => (
              <div key={paramName} className="border rounded-md p-3">
                <label className="block text-sm text-gray-600">
                  {paramName}
                </label>
                {param.type === "boolean" ? (
                  <input
                    type="checkbox"
                    checked={paramConfigs[paramName] || false}
                    onChange={(e) =>
                      handleParamChange(paramName, e.target.checked)
                    }
                    className="mt-1"
                  />
                ) : (
                  <input
                    type="number"
                    value={paramConfigs[paramName] || 0}
                    onChange={(e) =>
                      handleParamChange(paramName, parseInt(e.target.value, 10))
                    }
                    className="w-full border rounded-md p-1"
                    min={param.min}
                    max={param.max}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    </NodeToolbar>
  );
};

export default BlockConfiguration;
