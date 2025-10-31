import { Concept, ExtendedConcept, OperationResult } from '../types/concept';
import { validateLinksSystemPrompt } from '../prompts';
import { callLLM, extractJSONArray } from '../services/llm';
import { validateConcept, validateExtendedConcept, normalizeConcept, validateConceptArray } from '../utils/validation';

/**
 * Validates relationships between concepts
 * @param concepts - Array of concepts to validate
 * @returns Array of concepts with validation_score and corrected parent relationships
 */
export async function validateLinks(concepts: Concept[]): Promise<ExtendedConcept[]> {
  // Validate input
  if (!validateConceptArray(concepts) || concepts.length === 0) {
    throw new Error('Invalid concepts input for validateLinks operation');
  }

  // Create concept list string with names and current parent relationships
  const conceptList = concepts.map(c => 
    `${c.name} (parents: ${c.parents.join(', ') || 'none'})`
  ).join('; ');

  // Use template strings directly
  const userPrompt = `Validate relationships among: ${conceptList}. For each concept, include only: "name", "validation_score" (number 0-1), "parents" (array of parent names, corrected if needed), "description" (preserve existing), "children" (preserve existing). Return JSON array only. Merge parents if concept exists.`;

  // Call LLM
  const response = await callLLM({
    systemPrompt: validateLinksSystemPrompt,
    userPrompt: userPrompt,
  });

  // Extract and parse JSON array
  let results: any[];
  try {
    results = extractJSONArray(response.content);
  } catch (error) {
    throw new Error(`Failed to parse LLM response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Create a map of existing concepts for merging
  const conceptMap = new Map<string, Concept>();
  concepts.forEach(c => conceptMap.set(c.name, c));

  // Normalize and merge results with existing concepts
  const normalizedResults: ExtendedConcept[] = results.map((item: any) => {
    const existing = conceptMap.get(item.name);
    const baseConcept = existing || normalizeConcept(item);

    const extended: ExtendedConcept = {
      ...baseConcept,
      validation_score: typeof item.validation_score === 'number'
        ? Math.max(0, Math.min(1, item.validation_score))
        : undefined,
      // Use corrected parents from LLM if provided, otherwise preserve existing
      parents: Array.isArray(item.parents) ? item.parents : (existing?.parents || []),
      description: item.description || existing?.description || '',
      children: item.children || existing?.children || [],
    };

    return extended;
  });

  // Validate all results
  normalizedResults.forEach(result => {
    if (!validateExtendedConcept(result)) {
      throw new Error(`Invalid extended concept in validateLinks result: ${result.name}`);
    }
  });

  return normalizedResults;
}

