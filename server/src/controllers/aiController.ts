import { Request, Response } from 'express';
import { getOpenAI } from '../config/openai';
import { extractTags, parseStructuredResponse, generateFallbackChildren } from '../utils/text';
import {
  GenerateNoteRequest,
  GenerateChildrenRequest,
  NoteResponse,
  GenerateChildrenResponse,
  HealthResponse,
} from '../types';

export async function generateNote(
  req: Request<{}, NoteResponse | { error: string; note?: string } | { error: string; details: string }, GenerateNoteRequest>,
  res: Response<NoteResponse | { error: string; note?: string } | { error: string; details: string }>
): Promise<void | Response> {
  try {
    const { prompt, parentTitle, parentContent, parentTags } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const openai = getOpenAI();
    if (!openai) {
      return res.status(500).json({
        error: 'OpenAI API key not configured',
        note: 'Please set OPENAI_API_KEY in your environment variables and restart the server',
      });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            "You are a helpful assistant that creates well-structured notes. Generate concise, organized content based on the user's request. Return the response in a structured format.",
        },
        {
          role: 'user',
          content: `Create a note about: ${prompt}. Make it informative and well-structured. ${parentTitle ? `Parent title: ${parentTitle}` : ''}  ${parentContent ? `Parent content: ${parentContent}` : ''} ${parentTags && parentTags.length > 0 ? `Parent tags: ${parentTags.join(', ')}` : ''}`,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const generatedContent = completion.choices[0]?.message?.content || '';

    const response: NoteResponse = {
      title: prompt.length > 50 ? prompt.substring(0, 50) + '...' : prompt,
      content: generatedContent,
      tags: extractTags(prompt),
    };

    res.json(response);
  } catch (error) {
    console.error('Error generating note:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Failed to generate note', details: errorMessage });
  }
}

export async function generateChildren(
  req: Request<{}, GenerateChildrenResponse | { error: string; note?: string } | { error: string; details: string }, GenerateChildrenRequest>,
  res: Response<GenerateChildrenResponse | { error: string; note?: string } | { error: string; details: string }>
): Promise<void | Response> {
  try {
    const { parentTitle, parentContent, parentTags } = req.body;

    if (!parentTitle) {
      return res.status(400).json({ error: 'Parent title is required' });
    }

    const openai = getOpenAI();
    if (!openai) {
      return res.status(500).json({
        error: 'OpenAI API key not configured',
        note: 'Please set OPENAI_API_KEY in your environment variables and restart the server',
      });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-5-nano',
      messages: [
        {
          role: 'system',
          content:
            "You are a teacher that teaches topics by creating child notes for a parent note. Generate as many relevant child notes that would logically belong under the parent note. Each child should be a specific subtopic or aspect of the parent topic. the idea is to teach someone by walking them through this topic step by step. Return the response as a JSON array of objects with 'title', 'content', and 'tags' properties. keep it simple and give a general overview of the topic.",
        },
        {
          role: 'user',
          content: `Generate child notes for a parent note titled "${parentTitle}". ${parentContent ? `Parent content: ${parentContent}` : ''} ${parentTags && parentTags.length > 0 ? `Parent tags: ${parentTags.join(', ')}` : ''}. Create as many child notes that are logical subtopics.`,
        },
      ],
    });

    const generatedContent = completion.choices[0]?.message?.content || '';

    let children: Array<{ title: string; content: string; tags: string[] }> = [];
    try {
      const jsonMatch = generatedContent.match(/\[.*\]/s);
      if (jsonMatch) {
        children = JSON.parse(jsonMatch[0]) as Array<{ title: string; content: string; tags: string[] }>;
      } else {
        children = parseStructuredResponse(generatedContent);
      }
    } catch (parseError) {
      console.log('JSON parsing failed, using fallback parser');
      children = parseStructuredResponse(generatedContent);
    }

    if (!Array.isArray(children) || children.length === 0) {
      children = generateFallbackChildren(parentTitle);
    }

    const response: GenerateChildrenResponse = { children };
    res.json(response);
  } catch (error) {
    console.error('Error generating children:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Failed to generate children', details: errorMessage });
  }
}

export function health(
  req: Request,
  res: Response<HealthResponse>
): void {
  res.json({ status: 'OK', message: 'KFlow API is running' });
}

