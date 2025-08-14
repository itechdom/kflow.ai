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
  onNavigateToNote?: (note: Note) => void;
}

interface TreeNode {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  level: number;
  parentId?: string;
  children: TreeNode[];
  x: number;
  y: number;
  width: number;
  height: number;
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

  // Update container dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerWidth(rect.width);
        setContainerHeight(rect.height);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Convert notes to tree structure
  const treeData = useMemo(() => {
    if (notes.length === 0) return null;

    // Create a map of notes by ID
    const notesMap = new Map<string, Note>();
    notes.forEach(note => notesMap.set(note.id, note));

    // Build tree structure
    const buildTree = (note: Note): TreeNode => {
      const children = notes
        .filter(n => n.parentId === note.id)
        .map(childNote => buildTree(childNote));

      return {
        id: note.id,
        title: note.title,
        content: note.content,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        tags: note.tags,
        level: note.level,
        parentId: note.parentId,
        children,
        x: 0,
        y: 0,
        width: 0,
        height: 0
      };
    };

    // Get root notes (no parent)
    const rootNotes = notes.filter(note => !note.parentId);
    if (rootNotes.length === 0) return null;

    // Build tree from first root note (or create a virtual root if multiple)
    let rootNote: Note;
    if (rootNotes.length === 1) {
      rootNote = rootNotes[0];
    } else {
      // Create a virtual root note if multiple root notes exist
      rootNote = {
        id: 'virtual-root',
        title: 'Root Notes',
        content: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
        parentId: undefined,
        children: [],
        level: -1
      };
    }

    return buildTree(rootNote);
  }, [notes]);

  // Calculate tree layout
  const layoutTree = useCallback((node: TreeNode, x: number, y: number, level: number): { width: number, height: number } => {
    const nodeWidth = 200;
    const nodeHeight = 80;
    const levelSpacing = 250;
    const nodeSpacing = 50;

    node.x = x;
    node.y = y;
    node.width = nodeWidth;
    node.height = nodeHeight;

    if (node.children.length === 0) {
      return { width: nodeWidth, height: nodeHeight };
    }

    // Calculate total width needed for children
    let totalChildrenWidth = 0;
    const childrenLayouts: { width: number, height: number }[] = [];

    node.children.forEach(child => {
      const childLayout = layoutTree(child, 0, y + levelSpacing, level + 1);
      childrenLayouts.push(childLayout);
      totalChildrenWidth += childLayout.width + nodeSpacing;
    });

    // Remove extra spacing from last child
    if (childrenLayouts.length > 0) {
      totalChildrenWidth -= nodeSpacing;
    }

    // Position children
    let currentX = x - totalChildrenWidth / 2;
    node.children.forEach((child, index) => {
      const childLayout = childrenLayouts[index];
      layoutTree(child, currentX + childLayout.width / 2, y + levelSpacing, level + 1);
      currentX += childLayout.width + nodeSpacing;
    });

    // Return the total width needed for this subtree
    return {
      width: Math.max(nodeWidth, totalChildrenWidth),
      height: nodeHeight + levelSpacing
    };
  }, []);

  // Apply tree layout
  const positionedTree = useMemo(() => {
    if (!treeData) return null;

    const tree = JSON.parse(JSON.stringify(treeData)) as TreeNode;
    const centerX = containerWidth / 2;
    const startY = 50;
    
    layoutTree(tree, centerX, startY, 0);
    return tree;
  }, [treeData, containerWidth, layoutTree]);

