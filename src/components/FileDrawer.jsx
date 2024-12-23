import React from "react";
import Editor from "@monaco-editor/react";

const FileDrawer = ({ isOpen, files, selectedFile, onFileSelect, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed top-0 right-0 bottom-0 w-1/2 bg-white shadow-lg flex flex-col">
      <div className="p-4 border-b flex items-center justify-between gap-4">
        <h2 className="font-bold">Generated Files</h2>
        <select
          className="flex-1 p-2 border rounded"
          value={selectedFile?.name || ""}
          onChange={(e) => {
            const name = e.target.value;
            if (name) onFileSelect({ name, content: files[name] });
          }}
        >
          <option value="">Select a file...</option>
          {Object.entries(files).map(([name]) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <button
          onClick={onClose}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          Close
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        {selectedFile ? (
          <Editor
            height="100%"
            language="verilog"
            theme="vs-dark"
            value={selectedFile.content}
            options={{
              readOnly: true,
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
            }}
          />
        ) : (
          <div className="p-4">Select a file to view</div>
        )}
      </div>
    </div>
  );
};

export default FileDrawer;
