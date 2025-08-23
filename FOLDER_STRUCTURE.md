# KFlow Project Structure

This document outlines the refactored folder structure for the KFlow project, following modern React application architecture patterns.

## Directory Structure

```
src/
│
├── app/                               # App-wide setup
│   ├── store.ts                       # Redux store configuration
│   ├── rootReducer.ts                 # Combine slices (if needed)
│   ├── hooks.ts                       # Typed hooks (useAppDispatch, useAppSelector)
│   ├── queryClient.ts                 # React Query client instance
│   ├── providers.tsx                  # Wrap App in ReduxProvider + QueryClientProvider
│   └── index.ts                       # Export all app configurations
│
├── features/                          # Feature-based modules
│   └── notes/
│       ├── notesSlice.ts              # Redux slice (UI state: filters, selectedTodoId)
│       ├── NotesAPI.ts                # Raw API calls
│       ├── queries.ts                 # React Query hooks (useNotesQuery, useAddNote)
│       ├── components/
│       │   ├── NoteListItem.tsx
│       │   ├── NoteListCard.tsx
│       │   ├── NoteList.tsx
│       │   ├── NoteForm.tsx
│       │   ├── MindMap.tsx
│       │   └── AIGenerator.tsx
│       ├── hooks/
│       │   └── useFilteredNotes.ts    # Derived data from notes
│       ├── __tests__/                 # Test files for notes feature
│       └── index.ts                   # Export all notes-related items
│
├── components/                        # Global, reusable UI components
│   ├── Button.tsx
│   ├── Modal.tsx
│   ├── Loader.tsx
│   ├── SearchBar.tsx
│   └── index.ts                       # Export all components
│
├── hooks/                             # Global hooks (not feature-specific)
│   └── useLocalStorage.ts
│
├── pages/                             # Top-level route views
│   ├── HomePage.tsx
│   ├── NotePage.tsx
│   ├── NotFoundPage.tsx
│   └── index.ts                       # Export all pages
│
├── routes/                            # Routing setup
│   ├── AppRouter.tsx
│   └── index.ts                       # Export routing components
│
├── services/                          # Shared services & configs
│   ├── apiClient.ts                   # Axios/fetch instance
│   ├── reactQueryConfig.ts            # Global React Query defaults (retry, cache, etc.)
│   └── index.ts                       # Export all services
│
├── utils/                             # Pure utility functions
│   ├── formatDate.ts
│   ├── validators.ts
│   ├── uuid.ts
│   └── index.ts                       # Export all utilities
│
├── styles/                            # Global styles
│   ├── index.css
│   ├── App.css
│   └── index.ts                       # Export all styles
│
├── assets/                            # Static assets
│   └── logo.svg
│
├── index.ts                           # Main entry point exports
├── index.tsx                          # React entry point
└── App.tsx                            # Root App component
```

## Key Benefits of This Structure

### 1. **Feature-Based Organization**
- All note-related functionality is grouped together
- Easy to find and maintain related code
- Clear separation of concerns

### 2. **Scalability**
- Easy to add new features (chat, profile, etc.)
- Each feature can have its own components, hooks, and API calls
- Clear boundaries between different parts of the application

### 3. **Reusability**
- Global components are easily accessible
- Shared utilities and services are centralized
- Consistent import patterns across the application

### 4. **Maintainability**
- Clear file locations make debugging easier
- Related code is grouped together
- Easy to refactor individual features

### 5. **Developer Experience**
- Intuitive file organization
- Consistent import patterns
- Easy to onboard new developers

## Import Patterns

### Feature Imports
```typescript
// Import from notes feature
import { NoteList, MindMap, useFilteredNotes } from '../features/notes';
```

### App Configuration Imports
```typescript
// Import app-wide configurations
import { useAppDispatch, useAppSelector } from '../app';
```

### Component Imports
```typescript
// Import global components
import { Modal, SearchBar } from '../components';
```

### Utility Imports
```typescript
// Import utilities
import { generateUUID } from '../utils';
```

## Future Enhancements

### 1. **Additional Features**
- `features/chat/` - Chat functionality
- `features/profile/` - User profile management
- `features/analytics/` - Usage analytics

### 2. **Advanced State Management**
- React Query integration for server state
- Zustand for client state (if needed)
- Redux Toolkit for complex state

### 3. **Testing Strategy**
- Unit tests in feature directories
- Integration tests in `__tests__` directories
- E2E tests in separate `tests/` directory

### 4. **Performance Optimization**
- Code splitting by feature
- Lazy loading of routes
- Bundle analysis and optimization

## Migration Notes

This structure was refactored from the previous flat organization to improve:
- Code organization and maintainability
- Developer experience and onboarding
- Scalability for future features
- Consistency with modern React patterns

All import paths have been updated to reflect the new structure, and index files have been created to maintain clean import statements.