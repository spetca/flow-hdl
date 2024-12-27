import React, { useEffect, useRef } from "react";
import katex from "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.mjs";

const NodeLatex = ({ config, isSpecialShape }) => {
  const latexRef = useRef(null);
  const latex = config.icon || "";

  useEffect(() => {
    if (latexRef.current && latex) {
      try {
        katex.render(latex, latexRef.current, {
          throwOnError: false,
          displayMode: true,
          errorColor: "#FF0000",
        });
      } catch (error) {
        console.error("LaTeX rendering error:", error);
      }
    }
  }, [latex]);

  // If no latex specified in config, return null
  if (!latex) {
    return null;
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div
        ref={latexRef}
        className={`${isSpecialShape ? "text-white" : "text-gray-600"} text-lg`}
      />
    </div>
  );
};

export default NodeLatex;
