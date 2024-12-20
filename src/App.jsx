import React, { useState } from "react";
import { Maximize2 } from "lucide-react";
import FlowGraph from "./components/FlowGraph";
import BlockLibrary from "./components/BlockLibrary";

const App = () => {
  const [blocks, setBlocks] = useState({});

  const handleAddBlock = (type, config) => {
    const id = `block_${Date.now()}`;
    console.log("Adding block:", type, config); // Debug
    setBlocks((prev) => ({
      ...prev,
      [id]: {
        id,
        type,
        ...config,
      },
    }));
  };

  return (
    <div className="w-screen h-screen flex flex-col">
      {/* Top Bar */}
      <div className="h-12 border-b flex items-center px-4 bg-white">
        <h1 className="text-xl font-semibold">~flow hdl~</h1>
        <button
          className="ml-auto p-2 hover:bg-gray-100 rounded-md"
          onClick={() => document.documentElement.requestFullscreen()}
        >
          <Maximize2 className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* FlowGraph takes up 85% of the width */}
        <div className="flex-1">
          <FlowGraph blocks={blocks} setBlocks={setBlocks} />
        </div>

        {/* Block Library takes up 15% of the width */}
        <div className="w-[15%] min-w-[200px]">
          <BlockLibrary onAddBlock={handleAddBlock} />
        </div>
      </div>
    </div>
  );
};

export default App;
