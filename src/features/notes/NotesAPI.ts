// Raw API calls for notes
export const NotesAPI = {
  // Generate note content using AI
  generateNote: async (prompt: string) => {
    const response = await fetch('http://localhost:3001/api/generate-note', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate note');
    }
    
    return response.json();
  },

  // Generate children notes using AI
  generateChildren: async (parentTitle: string, parentContent: string, parentTags: string[]) => {
    const response = await fetch('http://localhost:3001/api/generate-children', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        parentTitle,
        parentContent,
        parentTags
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate children');
    }
    
    return response.json();
  },
};
