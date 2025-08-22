import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface AIGeneratorProps {
  onFillForm: (data: { title: string; content: string; tags: string[] }) => void;
}

const AIGenerator: React.FC<AIGeneratorProps> = ({ onFillForm }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const generateContent = async () => {
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
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      
      // Fill the form with generated content instead of creating a note
      onFillForm({
        title: data.title || 'AI Generated Title',
        content: data.content || '',
        tags: data.tags || []
      });

      setPrompt('');
    } catch (err) {
      setError('Failed to generate content. Please try again.');
      console.error('Error generating content:', err);
    } finally {
      setIsGenerating(false);
    }
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
          disabled={isGenerating}
        />
        
        <button
          className="generate-btn"
          onClick={generateContent}
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
