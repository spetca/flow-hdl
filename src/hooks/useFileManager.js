import { useState, useCallback } from "react";
import SystemVerilogGenerator from "../lib/SystemVerilogGenerator";

export const useFileManager = (nodes, edges, moduleName) => {
  const [generatedFiles, setGeneratedFiles] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const generateHDL = useCallback(() => {
    const generator = new SystemVerilogGenerator(nodes, edges, moduleName);
    const files = generator.generate();

    setGeneratedFiles(files);
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
