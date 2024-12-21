import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const BlockDialog = ({ block, config, isOpen, onClose, onUpdate }) => {
  const [portConfig, setPortConfig] = useState({
    inputs: { ...config.ports.inputs },
    outputs: { ...config.ports.outputs },
  });
  const dialogRef = useRef(null);

  // Handle click outside
  const handleClickOutside = (e) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target)) {
      onClose();
    }
  };

  // Update local state when props change
  useEffect(() => {
    setPortConfig({
      inputs: { ...config.ports.inputs },
      outputs: { ...config.ports.outputs },
    });
  }, [config]);

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
      ports: portConfig,
    });
    onClose();
  };

  if (!isOpen) return null;

  const dialog = (
    <div
      className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
      onClick={handleClickOutside}
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-lg shadow-2xl w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            Configure Ports: {config.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-semibold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Input Ports */}
          {Object.keys(config.ports.inputs || {}).length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Input Ports</h3>
              <div className="space-y-3">
                {Object.entries(config.ports.inputs).map(([name, port]) => (
                  <div key={name} className="p-3 border rounded-md">
                    <div className="font-medium mb-2">{name}</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Width
                        </label>
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
                          className="block w-full rounded-md border-gray-300 shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Signed
                        </label>
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
                          className="rounded border-gray-300"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Output Ports */}
          {Object.keys(config.ports.outputs || {}).length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Output Ports</h3>
              <div className="space-y-3">
                {Object.entries(config.ports.outputs).map(([name, port]) => (
                  <div key={name} className="p-3 border rounded-md">
                    <div className="font-medium mb-2">{name}</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Width
                        </label>
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
                          className="block w-full rounded-md border-gray-300 shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Signed
                        </label>
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
                          className="rounded border-gray-300"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
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
    </div>
  );

  return createPortal(dialog, document.body);
};

export default BlockDialog;
