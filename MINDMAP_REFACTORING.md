# MindMap Component Refactoring Guide

## Overview
The current `MindMap.tsx` component is **1,284 lines** long and handles multiple responsibilities, making it difficult to maintain and test. This document outlines a comprehensive refactoring strategy to break it down into smaller, focused components and reusable hooks.

## Current Issues
- **Single Responsibility Violation**: Handles rendering, layout, navigation, editing, zoom/pan, and keyboard shortcuts
- **Massive Component**: 1,284 lines makes it hard to navigate and debug
- **Mixed Concerns**: UI logic, business logic, and state management all in one place
- **Difficult Testing**: Large component with many dependencies
- **Poor Reusability**: Logic is tightly coupled to the component

## Refactoring Strategy

### 1. Component Breakdown

#### **Core Components**

##### **MindMapContainer** (~50 lines)
- Main container with zoom/pan state
- Handles container dimensions and resize events
- Renders header and main content area

##### **MindMapHeader** (~40 lines)
- Displays help text and zoom controls
- Handles zoom in/out functionality
- Shows keyboard shortcut hints

##### **MindMapCanvas** (~80 lines)
- SVG canvas container
- Handles mouse events for panning
- Manages focus state for keyboard shortcuts

##### **MindMapNode** (~120 lines)
- Individual node rendering
- Handles node-specific interactions (click, hover, context menu)
- Manages editing state for individual nodes

##### **MindMapConnections** (~30 lines)
- Renders connection lines between nodes
- Handles zoom/pan transformations for connections

##### **MindMapContextMenu** (~40 lines)
- Right-click context menu
- Menu options for editing and adding children

##### **MindMapControls** (~60 lines)
- Zoom controls
- Navigation hints
- Help text display

#### **Modal Components**

##### **NoteContentModal** (~50 lines)
- Content editing modal
- Integrates with NoteForm component

##### **EmptyState** (~30 lines)
- No notes available state
- Create first note button

### 2. Custom Hooks

#### **useMindMapNavigation** (~80 lines)
```typescript
interface UseMindMapNavigationProps {
  notes: Note[];
  selectedNote: Note | null;
  laidOutNodes: TreeNode[];
  onSelectNote: (note: Note) => void;
}

interface UseMindMapNavigationReturn {
  findParentNote: (note: Note) => Note | null;
  findFirstChildNote: (note: Note) => Note | null;
  findPreviousSiblingNote: (note: Note) => Note | null;
  findNextSiblingNote: (note: Note) => Note | null;
  navigateToNote: (note: Note) => void;
}
```

#### **useMindMapKeyboard** (~100 lines)
```typescript
interface UseMindMapKeyboardProps {
  isTreeContainerFocused: boolean;
  editingState: EditingState | null;
  selectedNote: Note | null;
  onSelectNote: (note: Note) => void;
  onEditNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
  openContentEditor: (note: Note) => void;
  handleAddChildNote: (note: Note) => void;
  findParentNote: (note: Note) => Note | null;
  findFirstChildNote: (note: Note) => Note | null;
  findPreviousSiblingNote: (note: Note) => Note | null;
  findNextSiblingNote: (note: Note) => Note | null;
  laidOutNodes: TreeNode[];
  containerWidth: number;
  containerHeight: number;
  setPan: (pan: { x: number; y: number }) => void;
}

interface UseMindMapKeyboardReturn {
  handleKeyDown: (e: KeyboardEvent) => void;
  handleArrowNavigation: (e: KeyboardEvent) => void;
}
```

#### **useMindMapZoomPan** (~80 lines)
```typescript
interface UseMindMapZoomPanProps {
  containerRef: React.RefObject<HTMLDivElement>;
  editingState: EditingState | null;
  showContentModal: boolean;
}

interface UseMindMapZoomPanReturn {
  zoom: number;
  pan: { x: number; y: number };
  isDragging: boolean;
  handleWheel: (e: React.WheelEvent) => void;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
  handleMouseLeave: () => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
  resetView: () => void;
}
```

