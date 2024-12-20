import React from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/hljs";

const FileEditor = ({ file }) => {
  if (!file) {
    return <div>No file selected</div>;
  }

  return (
    <div>
      <h3 className="text-lg font-bold mb-2">{file.name}</h3>
      <SyntaxHighlighter language="verilog" style={tomorrow}>
        {file.content}
      </SyntaxHighlighter>
    </div>
  );
};

export default FileEditor;
