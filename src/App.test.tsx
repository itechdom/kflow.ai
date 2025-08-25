import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App routing', () => {
  test('renders HomePage at root path', () => {
    window.history.pushState({}, 'Home', '/');
    render(<App />);

    expect(screen.getByText('KFlow')).toBeInTheDocument();
    expect(screen.getByText('Knowledge Management & AI-Powered Notes')).toBeInTheDocument();
  });

  test('renders NotePage not found for unknown note id', () => {
    window.history.pushState({}, 'Note Not Found', '/note/non-existent-id');
    render(<App />);

    expect(screen.getByText(/Note Not Found/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Back to All Notes/i })).toBeInTheDocument();
  });
});
