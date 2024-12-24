import React, { useState, useEffect } from "react";
import { Keyboard } from "lucide-react";

const KEYBOARD_SHORTCUTS = [
  { key: "Shift + drag", description: "select multiple blocks" },
  { key: "Ctrl/⌘ D", description: "generate HDL" },
  { key: "Space", description: "Fit view" },
  { key: "Ctrl/⌘ +", description: "Zoom in" },
  { key: "Ctrl/⌘ -", description: "Zoom out" },
  { key: "Ctrl/⌘ C", description: "Copy selection" },
  { key: "Ctrl/⌘ V", description: "Paste selection" },
  { key: "Delete/Backspace", description: "Delete selection" },
];

const KeyboardShortcuts = ({ isOpen, onToggle }) => {
  const [width, setWidth] = useState(20); // Default to 20% of viewport
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const newWidth = (e.clientX / window.innerWidth) * 100;
      setWidth(Math.min(Math.max(newWidth, 15), 40));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  if (!isOpen) return null;

  return (
    <>
      {isDragging && <div className="fixed inset-0 z-20 cursor-col-resize" />}

      <div
        className="fixed top-12 right-0 bottom-0 bg-white shadow-lg flex flex-col z-20"
        style={{ width: `${width}%` }}
      >
        {/* Drag handle */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-black/20 group"
          onMouseDown={() => setIsDragging(true)}
        >
          <div className="absolute left-0 top-0 bottom-0 w-4 -translate-x-1/2 group-hover:bg-black/10" />
        </div>

        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            <h2 className="font-bold">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onToggle}
            className="px-3 py-1.5 bg-white border border-black/80 rounded text-sm font-medium hover:bg-black hover:text-white transition-colors duration-200"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {KEYBOARD_SHORTCUTS.map(({ key, description }) => (
              <div
                key={key}
                className="px-3 py-2 bg-white border border-black/80 rounded text-sm flex items-center justify-between"
              >
                <span>{description}</span>
                <kbd className="px-2 py-1 bg-gray-100 border border-black/20 rounded font-mono text-xs">
                  {key}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default KeyboardShortcuts;
