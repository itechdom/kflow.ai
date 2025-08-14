import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NoteList from './NoteList';
import MindMap from './MindMap';
import SearchBar from './SearchBar';
import { Note } from '../types/Note';

interface HomePageProps {
  notes: Note[];
  selectedNote: Note | null;
  onSelectNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
  onEditNote: () => void;
  onAddChildNote: (parentNote: Note) => void;
  onCreateNote: () => void;
  onUpdateNote: (note: Note) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({
  notes,
  selectedNote,
  onSelectNote,
  onDeleteNote,
  onEditNote,
  onAddChildNote,
  onCreateNote,
  onUpdateNote,
  searchQuery,
  onSearchChange
}) => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'mindmap' | 'list'>('list');

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNoteClick = (note: Note) => {
    // First select the note to ensure it's properly set in state
    onSelectNote(note);
    // Then navigate to the note page
    navigate(`/note/${note.id}`);
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
            onSearchChange={onSearchChange} 
          />          
          {viewMode === 'mindmap' ? (
            <MindMap
              notes={filteredNotes}
              selectedNote={selectedNote}
              onSelectNote={onSelectNote}
              onDeleteNote={onDeleteNote}
              onEditNote={(note) => {
                // When edit button is clicked, select the note and navigate to its page
                onSelectNote(note);
                handleNoteClick(note);
              }}
              onCreateNote={onCreateNote}
              onAddChildNote={onAddChildNote}
              onNavigateToNote={handleNoteClick}
            />
          ) : (
            <NoteList 
              notes={filteredNotes}
              selectedNote={selectedNote}
              onSelectNote={onSelectNote}
              onDeleteNote={onDeleteNote}
              onEditNote={(note) => {
                // When edit button is clicked, select the note and navigate to its page
                onSelectNote(note);
                handleNoteClick(note);
              }}
              onAddChildNote={onAddChildNote}
              onCreateNote={onCreateNote}
              onNavigateToNote={handleNoteClick}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
