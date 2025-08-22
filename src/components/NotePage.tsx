import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectNote, deleteNote, addChildNote, createNote, editNote, toggleNoteExpanded, expandNote } from '../store/noteSlice';
import { Note } from '../types/Note';
import NoteList from './NoteList';
import MindMap from './MindMap';
import SearchBar from './SearchBar';
import { ArrowLeft, List, Map } from 'lucide-react';
import { current } from '@reduxjs/toolkit';

const NotePage: React.FC = () => {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [viewMode, setViewMode] = useState<'list' | 'mindmap'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [scrollTargetNote, setScrollTargetNote] = useState<Note>();
  
  // Get state from Redux
  const { notes, selectedNote } = useAppSelector(state => state.notes);

  // Find the current note
  const currentNote = notes.find(note => note.id === noteId);

  // When searching in NotePage sidebar, if a unique match is found within the sidebar set,
  // ensure it is expanded (and its ancestors), scroll to it, and select it
  useEffect(() => {
    if (!searchQuery.trim()) return;
    // Consider matches within the sidebar scope
    const sidebarIds = new Set(sidebarNotes.map(n => n.id));
    const matches = notes.filter(n => sidebarIds.has(n.id) && (
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
    ));
    if (matches.length !== 1) return;
    const match = matches[0];

    // Expand ancestors up to root
    const expandAncestors = (note: Note | undefined) => {
      if (!note) return;
      if (note.parentId) {
        const parent = notes.find(n => n.id === note.parentId);
        if (parent) {
          dispatch(expandNote(parent.id));
          expandAncestors(parent);
        }
      }
    };
    expandAncestors(match);
    // Ensure matched note expanded and saved
    dispatch(expandNote(match.id));
    // Select and scroll
    dispatch(selectNote(match));
    setScrollTargetNote({...match});
  }, [searchQuery]);

  // Auto-select current note if none selected
  useEffect(() => {
    if (currentNote && !selectedNote) {
      dispatch(selectNote(currentNote));
    }
  }, [currentNote, selectedNote, dispatch]);

  //TODO: move this to the store
  // Get notes to display in sidebar - only the selected note and its hierarchy
  const getNotesForSidebar = (): Note[] => {
    if (!selectedNote) return [];
    
    // Start with the selected note
    const notesToShow: Note[] = [];
    
    // First, add all parent notes from root to selected note
    const addParentPath = (noteId: string) => {
      const note = notes.find(n => n.id === noteId);
      if (note && note.parentId) {
        addParentPath(note.parentId); // Recursively add parents first
      }
      if (note) {
        notesToShow.push(note);
      }
    };
    
    // Add the full path from root to current note
    addParentPath(currentNote?.id || '');
    
    // Then add all children of the current note
    const addChildren = (parentId: string) => {
      const children = notes.filter(note => note.parentId === parentId);
      children.forEach(child => {
        notesToShow.push(child);
        addChildren(child.id); // Recursively add grandchildren
      });
    };
    
    addChildren(currentNote?.id || '');
    return notesToShow;
  };

  const sidebarNotes = getNotesForSidebar();
  
  if (!currentNote) {
    return (
      <div className="note-page">
        <div className="note-page-header">
          <button 
            className="back-btn"
            onClick={() => navigate('/')}
          >
            <ArrowLeft size={20} />
            Back to All Notes
          </button>
        </div>
        <div className="note-not-found">
          <h2>Note Not Found</h2>
          <p>The note you're looking for doesn't exist.</p>
          <button 
            className="back-btn"
            onClick={() => navigate('/')}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const handleNoteClick = (note: Note) => {
    if(!note.parentId){
      navigate(`/note/${note.id}`);
    }
  };

  const handleNoteSelect = (note: Note) => {
    dispatch(selectNote(note));
  };

  const handleDeleteNote = (noteId: string) => {
    dispatch(deleteNote(noteId));
    // If we deleted the current note, navigate back to home
    if (noteId === currentNote.id) {
      navigate('/');
    }
  };

  const handleAddChildNote = (parentNote: Note) => {
    dispatch(addChildNote(parentNote));
  };

  const handleCreateNote = () => {
    const newNote = {
      title: 'New Note',
      content: '',
      tags: [],
      parentId: undefined,
      children: [],
      level: 0
    };
    dispatch(createNote(newNote));
  };

  const handleEditNote = (note: Note) => {
    dispatch(editNote(note));
  };

  const handleToggleExpand = (noteId: string) => {
    dispatch(toggleNoteExpanded(noteId));
  };

  const handleEnsureExpanded = (noteId: string) => {
    dispatch(expandNote(noteId));
  };

  return (
    <div className="note-page">
      <div className="note-page-header">
        <button 
          className="back-btn"
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={20} />
          Back to All Notes
        </button>
        
        <div className="note-page-title">
          <h1 className="note-title">
            {currentNote.title}
          </h1>
          <div className="note-meta">
            <span className="note-level-badge">Level {currentNote.level}</span>
            {currentNote.parentId && (
              <span className="parent-note-info">
                Parent: {notes.find(n => n.id === currentNote.parentId)?.title || 'Unknown'}
              </span>
            )}
          </div>
        </div>

        <div className="view-toggle">
          <button
            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <List size={16} />
            List View
          </button>
          <button
            className={`toggle-btn ${viewMode === 'mindmap' ? 'active' : ''}`}
            onClick={() => setViewMode('mindmap')}
          >
            <Map size={16} />
            Mind Map
          </button>
        </div>
      </div>

      <div className="note-page-content">
        <div className="sidebar">
          <SearchBar 
            searchQuery={searchQuery} 
            onSearchChange={setSearchQuery} 
          />
          
          {viewMode === 'mindmap' ? (
            <MindMap
              notes={sidebarNotes}
              selectedNote={selectedNote}
              onSelectNote={handleNoteSelect}
              onDeleteNote={handleDeleteNote}
              onEditNote={handleEditNote}
              onCreateNote={handleCreateNote}
              onAddChildNote={handleAddChildNote}
              onNavigateToNote={handleNoteSelect}
              scrollTargetNote={scrollTargetNote}
            />
          ) : (
            <NoteList 
              notes={sidebarNotes}
              selectedNote={selectedNote}
              onDeleteNote={handleDeleteNote}
              onEditNote={handleEditNote}
              onAddChildNote={handleAddChildNote}
              onCreateNote={handleCreateNote}
              onSelectNote={handleNoteSelect}
              onNavigateToNote={handleNoteClick}
              showCreateButton={false}
              autoExpandParent={true}
              currentNoteId={currentNote.id}
              onToggleExpand={handleToggleExpand}
              onEnsureExpanded={handleEnsureExpanded}
              scrollTargetNote={scrollTargetNote}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default NotePage;
