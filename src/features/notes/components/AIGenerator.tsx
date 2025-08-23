import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { useGenerateNote } from '../queries';

interface AIGeneratorProps {
  onFillForm: (data: { title: string; content: string; tags: string[] }) => void;
}

const AIGenerator: React.FC<AIGeneratorProps> = ({ onFillForm }) => {
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState('');

  const { mutate: generateNote, isPending, error: queryError, data, reset } = useGenerateNote();

  // Handle successful generation
  useEffect(() => {
    if (data) {
      // Fill the form with generated content
      onFillForm({
        title: data.title || 'AI Generated Title',
        content: data.content || '',
        tags: data.tags || []
      });

      // Reset the form and query state
      setPrompt('');
      reset();
    }
  }, [data, onFillForm, reset]);

  // Handle errors
  useEffect(() => {
    if (queryError) {
      setError('Failed to generate content. Please try again.');
      console.error('Error generating content:', queryError);
    }
  }, [queryError]);

  const generateContent = () => {
    if (!prompt.trim()) return;

    setError('');
    generateNote(prompt.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      generateContent();
    }
  };

  return (
    <div className="ai-generator">
      <div className="ai-header">
        <h3>
          <Sparkles size={16} />
          AI Content Generator
        </h3>
      </div>
      
      <div className="ai-input-section">
        <textarea
          className="ai-prompt-input"
          placeholder="Describe what kind of content you want to generate..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyPress={handleKeyPress}
          rows={3}
          disabled={isPending}
        />
        
        <button
          className="generate-btn"
          onClick={generateContent}
          disabled={!prompt.trim() || isPending}
        >
          {isPending ? (
            <>
              <Loader2 size={16} className="spinning" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Generate Content
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
};

export default AIGenerator;
