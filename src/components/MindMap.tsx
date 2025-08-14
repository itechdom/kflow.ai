import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { Note } from '../types/Note';
import { Plus, Eye } from 'lucide-react';

interface MindMapProps {
  notes: Note[];
  selectedNote: Note | null;
  onSelectNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
  onEditNote: (note: Note) => void;
  onCreateNote: () => void;
  onAddChildNote: (parentNote: Note) => void;
  onNavigateToNote: (note: Note) => void;
}

interface TreeNode {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  level: number;
  children: TreeNode[];
  parentId?: string;
}

const MindMap: React.FC<MindMapProps> = ({
  notes,
  selectedNote,
  onSelectNote,
  onDeleteNote,
  onEditNote,
  onCreateNote,
  onAddChildNote,
  onNavigateToNote
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<TreeNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [containerWidth, setContainerWidth] = useState(800);
  const [containerHeight, setContainerHeight] = useState(600);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

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
  }, []);

  // Handle mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.3, Math.min(3, zoom * delta));
    setZoom(newZoom);
  }, [zoom]);

  // Handle mouse down for panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

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
    setIsDragging(false);
  }, []);

  // Handle mouse leave for panning
  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Prepare tree data from notes
  const treeData = useMemo(() => {
    const nodesMap = new Map<string, TreeNode>();
    const rootNodes: TreeNode[] = [];

    // Create all nodes
    notes.forEach(note => {
      nodesMap.set(note.id, {
        id: note.id,
        title: note.title,
        x: 0, y: 0, width: 0, height: 0, // Will be calculated by layout
        level: note.level,
        children: [],
        parentId: note.parentId
      });
    });

    // Build hierarchy
    nodesMap.forEach(node => {
      if (node.parentId) {
        const parent = nodesMap.get(node.parentId);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        rootNodes.push(node);
      }
    });

    // Sort children for consistent layout
    nodesMap.forEach(node => {
      node.children.sort((a, b) => a.title.localeCompare(b.title));
    });

    // Create a virtual root if there are multiple actual root nodes
    if (rootNodes.length > 1) {
      return {
        id: 'virtual-root',
        title: 'All Notes',
        x: 0, y: 0, width: 0, height: 0,
        level: -1, // Virtual root has no level
        children: rootNodes,
        parentId: undefined
      };
    } else if (rootNodes.length === 1) {
      return rootNodes[0];
    }
    return null;
  }, [notes]);

  // Layout the tree
  const layoutTree = useCallback((node: TreeNode, x: number, y: number, level: number, siblingIndex: number, totalSiblings: number): { nodes: TreeNode[], connections: { source: TreeNode, target: TreeNode }[] } => {
    const nodeWidth = 150;
    const nodeHeight = 60;
    const horizontalSpacing = 200;
    const verticalSpacing = 100;

    node.x = x;
    node.y = y;
    node.width = nodeWidth;
    node.height = nodeHeight;
    node.level = level;

    const nodes: TreeNode[] = [node];
    const connections: { source: TreeNode, target: TreeNode }[] = [];

    if (node.children.length > 0) {
      const totalChildrenWidth = node.children.length * nodeWidth + (node.children.length - 1) * horizontalSpacing;
      let currentChildX = x - totalChildrenWidth / 2 + nodeWidth / 2;

      node.children.forEach((child, index) => {
        connections.push({ source: node, target: child });
        const childLayout = layoutTree(child, currentChildX, y + verticalSpacing, level + 1, index, node.children.length);
        nodes.push(...childLayout.nodes);
        connections.push(...childLayout.connections);
        currentChildX += nodeWidth + horizontalSpacing;
      });
    }

    return { nodes, connections };
  }, []);

  const { nodes: laidOutNodes, connections: laidOutConnections } = useMemo(() => {
    if (!treeData) return { nodes: [], connections: [] };

    // Calculate initial layout assuming root at (0,0)
    const { nodes, connections } = layoutTree(treeData, 0, 0, 0, 0, 1);

    // Find min/max X to center the tree
    let minX = Infinity;
    let maxX = -Infinity;
    nodes.forEach(node => {
      minX = Math.min(minX, node.x - node.width / 2);
      maxX = Math.max(maxX, node.x + node.width / 2);
    });

    const treeWidth = maxX - minX;
    const offsetX = (containerWidth / 2) - (minX + treeWidth / 2);

    // Apply offset to all nodes
    nodes.forEach(node => {
      node.x += offsetX;
    });

    return { nodes, connections };
  }, [treeData, layoutTree, containerWidth]);

  const handleNodeClick = useCallback((node: TreeNode) => {
    if (node.id === 'virtual-root') return;
    const note = notes.find(n => n.id === node.id);
    if (note) {
      // First select the note to ensure it's properly set in state
      onSelectNote(note);
      // Then navigate if navigation function is provided
      if (onNavigateToNote) {
        onNavigateToNote(note);
      }
    }
  }, [notes, onSelectNote, onNavigateToNote]);

  // Handle node hover
  const handleNodeHover = useCallback((node: TreeNode | null) => {
    setHoveredNode(node);
  }, []);

  // Render tree node
  const renderNode = useCallback((node: TreeNode) => {
    const isSelected = selectedNote?.id === node.id;
    const isHovered = hoveredNode?.id === node.id;
    const isFiltered = searchQuery ? node.title.toLowerCase().includes(searchQuery.toLowerCase()) : true;

    if (!isFiltered && node.id !== 'virtual-root') return null; // Hide if not filtered and not virtual root

    // Apply zoom and pan transformations
    const transformedX = (node.x - node.width / 2) * zoom + pan.x;
    const transformedY = (node.y - node.height / 2) * zoom + pan.y;
    const transformedWidth = node.width * zoom;
    const transformedHeight = node.height * zoom;

    return (
      <g
        key={node.id}
        transform={`translate(${transformedX}, ${transformedY})`}
        className={`mindmap-node ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
        onClick={() => handleNodeClick(node)}
        onMouseEnter={() => handleNodeHover(node)}
        onMouseLeave={() => handleNodeHover(null)}
      >
        <rect
          x="0"
          y="0"
          width={transformedWidth}
          height={transformedHeight}
          rx="8"
          ry="8"
          className="node-rect"
        />
        <text
          x={transformedWidth / 2}
          y={transformedHeight / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          className="node-text"
          style={{ fontSize: `${12 * zoom}px` }}
        >
          {node.title}
        </text>
        {node.id !== 'virtual-root' && (
          <text
            x={transformedWidth - 10}
            y={15 * zoom}
            textAnchor="end"
            className="node-level-badge"
            style={{ fontSize: `${10 * zoom}px` }}
          >
            L{node.level}
          </text>
        )}
        {node.id !== 'virtual-root' && (
          <g className="node-actions-overlay">
            <button
              className="action-btn add-child-btn"
              onClick={(e) => { e.stopPropagation(); onAddChildNote(notes.find(n => n.id === node.id)!); }}
              title="Add child note"
            >
              <Plus size={14 * zoom} />
            </button>
            <button
              className="action-btn view-btn"
              onClick={(e) => { e.stopPropagation(); onNavigateToNote(notes.find(n => n.id === node.id)!); }}
              title="View note page"
            >
              <Eye size={14 * zoom} />
            </button>
            {/* Edit and Delete buttons can be added here if needed */}
          </g>
        )}
      </g>
    );
  }, [handleNodeClick, handleNodeHover, selectedNote, hoveredNode, searchQuery, notes, onAddChildNote, onNavigateToNote, zoom, pan]);

  // Render connections
  const renderConnections = useCallback(() => {
    return laidOutConnections.map((conn, index) => {
      const sourceX = conn.source.x * zoom + pan.x;
      const sourceY = conn.source.y * zoom + pan.y;
      const targetX = conn.target.x * zoom + pan.x;
      const targetY = conn.target.y * zoom + pan.y;

      // Draw a straight line for now
      return (
        <line
          key={index}
          x1={sourceX}
          y1={sourceY}
          x2={targetX}
          y2={targetY}
          className="mindmap-link"
          strokeWidth={2 * zoom}
        />
      );
    });
  }, [laidOutConnections, zoom, pan]);

  const filteredNodes = laidOutNodes.filter(node =>
    node.id === 'virtual-root' || node.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div 
      className="mindmap-container" 
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <div className="mindmap-header">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="controls">
          <button className="control-btn" onClick={onCreateNote}>
            <Plus size={16} />
            New Note
          </button>
          <div className="zoom-controls">
            <button 
              className="zoom-btn" 
              onClick={() => setZoom(Math.max(0.3, zoom * 0.9))}
              title="Zoom Out"
            >
              -
            </button>
            <span className="zoom-level">{Math.round(zoom * 100)}%</span>
            <button 
              className="zoom-btn" 
              onClick={() => setZoom(Math.min(3, zoom * 1.1))}
              title="Zoom In"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {notes.length === 0 ? (
        <div className="empty-state">
          <h3>No notes yet</h3>
          <p>Create your first note to start building your knowledge tree</p>
          <button className="create-first-note-btn" onClick={onCreateNote}>
            <Plus size={16} />
            Create your first note
          </button>
        </div>
      ) : (
        <div className="tree-container">
          <svg width={containerWidth} height={containerHeight}>
            {renderConnections()}
            {filteredNodes.map(renderNode)}
          </svg>
        </div>
      )}
    </div>
  );
};

export default MindMap;
