import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { MemoryRouter, Routes, Route } from 'react-router';
import notesReducer from '../../store/noteSlice';
import NotePage from '../NotePage';

function renderWithProvidersAndRouter(route: string, preloadedState: any) {
  const reducer = combineReducers({ notes: notesReducer });
  const store = configureStore({ reducer, preloadedState });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/note/:noteId" element={<NotePage />} />
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

const baseState = {
  notes: {
    notes: [
      { id: 'n1', title: 'Parent Note', content: 'Parent content', tags: [], parentId: undefined, children: ['n2'], level: 0, createdAt: new Date(), updatedAt: new Date() },
      { id: 'n2', title: 'Child Note', content: 'Child content', tags: [], parentId: 'n1', children: [], level: 1, createdAt: new Date(), updatedAt: new Date() },
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

  test('renders current note title and level for existing note', () => {
    renderWithProvidersAndRouter('/note/n1', baseState);
    // Title is rendered as H1 in the page header; sidebar may also show the title
    expect(screen.getByRole('heading', { level: 1, name: /Parent Note/i })).toBeInTheDocument();
    expect(screen.getByText(/Level\s*0/i)).toBeInTheDocument();
  });

  test('back button navigates to home', () => {
    renderWithProvidersAndRouter('/note/n1', baseState);
    fireEvent.click(screen.getByRole('button', { name: /Back to All Notes/i }));
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  test('can toggle to Mind Map view', () => {
    renderWithProvidersAndRouter('/note/n1', baseState);
    const mindmapBtn = screen.getByRole('button', { name: /Mind Map/i });
    fireEvent.click(mindmapBtn);
    // MindMap shows a "New Note" button in its header
    expect(screen.getByRole('button', { name: /New Note/i })).toBeInTheDocument();
  });
});
