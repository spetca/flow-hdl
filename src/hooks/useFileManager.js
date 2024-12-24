import { useState, useCallback } from "react";
import SystemVerilogGenerator from "../lib/SystemVerilogGenerator";

export const useFileManager = (nodes, edges, moduleName) => {
  const [generatedFiles, setGeneratedFiles] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const generateHDL = useCallback(() => {
    // Create a flow graph JSON object
    const flowGraphJson = {
      nodes,
      edges,
      moduleName,
      hierarchicalBlocks: [], // You can populate this if needed
    };

    const generator = new SystemVerilogGenerator(flowGraphJson);
    const files = generator.generate();

    // Include the JSON file in the generated files
    const jsonFileName = `${moduleName}.json`;
    const jsonFileContent = JSON.stringify(flowGraphJson, null, 2);

    // Create a new files object with the JSON file
    const newFiles = {
      ...files,
      [jsonFileName]: jsonFileContent,
    };

    // Update generated files
    setGeneratedFiles(newFiles);

    // Reset selected file to the first generated file
    const firstFileName = Object.keys(newFiles)[0];
    if (firstFileName) {
      setSelectedFile({
        name: firstFileName,
        content: newFiles[firstFileName],
      });
    }

    // Open the drawer
    setIsDrawerOpen(true);
  }, [nodes, edges, moduleName]);

  const toggleFileDrawer = useCallback(() => {
    setIsDrawerOpen((prev) => !prev);
    if (!isDrawerOpen) {
      setSelectedFile(null);
    }
  }, [isDrawerOpen]);

  return {
    generatedFiles,
    selectedFile,
    isDrawerOpen,
    generateHDL,
    toggleFileDrawer,
    setSelectedFile,
  };
};
