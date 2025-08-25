import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { MemoryRouter, Routes, Route } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import notesReducer from '../../features/notes/noteSlice';
import NotePage from '../../pages/NotePage';

// Mock the auth module
jest.mock('../../features/auth', () => ({
  UserProfile: () => 'UserProfile',
}));

// Mock the mindmap module
jest.mock('../../features/mindmap', () => ({
  MindMap: () => 'MindMap Component',
}));

function renderWithProvidersAndRouter(route: string, preloadedState: any) {
  const reducer = combineReducers({ notes: notesReducer });
  const store = configureStore({ reducer, preloadedState });
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path="/note/:noteId" element={<NotePage />} />
            <Route path="/" element={<div>Home</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    </QueryClientProvider>
  );
}

const baseState = {
  notes: {
    notes: [
      { id: 'n1', title: 'Parent Note', content: 'Parent content', tags: [], parentId: undefined, children: ['n2'], level: 0, createdAt: '2025-08-25T00:00:00.000Z', updatedAt: '2025-08-25T00:00:00.000Z', isExpanded: false },
      { id: 'n2', title: 'Child Note', content: 'Child content', tags: [], parentId: 'n1', children: [], level: 1, createdAt: '2025-08-25T00:00:00.000Z', updatedAt: '2025-08-25T00:00:00.000Z', isExpanded: false },
    ],
    selectedNote: null,
    searchQuery: '',
    isLoading: false,
    error: null,
  },
};

describe('NotePage', () => {
  test('shows Not Found for unknown note id', () => {
    renderWithProvidersAndRouter('/note/does-not-exist', baseState);
    expect(screen.getByText(/Note Not Found/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Back to All Notes/i })).toBeInTheDocument();
  });

  test('renders current note title for existing note', () => {
    renderWithProvidersAndRouter('/note/n1', baseState);
    // Check that the note title appears somewhere on the page
    expect(screen.getByText('Parent Note')).toBeInTheDocument();
  });

  test('back button navigates to home', () => {
    renderWithProvidersAndRouter('/note/n1', baseState);
    fireEvent.click(screen.getByRole('button', { name: /Back to All Notes/i }));
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  test('can toggle to Mind Map view', () => {
    renderWithProvidersAndRouter('/note/n1', baseState);
    // Look for the Mind Map button (Map icon)
    const mindmapBtn = screen.getByRole('button', { name: /Map/i });
    fireEvent.click(mindmapBtn);
    // Check that the MindMap component is rendered
    expect(screen.getByText('MindMap Component')).toBeInTheDocument();
  });
});