  // Filter tree based on search
  const filteredTree = useMemo(() => {
    if (!positionedTree || !searchQuery.trim()) return positionedTree;

    const filterNode = (node: TreeNode): TreeNode | null => {
      const matchesSearch = 
        node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const filteredChildren = node.children
        .map(child => filterNode(child))
        .filter(Boolean) as TreeNode[];

      if (matchesSearch || filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren
        };
      }

      return null;
    };

    return filterNode(positionedTree);
  }, [positionedTree, searchQuery]);

  // Handle node click
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

  // Node color based on selection and hover
  const getNodeColor = useCallback((node: TreeNode) => {
    if (node.id === 'virtual-root') return '#94a3b8';
    if (selectedNote?.id === node.id) return '#667eea';
    if (hoveredNode?.id === node.id) return '#10b981';
    return '#64748b';
  }, [selectedNote, hoveredNode]);

  // Render tree node
  const renderNode = useCallback((node: TreeNode) => {
    if (!filteredTree) return null;

    const isVirtualRoot = node.id === 'virtual-root';
    const note = notes.find(n => n.id === node.id);
    const level = note?.level || 0;

    return (
      <g key={node.id}>
        {/* Node rectangle */}
        <rect
          x={node.x - node.width / 2}
          y={node.y - node.height / 2}
          width={node.width}
          height={node.height}
          rx={8}
          fill={getNodeColor(node)}
          stroke={hoveredNode?.id === node.id ? '#10b981' : '#e2e8f0'}
          strokeWidth={hoveredNode?.id === node.id ? 2 : 1}
          cursor="pointer"
          onClick={() => handleNodeClick(node)}
          onMouseEnter={() => handleNodeHover(node)}
          onMouseLeave={() => handleNodeHover(null)}
        />

        {/* Level badge */}
        {!isVirtualRoot && (
          <rect
            x={node.x - 25}
            y={node.y - node.height / 2 - 20}
            width={50}
            height={20}
            rx={10}
            fill="#667eea"
          />
        )}

        {/* Level text */}
        {!isVirtualRoot && (
          <text
            x={node.x}
            y={node.y - node.height / 2 - 10}
            textAnchor="middle"
            fill="white"
            fontSize="10"
            fontWeight="bold"
          >
            L{level}
          </text>
        )}

        {/* Title text */}
        <text
          x={node.x}
          y={node.y - 5}
          textAnchor="middle"
          fill="white"
          fontSize="12"
          fontWeight="600"
          cursor="pointer"
          onClick={() => handleNodeClick(node)}
        >
          {isVirtualRoot ? node.title : (node.title.length > 20 ? node.title.substring(0, 20) + '...' : node.title)}
        </text>

        {/* Content preview */}
        {!isVirtualRoot && (
          <text
            x={node.x}
            y={node.y + 10}
            textAnchor="middle"
            fill="white"
            fontSize="10"
            opacity={0.8}
          >
            {node.content.length > 30 ? node.content.substring(0, 30) + '...' : node.content}
          </text>
        )}

        {/* Render children */}
        {node.children.map(child => renderNode(child))}
      </g>
    );
  }, [filteredTree, notes, getNodeColor, hoveredNode, handleNodeClick, handleNodeHover]);

  // Render connections between nodes
  const renderConnections = useCallback((node: TreeNode) => {
    if (!filteredTree) return null;

    return (
      <g key={`connections-${node.id}`}>
        {node.children.map(child => (
          <g key={`connection-${node.id}-${child.id}`}>
            {/* Connection line */}
            <line
              x1={node.x}
              y1={node.y + node.height / 2}
              x2={child.x}
              y2={child.y - child.height / 2}
              stroke="#667eea"
              strokeWidth={2}
              opacity={0.6}
            />
            
            {/* Arrow head */}
            <polygon
              points={`${child.x - 5},${child.y - child.height / 2} ${child.x + 5},${child.y - child.height / 2} ${child.x},${child.y - child.height / 2 - 8}`}
              fill="#667eea"
              opacity={0.6}
            />
          </g>
        ))}
        
        {/* Render connections for children */}
        {node.children.map(child => renderConnections(child))}
      </g>
    );
  }, [filteredTree]);

  if (notes.length === 0) {
    return (
      <div className="mind-map empty">
        <div className="empty-state">
          <h3>No notes yet</h3>
          <p>Create your first note to start building your knowledge tree</p>
          <button className="create-first-note-btn" onClick={onCreateNote}>
            <Plus size={16} />
            Create your first note
          </button>
        </div>
      </div>
    );
  }

  if (!filteredTree) {
    return (
      <div className="mind-map empty">
        <div className="empty-state">
          <h3>No notes found</h3>
          <p>Try adjusting your search query</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mind-map">
      <div className="mind-map-header">
        <div className="search-section">
          <input
            type="text"
            className="search-input"
            placeholder="Search notes in tree..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="controls">
          <button className="control-btn" onClick={onCreateNote}>
            <Plus size={16} />
            New Note
          </button>
          <button 
            className="control-btn"
            onClick={() => {
              if (containerRef.current) {
                containerRef.current.scrollTo({
                  top: 0,
                  left: 0,
                  behavior: 'smooth'
                });
              }
            }}
          >
            <Eye size={16} />
            Top View
          </button>
        </div>
      </div>
      
      <div className="tree-container" ref={containerRef}>
        <svg
          width={containerWidth}
          height={Math.max(containerHeight, 800)}
          style={{ display: 'block' }}
        >
          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.3)"/>
            </filter>
          </defs>
          
          {/* Render connections first (behind nodes) */}
          {renderConnections(filteredTree)}
          
          {/* Render nodes on top */}
          {renderNode(filteredTree)}
        </svg>
      </div>
      
      <div className="graph-legend">
        <div className="legend-item">
          <div className="legend-color hierarchy"></div>
          <span>Parent-child</span>
        </div>
        <div className="legend-item">
          <div className="legend-color selected"></div>
          <span>Selected note</span>
        </div>
        <div className="legend-item">
          <div className="legend-color hover"></div>
          <span>Hovered note</span>
        </div>
      </div>
    </div>
  );
};

export default MindMap;