#### **useMindMapEditing** (~60 lines)
```typescript
interface UseMindMapEditingProps {
  notes: Note[];
  onEditNote: (note: Note) => void;
  onSetScrollTargetNote: (note: Note | undefined) => void;
}

interface UseMindMapEditingReturn {
  editingState: EditingState | null;
  editValues: { title: string; content: string };
  showContentModal: boolean;
  editingNote: Note | null;
  startEditing: (note: Note, field: 'title' | 'content') => void;
  cancelEdit: () => void;
  saveEdit: (note: Note) => void;
  openContentEditor: (note: Note) => void;
  closeContentEditor: () => void;
}
```

#### **useMindMapLayout** (~120 lines)
```typescript
interface UseMindMapLayoutProps {
  notes: Note[];
  containerWidth: number;
}

interface UseMindMapLayoutReturn {
  treeData: TreeNode | null;
  laidOutNodes: TreeNode[];
  laidOutConnections: { source: TreeNode; target: TreeNode }[];
  calculateNodeWidth: (title: string) => number;
  calculateNodeHeight: (title: string, width: number) => number;
  wrapText: (text: string, maxWidth: number) => string[];
}
```

#### **useMindMapContextMenu** (~40 lines)
```typescript
interface UseMindMapContextMenuProps {
  notes: Note[];
  onAddChildNote: (note: Note) => void;
  openContentEditor: (note: Note) => void;
}

interface UseMindMapContextMenuReturn {
  contextMenu: { x: number; y: number; note: Note } | null;
  handleNodeRightClick: (e: React.MouseEvent, node: TreeNode) => void;
  closeContextMenu: () => void;
}
```

#### **useMindMapAI** (~30 lines)
```typescript
interface UseMindMapAIProps {
  onEditNote: (note: Note) => void;
}

interface UseMindMapAIReturn {
  isGeneratingChildren: boolean;
  handleAIGenerateChildren: (parentNote: Note) => Promise<void>;
}
```

### 3. Utility Functions

#### **mindMapUtils.ts** (~80 lines)
```typescript
// Text wrapping and sizing utilities
export const calculateNodeWidth = (title: string): number;
export const calculateNodeHeight = (title: string, width: number): number;
export const wrapText = (text: string, maxWidth: number): string[];

// Layout utilities
export const layoutTree = (node: TreeNode, x: number, y: number, level: number, siblingIndex: number, totalSiblings: number): LayoutResult;
export const calculateGroupBounds = (nodes: TreeNode[]): Bounds;
export const moveGroup = (nodes: TreeNode[], offset: number, allNodes: TreeNode[]): void;

// Navigation utilities
export const findParentNote = (note: Note, notes: Note[]): Note | null;
export const findFirstChildNote = (note: Note, notes: Note[], laidOutNodes: TreeNode[]): Note | null;
export const findPreviousSiblingNote = (note: Note, notes: Note[], laidOutNodes: TreeNode[]): Note | null;
export const findNextSiblingNote = (note: Note, notes: Note[], laidOutNodes: TreeNode[]): Note | null;
```

#### **mindMapConstants.ts** (~20 lines)
```typescript
export const MINDMAP_CONSTANTS = {
  MIN_ZOOM: 0.1,
  MAX_ZOOM: 3,
  ZOOM_SPEED: 0.001,
  SCROLL_SPEED: 0.5,
  HORIZONTAL_SPACING: 200,
  VERTICAL_SPACING: 50,
  MIN_NODE_WIDTH: 120,
  MAX_NODE_WIDTH: 300,
  MIN_NODE_HEIGHT: 60,
  CHAR_WIDTH: 8,
  LINE_HEIGHT: 18,
  NODE_PADDING: 40,
  LINE_SPACING: 4,
  COLLISION_BUFFER: 50,
  COLLISION_SEPARATION: 100,
} as const;
```

### 4. Types and Interfaces

