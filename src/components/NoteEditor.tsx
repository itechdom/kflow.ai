import React, { useState, useEffect } from 'react';
import { Note } from '../types/Note';
import { Save, X, Edit, Sparkles } from 'lucide-react';
import AIGenerator from './AIGenerator';

interface NoteEditorProps {
  note: Note;
  notes: Note[];
  onSave: (note: Note) => void;
  onCancel: () => void;
  isEditing: boolean;
  onEditNote?: () => void;
  onGenerateNote?: (note: Note) => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  notes,
  onSave,
  onCancel,
  isEditing,
  onEditNote,
  onGenerateNote
}) => {
  const [editedNote, setEditedNote] = useState<Note>(note);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [tags, setTags] = useState<string[]>(note.tags || []);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    setEditedNote(note);
    setTitle(note.title);
    setContent(note.content);
  }, [note]);

  const handleSave = () => {
    const updatedNote: Note = {
      ...editedNote,
      title: title.trim() || 'Untitled Note',
      content: content.trim(),
      tags: tags,
      updatedAt: new Date()
    };
    onSave(updatedNote);
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const getNotePath = (note: Note): Note[] => {
    const path: Note[] = [];
    let currentNoteId: string | undefined = note.id;
    
    while (currentNoteId) {
      const currentNote = notes.find(n => n.id === currentNoteId);
      if (currentNote) {
        path.unshift(currentNote);
        currentNoteId = currentNote.parentId;
      } else {
        break;
      }
    }
    
    return path;
  };

  const handleCancel = () => {
    setTitle(note.title);
    setContent(note.content);
    onCancel();
  };

  if (!isEditing) {
    return (
      <div className="note-editor view-mode">
                 <div className="note-header">
           <h2>{note.title}</h2>
           {note.level > 0 && (
             <div className="note-breadcrumb">
               {getNotePath(note).slice(0, -1).map((pathNote, index) => (
                 <span key={pathNote.id} className="breadcrumb-item">
                   {pathNote.title}
                   {index < getNotePath(note).length - 2 && <span className="breadcrumb-separator"> › </span>}
                 </span>
               ))}
             </div>
           )}
           <div className="note-meta">
             <span>Created: {new Date(note.createdAt).toLocaleDateString()}</span>
             <span>Updated: {new Date(note.updatedAt).toLocaleDateString()}</span>
             <span className="note-level-badge">Level {note.level}</span>
             {note.parentId && (
               <span className="parent-note-info">
                 Parent: {notes.find(n => n.id === note.parentId)?.title || 'Unknown'}
               </span>
             )}
           </div>
           {onEditNote && (
             <button
               className="edit-btn"
               onClick={onEditNote}
             >
               <Edit size={16} />
               Edit
             </button>
           )}
         </div>
        <div className="note-content">
          {note.content ? (
            <div className="content-text">{note.content}</div>
          ) : (
            <div className="empty-content">
              <p>No content yet. Click edit to add some!</p>
            </div>
          )}
          
          {note.tags && note.tags.length > 0 && (
            <div className="note-tags">
              {note.tags.map(tag => (
                <span key={tag} className="tag">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="note-editor edit-mode">
      <div className="editor-header">
        <input
          type="text"
          className="title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title..."
          autoFocus
        />
        <div className="editor-actions">
          <button
            className="save-btn"
            onClick={handleSave}
            disabled={!title.trim()}
          >
            <Save size={16} />
            Save
          </button>
          <button className="cancel-btn" onClick={handleCancel}>
            <X size={16} />
            Cancel
          </button>
        </div>
      </div>
      
      <textarea
        className="content-textarea"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start writing your note..."
        rows={20}
      />
      
      <div className="tags-section">
        <h4>Tags</h4>
        <div className="tags-input">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={handleTagKeyPress}
            placeholder="Add a tag..."
            className="tag-input"
          />
          <button onClick={addTag} className="add-tag-btn">
            Add
          </button>
        </div>
        <div className="tags-display">
          {tags.map(tag => (
            <span key={tag} className="tag">
              #{tag}
              <button
                onClick={() => removeTag(tag)}
                className="remove-tag-btn"
                title="Remove tag"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {onGenerateNote && (
        <div className="ai-generator-section">
          <h4>
            <Sparkles size={16} />
            AI Content Generator
          </h4>
          <AIGenerator 
            onGenerateNote={(generatedNote) => {
              // Update the current note content with AI-generated content
              setContent(generatedNote.content);
              setTitle(generatedNote.title);
              setTags(generatedNote.tags || []);
            }} 
          />
        </div>
      )}
      
      <div className="editor-footer">
        <div className="note-info">
          <span>Last modified: {new Date(note.updatedAt).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;
