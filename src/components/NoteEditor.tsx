import React, { useState, useEffect, useCallback } from 'react';
import { Note } from '../types/Note';
import AIGenerator from './AIGenerator';
import { Save, Tag, Plus, X } from 'lucide-react';

interface NoteEditorProps {
  note: Note;
  notes: Note[];
  onSave: (updatedNote: Note) => void;
  onGenerateNote: (note: Note) => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  notes,
  onSave,
  onGenerateNote
}) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [tags, setTags] = useState<string[]>(note.tags);
  const [newTag, setNewTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());

  // Debounced save function
  const debouncedSave = useCallback(
    debounce((updatedNote: Note) => {
      setIsSaving(true);
      onSave(updatedNote);
      setLastSaved(new Date());
      setIsSaving(false);
    }, 1000), // Save after 1 second of inactivity
    [onSave]
  );

  // Update local state when note prop changes (only when note ID changes)
  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setTags(note.tags);
  }, [note.id]); // Only depend on note.id to prevent infinite re-renders

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    
    // Trigger auto-save when user types in title
    const updatedNote = {
      ...note,
      title: newTitle,
      content,
      tags,
      updatedAt: new Date()
    };
    debouncedSave(updatedNote);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    // Trigger auto-save when user types in content
    const updatedNote = {
      ...note,
      title,
      content: newContent,
      tags,
      updatedAt: new Date()
    };
    debouncedSave(updatedNote);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      setNewTag('');
      
      // Trigger auto-save when user adds a tag
      const updatedNote = {
        ...note,
        title,
        content,
        tags: updatedTags,
        updatedAt: new Date()
      };
      debouncedSave(updatedNote);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags);
    
    // Trigger auto-save when user removes a tag
    const updatedNote = {
      ...note,
      title,
      content,
      tags: updatedTags,
      updatedAt: new Date()
    };
    debouncedSave(updatedNote);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddTag();
    }
  };

  const getNotePath = (currentNoteId: string): string[] => {
    const path: string[] = [];
    let currentNote = notes.find(n => n.id === currentNoteId);
    
    if (!currentNote) {
      return path;
    }
    
    // Build the path from current note up to root
    for (let note = currentNote; note; ) {
      path.unshift(note.title);
      
      if (!note.parentId) {
        break;
      }
      
      const parentNote = notes.find(n => n.id === note.parentId);
      if (!parentNote) {
        break;
      }
      
      note = parentNote;
    }
    
    return path;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  // Debounce utility function
  function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  return (
    <div className="note-editor">
      <div className="editor-header">
        <div className="note-info">
          <div className="note-path">
            {getNotePath(note.id).map((title, index) => (
              <span key={index} className="path-segment">
                {title}
                {index < getNotePath(note.id).length - 1 && <span className="path-separator"> / </span>}
              </span>
            ))}
          </div>
          <div className="note-meta">
            <span className="note-level-badge">Level {note.level}</span>
            {note.parentId && (
              <span className="parent-note-info">
                Parent: {notes.find(n => n.id === note.parentId)?.title || 'Unknown'}
              </span>
            )}
            <span className="note-date">
              Last saved: {formatDate(lastSaved)}
              {isSaving && <span className="saving-indicator"> (Saving...)</span>}
            </span>
          </div>
        </div>
      </div>

      <div className="editor-content">
        <div className="title-section">
          <input
            type="text"
            className="note-title-input"
            value={title}
            onChange={handleTitleChange}
            placeholder="Note title..."
          />
        </div>

        <div className="content-section">
          <textarea
            className="note-content-textarea"
            value={content}
            onChange={handleContentChange}
            placeholder="Start writing your note..."
            rows={15}
          />
        </div>

        <div className="tags-section">
          <h4>Tags</h4>
          <div className="tags-input-container">
            <input
              type="text"
              className="tag-input"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add a tag..."
            />
            <button className="add-tag-btn" onClick={handleAddTag}>
              <Plus size={16} />
            </button>
          </div>
          <div className="tags-display">
            {tags.map(tag => (
              <span key={tag} className="tag">
                #{tag}
                <button
                  className="remove-tag-btn"
                  onClick={() => handleRemoveTag(tag)}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="ai-generator-section">
          <AIGenerator onGenerateNote={onGenerateNote} />
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;
