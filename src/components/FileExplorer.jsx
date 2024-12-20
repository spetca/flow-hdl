import React from "react";

const FileExplorer = ({ files, onFileSelect }) => {
  return (
    <div>
      {Object.entries(files).map(([fileName, content]) => (
        <div
          key={fileName}
          className="mb-2 cursor-pointer"
          onClick={() => onFileSelect({ name: fileName, content })}
        >
          {fileName}
        </div>
      ))}
    </div>
  );
};

export default FileExplorer;
