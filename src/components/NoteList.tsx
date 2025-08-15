import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Note } from '../types/Note';
import { Trash2, Plus, ChevronRight, ChevronDown, X } from 'lucide-react';
import AIGenerator from './AIGenerator';

interface NoteListProps {
	notes: Note[];
	selectedNote: Note | null;
	onSelectNote: (note: Note) => void;
	onDeleteNote: (noteId: string) => void;
	onEditNote: (note: Note) => void;
	onAddChildNote: (parentNote: Note) => void;
	onCreateNote: () => void;
	onNavigateToNote: (note: Note) => void;
	showCreateButton?: boolean;
	autoExpandParent?: boolean;
	currentNoteId?: string;
}

interface EditingState {
	noteId: string;
	field: 'title' | 'content' | 'tags';
}

const NoteList: React.FC<NoteListProps> = ({
	notes,
	selectedNote,
	onSelectNote,
	onDeleteNote,
	onEditNote,
	onAddChildNote,
	onCreateNote,
	onNavigateToNote,
	showCreateButton = true,
	autoExpandParent = false,
	currentNoteId
}) => {
	const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
	const [editingState, setEditingState] = useState<EditingState | null>(null);
	const [editValues, setEditValues] = useState<{ title: string; content: string; tags: string[] }>({
		title: '',
		content: '',
		tags: []
	});
	const [newTag, setNewTag] = useState('');

	// Debounced autosave timer
	const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const tagsContainerRef = useRef<HTMLDivElement | null>(null);
	const queueAutoSave = useCallback((note: Note, partial: Partial<Pick<Note, 'title' | 'content' | 'tags'>>) => {
		const updatedNote: Note = {
			...note,
			title: partial.title !== undefined ? partial.title : editValues.title,
			content: partial.content !== undefined ? partial.content : editValues.content,
			tags: partial.tags !== undefined ? partial.tags : editValues.tags,
			updatedAt: new Date()
		};

		if (autoSaveTimerRef.current) {
			clearTimeout(autoSaveTimerRef.current);
		}
		autoSaveTimerRef.current = setTimeout(() => {
			onEditNote(updatedNote);
		}, 600);
	}, [editValues.title, editValues.content, editValues.tags, onEditNote]);

	// Auto-expand parent note when child is selected
	useEffect(() => {
		if (autoExpandParent && currentNoteId && selectedNote) {
			const currentNote = notes.find(note => note.id === currentNoteId);
			if (currentNote && currentNote.parentId) {
				// Auto-expand the parent note
				setExpandedNotes(prev => new Set([...Array.from(prev), currentNote.parentId!]));
			}
		}
	}, [autoExpandParent, currentNoteId, selectedNote, notes]);

	const createNewNote = () => {
		onCreateNote();
	};

	const createChildNote = (parentNote: Note) => {
		// Automatically expand the parent note to show the new child
		if (!expandedNotes.has(parentNote.id)) {
			const newExpanded = new Set(expandedNotes);
			newExpanded.add(parentNote.id);
			setExpandedNotes(newExpanded);
		}
		
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

	const getRootNotes = (): Note[] => {
		return notesWithChildren.filter(note => !note.parentId);
	};

	const handleNoteSelect = (note: Note) => {
		onSelectNote(note);
	};

	const handleNoteDelete = (noteId: string) => {
		onDeleteNote(noteId);
	};

	const handleNoteEdit = (note: Note) => {
		onEditNote(note);
	};

	const handleNoteView = (note: Note) => {
		onNavigateToNote(note);
	};

	// Inline editing functions
	const startEditing = (note: Note, field: 'title' | 'content' | 'tags') => {
		setEditingState({ noteId: note.id, field });
		setEditValues({
			title: note.title,
			content: note.content,
			tags: [...note.tags]
		});
	};

	const saveEdit = (note: Note) => {
		if (editingState) {
			const updatedNote = {
				...note,
				title: editValues.title,
				content: editValues.content,
				tags: editValues.tags,
				updatedAt: new Date()
			};
			onEditNote(updatedNote);
			setEditingState(null);
		}
	};

	const cancelEdit = () => {
		setEditingState(null);
	};

	const handleAddTag = (note: Note) => {
		if (newTag.trim() && !editValues.tags.includes(newTag.trim())) {
			const updatedTags = [...editValues.tags, newTag.trim()];
			setEditValues({ ...editValues, tags: updatedTags });
			setNewTag('');
			// Do not autosave here; only autosave on typing per requirement
		}
	};

	const handleRemoveTag = (note: Note, tagToRemove: string) => {
		const updatedTags = editValues.tags.filter(tag => tag !== tagToRemove);
		setEditValues({ ...editValues, tags: updatedTags });
		// Do not autosave here; only autosave on typing per requirement
	};

	const handleKeyPress = (e: React.KeyboardEvent, note: Note) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleAddTag(note);
		}
	};

	const handleGenerateNote = (generatedNote: Note) => {
		if (selectedNote) {
			const updatedNote = {
				...selectedNote,
				title: generatedNote.title,
				content: generatedNote.content,
				tags: generatedNote.tags,
				updatedAt: new Date()
			};
			onEditNote(updatedNote);
		}
	};

	const renderNoteItem = (note: Note) => {
		const hasChildren = note.children && note.children.length > 0;
		const isExpanded = expandedNotes.has(note.id);
		const childNotes = getChildNotes(note.id);
		const displayDepth = note.level;
		const isEditing = editingState?.noteId === note.id;
		const isEditingTitle = isEditing && editingState?.field === 'title';
		const isEditingContent = isEditing && editingState?.field === 'content';
		const isEditingTags = isEditing && editingState?.field === 'tags';

		return (
			<div
				key={note.id}
				className={`note-item ${selectedNote?.id === note.id ? 'selected' : ''}`}
				onClick={() => {
					// Only navigate if it's a root note (no parent)
					if (!note.parentId) {
						onNavigateToNote(note);
					}
				}}
				style={{ 
					marginLeft: `${displayDepth * 20}px`,
					cursor: !note.parentId ? 'pointer' : 'default'
				}}
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
						
						{isEditingTitle ? (
							<div className="inline-edit-container" onClick={(e) => e.stopPropagation()}>
								<input
									type="text"
									className="inline-edit-input title-input"
									value={editValues.title}
									onChange={(e) => {
										const newTitle = e.target.value;
										setEditValues({ ...editValues, title: newTitle });
										queueAutoSave(note, { title: newTitle });
									}}
									onBlur={() => cancelEdit()}
									autoFocus
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
					
					{isEditingContent ? (
						<div className="inline-edit-container" onClick={(e) => e.stopPropagation()}>
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
							/>
						</div>
					) : (
						<p 
							className="note-preview clickable"
							onClick={(e) => { e.stopPropagation(); startEditing(note, 'content'); }}
							title="Click to edit content"
						>
							{note.content.length > 100 
								? `${note.content.substring(0, 100)}...` 
								: note.content || 'No content'
							}
						</p>
					)}
					
					<div className="note-meta">
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
				{showCreateButton && (
					<button 
						className="new-note-btn"
						onClick={createNewNote}
						title="Create new note"
					>
						<Plus size={16} />
					</button>
				)}
			</div>
			
			<div className="notes-container">
				{notes.length === 0 ? (
					<div className="empty-state">
						<p>No notes yet</p>
						{showCreateButton && (
							<button 
								className="create-first-note-btn"
								onClick={createNewNote}
							>
								Create your first note
							</button>
						)}
					</div>
				) : (
					getRootNotes().map(note => renderNoteItem(note))
				)}
			</div>

			{/* AI Generator for the selected note */}
			{selectedNote && (
				<div className="ai-generator-section">
					<AIGenerator onGenerateNote={handleGenerateNote} />
				</div>
			)}
		</div>
	);
};

export default NoteList;