#### **mindMapTypes.ts** (~40 lines)
```typescript
export interface TreeNode {
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

export interface EditingState {
  noteId: string;
  field: 'title' | 'content';
}

export interface LayoutResult {
  nodes: TreeNode[];
  connections: { source: TreeNode; target: TreeNode }[];
  totalWidth: number;
}

export interface Bounds {
  minX: number;
  maxX: number;
}

export interface MindMapProps {
  notes: Note[];
  selectedNote: Note | null;
  onSelectNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
  onEditNote: (note: Note) => void;
  onCreateNote: () => void;
  onAddChildNote: (parentNote: Note) => void;
  onNavigateToNote: (note: Note) => void;
  scrollTargetNote?: Note;
  onSetScrollTargetNote: (note: Note | undefined) => void;
}
```

## File Structure After Refactoring

```
src/features/notes/components/mindmap/
├── index.ts                          # Export all components
├── MindMap.tsx                       # Main component (now ~100 lines)
├── components/
│   ├── MindMapContainer.tsx          # Container wrapper
│   ├── MindMapHeader.tsx             # Header with controls
│   ├── MindMapCanvas.tsx             # SVG canvas
│   ├── MindMapNode.tsx               # Individual node
│   ├── MindMapConnections.tsx        # Connection lines
│   ├── MindMapContextMenu.tsx        # Right-click menu
│   ├── MindMapControls.tsx           # Zoom and navigation controls
│   ├── NoteContentModal.tsx          # Content editing modal
│   └── EmptyState.tsx                # No notes state
├── hooks/
│   ├── useMindMapNavigation.ts       # Navigation logic
│   ├── useMindMapKeyboard.ts         # Keyboard shortcuts
│   ├── useMindMapZoomPan.ts          # Zoom and pan logic
│   ├── useMindMapEditing.ts          # Editing state management
│   ├── useMindMapLayout.ts           # Tree layout calculations
│   ├── useMindMapContextMenu.ts      # Context menu logic
│   └── useMindMapAI.ts               # AI generation logic
├── utils/
│   ├── mindMapUtils.ts               # Utility functions
│   └── mindMapConstants.ts           # Constants
└── types/
    └── mindMapTypes.ts               # Type definitions
```

## Benefits of Refactoring

### **Maintainability**
- **Smaller Components**: Each component has a single, clear responsibility
- **Easier Debugging**: Issues can be isolated to specific components
- **Better Code Organization**: Related functionality is grouped together

### **Reusability**
- **Custom Hooks**: Logic can be reused across different components
- **Utility Functions**: Pure functions can be easily tested and reused
- **Component Composition**: Components can be mixed and matched

### **Testing**
- **Unit Testing**: Individual hooks and utilities can be tested in isolation
- **Component Testing**: Smaller components are easier to test
- **Mock Dependencies**: Easier to mock dependencies for testing

### **Performance**
- **Selective Re-renders**: Only affected components re-render
- **Memoization**: Hooks can optimize expensive calculations
- **Code Splitting**: Components can be lazy-loaded if needed

### **Developer Experience**
- **Faster Development**: Developers can work on isolated components
- **Better IDE Support**: Smaller files are easier to navigate
- **Code Reviews**: Smaller changes are easier to review

## Implementation Priority

### **Phase 1: Extract Hooks** (High Priority)
1. `useMindMapLayout` - Core layout logic
2. `useMindMapZoomPan` - Zoom and pan functionality
3. `useMindMapEditing` - Editing state management

### **Phase 2: Extract Components** (Medium Priority)
1. `MindMapNode` - Individual node rendering
2. `MindMapConnections` - Connection lines
3. `MindMapContextMenu` - Context menu

### **Phase 3: Extract Utilities** (Medium Priority)
1. `mindMapUtils.ts` - Layout and calculation functions
2. `mindMapTypes.ts` - Type definitions
3. `mindMapConstants.ts` - Constants

### **Phase 4: Extract Remaining Components** (Low Priority)
1. `MindMapHeader` - Header controls
2. `MindMapControls` - Zoom controls
3. `NoteContentModal` - Content editing

## Migration Strategy

### **Step 1: Create New Structure**
- Create new directory structure
- Move types and interfaces to separate files
- Extract constants to separate file

### **Step 2: Extract Hooks**
- Create custom hooks one by one
- Test each hook in isolation
- Update main component to use new hooks

