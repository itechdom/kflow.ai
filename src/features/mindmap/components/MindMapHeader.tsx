import React from 'react';
import { MindMapHeaderProps } from '../types/mindMapTypes';

const MindMapHeader: React.FC<MindMapHeaderProps> = ({
  zoom,
  onZoomIn,
  onZoomOut
}) => {
  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-xs text-blue-700 font-medium">
              💡 Click on the tree area to enable keyboard shortcuts • Use ↑↓←→ arrow keys to navigate • Press F to expand/collapse notes • Double-click nodes to edit titles • Click blue edit button inside nodes for content • Orange +/- icon = expandable • Green clip icon = has content • Right-click for menu • Ctrl+E to edit content
            </span>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button 
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-white rounded transition-all duration-200 font-medium" 
              onClick={onZoomOut}
              title="Zoom Out"
            >
              -
            </button>
            <span className="px-2 text-sm font-medium text-gray-700 min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button 
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-white rounded transition-all duration-200 font-medium" 
              onClick={onZoomIn}
              title="Zoom In"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MindMapHeader;
