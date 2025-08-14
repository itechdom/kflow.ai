import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectNote, deleteNote, addChildNote, createNote, setSearchQuery } from '../store/noteSlice';
import NoteList from './NoteList';
import MindMap from './MindMap';
import SearchBar from './SearchBar';
import { Note } from '../types/Note';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [viewMode, setViewMode] = useState<'mindmap' | 'list'>('list');
  
  // Get state from Redux
  const { notes, selectedNote, searchQuery } = useAppSelector(state => state.notes);

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNoteClick = (note: Note) => {
    // First select the note to ensure it's properly set in state
    dispatch(selectNote(note));
    // Then navigate to the note page
    navigate(`/note/${note.id}`);
  };

  const handleSelectNote = (note: Note) => {
    dispatch(selectNote(note));
  };

  const handleDeleteNote = (noteId: string) => {
    dispatch(deleteNote(noteId));
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

  const handleSearchChange = (query: string) => {
    dispatch(setSearchQuery(query));
  };

  const handleEditNote = (note: Note) => {
    // When edit button is clicked, navigate to the note page
    handleNoteClick(note);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>KFlow</h1>
        <p>Knowledge Management & AI-Powered Notes</p>
      </header>
      
      <main className="App-main">
        <div className="full-width-content">
          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              📝 List View
            </button>
            <button
              className={`toggle-btn ${viewMode === 'mindmap' ? 'active' : ''}`}
              onClick={() => setViewMode('mindmap')}
            >
              🗺️ Mind Map
            </button>
          </div>
          
          <SearchBar 
            searchQuery={searchQuery} 
            onSearchChange={handleSearchChange} 
          />          
          {viewMode === 'mindmap' ? (
            <MindMap
              notes={filteredNotes}
              selectedNote={selectedNote}
              onSelectNote={handleSelectNote}
              onDeleteNote={handleDeleteNote}
              onEditNote={handleEditNote}
              onCreateNote={handleCreateNote}
              onAddChildNote={handleAddChildNote}
              onNavigateToNote={handleNoteClick}
            />
          ) : (
            <NoteList 
              notes={filteredNotes}
              selectedNote={selectedNote}
              onSelectNote={handleSelectNote}
              onDeleteNote={handleDeleteNote}
              onEditNote={handleEditNote}
              onAddChildNote={handleAddChildNote}
              onCreateNote={handleCreateNote}
              onNavigateToNote={handleNoteClick}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
