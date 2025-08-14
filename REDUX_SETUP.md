# Redux Store Setup for KFlow

## Overview
KFlow now uses Redux for state management, providing a centralized store for all note-related operations.

## Store Structure

### State Shape
```typescript
interface NoteState {
  notes: Note[];
  selectedNote: Note | null;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
}
```

### Actions Available

#### `createNote(payload)`
Creates a new note and adds it to the store.
- **Payload**: `Omit<Note, 'id' | 'createdAt' | 'updatedAt'>`
- **Effect**: Adds note to store, updates parent's children array if applicable

#### `selectNote(note)`
Selects a note for editing/viewing.
- **Payload**: `Note | null`
- **Effect**: Updates `selectedNote` in store

#### `editNote(note)`
Updates an existing note.
- **Payload**: `Note`
- **Effect**: Updates note in store, refreshes `updatedAt` timestamp

#### `deleteNote(noteId)`
Deletes a note from the store.
- **Payload**: `string` (note ID)
- **Effect**: Removes note from store, updates parent's children array

#### `addChildNote(parentNote)`
Adds a child note to a parent note.
- **Payload**: `Note` (parent note)
- **Effect**: Creates new child note with incremented level

#### `setSearchQuery(query)`
Sets the search query for filtering notes.
- **Payload**: `string`
- **Effect**: Updates search query in store

#### `clearSearch()`
Clears the current search query.
- **Effect**: Resets search query to empty string

## Usage in Components

### Using Redux Hooks
```typescript
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectNote, createNote, editNote } from '../store/noteSlice';

const MyComponent = () => {
  const dispatch = useAppDispatch();
  const { notes, selectedNote, searchQuery } = useAppSelector(state => state.notes);

  const handleCreateNote = () => {
    dispatch(createNote({
      title: 'New Note',
      content: '',
      tags: [],
      parentId: undefined,
      children: [],
      level: 0
    }));
  };

  const handleSelectNote = (note: Note) => {
    dispatch(selectNote(note));
  };
};
```

### Accessing State
```typescript
// Get all notes
const { notes } = useAppSelector(state => state.notes);

// Get selected note
const { selectedNote } = useAppSelector(state => state.notes);

// Get search query
const { searchQuery } = useAppSelector(state => state.notes);

// Get specific note by ID
const note = useAppSelector(state => 
  state.notes.notes.find(n => n.id === noteId)
);
```

## Benefits of Redux Implementation

1. **Centralized State**: All note data is managed in one place
2. **Predictable Updates**: Actions follow a clear pattern
3. **Easy Debugging**: Redux DevTools support for state inspection
4. **Performance**: Components only re-render when relevant state changes
5. **Scalability**: Easy to add new features and actions
6. **Type Safety**: Full TypeScript support with proper typing

## Migration from Props

### Before (Props-based)
```typescript
interface HomePageProps {
  notes: Note[];
  selectedNote: Note | null;
  onSelectNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
  // ... more props
}

const HomePage: React.FC<HomePageProps> = ({ notes, selectedNote, onSelectNote }) => {
  // Component logic
};
```

### After (Redux-based)
```typescript
const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { notes, selectedNote } = useAppSelector(state => state.notes);
  
  const handleSelectNote = (note: Note) => {
    dispatch(selectNote(note));
  };
  
  // Component logic
};
```

## Installation Requirements

Make sure to install the required packages:
```bash
npm install @reduxjs/toolkit react-redux
```

## Store Configuration

The store is configured in `src/store/store.ts` with:
- Note reducer
- Middleware configuration
- Serialization handling for Date objects
- TypeScript type definitions

## Next Steps

1. Install Redux packages
2. Test the application
3. Add persistence layer (localStorage/IndexedDB)
4. Add async actions for API calls
5. Implement undo/redo functionality
