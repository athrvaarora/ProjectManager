import React from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';

interface HierarchyEdgeData {
  type: 'hierarchy';
  notes?: string;
}

export const HierarchyEdge: React.FC<EdgeProps<HierarchyEdgeData>> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <path
      id={id}
      style={{
        ...style,
        strokeWidth: 2,
        stroke: '#4caf50',
        strokeDasharray: '5 5',
      }}
      className="react-flow__edge-path"
      d={edgePath}
      markerEnd={markerEnd}
    />
  );
}; 