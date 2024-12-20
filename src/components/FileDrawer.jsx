import React from "react";
import FileExplorer from "./FileExplorer";
import FileEditor from "./FileEditor";

const FileDrawer = ({ isOpen, files, selectedFile, onFileSelect, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed top-0 right-0 bottom-0 w-1/2 bg-white shadow-lg p-4 transition-transform duration-300 ease-in-out transform translate-x-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Generated Files</h2>
        <button
          onClick={onClose}
          className="px-2 py-1 bg-gray-200 text-gray-700 rounded"
        >
          Close
        </button>
      </div>
      <FileExplorer files={files} onFileSelect={onFileSelect} />
      <hr className="my-4" />
      <h2 className="text-lg font-bold mb-4">File Editor</h2>
      <FileEditor file={selectedFile} />
    </div>
  );
};

export default FileDrawer;
