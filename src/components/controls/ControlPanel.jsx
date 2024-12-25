import React from "react";
import { Panel } from "reactflow";
import ModuleNameInput from "./ModuleNameInput";

const ControlPanel = ({
  moduleName,
  setModuleName,
  generateHDL,
  exportFlow,
  clearGraph,
  importFlow,
}) => {
  const buttonStyles =
    "px-3 py-1.5 bg-white border border-black/80 rounded text-sm font-medium hover:bg-black hover:text-white transition-colors duration-200";

  const handleClearGraph = () => {
    if (
      window.confirm(
        "Are you sure you want to clear the graph? This cannot be undone."
      )
    ) {
      clearGraph();
    }
  };
  return (
    <Panel
      position="top-left"
      className="bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-sm mt-12" // Added mt-12 for margin-top
    >
      <div className="flex flex-wrap gap-2 items-center">
        <ModuleNameInput value={moduleName} onChange={setModuleName} />
        <button onClick={generateHDL} className={buttonStyles} title="Ctrl+D">
          Generate HDL
        </button>
        <button onClick={exportFlow} className={buttonStyles}>
          Export Flow
        </button>
        <button
          onClick={() => handleClearGraph(true)}
          className={buttonStyles}
        >
          Clear Graph
        </button>
        <label className={`${buttonStyles} inline-flex cursor-pointer`}>
          Import Flow
          <input
            type="file"
            accept=".json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files[0];
              if (!file) return;

              const reader = new FileReader();
              reader.onload = (e) => {
                try {
                  const flowData = JSON.parse(e.target.result);
                  importFlow(flowData);
                } catch (error) {
                  console.error("Error importing flow graph:", error);
                  alert(
                    "Error importing flow graph. Please check the file format."
                  );
                }
              };
              reader.readAsText(file);
            }}
          />
        </label>
      </div>
    </Panel>
  );
};

export default ControlPanel;
