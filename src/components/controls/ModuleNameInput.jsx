import React from "react";

const ModuleNameInput = ({ value, onChange }) => {
  const handleChange = (e) => {
    const sanitizedValue = e.target.value.replace(/[^a-zA-Z0-9_]/g, "");
    onChange(sanitizedValue);
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="moduleName" className="text-sm font-medium">
        Module Name:
      </label>
      <input
        id="moduleName"
        value={value}
        onChange={handleChange}
        className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
        placeholder="top_module"
        pattern="[a-zA-Z][a-zA-Z0-9_]*"
        title="Must start with a letter and contain only letters, numbers, and underscores"
      />
    </div>
  );
};

export default ModuleNameInput;
