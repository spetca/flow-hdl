// FileExplorer.jsx
import React from "react";

const FileExplorer = ({ files, onFileSelect }) => {
  return (
    <div className="overflow-y-auto max-h-32">
      {Object.entries(files).map(([fileName, content]) => (
        <div
          key={fileName}
          className="py-2 px-3 cursor-pointer hover:bg-gray-100 rounded transition-colors"
          onClick={() => onFileSelect({ name: fileName, content })}
        >
          {fileName}
        </div>
      ))}
    </div>
  );
};

export default FileExplorer;
