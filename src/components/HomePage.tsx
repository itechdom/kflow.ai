import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectNote, deleteNote, addChildNote, createNote, setSearchQuery, editNote, toggleNoteExpanded, expandNote } from '../store/noteSlice';
import NoteList from './NoteList';
import MindMap from './MindMap';
import SearchBar from './SearchBar';
import NoteEditor from './NoteEditor';
import { Note } from '../types/Note';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [viewMode, setViewMode] = useState<'mindmap' | 'list'>('list');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Get state from Redux
  const { notes, selectedNote, searchQuery } = useAppSelector(state => state.notes);

  const filteredNotes = notes.filter(note =>{
    return !note.parentId && (note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase()));
});

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
    setShowCreateModal(true);
  };

  const handleSearchChange = (query: string) => {
    dispatch(setSearchQuery(query));
  };

  const handleEditNote = (note: Note) => {
    // Inline edits should only update the store, not navigate
    dispatch(editNote(note));
  };

  const handleToggleExpand = (noteId: string) => {
    dispatch(toggleNoteExpanded(noteId));
  };

  const handleEnsureExpanded = (noteId: string) => {
    dispatch(expandNote(noteId));
  };

  const handleSaveNote = (newNote: Note) => {
    // Create the note in Redux
    dispatch(createNote(newNote));
    
    // Close the modal
    setShowCreateModal(false);
    
    // Navigate to the newly created note's page
    // The note will be created with a new ID, so we need to find it
    setTimeout(() => {
      const createdNote = notes.find(note => 
        note.title === newNote.title && 
        note.content === newNote.content &&
        note.tags.length === newNote.tags.length &&
        note.tags.every(tag => newNote.tags.includes(tag))
      );
      
      if (createdNote) {
        navigate(`/note/${createdNote.id}`);
      }
    }, 100);
  };

  const handleCancelCreate = () => {
    setShowCreateModal(false);
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
            <button className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>📝 List View</button>
            <button className={`toggle-btn ${viewMode === 'mindmap' ? 'active' : ''}`} onClick={() => setViewMode('mindmap')}>🗺️ Mind Map</button>
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
              showFullContent={false}
              onToggleExpand={handleToggleExpand}
              onEnsureExpanded={handleEnsureExpanded}
            />
          )}
        </div>
      </main>

      {/* Create Note Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={handleCancelCreate}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <NoteEditor
              onSave={handleSaveNote}
              onCancel={handleCancelCreate}
              isCreating={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
