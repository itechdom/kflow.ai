import React from 'react';
import { Note } from '../types';
import MDEditor from '@uiw/react-md-editor';

interface NoteContentProps {
  note: Note;
  isEditing: boolean;
  editValues: { content: string };
  onContentChange: (value: string) => void;
  onStartEditing: (note: Note, field: 'title' | 'content' | 'tags') => void;
  onCancelEdit: () => void;
  onKeyDown: (e: React.KeyboardEvent, note: Note) => void;
  showFullContent?: boolean;
  className?: string;
  placeholder?: string;
  rows?: number;
  minHeight?: string;
}

const NoteContent: React.FC<NoteContentProps> = ({
  note,
  isEditing,
  editValues,
  onContentChange,
  onStartEditing,
  onCancelEdit,
  onKeyDown,
  showFullContent = false,
  className = '',
  placeholder = 'Tab → tags, Shift+Tab → title',
  rows = 4,
  minHeight = '100px'
}) => {
  const handleContentKeyDown = (e: React.KeyboardEvent) => {
    onKeyDown(e, note);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStartEditing(note, 'content');
  };

  if (isEditing) {
    return (
      <div className={`flex-1 ${className}`} onClick={(e) => e.stopPropagation()}>
        <div className="border-2 border-blue-500 rounded-md overflow-hidden">
          <MDEditor
            value={editValues.content}
            onChange={(value) => onContentChange(value || '')}
            height={parseInt(minHeight)}
            preview="edit"
            hideToolbar={false}
            autoFocus
            onBlur={onCancelEdit}
            onKeyDown={handleContentKeyDown}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded cursor-pointer transition-all duration-200 ${className}`}
      style={{ minHeight: '24px' }}
      onClick={handleClick}
      title="Click to edit content"
    >
      {!showFullContent ? (
        <MDEditor.Markdown 
          source={note.content.substring(0, 100) + '...'} 
          className="text-sm"
        />
      ) : (
        <MDEditor.Markdown 
          source={note.content || 'No content'} 
          className="text-sm"
        />
      )}
    </div>
  );
};

export default NoteContent;
