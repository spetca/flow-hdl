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

    setGeneratedFiles({
      ...files,
      [jsonFileName]: jsonFileContent,
    });

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
