import React, { useState, useEffect } from 'react';
import { Note } from '../Note';
import { Save, Tag, Plus, X } from 'lucide-react';
import AIGenerator from './AIGenerator';

interface NoteFormProps {
  note?: Note;
  onSave: (note: Partial<Note>) => void;
  onCancel: () => void;
  isCreating?: boolean;
}

const NoteForm: React.FC<NoteFormProps> = ({
  note,
  onSave,
  onCancel,
  isCreating = true
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  // Initialize form with note data if editing
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setTags([...note.tags]);
    }
  }, [note]);

  // Handle AI-generated content filling the form
  const handleAIFillForm = (data: { title: string; content: string; tags: string[] }) => {
    setTitle(data.title);
    setContent(data.content);
    setTags(data.tags);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Please enter a title for the note');
      return;
    }

    const noteData: Partial<Note> = {
      title: title.trim(),
      content: content.trim(),
      tags: tags,
      updatedAt: new Date()
    };

    if (isCreating) {
      noteData.createdAt = new Date();
      noteData.level = 0;
      noteData.isExpanded = true;
    }

    onSave(noteData);
  };

  return (
    <div className="note-form-container">
      {/* AI Generator Section */}
      <div className="ai-generator-section">
        <AIGenerator onFillForm={handleAIFillForm} />
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="note-form">
        <div className="form-group">
          <label htmlFor="note-title">Title:</label>
          <input
            id="note-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-input"
            placeholder="Enter note title..."
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label htmlFor="note-content">Content:</label>
          <textarea
            id="note-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onScroll={e => e.stopPropagation()}
            className="form-textarea"
            rows={8}
            placeholder="Enter note content..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="note-tags">Tags:</label>
          <div className="tags-input-container">
            <input
              type="text"
              className="tag-input"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add a tag..."
            />
            <button
              type="button"
              className="add-tag-btn"
              onClick={handleAddTag}
            >
              <Plus size={12} />
            </button>
          </div>
          <div className="tags-display">
            {tags.map(tag => (
              <span key={tag} className="tag">
                #{tag}
                <button
                  type="button"
                  className="remove-tag-btn"
                  onClick={() => handleRemoveTag(tag)}
                >
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
          >
            {isCreating ? 'Create Note' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NoteForm;
