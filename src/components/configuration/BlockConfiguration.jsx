import React, { useState, useEffect } from "react";
import { NodeToolbar } from "reactflow";

const BlockConfiguration = ({ data, isOpen, onClose, onUpdate }) => {
  const { config, name: blockName, ...restData } = data;
  const [name, setName] = useState(blockName || "");

  // Deep clone config to avoid direct mutations
  const [portConfig, setPortConfig] = useState(() => ({
    inputs: Object.fromEntries(
      Object.entries(config.ports.inputs || {}).map(([name, port]) => [
        name,
        {
          width: {
            default:
              typeof port.width === "object"
                ? port.width.default || port.width.value || 32
                : port.width || 32,
          },
          signed: {
            default:
              typeof port.signed === "object"
                ? port.signed.default || port.signed.value || false
                : port.signed || false,
          },
        },
      ])
    ),
    outputs: Object.fromEntries(
      Object.entries(config.ports.outputs || {}).map(([name, port]) => [
        name,
        {
          width: {
            default:
              typeof port.width === "object"
                ? port.width.default || port.width.value || 32
                : port.width || 32,
          },
          signed: {
            default:
              typeof port.signed === "object"
                ? port.signed.default || port.signed.value || false
                : port.signed || false,
          },
        },
      ])
    ),
  }));

  // Handle params more robustly
  const [paramConfig, setParamConfig] = useState(() =>
    Object.fromEntries(
      Object.entries(config.params || {}).map(([key, param]) => [
        key,
        {
          ...param,
          default:
            param.default !== undefined
              ? param.default
              : param.type === "boolean"
              ? false
              : 0,
        },
      ])
    )
  );

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setName(blockName || "");

      // Reset port configurations
      setPortConfig({
        inputs: Object.fromEntries(
          Object.entries(config.ports.inputs || {}).map(([name, port]) => [
            name,
            {
              width:
                typeof port.width === "object"
                  ? port.width.default || port.width.value || 32
                  : port.width || 32,
              signed:
                typeof port.signed === "object"
                  ? port.signed.default || port.signed.value || false
                  : port.signed || false,
            },
          ])
        ),
        outputs: Object.fromEntries(
          Object.entries(config.ports.outputs || {}).map(([name, port]) => [
            name,
            {
              width:
                typeof port.width === "object"
                  ? port.width.default || port.width.value || 32
                  : port.width || 32,
              signed:
                typeof port.signed === "object"
                  ? port.signed.default || port.signed.value || false
                  : port.signed || false,
            },
          ])
        ),
      });

      // Reset parameter configurations
      setParamConfig(
        Object.fromEntries(
          Object.entries(config.params || {}).map(([key, param]) => [
            key,
            {
              ...param,
              default:
                param.default !== undefined
                  ? param.default
                  : param.type === "boolean"
                  ? false
                  : 0,
            },
          ])
        )
      );
    }
  }, [isOpen, config, blockName]);

  const handleSave = () => {
    // Construct comprehensive update object
    const updates = {
      name: name || config.name,
      config: {
        ...config,
        name: name || config.name,
        ports: {
          inputs: Object.fromEntries(
            Object.entries(portConfig.inputs).map(([name, port]) => [
              name,
              {
                width: { default: Number(port.width) },
                signed: { default: Boolean(port.signed) },
              },
            ])
          ),
          outputs: Object.fromEntries(
            Object.entries(portConfig.outputs).map(([name, port]) => [
              name,
              {
                width: { default: Number(port.width) },
                signed: { default: Boolean(port.signed) },
              },
            ])
          ),
        },
        params: Object.fromEntries(
          Object.entries(paramConfig).map(([key, value]) => [
            key,
            {
              ...config.params[key],
              default: value.default,
            },
          ])
        ),
      },
      params: Object.fromEntries(
        Object.entries(paramConfig).map(([key, value]) => [key, value.default])
      ),
      ports: {
        inputs: portConfig.inputs,
        outputs: portConfig.outputs,
      },
    };

    console.log("Saving updates:", updates);

    // Call update method
    onUpdate(updates);

    // Close modal
    onClose();
  };

  if (!isOpen) return null;

  return (
    <NodeToolbar
      isVisible={isOpen}
      position="right"
      className="bg-white rounded-lg shadow-xl p-4 min-w-[360px]"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="text-lg font-semibold">Configure {config.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {/* Name Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            placeholder={config.name}
          />
        </div>

        {/* Parameters */}
        {Object.keys(config.params || {}).length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Parameters</h4>
            <div className="space-y-2">
              {Object.entries(config.params).map(([name, param]) => (
                <div key={name} className="flex items-center gap-2">
                  <label className="text-sm text-gray-600 flex-1">{name}</label>
                  {param.type === "boolean" ? (
                    <input
                      type="checkbox"
                      checked={paramConfig[name].default}
                      onChange={(e) =>
                        setParamConfig((prev) => ({
                          ...prev,
                          [name]: {
                            ...prev[name],
                            default: e.target.checked,
                          },
                        }))
                      }
                      className="rounded border-gray-300"
                    />
                  ) : (
                    <input
                      type="number"
                      value={paramConfig[name].default}
                      min={param.min}
                      max={param.max}
                      onChange={(e) =>
                        setParamConfig((prev) => ({
                          ...prev,
                          [name]: {
                            ...prev[name],
                            default: Number(e.target.value),
                          },
                        }))
                      }
                      className="w-20 rounded-md border-gray-300"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Port Configuration */}
        {["inputs", "outputs"].map((portType) => {
          const ports = config.ports[portType];
          if (!Object.keys(ports || {}).length) return null;

          return (
            <div key={portType}>
              <h4 className="font-medium mb-2">
                {portType.charAt(0).toUpperCase() + portType.slice(1)}
              </h4>
              <div className="space-y-2">
                {Object.entries(ports).map(([name, port]) => (
                  <div key={name} className="border rounded-md p-2">
                    <div className="font-medium text-sm mb-1">{name}</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500">
                          Width
                        </label>
                        <input
                          type="number"
                          value={portConfig[portType][name].width}
                          min={1}
                          onChange={(e) =>
                            setPortConfig((prev) => ({
                              ...prev,
                              [portType]: {
                                ...prev[portType],
                                [name]: {
                                  ...prev[portType][name],
                                  width: Number(e.target.value),
                                },
                              },
                            }))
                          }
                          className="w-full rounded-md border-gray-300 text-sm"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="block text-xs text-gray-500">
                          Signed
                        </label>
                        <input
                          type="checkbox"
                          checked={portConfig[portType][name].signed}
                          onChange={(e) =>
                            setPortConfig((prev) => ({
                              ...prev,
                              [portType]: {
                                ...prev[portType],
                                [name]: {
                                  ...prev[portType][name],
                                  signed: e.target.checked,
                                },
                              },
                            }))
                          }
                          className="rounded border-gray-300"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-2 border-t">
          <button
            onClick={onClose}
            className="px-3 py-1 border rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    </NodeToolbar>
  );
};

export default BlockConfiguration;
