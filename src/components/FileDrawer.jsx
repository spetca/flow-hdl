// FileDrawer.jsx
import React from "react";
import FileExplorer from "./FileExplorer";
import FileEditor from "./FileEditor";

const FileDrawer = ({ isOpen, files, selectedFile, onFileSelect, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed top-0 right-0 bottom-0 w-1/2 bg-white shadow-lg flex flex-col h-screen">
      {/* Header - Fixed height */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">Generated Files</h2>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-grow overflow-hidden">
        {/* File Explorer - Fixed height */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-md font-semibold mb-2">Files</h2>
          <FileExplorer files={files} onFileSelect={onFileSelect} />
        </div>

        {/* Editor Section - Takes remaining space */}
        <div className="flex-grow overflow-hidden p-4 flex flex-col">
          <h2 className="text-md font-semibold mb-2 flex-shrink-0">
            File Content
          </h2>
          <div className="flex-grow overflow-hidden">
            <FileEditor file={selectedFile} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileDrawer;
