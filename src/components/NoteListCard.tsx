import React from 'react';
import { Note } from '../types/Note';
import { Trash2, Plus, X } from 'lucide-react';

interface NoteListCardProps {
	note: Note;
	selectedNote: Note | null;
	editingState: { noteId: string; field: 'title' | 'content' | 'tags' } | null;
	editValues: { title: string; content: string; tags: string[] };
	newTag: string;
	noteRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
	titleInputRefs: React.MutableRefObject<Record<string, HTMLInputElement | null>>;
	contentTextareaRefs: React.MutableRefObject<Record<string, HTMLTextAreaElement | null>>;
	tagsContainerRef: React.MutableRefObject<HTMLDivElement | null>;
	showFullContent: boolean;
	onSelectNote: (note: Note) => void;
	onDeleteNote: (noteId: string) => void;
	onEditNote: (note: Note) => void;
	onAddChildNote: (parentNote: Note) => void;
	onNavigateToNote: (note: Note) => void;
	onToggleExpand: (noteId: string) => void;
	startEditing: (note: Note, field: 'title' | 'content' | 'tags') => void;
	cancelEdit: () => void;
	queueAutoSave: (note: Note, partial: Partial<Pick<Note, 'title' | 'content' | 'tags'>>) => void;
	handleAddTag: (note: Note) => void;
	handleRemoveTag: (note: Note, tagToRemove: string) => void;
	handleKeyPress: (e: React.KeyboardEvent, note: Note) => void;
	handleContentKeyDown: (e: React.KeyboardEvent, note: Note) => void;
	handleTagInputKeyDown: (e: React.KeyboardEvent, note: Note) => void;
	createChildNote: (parentNote: Note) => void;
	handleNoteDelete: (noteId: string) => void;
	formatDate: (date: Date) => string;
	getChildNotes: (noteId: string) => Note[];
	renderNoteItem: (note: Note) => React.ReactElement;
	setEditValues: React.Dispatch<React.SetStateAction<{ title: string; content: string; tags: string[] }>>;
	setNewTag: React.Dispatch<React.SetStateAction<string>>;
}

