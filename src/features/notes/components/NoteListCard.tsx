import React, { useState, useRef, useEffect } from 'react';
import { Note } from '../types';
import { Edit3, Trash2, Save, X, Tag, Plus } from 'lucide-react';

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
			className={`p-4 border border-gray-200 rounded-lg mb-3 transition-all duration-200 ${
				selectedNote?.id === note.id 
					? 'border-indigo-500 bg-indigo-50 shadow-md' 
					: 'hover:border-gray-300 hover:shadow-sm'
			} ${
				isNewChildNote 
					? 'border-orange-300 bg-orange-50 animate-pulse' 
					: ''
			}`}
			ref={(el) => { noteRefs.current[note.id] = el; }}
			onClick={(e) => {
				e.stopPropagation();
				onSelectNote(note);
				onNavigateToNote(note);
			}}
			style={{ 
				marginLeft: `${displayDepth * 20}px`,
				cursor: !note.parentId ? 'pointer' : 'default'
			}}
		>
			<div className="flex justify-between items-start mb-3">
				{isEditingTitle ? (
					<div className="flex-1 mr-3" onClick={(e) => e.stopPropagation()}>
						<input
							ref={(el) => { titleInputRefs.current[note.id] = el; }}
							type="text"
							className={`w-full px-3 py-2 border-2 border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 ${
								isNewChildNote 
									? 'bg-orange-50 border-orange-500' 
									: 'bg-white'
							}`}
							value={editValues.title}
							onChange={(e) => {
								const newTitle = e.target.value;
								setEditValues({ ...editValues, title: newTitle });
								queueAutoSave(note, { title: newTitle });
							}}
							onBlur={() => cancelEdit()}
							autoFocus
							onClick={(e) => e.stopPropagation()}
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
						className="flex-1 text-lg font-semibold text-gray-900 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded cursor-pointer transition-all duration-200 mr-3"
						onClick={(e) => { e.stopPropagation(); startEditing(note, 'title'); }}
						title="Click to edit title"
					>
						{note.title}
					</h4>
				)}
				<span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full flex-shrink-0">
					L{note.level}
				</span>
			</div>
			<div className="mb-3">
				{isEditingContent ? (
					<textarea
						className="w-full px-3 py-2 border-2 border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none min-h-[100px]"
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
						onClick={(e) => e.stopPropagation()}
						placeholder="Tab → tags, Shift+Tab → title"
					/>
				) : (
					<p 
						className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded cursor-pointer transition-all duration-200 min-h-[24px]"
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
			<div className="flex justify-between items-center mb-3">
				<span className="text-sm text-gray-500">{formatDate(note.updatedAt)}</span>
				{isEditingTags ? (
					<div
						className="flex-1 ml-4"
						ref={tagsContainerRef}
						onClick={(e) => e.stopPropagation()}
						onBlur={(e) => {
							const next = e.relatedTarget as Node | null;
							if (!next || (tagsContainerRef.current && !tagsContainerRef.current.contains(next))) {
								cancelEdit();
							}
						}}
					>
						<div className="flex gap-2 mb-2">
							<input
								type="text"
								className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
								value={newTag}
								onChange={(e) => {
									setNewTag(e.target.value);
									// Autosave on typing in tag input (saving current tags state)
									queueAutoSave(note, { tags: editValues.tags });
								}}
								onKeyPress={(e) => handleKeyPress(e, note)}
								onKeyDown={(e) => handleTagInputKeyDown(e, note)}
								onClick={(e) => e.stopPropagation()}
								placeholder="Add a tag..."
							/>
							<button
								className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
								onMouseDown={(e) => e.preventDefault()}
								onClick={() => handleAddTag(note)}
							>
								<Plus size={12} />
							</button>
						</div>
						<div className="flex flex-wrap gap-1">
							{editValues.tags.map(tag => (
								<span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
									#{tag}
									<button
										className="text-blue-600 hover:text-blue-800 hover:bg-blue-200 rounded-full p-0.5 transition-colors duration-200"
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
						className="flex items-center gap-2 cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors duration-200"
						onClick={(e) => { e.stopPropagation(); startEditing(note, 'tags'); }}
						title="Click to edit tags"
					>
						{note.tags.length > 0 ? (
							<>
								{note.tags.slice(0, 3).map(tag => (
									<span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">#{tag}</span>
								))}
								{note.tags.length > 3 && <span className="text-xs text-gray-500">+{note.tags.length - 3}</span>}
							</>
						) : (
							<span className="text-xs text-gray-400 italic">Click to add tags</span>
						)}
					</div>
				)}
			</div>
			<div className="flex justify-end">
				<button
					className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors duration-200"
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
				<div className="mt-4 border-l-2 border-gray-200 pl-4">
					{childNotes.map(childNote => renderNoteItem(childNote))}
				</div>
			)}
		</div>
	);
};

export default NoteListCard;
