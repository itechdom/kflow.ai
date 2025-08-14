import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NoteList from './NoteList';
import MindMap from './MindMap';
import SearchBar from './SearchBar';
import AIGenerator from './AIGenerator';
import NoteEditor from './NoteEditor';
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
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
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
  onSearchChange,
  isEditing,
  setIsEditing
}) => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'mindmap' | 'list'>('mindmap');

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNoteClick = (note: Note) => {
    console.log("NOTE CLicked", note);
    navigate(`/note/${note.id}`);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>KFlow</h1>
        <p>Knowledge Management & AI-Powered Notes</p>
      </header>
      
      <main className="App-main">
        <div className="sidebar">
          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === 'mindmap' ? 'active' : ''}`}
              onClick={() => setViewMode('mindmap')}
            >
              🗺️ Mind Map
            </button>
            <button
              className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              📝 List View
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
              onSelectNote={handleNoteClick}
              onDeleteNote={onDeleteNote}
              onEditNote={() => setIsEditing(true)}
              onCreateNote={onCreateNote}
              onAddChildNote={onAddChildNote}
            />
          ) : (
            <NoteList 
              notes={filteredNotes}
              selectedNote={selectedNote}
              onSelectNote={handleNoteClick}
              onDeleteNote={onDeleteNote}
              onEditNote={() => setIsEditing(true)}
              onAddChildNote={onAddChildNote}
              onCreateNote={onCreateNote}
            />
          )}
        </div>
        
        <div className="content">
          {selectedNote ? (
            <NoteEditor
              note={selectedNote}
              notes={notes}
              onSave={onUpdateNote}
              onCancel={() => setIsEditing(false)}
              isEditing={isEditing}
            />
          ) : (
            <div className="welcome-message">
              <h2>Welcome to KFlow</h2>
              <p>Create your first note or use AI to generate content!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
