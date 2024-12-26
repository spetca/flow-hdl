/ src/components/flowgraph/ports/FlowHandle.jsx
import { Handle, Position } from 'reactflow';

export const FlowHandle = ({ type, position, id, isSpecialShape, side }) => (
  <Handle
    type={type}
    position={position}
    id={id}
    className="w-3 h-3 rounded-full bg-gray-400 border-2 border-white transition-colors hover:bg-blue-400"
    style={{ [side]: isSpecialShape ? -6 : -8 }}
  />
);