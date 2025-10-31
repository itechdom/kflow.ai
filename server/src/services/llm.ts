import { getOpenAI } from '../config/openai';

export interface LLMRequest {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMResponse {
  content: string;
  raw: any;
}

/**
 * Extracts JSON array from LLM response
 * Handles cases where LLM wraps JSON in markdown or text
 */
export function extractJSONArray(response: string): any[] {
  // Try to find JSON array in the response
  // Handle markdown code blocks
  const jsonBlockMatch = response.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
  if (jsonBlockMatch) {
    try {
      return JSON.parse(jsonBlockMatch[1]);
    } catch (e) {
      // Continue to try other methods
    }
  }

  // Try to find JSON array directly
  const arrayMatch = response.match(/(\[[\s\S]*\])/);
  if (arrayMatch) {
    try {
      return JSON.parse(arrayMatch[1]);
    } catch (e) {
      // Continue to try other methods
    }
  }

  // Try to parse the entire response as JSON
  try {
    const parsed = JSON.parse(response);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (e) {
    // Not valid JSON
  }

  // Fallback: try to extract individual objects and combine into array
  const objectMatches = response.match(/\{[^{}]*\}/g);
  if (objectMatches && objectMatches.length > 0) {
    try {
      return objectMatches.map(match => JSON.parse(match));
    } catch (e) {
      // Failed to parse objects
    }
  }

  throw new Error('Could not extract JSON array from LLM response');
}

/**
 * Calls LLM API with structured prompt
 * Handles JSON extraction and validation
 */
export async function callLLM(request: LLMRequest): Promise<LLMResponse> {
  const openai = getOpenAI();
  if (!openai) {
    throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY in your environment variables.');
  }

  const {
    systemPrompt,
    userPrompt,
    model = 'gpt-5-nano',
    //temperature = 0.7,
    //maxTokens = 2000,
  } = request;

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      //temperature,
      //max_tokens: maxTokens,
      // Note: response_format can only be used for json_object, not arrays
      // We'll extract JSON arrays manually from the response
    });

    const content = completion.choices[0]?.message?.content || '';
    if (!content) {
      throw new Error('Empty response from LLM');
    }

    return {
      content,
      raw: completion,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`LLM API call failed: ${errorMessage}`);
  }
}

