import React from "react";
import {
  Plus,
  Minus,
  X,
  Divide,
  PlusSquare,
  MinusSquare,
  XSquare,
  DivideSquare,
  Equal,
  Percent,
  Hash,
} from "lucide-react";

const NodeIcon = ({ config, isSpecialShape }) => {
  // Map of operation names to Lucide icons
  const iconMap = {
    plus: Plus,
    minus: Minus,
    multiply: X,
    divide: Divide,
    plusSquare: PlusSquare,
    minusSquare: MinusSquare,
    multiplySquare: XSquare,
    divideSquare: DivideSquare,
    equal: Equal,
    percent: Percent,
    hash: Hash,
    null: null,
  };

  // If no icon specified in config, return null
  if (!config.icon) {
    return null;
  }

  // Get the icon component if specified
  const IconComponent = iconMap[config.icon];

  // If invalid icon name specified, return null
  if (!IconComponent) {
    return null;
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <IconComponent
        className={`${isSpecialShape ? "text-white" : "text-gray-600"}`}
        size={24}
      />
    </div>
  );
};

export default NodeIcon;
