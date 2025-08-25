import { useMemo } from 'react';
import { Note } from '../../notes/types';
import { TreeNode } from '../types/mindMapTypes';
import { 
  layoutTree, 
  calculateNodeWidth, 
  calculateNodeHeight, 
  wrapText,
  calculateGroupBounds,
  moveGroup
} from '../utils/mindMapUtils';

interface UseMindMapLayoutProps {
  notes: Note[];
  containerWidth: number;
  layoutType?: 'horizontal' | 'vertical';
}

interface UseMindMapLayoutReturn {
  treeData: TreeNode | null;
  laidOutNodes: TreeNode[];
  laidOutConnections: { source: TreeNode; target: TreeNode }[];
  calculateNodeWidth: (title: string) => number;
  calculateNodeHeight: (title: string, width: number) => number;
  wrapText: (text: string, maxWidth: number) => string[];
}

export const useMindMapLayout = ({ notes, containerWidth, layoutType = 'horizontal' }: UseMindMapLayoutProps): UseMindMapLayoutReturn => {
  // Prepare tree data from notes
  const treeData = useMemo(() => {
    const nodesMap = new Map<string, TreeNode>();
    const rootNodes: TreeNode[] = [];

    // Create all nodes
    notes.forEach(note => {
      const calculatedWidth = calculateNodeWidth(note.title);
      const calculatedHeight = calculateNodeHeight(note.title, calculatedWidth);
      nodesMap.set(note.id, {
        id: note.id,
        title: note.title,
        x: 0, y: 0, width: calculatedWidth, height: calculatedHeight,
        level: note.level,
        children: [],
        parentId: note.parentId
      });
    });

    // Build hierarchy - only include children of expanded notes
    nodesMap.forEach(node => {
      if (node.parentId) {
        const parent = nodesMap.get(node.parentId);
        if (parent) {
          // Check if parent is expanded before adding children
          const parentNote = notes.find(n => n.id === node.parentId);
          if (parentNote && parentNote.isExpanded) {
            parent.children.push(node);
          }
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

  // Enhanced tree layout with collision detection and prevention
  const { nodes: laidOutNodes, connections: laidOutConnections } = useMemo(() => {
    if (!treeData) return { nodes: [], connections: [] };

    // Phase 1: Calculate initial layout and get total widths
    const { nodes, connections, totalWidth } = layoutTree(treeData, 0, 0, 0, 0, 1, layoutType);
    
    // Phase 2: Detect and resolve overlapping between different parent groups
    const resolvedNodes = [...nodes];
    const resolvedConnections = [...connections];
    
    // Group nodes by their parent and level
    const nodesByLevel = new Map<number, TreeNode[]>();
    nodes.forEach(node => {
      if (!nodesByLevel.has(node.level)) {
        nodesByLevel.set(node.level, []);
      }
      nodesByLevel.get(node.level)!.push(node);
    });
    
    // For each level, check for overlapping between different parent groups
    const levels = Array.from(nodesByLevel.keys()).sort((a, b) => a - b);
    for (let level = 1; level <= Math.max(...levels); level++) {
      const levelNodes = nodesByLevel.get(level) || [];
      const parentGroups = new Map<string, TreeNode[]>();
      
      // Group nodes by their parent
      levelNodes.forEach(node => {
        const parent = nodes.find(n => n.id === node.parentId);
        if (parent) {
          if (!parentGroups.has(parent.id)) {
            parentGroups.set(parent.id, []);
          }
          parentGroups.get(parent.id)!.push(node);
        }
      });
      
      // Sort parent groups by their leftmost position
      const sortedParentGroups = Array.from(parentGroups.entries()).sort(([, group1], [, group2]) => {
        const bounds1 = calculateGroupBounds(group1);
        const bounds2 = calculateGroupBounds(group2);
        return bounds1.minX - bounds2.minX;
      });
      
      // Check for overlapping between adjacent parent groups
      for (let i = 0; i < sortedParentGroups.length - 1; i++) {
        const [, group1] = sortedParentGroups[i];
        const [, group2] = sortedParentGroups[i + 1];
        
        // Calculate bounds for each group
        const group1Bounds = calculateGroupBounds(group1);
        const group2Bounds = calculateGroupBounds(group2);
        
        // Check if groups overlap (with some buffer)
        const buffer = 50;
        if (group1Bounds.maxX + buffer >= group2Bounds.minX) {
          // Groups overlap, need to separate them
          const overlap = group1Bounds.maxX + buffer - group2Bounds.minX;
          const separation = overlap + 100; // Add extra spacing
          
          // Move group2 and all groups to its right
          for (let j = i + 1; j < sortedParentGroups.length; j++) {
            const [, groupToMove] = sortedParentGroups[j];
            moveGroup(groupToMove, separation, resolvedNodes);
          }
        }
      }
    }
    
    // Find min/max X to center the tree
    let minX = Infinity;
    let maxX = -Infinity;
    resolvedNodes.forEach(node => {
      minX = Math.min(minX, node.x - node.width / 2);
      maxX = Math.max(maxX, node.x + node.width / 2);
    });

    const treeWidth = maxX - minX;
    const offsetX = (containerWidth / 2) - (minX + treeWidth / 2);

    // Apply offset to all nodes
    resolvedNodes.forEach(node => {
      node.x += offsetX;
    });

    return { nodes: resolvedNodes, connections: resolvedConnections };
  }, [treeData, containerWidth, layoutType]);

  return {
    treeData,
    laidOutNodes,
    laidOutConnections,
    calculateNodeWidth,
    calculateNodeHeight,
    wrapText
  };
};
