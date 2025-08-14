import React, { useState } from 'react';
import { Note } from '../types/Note';
import { Trash2, Edit, Plus, ChevronRight, ChevronDown, Eye } from 'lucide-react';

interface NoteListProps {
  notes: Note[];
  selectedNote: Note | null;
  onSelectNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
  onEditNote: () => void;
  onAddChildNote: (parentNote: Note) => void;
  onCreateNote: () => void;
  onNavigateToNote?: (note: Note) => void;
}

const NoteList: React.FC<NoteListProps> = ({
  notes,
  selectedNote,
  onSelectNote,
  onDeleteNote,
  onEditNote,
  onAddChildNote,
  onCreateNote,
  onNavigateToNote
}) => {
  console.log("Notes",notes);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  const createNewNote = () => {
    onCreateNote();
  };

  const createChildNote = (parentNote: Note) => {
    onAddChildNote(parentNote);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const toggleExpanded = (noteId: string) => {
    const newExpanded = new Set(expandedNotes);
    if (newExpanded.has(noteId)) {
      newExpanded.delete(noteId);
    } else {
      newExpanded.add(noteId);
    }
    setExpandedNotes(newExpanded);
  };

  const getChildNotes = (noteId: string): Note[] => {
    return notesWithChildren.filter(note => note.parentId === noteId);
  };

  // Update children arrays for all notes
  const updateChildrenArrays = (notes: Note[]): Note[] => {
    return notes.map(note => ({
      ...note,
      children: notes.filter(n => n.parentId === note.id).map(n => n.id)
    }));
  };

  // Get notes with updated children arrays
  const notesWithChildren = updateChildrenArrays(notes);

  console.log("Notes with children",notesWithChildren);

  const getRootNotes = (): Note[] => {
    return notesWithChildren.filter(note => !note.parentId);
  };

    const renderNoteItem = (note: Note) => {
    const hasChildren = note.children && note.children.length > 0;
    const isExpanded = expandedNotes.has(note.id);
    const childNotes = getChildNotes(note.id);
    const displayDepth = note.level;

    return (
      <div
        key={note.id}
        className={`note-item ${selectedNote?.id === note.id ? 'selected' : ''}`}
        style={{ marginLeft: `${displayDepth * 20}px` }}
      >
        <div className="note-item-content">
          <div className="note-header-row">
            {hasChildren && (
              <button
                className="expand-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded(note.id);
                }}
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            )}
            <h4 className="note-title">{note.title}</h4>
            <span className="note-level">L{note.level}</span>
          </div>
          
          <p className="note-preview">
            {note.content.length > 100 
              ? `${note.content.substring(0, 100)}...` 
              : note.content || 'No content'
            }
          </p>
          
          <div className="note-meta">
            <span className="note-date">{formatDate(note.updatedAt)}</span>
            {note.tags.length > 0 && (
              <div className="note-tags">
                {note.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="tag">#{tag}</span>
                ))}
                {note.tags.length > 3 && <span className="more-tags">+{note.tags.length - 3}</span>}
              </div>
            )}
          </div>
        </div>
        
                 <div className="note-actions">
           <button
             className="action-btn add-child-btn"
             onClick={(e) => {
               e.stopPropagation();
               createChildNote(note);
             }}
             title="Add child note"
           >
             <Plus size={14} />
           </button>
           {onNavigateToNote && (
             <button
               className="action-btn view-btn"
               onClick={(e) => {
                 e.stopPropagation();
                 onNavigateToNote(note);
               }}
               title="View note page"
             >
               <Eye size={14} />
             </button>
           )}
           <button
             className="action-btn edit-btn"
             onClick={(e) => {
               e.stopPropagation();
               onSelectNote(note);
               onEditNote();
             }}
             title="Edit note"
           >
             <Edit size={14} />
           </button>
           <button
             className="action-btn delete-btn"
             onClick={(e) => {
               e.stopPropagation();
               onDeleteNote(note.id);
             }}
             title="Delete note"
           >
             <Trash2 size={14} />
           </button>
         </div>
        
        {hasChildren && isExpanded && (
          <div className="child-notes">
            {childNotes.map(childNote => renderNoteItem(childNote))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="note-list">
      <div className="note-list-header">
        <div className="header-info">
          <h3>Notes ({notes.length})</h3>
            <div className="level-stats">
             {Array.from(new Set(notesWithChildren.map(n => n.level))).sort().map(level => {
               const count = notesWithChildren.filter(n => n.level === level).length;
               return (
                 <span key={level} className="level-stat">
                   L{level}: {count}
                 </span>
               );
             })}
           </div>
        </div>
        <button 
          className="new-note-btn"
          onClick={createNewNote}
          title="Create new note"
        >
          <Plus size={16} />
        </button>
      </div>
      
      <div className="notes-container">
        {notes.length === 0 ? (
          <div className="empty-state">
            <p>No notes yet</p>
            <button 
              className="create-first-note-btn"
              onClick={createNewNote}
            >
              Create your first note
            </button>
          </div>
        ) : (
          getRootNotes().map(note => renderNoteItem(note))
        )}
      </div>
    </div>
  );
};

export default NoteList;
