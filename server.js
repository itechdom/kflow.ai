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

// Helper function to extract potential tags from prompt
function extractTags(prompt) {
  const commonTags = ['meeting', 'study', 'work', 'personal', 'ideas', 'todo', 'project'];
  const promptLower = prompt.toLowerCase();
  return commonTags.filter(tag => promptLower.includes(tag));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'KFlow API is running' });
});

app.listen(port, () => {
  console.log(`KFlow server running on port ${port}`);
  console.log(`AI Note Generation: ${process.env.OPENAI_API_KEY ? 'Enabled' : 'Disabled (No API Key)'}`);
});
