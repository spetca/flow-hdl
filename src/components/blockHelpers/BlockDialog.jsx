import React, { useState } from "react";

const BlockDialog = ({ block, config, isOpen, onClose, onUpdate }) => {
  const [params, setParams] = useState(block.params || {});
  const [portConfig, setPortConfig] = useState({
    inputs: { ...config.ports.inputs },
    outputs: { ...config.ports.outputs },
  });

  if (!isOpen) return null;

  const handleParamChange = (name, value) => {
    setParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePortChange = (portType, portName, property, value) => {
    setPortConfig((prev) => ({
      ...prev,
      [portType]: {
        ...prev[portType],
        [portName]: {
          ...prev[portType][portName],
          [property]: value,
        },
      },
    }));
  };

  const handleSave = () => {
    onUpdate({
      params,
      ports: portConfig,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Edit {config.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {/* Block Parameters */}
        <div className="mb-6">
          <h3 className="font-bold mb-2">Block Parameters</h3>
          {Object.entries(config.params).map(([name, param]) => (
            <div key={name} className="mb-4">
              <label className="block mb-1">{name}</label>
              {param.type === "boolean" ? (
                <input
                  type="checkbox"
                  checked={params[name] ?? param.default}
                  onChange={(e) => handleParamChange(name, e.target.checked)}
                />
              ) : (
                <input
                  type={param.type}
                  value={params[name] ?? param.default}
                  min={param.min}
                  max={param.max}
                  onChange={(e) =>
                    handleParamChange(
                      name,
                      param.type === "number"
                        ? Number(e.target.value)
                        : e.target.value
                    )
                  }
                  className="border p-1 rounded"
                />
              )}
            </div>
          ))}
        </div>

        {/* Port Configurations */}
        <div className="mb-6">
          <h3 className="font-bold mb-2">Input Ports</h3>
          {Object.entries(config.ports.inputs).map(([name, port]) => (
            <div key={name} className="mb-4 p-2 border rounded">
              <div className="font-bold mb-2">{name}</div>
              <div className="flex gap-4">
                <div>
                  <label className="block mb-1">Width</label>
                  <input
                    type="number"
                    value={portConfig.inputs[name].width}
                    min={1}
                    onChange={(e) =>
                      handlePortChange(
                        "inputs",
                        name,
                        "width",
                        Number(e.target.value)
                      )
                    }
                    className="border p-1 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Signed</label>
                  <input
                    type="checkbox"
                    checked={portConfig.inputs[name].signed}
                    onChange={(e) =>
                      handlePortChange(
                        "inputs",
                        name,
                        "signed",
                        e.target.checked
                      )
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-6">
          <h3 className="font-bold mb-2">Output Ports</h3>
          {Object.entries(config.ports.outputs).map(([name, port]) => (
            <div key={name} className="mb-4 p-2 border rounded">
              <div className="font-bold mb-2">{name}</div>
              <div className="flex gap-4">
                <div>
                  <label className="block mb-1">Width</label>
                  <input
                    type="number"
                    value={portConfig.outputs[name].width}
                    min={1}
                    onChange={(e) =>
                      handlePortChange(
                        "outputs",
                        name,
                        "width",
                        Number(e.target.value)
                      )
                    }
                    className="border p-1 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Signed</label>
                  <input
                    type="checkbox"
                    checked={portConfig.outputs[name].signed}
                    onChange={(e) =>
                      handlePortChange(
                        "outputs",
                        name,
                        "signed",
                        e.target.checked
                      )
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlockDialog;
