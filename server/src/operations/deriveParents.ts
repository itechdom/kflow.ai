import { Concept, OperationResult } from '../types/concept';
import { deriveParentsSystemPrompt } from '../prompts';
import { callLLM, extractJSONArray } from '../services/llm';
import { validateConcept, normalizeConcept } from '../utils/validation';

/**
 * Generates prerequisite or parent concepts for a given concept
 * @param concept - Concept to derive parents for
 * @returns Array of prerequisite concepts with the input concept as their child
 */
export async function deriveParents(concept: Concept): Promise<OperationResult> {
  // Validate input
  if (!validateConcept(concept)) {
    throw new Error('Invalid concept input for deriveParents operation');
  }

  // Use template strings directly
  const userPrompt = `For "${concept.name}", generate 3–6 prerequisite or parent concepts. Include only: "name", "description", "children" (array with "${concept.name}"), "parents" (empty array []). Return JSON array only. Merge children if concept already exists.`;

  // Call LLM
  const response = await callLLM({
    systemPrompt: deriveParentsSystemPrompt,
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
    // Ensure the input concept is in children array
    if (!normalized.children.includes(concept.name)) {
      normalized.children.push(concept.name);
    }
    // Ensure parents is an array (may be empty for root concepts)
    if (!Array.isArray(normalized.parents)) {
      normalized.parents = [];
    }
    return normalized;
  });

  // Validate all results
  for (const result of normalizedResults) {
    const conceptName = result.name || 'unknown';
    if (!validateConcept(result)) {
      throw new Error(`Invalid concept in deriveParents result: ${conceptName}`);
    }
  }

  return normalizedResults;
}

