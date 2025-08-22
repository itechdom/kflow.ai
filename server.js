const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Debug: Log environment variables
console.log('Environment check:');
console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
console.log('OPENAI_API_KEY length:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0);
console.log('PORT:', process.env.PORT);


const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize OpenAI only if API key is available
let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// AI Note Generation Endpoint
app.post('/api/generate-note', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!openai) {
      return res.status(500).json({ 
        error: 'OpenAI API key not configured',
        note: 'Please set OPENAI_API_KEY in your environment variables and restart the server'
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that creates well-structured notes. Generate concise, organized content based on the user's request. Return the response in a structured format."
        },
        {
          role: "user",
          content: `Create a note about: ${prompt}. Make it informative and well-structured.`
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const generatedContent = completion.choices[0]?.message?.content || '';

    // Create a structured response
    const response = {
      title: prompt.length > 50 ? prompt.substring(0, 50) + '...' : prompt,
      content: generatedContent,
      tags: extractTags(prompt)
    };

    res.json(response);
  } catch (error) {
    console.error('Error generating note:', error);
    res.status(500).json({ 
      error: 'Failed to generate note',
      details: error.message 
    });
  }
});

// AI Children Generation Endpoint
app.post('/api/generate-children', async (req, res) => {
  try {
    const { parentTitle, parentContent, parentTags } = req.body;

    if (!parentTitle) {
      return res.status(400).json({ error: 'Parent title is required' });
    }

    if (!openai) {
      return res.status(500).json({ 
        error: 'OpenAI API key not configured',
        note: 'Please set OPENAI_API_KEY in your environment variables and restart the server'
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a teacher that teaches topics by creating child notes for a parent note. Generate as many relevant child notes that would logically belong under the parent note. Each child should be a specific subtopic or aspect of the parent topic. the idea is to teach someone by walking them through this topic step by step. Return the response as a JSON array of objects with 'title', 'content', and 'tags' properties."
        },
        {
          role: "user",
          content: `Generate child notes for a parent note titled "${parentTitle}". ${parentContent ? `Parent content: ${parentContent}` : ''} ${parentTags && parentTags.length > 0 ? `Parent tags: ${parentTags.join(', ')}` : ''}. Create as many child notes that are logical subtopics.`
        }
      ],
      temperature: 0.5,
    });

    const generatedContent = completion.choices[0]?.message?.content || '';

    // Try to parse the response as JSON, fallback to structured parsing
    let children = [];
    try {
      // Look for JSON in the response
      const jsonMatch = generatedContent.match(/\[.*\]/s);
      if (jsonMatch) {
        children = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: parse structured text
        children = parseStructuredResponse(generatedContent);
      }
    } catch (parseError) {
      console.log('JSON parsing failed, using fallback parser');
      children = parseStructuredResponse(generatedContent);
    }

    // Ensure we have valid children
    if (!Array.isArray(children) || children.length === 0) {
      children = generateFallbackChildren(parentTitle);
    }

    res.json({ children });
  } catch (error) {
    console.error('Error generating children:', error);
    res.status(500).json({ 
      error: 'Failed to generate children',
      details: error.message 
    });
  }
});

// Helper function to extract potential tags from prompt
function extractTags(prompt) {
  const commonTags = ['meeting', 'study', 'work', 'personal', 'ideas', 'todo', 'project'];
  const promptLower = prompt.toLowerCase();
  return commonTags.filter(tag => promptLower.includes(tag));
}

// Helper function to parse structured text response
function parseStructuredResponse(content) {
  const children = [];
  const lines = content.split('\n');
  let currentChild = null;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('Title:') || trimmedLine.startsWith('1.') || trimmedLine.startsWith('2.') || trimmedLine.startsWith('3.') || trimmedLine.startsWith('4.') || trimmedLine.startsWith('5.')) {
      if (currentChild) {
        children.push(currentChild);
      }
      currentChild = {
        title: trimmedLine.replace(/^(Title:|[0-9]+\.\s*)/, '').trim(),
        content: '',
        tags: []
      };
    } else if (trimmedLine.startsWith('Content:') && currentChild) {
      currentChild.content = trimmedLine.replace('Content:', '').trim();
    } else if (trimmedLine.startsWith('Tags:') && currentChild) {
      const tags = trimmedLine.replace('Tags:', '').trim();
      currentChild.tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    } else if (currentChild && trimmedLine && !trimmedLine.startsWith('---')) {
      if (currentChild.content) {
        currentChild.content += ' ' + trimmedLine;
      } else {
        currentChild.content = trimmedLine;
      }
    }
  }

  if (currentChild) {
    children.push(currentChild);
  }

  return children;
}

// Fallback function to generate basic children if parsing fails
function generateFallbackChildren(parentTitle) {
  const baseChildren = [
    {
      title: `Introduction to ${parentTitle}`,
      content: `Basic introduction and overview of ${parentTitle}`,
      tags: ['introduction', 'overview']
    },
    {
      title: `Key Concepts of ${parentTitle}`,
      content: `Main concepts and principles related to ${parentTitle}`,
      tags: ['concepts', 'principles']
    },
    {
      title: `Applications of ${parentTitle}`,
      content: `Practical applications and use cases of ${parentTitle}`,
      tags: ['applications', 'practical']
    }
  ];

  return baseChildren;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'KFlow API is running' });
});

app.listen(port, () => {
  console.log(`KFlow server running on port ${port}`);
  console.log(`AI Note Generation: ${process.env.OPENAI_API_KEY ? 'Enabled' : 'Disabled (No API Key)'}`);
});
