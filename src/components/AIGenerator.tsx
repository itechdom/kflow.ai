import React, { useState } from 'react';
import { Note } from '../types/Note';
import { Sparkles, Loader2 } from 'lucide-react';

interface AIGeneratorProps {
  onGenerateNote: (note: Note) => void;
}

const AIGenerator: React.FC<AIGeneratorProps> = ({ onGenerateNote }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const generateNote = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError('');

    try {
      // Note: In a real app, you'd want to use environment variables for the API key
      // and make the API call from your backend for security
      const response = await fetch('http://localhost:3001/api/generate-note', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate note');
      }

      const data = await response.json();
      
      const generatedNote: Note = {
        id: Date.now().toString(),
        title: data.title || 'AI Generated Note',
        content: data.content || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: data.tags || [],
        level: 0,
        isExpanded: false
      };

      onGenerateNote(generatedNote);
      setPrompt('');
    } catch (err) {
      setError('Failed to generate note. Please try again.');
      console.error('Error generating note:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      generateNote();
    }
  };

  return (
    <div className="ai-generator">
      <div className="ai-header">
        <h3>
          <Sparkles size={16} />
          AI Note Generator
        </h3>
      </div>
      
      <div className="ai-input-section">
        <textarea
          className="ai-prompt-input"
          placeholder="Describe what kind of note you want to generate..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyPress={handleKeyPress}
          rows={3}
          disabled={isGenerating}
        />
        
        <button
          className="generate-btn"
          onClick={generateNote}
          disabled={!prompt.trim() || isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 size={16} className="spinning" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Generate Note
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="ai-examples">
        <p className="examples-title">Try these examples:</p>
        <div className="example-prompts">
          <button
            className="example-btn"
            onClick={() => setPrompt('Meeting notes template for project planning')}
            disabled={isGenerating}
          >
            Meeting notes template
          </button>
          <button
            className="example-btn"
            onClick={() => setPrompt('Daily journal entry about productivity tips')}
            disabled={isGenerating}
          >
            Journal entry
          </button>
          <button
            className="example-btn"
            onClick={() => setPrompt('Study guide for React fundamentals')}
            disabled={isGenerating}
          >
            Study guide
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIGenerator;
