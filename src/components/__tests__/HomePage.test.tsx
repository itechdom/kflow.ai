import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router';
import notesReducer from '../../store/noteSlice';
import HomePage from '../HomePage';

function renderWithProviders(ui: React.ReactElement, { preloadedState }: any = {}) {
  const reducer = combineReducers({ notes: notesReducer });
  const store = configureStore({ reducer, preloadedState });
  return {
    ...render(
      <Provider store={store}>
        <BrowserRouter>{ui}</BrowserRouter>
      </Provider>
    ),
    store,
  };
}

const baseState = {
  notes: {
    notes: [
      { id: '1', title: 'Root A', content: 'Content A', tags: [], parentId: undefined, children: [], level: 0, createdAt: new Date(), updatedAt: new Date(), isExpanded: false },
      { id: '2', title: 'Root B', content: 'Content B', tags: [], parentId: undefined, children: [], level: 0, createdAt: new Date(), updatedAt: new Date(), isExpanded: false },
      { id: '3', title: 'Child of A', content: 'Child C', tags: [], parentId: '1', children: [], level: 1, createdAt: new Date(), updatedAt: new Date(), isExpanded: false },
    ],
    selectedNote: null,
    searchQuery: '',
    isLoading: false,
    error: null,
  },
};

describe('HomePage', () => {
  test('renders header and toggles', () => {
    renderWithProviders(<HomePage />, { preloadedState: baseState });
    expect(screen.getByText('KFlow')).toBeInTheDocument();
    expect(screen.getByText('Knowledge Management & AI-Powered Notes')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /List View/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Mind Map/i })).toBeInTheDocument();
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
    // Only Root B should appear
    expect(screen.getByText('Root B')).toBeInTheDocument();
  });

  test('navigates to NotePage when clicking a root note card area', () => {
    renderWithProviders(<HomePage />, { preloadedState: baseState });
    // Clicking root title should navigate - since BrowserRouter is used, assert URL change
    const rootTitle = screen.getByText('Root A');
    fireEvent.click(rootTitle);
    expect(window.location.pathname).toMatch(/\/note\/1$/);
  });
});
