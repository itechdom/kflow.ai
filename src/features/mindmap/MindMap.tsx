import React, { useCallback, useRef, useState, useEffect } from 'react';
import { Note } from '../notes/types';
import { MindMapProps } from './types/mindMapTypes';
import { useMindMapLayout } from './hooks/useMindMapLayout';
import { useMindMapZoomPan } from './hooks/useMindMapZoomPan';
import { useMindMapEditing } from './hooks/useMindMapEditing';
import { useMindMapContextMenu } from './hooks/useMindMapContextMenu';
import { useMindMapAI } from './hooks/useMindMapAI';
import { useMindMapNavigation } from './hooks/useMindMapNavigation';
import { useMindMapKeyboard } from './hooks/useMindMapKeyboard';
import MindMapContainer from './components/MindMapContainer';
import MindMapHeader from './components/MindMapHeader';
import MindMapCanvas from './components/MindMapCanvas';
import MindMapNode from './components/MindMapNode';
import MindMapConnections from './components/MindMapConnections';
import MindMapContextMenu from './components/MindMapContextMenu';
import NoteContentModal from './components/NoteContentModal';
import EmptyState from './components/EmptyState';

const MindMap: React.FC<MindMapProps> = ({
    notes,
    selectedNote,
    onSelectNote,
    onDeleteNote,
    onEditNote,
    onCreateNote,
    onAddChildNote,
    onNavigateToNote,
    scrollTargetNote,
    onSetScrollTargetNote
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isTreeContainerFocused, setIsTreeContainerFocused] = useState(false);
    const [autoEditNoteId, setAutoEditNoteId] = useState<string | null>(null);

    const {
        editingState,
        editValues,
        showContentModal,
        editingNote,
        startEditing,
        cancelEdit,
        saveEdit,
        openContentEditor,
        closeContentEditor,
        onEditValuesChange
    } = useMindMapEditing({ notes, onEditNote, onSetScrollTargetNote });

    // Custom hooks
    const {
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
        setPan
    } = useMindMapZoomPan({ containerRef, editingState, showContentModal });

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

    const {
        isGeneratingChildren,
        handleAIGenerateChildren
    } = useMindMapAI({ onEditNote });

    const {
        findParentNote,
        findFirstChildNote,
        findPreviousSiblingNote,
        findNextSiblingNote
    } = useMindMapNavigation({ notes, selectedNote, laidOutNodes, onSelectNote });

    const handleNodeClick = useCallback((node: any) => {
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

    const handleAddChildNote = useCallback((note: Note) => {
        onAddChildNote(note);
        closeContextMenu();
        setAutoEditNoteId(note.id);
    }, [onAddChildNote, closeContextMenu]);

    // Keyboard shortcuts
    useMindMapKeyboard({
        isTreeContainerFocused,
        editingState,
        selectedNote,
        onSelectNote,
        onEditNote,
        onDeleteNote,
        openContentEditor,
        handleAddChildNote,
        findParentNote,
        findFirstChildNote,
        findPreviousSiblingNote,
        findNextSiblingNote,
        laidOutNodes,
        containerWidth,
        containerHeight,
        setPan
    });

    // Close context menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => closeContextMenu();
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [closeContextMenu]);

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
    }, [notes, autoEditNoteId, startEditing]);

    // Scroll to target note when searching
    useEffect(() => {
        if (!scrollTargetNote) return;

        // Find the target note in the laid out nodes
        const targetNode = laidOutNodes.find(node => node.id === scrollTargetNote.id);
        if (!targetNode) return;

        // Calculate the center position of the target node
        const targetCenterX = targetNode.x;
        const targetCenterY = targetNode.y;

        // Calculate the center of the viewport
        const viewportCenterX = containerWidth / 2;
        const viewportCenterY = containerHeight / 2;

        // Calculate the pan offset needed to center the target node
        const panOffsetX = viewportCenterX - targetCenterX;
        const panOffsetY = viewportCenterY - targetCenterY;

        // Apply the pan offset smoothly
        setPan({
            x: panOffsetX,
            y: panOffsetY
        });

        // Also select the note
        onSelectNote(scrollTargetNote);

    }, [scrollTargetNote, laidOutNodes, containerWidth, containerHeight, onSelectNote, setPan]);



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
                            onEditValuesChange={onEditValuesChange}
                        />
                    ))}
                </MindMapCanvas>
            )}

            {contextMenu && (
                <MindMapContextMenu
                    contextMenu={contextMenu}
                    onClose={closeContextMenu}
                    onEditContent={() => openContentEditor(contextMenu.note)}
                    onAddChild={() => handleAddChildNote(contextMenu.note)}
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

export default MindMap;