const NoteListCard: React.FC<NoteListCardProps> = ({
	note,
	selectedNote,
	editingState,
	editValues,
	newTag,
	noteRefs,
	titleInputRefs,
	contentTextareaRefs,
	tagsContainerRef,
	showFullContent,
	onSelectNote,
	onDeleteNote,
	onEditNote,
	onAddChildNote,
	onNavigateToNote,
	onToggleExpand,
	startEditing,
	cancelEdit,
	queueAutoSave,
	handleAddTag,
	handleRemoveTag,
	handleKeyPress,
	handleContentKeyDown,
	handleTagInputKeyDown,
	createChildNote,
	handleNoteDelete,
	formatDate,
	getChildNotes,
	renderNoteItem,
	setEditValues,
	setNewTag
}) => {
	const hasChildren = note.children && note.children.length > 0;
	const isExpanded = note.isExpanded;
	const childNotes = getChildNotes(note.id);
	const displayDepth = note.level;
	const isEditing = editingState?.noteId === note.id;
	const isEditingTitle = isEditing && editingState?.field === 'title';
	const isEditingContent = isEditing && editingState?.field === 'content';
	const isEditingTags = isEditing && editingState?.field === 'tags';
	const isNewChildNote = note.title === 'New Child Note' && note.content === 'Add your content here...';

	return (
		<div
			className={`note-item note-card ${selectedNote?.id === note.id ? 'selected' : ''} ${isNewChildNote ? 'new-child-note' : ''}`}
			ref={(el) => { noteRefs.current[note.id] = el; }}
			onClick={(e) => {
				e.stopPropagation();
				onSelectNote(note);
				if (!note.parentId) {
					onNavigateToNote(note);
				}
			}}
			style={{ 
				marginLeft: `${displayDepth * 20}px`,
				cursor: !note.parentId ? 'pointer' : 'default'
			}}
		>
			<div className="note-card-header">
				{isEditingTitle ? (
					<div className="inline-edit-container" onClick={(e) => e.stopPropagation()}>
						<input
							ref={(el) => { titleInputRefs.current[note.id] = el; }}
							type="text"
							className={`inline-edit-input title-input ${isNewChildNote ? 'new-child-note-input' : ''}`}
							value={editValues.title}
							onChange={(e) => {
								const newTitle = e.target.value;
								setEditValues({ ...editValues, title: newTitle });
								queueAutoSave(note, { title: newTitle });
							}}
							onBlur={() => cancelEdit()}
							autoFocus
							placeholder={isNewChildNote ? "Enter note title..." : "Enter title..."}
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									e.preventDefault();
									cancelEdit();
								} else if (e.key === 'Escape') {
									e.preventDefault();
									cancelEdit();
								}
							}}
						/>
					</div>
				) : (
					<h4 
						className="note-title clickable"
						onClick={(e) => { e.stopPropagation(); startEditing(note, 'title'); }}
						title="Click to edit title"
					>
						{note.title}
					</h4>
				)}
				<span className="note-level">L{note.level}</span>
			</div>
			<div className="note-card-content">
				{isEditingContent ? (
					<textarea
						className="inline-edit-textarea content-textarea"
						value={editValues.content}
						onChange={(e) => {
							const newContent = e.target.value;
							setEditValues({ ...editValues, content: newContent });
							queueAutoSave(note, { content: newContent });
						}}
						rows={4}
						onBlur={() => cancelEdit()}
						autoFocus
						ref={(el) => { 
							contentTextareaRefs.current[note.id] = el; 
						}}
						onKeyDown={(e) => handleContentKeyDown(e, note)}
						placeholder="Tab → tags, Shift+Tab → title"
					/>
				) : (
					<p 
						className="note-preview clickable"
						onClick={(e) => { e.stopPropagation(); startEditing(note, 'content'); }}
						title="Click to edit content"
					>
						{!showFullContent 
							? `${note.content.substring(0, 100)}...` 
							: note.content || 'No content'
						}
					</p>
				)}
			</div>
			<div className="note-card-meta">
				<span className="note-date">{formatDate(note.updatedAt)}</span>
				{isEditingTags ? (
					<div
						className="inline-edit-container tags-edit"
						ref={tagsContainerRef}
						onClick={(e) => e.stopPropagation()}
						onBlur={(e) => {
							const next = e.relatedTarget as Node | null;
							if (!next || (tagsContainerRef.current && !tagsContainerRef.current.contains(next))) {
								cancelEdit();
							}
						}}
					>
						<div className="tags-input-container">
							<input
								type="text"
								className="tag-input"
								value={newTag}
								onChange={(e) => {
									setNewTag(e.target.value);
									// Autosave on typing in tag input (saving current tags state)
									queueAutoSave(note, { tags: editValues.tags });
								}}
								onKeyPress={(e) => handleKeyPress(e, note)}
								onKeyDown={(e) => handleTagInputKeyDown(e, note)}
								placeholder="Add a tag..."
							/>
							<button
								className="add-tag-btn"
								onMouseDown={(e) => e.preventDefault()}
								onClick={() => handleAddTag(note)}
							>
								<Plus size={12} />
							</button>
						</div>
						<div className="tags-display">
							{editValues.tags.map(tag => (
								<span key={tag} className="tag">
									#{tag}
									<button
										className="remove-tag-btn"
										onMouseDown={(e) => e.preventDefault()}
										onClick={() => handleRemoveTag(note, tag)}
									>
										<X size={10} />
									</button>
								</span>
							))}
						</div>
					</div>
				) : (
					<div 
						className="note-tags clickable"
						onClick={(e) => { e.stopPropagation(); startEditing(note, 'tags'); }}
						title="Click to edit tags"
					>
						{note.tags.length > 0 ? (
							<>
								{note.tags.slice(0, 3).map(tag => (
									<span key={tag} className="tag">#{tag}</span>
								))}
								{note.tags.length > 3 && <span className="more-tags">+{note.tags.length - 3}</span>}
							</>
						) : (
							<span className="no-tags">Click to add tags</span>
						)}
					</div>
				)}
			</div>
			<div className="note-card-actions">
				<button
					className="action-btn delete-btn"
					onClick={(e) => {
						e.stopPropagation();
						handleNoteDelete(note.id);
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

export default NoteListCard;
