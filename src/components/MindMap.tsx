import React, { useCallback, useMemo, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Note } from '../types/Note';
import { Plus, Eye } from 'lucide-react';

interface MindMapProps {
  notes: Note[];
  selectedNote: Note | null;
  onSelectNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
  onEditNote: () => void;
  onCreateNote: () => void;
  onAddChildNote: (parentNote: Note) => void;
}

interface GraphNode {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
}

interface GraphLink {
  source: string;
  target: string;
  type: 'tag' | 'content' | 'hierarchy';
}

const MindMap: React.FC<MindMapProps> = ({
  notes,
  selectedNote,
  onSelectNote,
  onDeleteNote,
  onEditNote,
  onCreateNote,
  onAddChildNote
}) => {
  const graphRef = useRef<any>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Convert notes to graph data
  const graphData = useMemo(() => {
    if (notes.length === 0) return { nodes: [], links: [] };

    const nodes: GraphNode[] = notes.map(note => ({
      id: note.id,
      title: note.title,
      content: note.content,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      tags: note.tags
    }));

    const links: GraphLink[] = [];
    
    // Create hierarchical links (parent-child relationships)
    notes.forEach(note => {
      if (note.parentId) {
        links.push({
          source: note.parentId,
          target: note.id,
          type: 'hierarchy'
        });
      }
    });
    
    // Create links based on tag relationships (only between non-hierarchical notes)
    notes.forEach((note, i) => {
      notes.slice(i + 1).forEach(otherNote => {
        // Only create tag links if they're not already connected hierarchically
        const isHierarchicallyConnected = note.parentId === otherNote.id || 
                                       otherNote.parentId === note.id ||
                                       note.parentId === otherNote.parentId;
        
        if (!isHierarchicallyConnected) {
          const commonTags = note.tags.filter(tag => 
            otherNote.tags.includes(tag)
          );
          if (commonTags.length > 0) {
            links.push({
              source: note.id,
              target: otherNote.id,
              type: 'tag'
            });
          }
        }
      });
    });

    // Create links based on content similarity (only between non-hierarchical notes)
    notes.forEach((note, i) => {
      notes.slice(i + 1).forEach(otherNote => {
        const isHierarchicallyConnected = note.parentId === otherNote.id || 
                                       otherNote.parentId === note.id ||
                                       note.parentId === otherNote.parentId;
        
        if (!isHierarchicallyConnected) {
          const noteWords = note.content.toLowerCase().split(/\s+/);
          const otherWords = otherNote.content.toLowerCase().split(/\s+/);
          const commonWords = noteWords.filter(word => 
            word.length > 3 && otherWords.includes(word)
          );
          if (commonWords.length >= 2) {
            links.push({
              source: note.id,
              target: otherNote.id,
              type: 'content'
            });
          }
        }
      });
    });

    return { nodes, links };
  }, [notes]);

  // Handle node click
  const handleNodeClick = useCallback((node: GraphNode) => {
    const note = notes.find(n => n.id === node.id);
    if (note) {
      onSelectNote(note);
    }
  }, [notes, onSelectNote]);

  // Handle node hover
  const handleNodeHover = useCallback((node: GraphNode | null) => {
    setHoveredNode(node);
  }, []);

  // Filter nodes based on search
  const filteredGraphData = useMemo(() => {
    if (!searchQuery.trim()) return graphData;
    
    const query = searchQuery.toLowerCase();
    const filteredNodes = graphData.nodes.filter(node =>
      node.title.toLowerCase().includes(query) ||
      node.content.toLowerCase().includes(query) ||
      node.tags.some(tag => tag.toLowerCase().includes(query))
    );
    
    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredLinks = graphData.links.filter(link =>
      filteredNodeIds.has(link.source as string) && 
      filteredNodeIds.has(link.target as string)
    );
    
    return { nodes: filteredNodes, links: filteredLinks };
  }, [graphData, searchQuery]);

  // Node color based on selection and hover
  const getNodeColor = useCallback((node: GraphNode) => {
    if (selectedNote?.id === node.id) return '#667eea';
    if (hoveredNode?.id === node.id) return '#10b981';
    return '#64748b';
  }, [selectedNote, hoveredNode]);

  // Node size based on content length
  const getNodeSize = useCallback((node: GraphNode) => {
    const baseSize = 8;
    const contentFactor = Math.min(node.content.length / 100, 2);
    return baseSize + contentFactor * 4;
  }, []);

  if (notes.length === 0) {
    return (
      <div className="mind-map empty">
        <div className="empty-state">
          <h3>No notes yet</h3>
          <p>Create your first note to start building your knowledge graph</p>
          <button className="create-first-note-btn" onClick={onCreateNote}>
            <Plus size={16} />
            Create your first note
          </button>
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
            placeholder="Search notes in graph..."
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
            onClick={() => graphRef.current?.zoomToFit(400)}
          >
            <Eye size={16} />
            Fit View
          </button>
        </div>
      </div>
      
      <div className="graph-container">
        <ForceGraph2D
          ref={graphRef}
          graphData={filteredGraphData}
          nodeLabel={(node: GraphNode) => {
            const note = notes.find(n => n.id === node.id);
            const level = note?.level || 0;
            const parentTitle = note?.parentId ? notes.find(n => n.id === note.parentId)?.title : null;
            
            return `
              <div style="background: white; padding: 8px; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                  <span style="background: #667eea; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold;">L${level}</span>
                  <strong>${node.title}</strong>
                </div>
                <small style="color: #666;">${node.content.substring(0, 50)}${node.content.length > 50 ? '...' : ''}</small><br/>
                ${parentTitle ? `<small style="color: #f59e0b;">Parent: ${parentTitle}</small><br/>` : ''}
                <small style="color: #10b981;">Tags: ${node.tags.join(', ') || 'None'}</small>
              </div>
            `;
          }}
          nodeColor={getNodeColor}
          nodeVal={getNodeSize}
          linkColor={(link: GraphLink) => {
            switch (link.type) {
              case 'hierarchy': return '#667eea';
              case 'tag': return '#10b981';
              case 'content': return '#f59e0b';
              default: return '#64748b';
            }
          }}
          linkWidth={1}
          onNodeClick={handleNodeClick}
          onNodeHover={handleNodeHover}
          cooldownTicks={100}
          nodeCanvasObject={(node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
            const note = notes.find(n => n.id === node.id);
            const level = note?.level || 0;
            const label = node.title;
            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            const textWidth = ctx.measureText(label).width;
            const bckgDimensions = [textWidth + 12, fontSize + 8];

            // Add level indicator
            const levelText = `L${level}`;
            const levelFontSize = 10 / globalScale;
            ctx.font = `${levelFontSize}px Sans-Serif`;
            const levelWidth = ctx.measureText(levelText).width;
            const levelHeight = levelFontSize + 4;

            // Draw level badge background
            ctx.fillStyle = 'rgba(102, 126, 234, 0.9)';
            ctx.fillRect(
              (node.x || 0) - levelWidth / 2 - 2,
              (node.y || 0) - bckgDimensions[1] / 2 - levelHeight - 2,
              levelWidth + 4,
              levelHeight
            );

            // Draw level text
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(levelText, node.x || 0, (node.y || 0) - bckgDimensions[1] / 2 - levelHeight / 2);

            // Draw main label background
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillRect(
              (node.x || 0) - bckgDimensions[0] / 2,
              (node.y || 0) - bckgDimensions[1] / 2,
              bckgDimensions[0],
              bckgDimensions[1]
            );

            // Draw main label text
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = getNodeColor(node);
            ctx.fillText(label, node.x || 0, node.y || 0);
          }}
        />
      </div>
      
      <div className="graph-legend">
        <div className="legend-item">
          <div className="legend-color hierarchy"></div>
          <span>Parent-child</span>
        </div>
        <div className="legend-item">
          <div className="legend-color tag"></div>
          <span>Tag connections</span>
        </div>
        <div className="legend-item">
          <div className="legend-color content"></div>
          <span>Content similarity</span>
        </div>
        <div className="legend-item">
          <div className="legend-color selected"></div>
          <span>Selected note</span>
        </div>
      </div>
    </div>
  );
};

export default MindMap;
