import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";

const FileDrawer = ({ isOpen, files, selectedFile, onFileSelect, onClose }) => {
  const [width, setWidth] = useState(50); // width in percentage
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;

      // Calculate width as percentage of viewport width
      const newWidth =
        ((window.innerWidth - e.clientX) / window.innerWidth) * 100;
      // Clamp between 30% and 70%
      setWidth(Math.min(Math.max(newWidth, 30), 70));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay to prevent ReactFlow interactions while dragging */}
      {isDragging && <div className="fixed inset-0 z-20 cursor-col-resize" />}

      <div
        className="fixed top-0 right-0 bottom-0 bg-white shadow-lg flex flex-col z-20"
        style={{ width: `${width}%` }}
      >
        {/* Drag handle */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500/50 group"
          onMouseDown={() => setIsDragging(true)}
        >
          <div className="absolute left-0 top-0 bottom-0 w-4 -translate-x-1/2 group-hover:bg-blue-500/20" />
        </div>

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
            className="px-3 py-1.5 bg-white border border-black/80 rounded text-sm font-medium hover:bg-black hover:text-white transition-colors duration-200"
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
    </>
  );
};

export default FileDrawer;
