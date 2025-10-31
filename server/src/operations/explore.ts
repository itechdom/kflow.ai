import { Concept, OperationResult } from '../types/concept';
import { exploreSystemPrompt } from '../prompts';
import { callLLM, extractJSONArray } from '../services/llm';
import { validateConcept, normalizeConcept } from '../utils/validation';

/**
 * Generates related concepts (lateral exploration)
 * @param concept - Concept to explore around
 * @param diversity - Optional diversity parameter (default: "high")
 * @returns Array of related concepts (may not have direct parent-child relationship)
 */
export async function explore(
  concept: Concept,
  diversity: 'low' | 'medium' | 'high' = 'high'
): Promise<OperationResult> {
  // Validate input
  if (!validateConcept(concept)) {
    throw new Error('Invalid concept input for explore operation');
  }

  // Use template strings directly with diversity hint
  const userPrompt = `Generate 5–10 concepts related to "${concept.name}", including diverse ideas. Focus on ${diversity} diversity: include varied and creative related concepts. Include only: "name", "description". "parents" and "children" should be empty arrays []. Return JSON array only. Merge related if concept already exists.`;

  // Call LLM
  const response = await callLLM({
    systemPrompt: exploreSystemPrompt,
    userPrompt: userPrompt,
    temperature: diversity === 'high' ? 0.8 : diversity === 'medium' ? 0.7 : 0.6, // Higher temp for more diversity
  });

  // Extract and parse JSON array
  let results: any[];
  try {
    results = extractJSONArray(response.content);
  } catch (error) {
    throw new Error(`Failed to parse LLM response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Normalize and validate results
  const normalizedResults: Concept[] = results.map((item: any) => {
    const normalized = normalizeConcept(item);
    // For explore, parents and children may be empty (relationships determined later)
    if (!Array.isArray(normalized.parents)) {
      normalized.parents = [];
    }
    if (!Array.isArray(normalized.children)) {
      normalized.children = [];
    }
    return normalized;
  });

  // Validate all results
  for (const result of normalizedResults) {
    const conceptName = result.name || 'unknown';
    if (!validateConcept(result)) {
      throw new Error(`Invalid concept in explore result: ${conceptName}`);
    }
  }

  return normalizedResults;
}

