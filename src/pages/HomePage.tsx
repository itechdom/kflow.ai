import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { selectNote, deleteNote, addChildNote, createNote, setSearchQuery, editNote, toggleNoteExpanded, expandNote } from '../features/notes/noteSlice';
import SearchBar from '../components/SearchBar';
import NoteList from '../features/notes/components/NoteList';
import Modal from '../components/Modal';
import NoteForm from '../features/notes/components/NoteForm';
import { UserProfile } from '../features/auth';
import { Note } from '../features/notes/types';
import { useHomeNotes } from '../features/notes';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [showCreateModal, setShowCreateModal] = useState(false);
  // Get state from Redux
  const { notes, selectedNote, searchQuery } = useAppSelector(state => state.notes);

  const filteredNotes = useHomeNotes(searchQuery);

  const handleNoteClick = (note: Note) => {
    // First select the note to ensure it's properly set in state
    dispatch(selectNote(note));
    // Then navigate to the note page
    if(!note.parentId){
      navigate(`/note/${note.id}`);
    }
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

  const handleSaveNote = (noteData: Partial<Note>) => {
    // Create a complete note object from the partial data
    const newNote: Omit<Note, "id" | "createdAt" | "updatedAt" | "isExpanded"> = {
      title: noteData.title || '',
      content: noteData.content || '',
      tags: noteData.tags || [],
      parentId: noteData.parentId,
      children: noteData.children || [],
      level: noteData.level || 0
    };

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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">KFlow</h1>
              <p className="text-indigo-100 text-lg">Knowledge Management & AI-Powered Notes</p>
            </div>
            <UserProfile />
          </div>
        </div>
      </header>

      <main className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            notes={notes}
            onSelectSuggestion={(note) => {
              handleNoteClick(note);
            }}
          />          
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
            displayMode={'card'}
          />
        </div>
      </main>

      {/* Create Note Modal */}
      <Modal 
        isOpen={showCreateModal}
        onClose={handleCancelCreate}
        title="Create New Note"
        size="extra-large"
      >
        <NoteForm
          onSave={handleSaveNote}
          onCancel={handleCancelCreate}
          isCreating={true}
        />
      </Modal>
    </div>
  );
};

export default HomePage;
