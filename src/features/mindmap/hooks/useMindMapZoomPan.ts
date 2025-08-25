import { useCallback, useEffect, useState } from 'react';
import { EditingState } from '../types/mindMapTypes';
import { MINDMAP_CONSTANTS } from '../utils/mindMapConstants';

interface UseMindMapZoomPanProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  editingState: EditingState | null;
  showContentModal: boolean;
}

interface UseMindMapZoomPanReturn {
  zoom: number;
  pan: { x: number; y: number };
  isDragging: boolean;
  containerWidth: number;
  containerHeight: number;
  handleWheel: (e: React.WheelEvent) => void;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
  handleMouseLeave: () => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
  resetView: () => void;
}

export const useMindMapZoomPan = ({ 
  containerRef, 
  editingState, 
  showContentModal 
}: UseMindMapZoomPanProps): UseMindMapZoomPanReturn => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [containerWidth, setContainerWidth] = useState(800);
  const [containerHeight, setContainerHeight] = useState(600);

  // Update container dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
        setContainerHeight(containerRef.current.offsetHeight);
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [containerRef]);

  // Handle mouse wheel for zooming and scrolling
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (editingState || showContentModal) return;
    
    const deltaX = e.deltaX;
    const deltaY = e.deltaY;
    const deltaZ = e.deltaZ;
    
    // Handle horizontal scrolling (left/right mouse wheel movement)
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal scroll - move view left/right
      const scrollSpeed = MINDMAP_CONSTANTS.SCROLL_SPEED;
      setPan(prevPan => ({
        x: prevPan.x - deltaX * scrollSpeed,
        y: prevPan.y
      }));
      return;
    }
    
    // Handle vertical scrolling (up/down mouse wheel movement)
    if (Math.abs(deltaY) > 0) {
      // Vertical scroll - move view up/down
      const scrollSpeed = MINDMAP_CONSTANTS.SCROLL_SPEED;
      setPan(prevPan => ({
        x: prevPan.x,
        y: prevPan.y - deltaY * scrollSpeed
      }));
      return;
    }
    
    // Handle zooming (if no significant horizontal/vertical movement)
    if (Math.abs(deltaZ) > 0 || (Math.abs(deltaX) < 5 && Math.abs(deltaY) < 5)) {
      const zoomSpeed = MINDMAP_CONSTANTS.ZOOM_SPEED;
      const newZoom = Math.max(
        MINDMAP_CONSTANTS.MIN_ZOOM, 
        Math.min(MINDMAP_CONSTANTS.MAX_ZOOM, zoom - deltaY * zoomSpeed)
      );
      setZoom(newZoom);
    }
  }, [editingState, zoom, showContentModal]);

  // Handle mouse down for panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (editingState || showContentModal) return;
    
    if (e.button === 0) { // Left mouse button
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan, editingState, showContentModal]);

  // Handle mouse move for panning
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart]);

  // Handle mouse up for panning
  const handleMouseUp = useCallback(() => {
    if (editingState || showContentModal) return;
    setIsDragging(false);
  }, [editingState, showContentModal]);

  // Handle mouse leave for panning
  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Reset view to center
  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  return {
    zoom,
    pan,
    isDragging,
    containerWidth,
    containerHeight,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    setZoom,
    setPan,
    resetView
  };
};