### **Step 3: Extract Components**
- Create new components one by one
- Move JSX and component logic
- Update main component to use new components

### **Step 4: Extract Utilities**
- Move utility functions to separate files
- Update imports throughout the codebase
- Add proper error handling and validation

### **Step 5: Testing and Validation**
- Test each component individually
- Ensure all functionality works as expected
- Update tests to cover new structure

## Example Refactored Component

### **Before (MindMap.tsx - 1,284 lines)**
```typescript
const MindMap: React.FC<MindMapProps> = ({ ... }) => {
  // 50+ state variables
  // 20+ useEffect hooks
  // 15+ useCallback functions
  // 1,200+ lines of mixed logic
  
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      {/* 1,000+ lines of JSX */}
    </div>
  );
};
```

### **After (MindMap.tsx - ~100 lines)**
```typescript
const MindMap: React.FC<MindMapProps> = ({ ... }) => {
  const {
    zoom,
    pan,
    isDragging,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    setZoom,
    setPan,
    resetView
  } = useMindMapZoomPan({ containerRef, editingState, showContentModal });

  const {
    editingState,
    editValues,
    showContentModal,
    editingNote,
    startEditing,
    cancelEdit,
    saveEdit,
    openContentEditor,
    closeContentEditor
  } = useMindMapEditing({ notes, onEditNote, onSetScrollTargetNote });

  const {
    treeData,
    laidOutNodes,
    laidOutConnections
  } = useMindMapLayout({ notes, containerWidth });

  const {
    contextMenu,
    handleNodeRightClick,
    closeContextMenu
  } = useMindMapContextMenu({ notes, onAddChildNote, openContentEditor });

  return (
    <MindMapContainer
      containerRef={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      isDragging={isDragging}
    >
      <MindMapHeader
        zoom={zoom}
        onZoomIn={() => setZoom(Math.min(3, zoom * 1.1))}
        onZoomOut={() => setZoom(Math.max(0.3, zoom * 0.9))}
      />
      
      {notes.length === 0 ? (
        <EmptyState onCreateNote={onCreateNote} />
      ) : (
        <MindMapCanvas
          width={containerWidth}
          height={containerHeight}
          isFocused={isTreeContainerFocused}
          onFocus={() => setIsTreeContainerFocused(true)}
          onBlur={() => setIsTreeContainerFocused(false)}
        >
          <MindMapConnections
            connections={laidOutConnections}
            zoom={zoom}
            pan={pan}
          />
          {laidOutNodes.map(node => (
            <MindMapNode
              key={node.id}
              node={node}
              note={notes.find(n => n.id === node.id)}
              isSelected={selectedNote?.id === node.id}
              isEditing={editingState?.noteId === node.id}
              editValues={editValues}
              zoom={zoom}
              pan={pan}
              onNodeClick={handleNodeClick}
              onNodeRightClick={handleNodeRightClick}
              onStartEditing={startEditing}
              onSaveEdit={saveEdit}
              onCancelEdit={cancelEdit}
              onOpenContentEditor={openContentEditor}
              onEditNote={onEditNote}
              onAIGenerateChildren={handleAIGenerateChildren}
            />
          ))}
        </MindMapCanvas>
      )}

      {contextMenu && (
        <MindMapContextMenu
          contextMenu={contextMenu}
          onClose={closeContextMenu}
          onEditContent={() => openContentEditor(contextMenu.note)}
          onAddChild={() => onAddChildNote(contextMenu.note)}
        />
      )}

      <NoteContentModal
        isOpen={showContentModal}
        note={editingNote}
        onClose={closeContentEditor}
        onSave={onEditNote}
      />
    </MindMapContainer>
  );
};
```

## Conclusion

This refactoring will transform the monolithic `MindMap.tsx` component into a well-structured, maintainable, and testable codebase. The separation of concerns will make it easier for developers to work on specific features, and the reusable hooks will enable better code sharing across the application.

The estimated time for this refactoring is **2-3 weeks** for a single developer, with the most critical functionality (layout and zoom/pan) being extracted first to minimize risk.
