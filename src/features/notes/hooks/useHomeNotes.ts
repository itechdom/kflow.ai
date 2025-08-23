import { useMemo } from 'react';
import { Note } from '../Note';
import { useAppSelector } from '../../../app/hooks';

export const useHomeNotes = (searchQuery: string = '') => {
  const notes = useAppSelector(state => state.notes.notes);

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) {
      return notes;
    }

    const query = searchQuery.toLowerCase();
    return notes.filter(note => 
      !note.parentId && (   // Only show root notes
      note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.tags.some(tag => tag.toLowerCase().includes(query))
      )
    );
  }, [notes, searchQuery]);

  return filteredNotes;
};
