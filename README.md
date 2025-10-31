# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KFlow is a knowledge management application with AI-powered note generation capabilities. It's built with React 19 + TypeScript on the frontend, Express.js backend, and uses Firebase for authentication and data persistence.

## Common Development Commands

- `npm start` - Start React development server (frontend only)
- `npm run build` - Build the app for production
- `npm test` - Run Jest tests with React Testing Library
- `npm run dev` - Start both frontend and backend concurrently (requires server setup)
- `npm run server` - Start the backend server (from server/ directory)
- `npm run server:dev` - Start backend with nodemon for development

## Architecture Overview

### State Management
- **Redux Toolkit** with RTK Query for global state management
- **React Query** (@tanstack/react-query) for server state and caching
- Store configuration in `src/app/store.ts` with rootReducer pattern

### Redux Slices and State Structure

#### Notes Slice (`src/features/notes/noteSlice.ts`)
Manages hierarchical note data and UI state:

**State Shape:**
```typescript
interface NoteState {
  notes: Note[];           // All notes with hierarchical relationships
  selectedNote: Note | null; // Currently selected note for viewing/editing
  searchQuery: string;     // Current search filter
  isLoading: boolean;      // Loading state for async operations
  error: string | null;    // Error messages
}
```

**Key Actions:**
- `createNote` - Creates new note and updates parent's children array
- `editNote` - Updates note content and timestamps
- `deleteNote` - Removes note and cleans up parent-child relationships
- `addChildNote` - Creates child note with proper hierarchy
- `aiGenerateChildren` - Batch creates multiple AI-generated child notes
- `toggleNoteExpanded`/`expandNote`/`collapseNote` - Controls note expansion state
- `selectNote` - Sets currently selected note
- `setSearchQuery`/`clearSearch` - Manages search functionality

**Hierarchical Note Management:**
- Notes maintain parent-child relationships via `parentId` and `children` arrays
- Level tracking for proper indentation/visualization
- Automatic parent updates when adding/removing children
- Expansion state management for tree navigation

#### Auth Slice (`src/features/auth/authSlice.ts`)
Manages Firebase user authentication state:

**State Shape:**
```typescript
interface AuthState {
  user: User | null;       // Firebase User object
  loading: boolean;        // Auth loading state
  error: string | null;    // Auth error messages
}
```

**Key Actions:**
- `setUser` - Sets authenticated user (null for logout)
- `setLoading`/`setError`/`clearError` - Loading and error state management
- `signOut` - Clears user and error state

### Routing & Authentication
- **React Router v7** for client-side routing
- **Firebase Authentication** for user management
- Protected routes wrap all main application pages
- Routes: `/` (home), `/note/:id` (note detail), `/widgets` (widgets page), `/login`

### Feature-Based Architecture
The codebase follows a feature-based folder structure:

```
src/
├── features/
│   ├── auth/           # Authentication logic, components, and services
│   ├── notes/          # Note management (CRUD, AI generation, types)
│   └── mindmap/        # Interactive mind map visualization
├── components/         # Shared UI components
├── pages/             # Route-level page components
├── services/          # API clients and configurations
├── app/               # Store, providers, and app-level configuration
└── utils/             # Shared utilities
```

### Key Data Models
- **Note**: Core entity with hierarchical structure (parentId, children, level)
  - Fields: id, title, content, createdAt, updatedAt, tags, parentId, children, level, isExpanded
- Notes support nested relationships for building knowledge hierarchies

### Backend Integration
- Express.js server (separate from React app)
- OpenAI API integration for AI note generation
- Endpoints: `/api/generate-note`, `/api/health`
- Firebase Admin SDK for server-side authentication

### Styling & UI
- **Tailwind CSS** for utility-first styling
- **Lucide React** for icons
- Responsive design with mobile-first approach

### Key Integrations
- **OpenAI API** for AI-powered note generation
- **Firebase** for authentication and potential data persistence
- **Matter.js** and **Three.js** for physics and 3D visualizations in widgets

## Environment Configuration

Required environment variables:
- `REACT_APP_FIREBASE_*` - Firebase configuration
- `OPENAI_API_KEY` - For AI features (backend)
- `PORT` - Backend server port (default: 3001)

Environment files: `.env`, `.env.local`, `.env.production`, `server/.env`

## Testing
- Jest + React Testing Library setup
- Test files in `src/pages/__tests__/`
- Run with `npm test`

## Development Notes

### Working with Notes
- Notes support hierarchical relationships (parent-child)
- Use Redux actions for state mutations (never mutate directly)
- AI generation hooks: `useAIGeneratedNote`, `useAIGeneratedChildren`
- Filtering and search via `useFilteredNotes`, `useHomeNotes`

### Redux Usage Patterns
- Import actions from slice files: `import { createNote, editNote } from '../features/notes/noteSlice'`
- Use `useAppDispatch` and `useAppSelector` hooks from `src/app/hooks.ts`
- Maintain hierarchical consistency when creating/deleting notes
- Update `updatedAt` timestamps when modifying notes
- Batch operations using dedicated actions (e.g., `aiGenerateChildren`)

### MindMap Feature
- Interactive visualization using native **SVG** rendering (not D3.js)
- Custom layout algorithms in `mindMapUtils.ts` for horizontal/vertical tree positioning
- Custom hooks for editing, layout, zoom/pan, keyboard navigation
- Context menu support for node interactions
- Text wrapping and node sizing calculations handled in utilities

### State Management Patterns
- Use RTK Query for server state
- Use React Query for additional caching needs
- Feature-specific slices (notes, auth)
- Combine reducers in `rootReducer.ts`

### Code Organization
- Each feature exports through index.ts barrel files
- Shared components in `src/components/`
- Types defined per feature in `types.ts` files
- Custom hooks in feature-specific `hooks/` directories