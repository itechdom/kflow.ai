import React from 'react';
import { MindMapContainerProps } from '../types/mindMapTypes';

const MindMapContainer: React.FC<MindMapContainerProps> = ({
  containerRef,
  onWheel,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
  isDragging,
  children
}) => {
  return (
    <div 
      className="flex-1 flex flex-col overflow-hidden bg-gray-50" 
      ref={containerRef}
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {children}
    </div>
  );
};

export default MindMapContainer;
