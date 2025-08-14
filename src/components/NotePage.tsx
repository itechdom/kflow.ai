import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectNote, deleteNote, addChildNote, createNote, editNote } from '../store/noteSlice';
import { Note } from '../types/Note';
import NoteList from './NoteList';
import MindMap from './MindMap';
import NoteEditor from './NoteEditor';
import SearchBar from './SearchBar';
import { ArrowLeft, List, Map } from 'lucide-react';

const NotePage: React.FC = () => {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [viewMode, setViewMode] = useState<'list' | 'mindmap'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get state from Redux
  const { notes, selectedNote } = useAppSelector(state => state.notes);

  // Find the current note
  const currentNote = notes.find(note => note.id === noteId);
   
  // Filter notes based on search query
  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get notes to display in sidebar - only the selected note and its children
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
    
    // Add the full path from root to selected note
    addParentPath(selectedNote.id);
    
    // Then add all children of the selected note
    const addChildren = (parentId: string) => {
      const children = notes.filter(note => note.parentId === parentId);
      children.forEach(child => {
        notesToShow.push(child);
        addChildren(child.id); // Recursively add grandchildren
      });
    };
    
    addChildren(selectedNote.id);
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

  const handleSaveNote = (updatedNote: Note) => {
    dispatch(editNote(updatedNote));
  };

  const handleNoteClick = (note: Note) => {
    dispatch(selectNote(note));
    navigate(`/note/${note.id}`);
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

  const handleGenerateNote = (generatedNote: Note) => {
    // Update the current note with AI-generated content
    const updatedNote = {
      ...currentNote,
      title: generatedNote.title,
      content: generatedNote.content,
      tags: generatedNote.tags,
      updatedAt: new Date()
    };
    dispatch(editNote(updatedNote));
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
              onEditNote={handleNoteClick}
              onCreateNote={handleCreateNote}
              onAddChildNote={handleAddChildNote}
              onNavigateToNote={handleNoteClick}
            />
          ) : (
            <NoteList 
              notes={sidebarNotes}
              selectedNote={selectedNote}
              onDeleteNote={handleDeleteNote}
              onEditNote={handleNoteClick}
              onAddChildNote={handleAddChildNote}
              onCreateNote={handleCreateNote}
              onSelectNote={handleNoteSelect}
              onNavigateToNote={handleNoteClick}
              showCreateButton={false}
            />
          )}
        </div>
        
        <div className="content">
          <NoteEditor
            note={selectedNote || currentNote}
            notes={notes}
            onSave={handleSaveNote}
            onGenerateNote={handleGenerateNote}
          />
        </div>
      </div>
    </div>
  );
};

export default NotePage;
