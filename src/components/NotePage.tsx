import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Note } from '../types/Note';
import NoteList from './NoteList';
import MindMap from './MindMap';
import NoteEditor from './NoteEditor';
import SearchBar from './SearchBar';
import { ArrowLeft, List, Map } from 'lucide-react';

interface NotePageProps {
  notes: Note[];
  selectedNote: Note | null;
  onSelectNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
  onEditNote: () => void;
  onAddChildNote: (parentNote: Note) => void;
  onCreateNote: () => void;
  onUpdateNote: (note: Note) => void;
}

const NotePage: React.FC<NotePageProps> = ({
  notes,
  selectedNote,
  onSelectNote,
  onDeleteNote,
  onEditNote,
  onAddChildNote,
  onCreateNote,
  onUpdateNote
}) => {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'mindmap'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Find the current note
  const currentNote = notes.find(note => note.id === noteId);
  
  // Filter notes based on search query
  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sync editing state when selectedNote changes
  useEffect(() => {
    if (currentNote && selectedNote && selectedNote.id === currentNote.id) {
      // If the current note is selected, allow editing
      setIsEditing(true);
    } else if (currentNote && selectedNote && selectedNote.id !== currentNote.id) {
      // If a different note is selected, don't edit the current note
      setIsEditing(false);
    }
  }, [selectedNote, currentNote]);

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

  const handleEditNote = () => {
    setIsEditing(true);
    // Also select the current note for editing
    onSelectNote(currentNote);
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      // If currently editing, exit edit mode
      setIsEditing(false);
    } else {
      // If not editing, enter edit mode
      setIsEditing(true);
      onSelectNote(currentNote);
    }
  };

  const handleSaveNote = (updatedNote: Note) => {
    onUpdateNote(updatedNote);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleNoteClick = (note: Note) => {
    navigate(`/note/${note.id}`);
  };

  const handleNoteSelect = (note: Note) => {
    onSelectNote(note);
    // If selecting a different note, set editing to false
    if (note.id !== currentNote.id) {
      setIsEditing(false);
    }
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
           <h1 
             className="clickable-title"
             onClick={() => handleNoteSelect(currentNote)}
             title="Click to edit this note"
           >
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
               notes={filteredNotes}
               selectedNote={selectedNote}
               onSelectNote={handleNoteSelect}
               onDeleteNote={onDeleteNote}
               onEditNote={handleEditNote}
               onCreateNote={onCreateNote}
               onAddChildNote={onAddChildNote}
             />
           ) : (
             <NoteList 
               notes={filteredNotes}
               selectedNote={selectedNote}
               onDeleteNote={onDeleteNote}
               onEditNote={handleEditNote}
               onAddChildNote={onAddChildNote}
               onCreateNote={onCreateNote}
               onSelectNote={handleNoteSelect}
               onNavigateToNote={handleNoteClick}
             />
           )}
        </div>
        
        <div className="content">
          {selectedNote ? (
                         <NoteEditor
               note={selectedNote}
               notes={notes}
               onSave={handleSaveNote}
               onCancel={handleCancelEdit}
               isEditing={isEditing}
               onEditNote={handleToggleEdit}
               onGenerateNote={onCreateNote}
             />
          ) : (
            <div className="welcome-message">
              <h2>Welcome to {currentNote.title}</h2>
              <p>Select a note from the sidebar to view or edit it.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotePage;
