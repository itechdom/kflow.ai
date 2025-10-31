import { Concept, OperationResult } from '../types/concept';
import { expandSystemPrompt } from '../prompts';
import { callLLM, extractJSONArray } from '../services/llm';
import { validateConcept, normalizeConcept } from '../utils/validation';

/**
 * Generates 3-7 sub-concepts of the input concept
 * @param concept - Concept to expand
 * @returns Array of child concepts with parent relationship established
 */
export async function expand(concept: Concept): Promise<OperationResult> {
  // Validate input
  if (!validateConcept(concept)) {
    throw new Error('Invalid concept input for expand operation');
  }

  // Use template strings directly
  const userPrompt = `Generate 3–7 sub-concepts of "${concept.name}" as a JSON array. For each sub-concept, include only these exact fields: "name" (concept name), "description" (short explanation), "parents" (array containing "${concept.name}"), "children" (empty array []). Return JSON array only, no text, no extra fields.`;

  // Call LLM
  const response = await callLLM({
    systemPrompt: expandSystemPrompt,
    userPrompt: userPrompt,
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
    // Ensure parent relationship is established
    if (!normalized.parents.includes(concept.name)) {
      normalized.parents.push(concept.name);
    }
    // Ensure children is an array (empty for new concepts)
    if (!Array.isArray(normalized.children)) {
      normalized.children = [];
    }
    return normalized;
  });

  // Validate all results
  for (const result of normalizedResults) {
    const conceptName = result.name || 'unknown';
    if (!validateConcept(result)) {
      throw new Error(`Invalid concept in expand result: ${conceptName}`);
    }
  }

  return normalizedResults;
}

