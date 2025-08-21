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
	showFullContent?: boolean;
	autoExpandParent?: boolean;
	currentNoteId?: string;
	onToggleExpand: (noteId: string) => void;
	onEnsureExpanded?: (noteId: string) => void;
	scrollTargetNote?: Note;
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
	showFullContent = true,
	autoExpandParent = false,
	currentNoteId,
	onToggleExpand,
	onEnsureExpanded,
	scrollTargetNote
}) => {
	const [editingState, setEditingState] = useState<EditingState | null>(null);
	const [editValues, setEditValues] = useState<{ title: string; content: string; tags: string[] }>({
		title: '',
		content: '',
		tags: []
	});
	const [newTag, setNewTag] = useState('');
	const [autoEditNoteId, setAutoEditNoteId] = useState<string | null>(null);
	const noteRefs = useRef<Record<string, HTMLDivElement | null>>({});
	const titleInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
	const contentTextareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});
	const tagsContainerRef = useRef<HTMLDivElement | null>(null);
	const queueAutoSave = useCallback((note: Note, partial: Partial<Pick<Note, 'title' | 'content' | 'tags'>>) => {
		const updatedNote: Note = {
			...note,
			title: partial.title !== undefined ? partial.title : editValues.title,
			content: partial.content !== undefined ? partial.content : editValues.content,
			tags: partial.tags !== undefined ? partial.tags : editValues.tags,
			updatedAt: new Date()
		};
		onEditNote(updatedNote);
	}, [editValues.title, editValues.content, editValues.tags, onEditNote]);

	// Auto-expand parent note when child is selected
	useEffect(() => {
		if (autoExpandParent && currentNoteId && selectedNote) {
			const currentNote = notes.find(note => note.id === currentNoteId);
			if (currentNote && currentNote.parentId) {
				onEnsureExpanded && onEnsureExpanded(currentNote.parentId);
			}
		}
	}, [autoExpandParent, currentNoteId, selectedNote, notes, onEnsureExpanded]);

	// Scroll to target note id when requested
	useEffect(() => {
		if (!scrollTargetNote) return;
		const el = noteRefs.current[scrollTargetNote.id];
		if (el) {
			el.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
	}, [scrollTargetNote]);

	// Auto-edit newly created child notes
	useEffect(() => {
		if (autoEditNoteId) {
			const parentNote = notes.find(note => note.id === autoEditNoteId);
			if (parentNote && parentNote.children && parentNote.children.length > 0) {
				// Find the most recently created child note (last in children array)
				const lastChildId = parentNote.children[parentNote.children.length - 1];
				const childNote = notes.find(note => note.id === lastChildId);
				if (childNote && childNote.title === 'New Child Note') {
					// Auto-start editing the title of this new child note
					setTimeout(() => {
						startEditing(childNote, 'title');
						setAutoEditNoteId(null); // Reset after starting edit
					}, 150); // Small delay to ensure the note is rendered and ref is set
				}
			}
		}
	}, [notes, autoEditNoteId]);

	const createNewNote = () => {
		onCreateNote();
	};

	const createChildNote = (parentNote: Note) => {
		// Ensure parent is expanded and saved
		onEnsureExpanded && onEnsureExpanded(parentNote.id);
		onAddChildNote(parentNote);
		setAutoEditNoteId(parentNote.id);
	};

	const formatDate = (date: Date) => {
		return new Date(date).toLocaleDateString();
	};

	const toggleExpanded = (noteId: string) => {
		onToggleExpand(noteId);
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

	const handleNoteDelete = (noteId: string) => {
		onDeleteNote(noteId);
	};

	// Inline editing functions
	const startEditing = (note: Note, field: 'title' | 'content' | 'tags') => {
		setEditingState({ noteId: note.id, field });
		setEditValues({
			title: note.title,
			content: note.content,
			tags: [...note.tags]
		});

		// Auto-focus title input for newly created child notes
		if (field === 'title' && note.title === 'New Child Note') {
			setTimeout(() => {
				if (titleInputRefs.current[note.id]) {
					titleInputRefs.current[note.id]?.focus();
					titleInputRefs.current[note.id]?.select(); // Select all text for easy replacement
				}
			}, 50);
		}
		else if(field === 'content' && note.content === 'Add your content here...'){
			setTimeout(() => {
				if(contentTextareaRefs.current[note.id]){
					contentTextareaRefs.current[note.id]?.focus();
					contentTextareaRefs.current[note.id]?.select(); // Select all text for easy replacement
				}
			},50);
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

	const handleTitleKeyDown = (e: React.KeyboardEvent, note: Note) => {
		if (e.key === 'Tab') {
			e.preventDefault();
			if (e.shiftKey) {
				// Shift+Tab: close edit mode (no previous field)
				cancelEdit();
			} else {
				// Tab: start editing content field
				startEditing(note, 'content');
			}
		}
	};

	const handleContentKeyDown = (e: React.KeyboardEvent, note: Note) => {
		if (e.key === 'Tab') {
			e.preventDefault();
			if (e.shiftKey) {
				// Shift+Tab: go back to title field
				startEditing(note, 'title');
			} else {
				// Tab: start editing tags field
				startEditing(note, 'tags');
			}
		}
	};

	const handleTagInputKeyDown = (e: React.KeyboardEvent, note: Note) => {
		if (e.key === 'Tab') {
			e.preventDefault();
			if (e.shiftKey) {
				// Shift+Tab: go back to content field
				startEditing(note, 'content');
			} else {
				// Tab: close edit mode (end of navigation cycle)
				cancelEdit();
			}
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
				key={note.id}
				className={`note-item ${selectedNote?.id === note.id ? 'selected' : ''} ${isNewChildNote ? 'new-child-note' : ''}`}
				ref={(el) => { noteRefs.current[note.id] = el; }}
				onClick={(e) => {
					e.stopPropagation();
					// Only navigate if it's a root note (no parent)
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
									placeholder={isNewChildNote ? "Enter note title... (Tab → content)" : "Tab → content"}
									onKeyDown={(e) => {
										handleTitleKeyDown(e, note);
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
								ref={(el) => { 
									contentTextareaRefs.current[note.id] = el; 
								}}
								onKeyDown={(e) => handleContentKeyDown(e, note)}
								placeholder="Tab → tags, Shift+Tab → title"
							/>
						</div>
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
