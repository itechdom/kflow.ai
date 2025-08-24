import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { selectNote, deleteNote, addChildNote, createNote, editNote, toggleNoteExpanded, expandNote } from '../features/notes/noteSlice';
import { Note } from '../features/notes/types';
import { ArrowLeft, List, Map } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import NoteList from '../features/notes/components/NoteList';
import MindMap from '../features/notes/components/MindMap';
import { UserProfile } from '../features/auth';

const NotePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [viewMode, setViewMode] = useState<'list' | 'mindmap'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [scrollTargetNote, setScrollTargetNote] = useState<Note>();
  
  // Get state from Redux
  const { notes, selectedNote } = useAppSelector(state => state.notes);

  // Find the current note
  const currentNote = notes.find(note => note.id === id);
  
  // When searching in NotePage sidebar, if a unique match is found within the sidebar set,
  // ensure it is expanded (and its ancestors), scroll to it, and select it
  useEffect(() => {
    if (!searchQuery.trim()){
      setScrollTargetNote(undefined);
      return;
    };
    // Consider matches within the sidebar scope
    const sidebarIds = new Set(sidebarNotes.map(n => n.id));
    const matches = notes.filter(n => sidebarIds.has(n.id) && (
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
    ));
    if (matches.length > 1){
      setScrollTargetNote(matches[0]);
      return;
    }
    else if(matches.length === 0){
      setScrollTargetNote(undefined);
      return;
    }
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

  const onSetScrollTargetNote = (note: Note | undefined) => {
    setScrollTargetNote(note);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <button 
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              onClick={() => navigate('/')}
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to All Notes
            </button>
            
            <div className="flex-1 text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {currentNote.title}
              </h1>
              <div className="flex items-center justify-center gap-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                  Level {currentNote.level}
                </span>
                {currentNote.parentId && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    Parent: {notes.find(n => n.id === currentNote.parentId)?.title || 'Unknown'}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setViewMode('list')}
                >
                  <List size={16} className="mr-2" />
                  List View
                </button>
                <button
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    viewMode === 'mindmap' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setViewMode('mindmap')}
                >
                  <Map size={16} className="mr-2" />
                  Mind Map
                </button>
              </div>
              
              <UserProfile />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <SearchBar 
            searchQuery={searchQuery} 
            onSearchChange={setSearchQuery}
            notes={sidebarNotes}
            onSelectSuggestion={(note) => {
              // Navigate to the selected note
              handleNoteSelect(note);
              setScrollTargetNote(note);
            }}
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
              onSetScrollTargetNote={onSetScrollTargetNote}
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
