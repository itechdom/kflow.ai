import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { Note } from '../types/Note';
import { Plus, Eye, Edit2, X, Paperclip } from 'lucide-react';

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

interface EditingState {
  noteId: string;
  field: 'title' | 'content';
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
  const [autoEditNoteId, setAutoEditNoteId] = useState<string | null>(null);
  
  // Editing state
  const [editingState, setEditingState] = useState<EditingState | null>(null);
  const [editValues, setEditValues] = useState<{ title: string; content: string }>({
    title: '',
    content: ''
  });
  const [showContentModal, setShowContentModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; note: Note } | null>(null);

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

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
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

  // Handle right-click for context menu
  const handleNodeRightClick = useCallback((e: React.MouseEvent, node: TreeNode) => {
    e.preventDefault();
    e.stopPropagation();
    if (node.id === 'virtual-root') return;
    
    const note = notes.find(n => n.id === node.id);
    if (note) {
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        note
      });
    }
  }, [notes]);

  const handleAddChildNote = useCallback((note: Note) => {
    onAddChildNote(note);
    setContextMenu(null);
    setAutoEditNoteId(note.id);
  }, [notes, onAddChildNote]);

  // Open content editor
  const openContentEditor = useCallback((note: Note) => {
    setEditingNote(note);
    setEditValues({
      title: note.title,
      content: note.content
    });
    setShowContentModal(true);
    setContextMenu(null);
  }, []);

  // Handle mouse leave for panning
  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'e' && selectedNote) {
        e.preventDefault();
        openContentEditor(selectedNote);
      }
      if(e.key === 'Tab') {
        e.preventDefault();
        handleAddChildNote(selectedNote!);
      }
      if(e.key === 'Backspace') {
        //check if editing is on, if so don't delete note
        if(editingState) {
          return;
        }
        e.preventDefault();
        onDeleteNote(selectedNote!.id);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedNote, editingState, openContentEditor]);

  	// Auto-edit newly created child notes
	useEffect(() => {
		if (autoEditNoteId) {
			const parentNote = notes.find(note => note.id === autoEditNoteId);
			if (parentNote && parentNote.children && parentNote.children.length > 0) {
				// Find the most recently created child note (last in children array)
				const lastChildId = parentNote.children[parentNote.children.length - 1];
				const childNote = notes.find(note => note.id === lastChildId);
				if (childNote && childNote.title === 'New Child Note') {
					// Auto-start editing the title of this new child note
					setTimeout(() => {
						startEditing(childNote, 'title');
						setAutoEditNoteId(null); // Reset after starting edit
					}, 150); // Small delay to ensure the note is rendered and ref is set
				}
			}
		}
	}, [notes, autoEditNoteId]);

  // Editing functions
  const startEditing = useCallback((note: Note, field: 'title' | 'content') => {
    setEditingState({ noteId: note.id, field });
    setEditValues({
      title: note.title,
      content: note.content
    });
    
    if (field === 'content') {
      setEditingNote(note);
      setShowContentModal(true);
    }
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingState(null);
    setEditValues({ title: '', content: '' });
  }, []);

  const saveEdit = useCallback((note: Note) => {
    const updatedNote = {
      ...note,
      title: editValues.title,
      content: editValues.content,
      updatedAt: new Date()
    };
    onEditNote(updatedNote);
    cancelEdit();
  }, [editValues.title, editValues.content, onEditNote, cancelEdit]);

  const handleTitleKeyDown = useCallback((e: React.KeyboardEvent, note: Note) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit(note);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  }, [saveEdit, cancelEdit]);

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
    const isEditingTitle = editingState?.noteId === node.id && editingState?.field === 'title';
    const note = notes.find(n => n.id === node.id);

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
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (note && node.id !== 'virtual-root') {
            startEditing(note, 'title');
          }
        }}
        onMouseEnter={() => handleNodeHover(node)}
        onMouseLeave={() => handleNodeHover(null)}
        onContextMenu={(e) => handleNodeRightClick(e, node)}
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
        
        {isEditingTitle ? (
          <foreignObject x="5" y="15" width={transformedWidth - 10} height="30">
            <div style={{ width: '100%', height: '100%' }}>
              <input
                type="text"
                value={editValues.title}
                onChange={(e) => setEditValues({ ...editValues, title: e.target.value })}
                onKeyDown={(e) => handleTitleKeyDown(e, note!)}
                onBlur={() => saveEdit(note!)}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: `${12 * zoom}px`,
                  textAlign: 'center',
                  color: '#1e293b'
                }}
                autoFocus
              />
            </div>
          </foreignObject>
        ) : (
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
        )}
        
        {/* Content Edit Button - Always visible inside the node */}
        {node.id !== 'virtual-root' && !isEditingTitle && (
          <foreignObject x="5" y="5" width="20" height="20">
            <div style={{ width: '100%', height: '100%' }}>
              <button
                className="content-edit-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  if (note) openContentEditor(note);
                }}
                title="Edit content"
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  background: 'rgba(37, 99, 235, 0.1)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(37, 99, 235, 0.2)';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(37, 99, 235, 0.1)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <Edit2 size={10} color="#2563eb" />
              </button>
            </div>
          </foreignObject>
        )}
        
        {/* Content Indicator - Show clip icon if node has actual content */}
        {node.id !== 'virtual-root' && note && note.content && note.content.trim() !== '' && note.content !== 'Add your content here...' && (
          <foreignObject x={transformedWidth - 25} y={transformedHeight - 25} width="20" height="20">
            <div style={{ width: '100%', height: '100%' }}>
              <div
                className="content-indicator"
                title={`Has content: ${note.content.length > 50 ? note.content.substring(0, 50) + '...' : note.content}`}
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(34, 197, 94, 0.1)',
                  borderRadius: '4px',
                  border: '1px solid rgba(34, 197, 94, 0.3)'
                }}
              >
                <Paperclip onClick={() => openContentEditor(note)} size={10} color="#22c55e" />
              </div>
            </div>
          </foreignObject>
        )}
        
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
      </g>
    );
  }, [handleNodeClick, handleNodeHover, selectedNote, hoveredNode, searchQuery, notes, onAddChildNote, onNavigateToNote, zoom, pan, editingState, editValues, startEditing, handleTitleKeyDown, saveEdit, handleNodeRightClick, openContentEditor]);

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
          <div className="edit-hint">
            <span className="hint-text">💡 Double-click nodes to edit titles • Click blue edit button inside nodes for content • Green clip icon = has content • Right-click for menu • Ctrl+E to edit content</span>
          </div>
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
      
      {/* Context Menu */}
      {contextMenu && (
        <div 
          className="context-menu"
          style={{
            position: 'fixed',
            left: Math.max(10, contextMenu.x - 75), // Center on x position, with margin from edge
            top: Math.max(10, contextMenu.y - 30), // Position above cursor, with margin from edge
            zIndex: 1001
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="context-menu-item" onClick={() => openContentEditor(contextMenu.note)}>
            <Edit2 size={14} />
            Edit Content
          </div>
          <div className="context-menu-item" onClick={() => handleAddChildNote(contextMenu.note)}>
            <Plus size={14} />
            Add Child
          </div>
        </div>
      )}
      
      {/* Content Editing Modal */}
      {showContentModal && editingNote && (
        <div className="modal-overlay" onClick={() => setShowContentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Note Content</h3>
              <button 
                className="close-btn"
                onClick={() => setShowContentModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="note-title">Title:</label>
                <input
                  id="note-title"
                  type="text"
                  value={editValues.title}
                  onChange={(e) => setEditValues({ ...editValues, title: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="note-content">Content:</label>
                <textarea
                  id="note-content"
                  value={editValues.content}
                  onChange={(e) => setEditValues({ ...editValues, content: e.target.value })}
                  className="form-textarea"
                  rows={8}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowContentModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  saveEdit(editingNote);
                  setShowContentModal(false);
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MindMap;
