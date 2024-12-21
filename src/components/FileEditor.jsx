// FileEditor.jsx
import React from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/hljs";

const FileEditor = ({ file }) => {
  if (!file) {
    return <div>No file selected</div>;
  }

  const handleCopy = () => {
    navigator.clipboard
      .writeText(file.content)
      .then(() => {
        alert("Content copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
        const textArea = document.createElement("textarea");
        textArea.value = file.content;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand("copy");
          alert("Content copied to clipboard!");
        } catch (e) {
          console.error("Fallback copy failed:", e);
        }
        document.body.removeChild(textArea);
      });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-2 flex-shrink-0">
        <h3 className="text-lg font-bold">{file.name}</h3>
        <button
          onClick={handleCopy}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Copy Content
        </button>
      </div>
      <div className="flex-grow overflow-auto">
        <SyntaxHighlighter
          language="verilog"
          style={tomorrow}
          customStyle={{
            margin: 0,
            padding: "1rem",
            borderRadius: "4px",
            height: "100%",
            minHeight: "100%",
          }}
          className="h-full"
          wrapLines={true}
          showLineNumbers={true}
        >
          {file.content}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default FileEditor;
