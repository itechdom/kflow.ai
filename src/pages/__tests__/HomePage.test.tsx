import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import notesReducer from '../../features/notes/noteSlice';
import HomePage from '../../pages/HomePage';

// Mock the auth module
jest.mock('../../features/auth', () => ({
  UserProfile: () => 'UserProfile',
}));

function renderWithProviders(ui: React.ReactElement, { preloadedState }: any = {}) {
  const reducer = combineReducers({ notes: notesReducer });
  const store = configureStore({ reducer, preloadedState });
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return {
    ...render(
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <BrowserRouter>{ui}</BrowserRouter>
        </Provider>
      </QueryClientProvider>
    ),
    store,
  };
}

const baseState = {
  notes: {
    notes: [
      { id: '1', title: 'Root A', content: 'Content A', tags: [], parentId: undefined, children: [], level: 0, createdAt: '2025-08-25T00:00:00.000Z', updatedAt: '2025-08-25T00:00:00.000Z', isExpanded: false },
      { id: '2', title: 'Root B', content: 'Content B', tags: [], parentId: undefined, children: [], level: 0, createdAt: '2025-08-25T00:00:00.000Z', updatedAt: '2025-08-25T00:00:00.000Z', isExpanded: false },
      { id: '3', title: 'Child of A', content: 'Child C', tags: [], parentId: '1', children: [], level: 1, createdAt: '2025-08-25T00:00:00.000Z', updatedAt: '2025-08-25T00:00:00.000Z', isExpanded: false },
    ],
    selectedNote: null,
    searchQuery: '',
    isLoading: false,
    error: null,
  },
};

describe('HomePage', () => {
  test('renders header and content', () => {
    renderWithProviders(<HomePage />, { preloadedState: baseState });
    expect(screen.getByText('KFlow')).toBeInTheDocument();
    expect(screen.getByText('Knowledge Management & AI-Powered Notes')).toBeInTheDocument();
    expect(screen.getByText('Notes (2)')).toBeInTheDocument();
  });

  test('opens create modal when create button clicked', () => {
    renderWithProviders(<HomePage />, { preloadedState: baseState });
    // Create button in NoteList header (icon-only, use title)
    const createBtn = screen.getByTitle('Create new note');
    fireEvent.click(createBtn);
    expect(screen.getByText(/Create New Note/i)).toBeInTheDocument();
    // Close via Cancel
    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelBtn);
    expect(screen.queryByText(/Create New Note/i)).not.toBeInTheDocument();
  });

  test('filters notes via SearchBar', () => {
    renderWithProviders(<HomePage />, { preloadedState: baseState });
    const searchInput = screen.getByRole('textbox');
    fireEvent.change(searchInput, { target: { value: 'Root B' } });
    // Check that Root B appears in the filtered results
    expect(screen.getAllByText('Root B')).toHaveLength(2); // One in title, one in search results
  });

  test('navigates to NotePage when clicking a root note card area', () => {
    renderWithProviders(<HomePage />, { preloadedState: baseState });
    // Click on the note card container
    const noteCard = screen.getByText('Root A').closest('div[style*="cursor: pointer"]');
    expect(noteCard).toBeInTheDocument();
    fireEvent.click(noteCard!);
    // Since we're using BrowserRouter, we can check the URL change
    expect(window.location.pathname).toMatch(/\/note\/1$/);
  });
});
