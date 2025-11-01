import { Concept, OperationResult } from '../types/concept';
import { progressiveExpandSystemPrompt } from '../prompts';
import { callLLM, extractJSONArray } from '../services/llm';
import { validateConcept, normalizeConcept, validateConceptArray } from '../utils/validation';

/**
 * Generates the next layer of concepts building on previous layers
 * @param concept - Target concept/seed for the learning path
 * @param previousLayers - Array of concepts from previous layers that learner already understands
 * @returns Array of concepts for the next layer with incremented layer number
 */
export async function progressiveExpand(
  concept: Concept,
  previousLayers: Concept[]
): Promise<OperationResult> {
  // Validate input
  if (!validateConcept(concept)) {
    throw new Error('Invalid concept input for progressiveExpand operation');
  }

  if (!validateConceptArray(previousLayers)) {
    throw new Error('Invalid previous layers input for progressiveExpand operation');
  }

  // Calculate next layer number (increment from max layer in previous, or start at 1)
  const maxPreviousLayer = previousLayers.length > 0
    ? Math.max(...previousLayers.map(c => c.layer || 0))
    : 0;
  const nextLayer = maxPreviousLayer + 1;

  // Build previous layers context
  const previousLayersInfo = previousLayers.length > 0
    ? previousLayers.map(c => `- ${c.name}: ${c.description}`).join('\n')
    : '(No previous concepts - this is the first layer)';

  // Build prompt
  const userPrompt = `You are a learning architect building a progressive learning path for the topic "${concept.name}".

## Current Knowledge
Below is the list of concepts the learner already understands:
${previousLayersInfo}

## Task
Now generate the **next layer of concepts** the learner should learn **immediately after** the current ones. Ensure each concept builds on what came before and increases slightly in complexity and abstraction.

## Rules
- The learner starts from no prior knowledge if this is the first layer.
- Each new layer should:
  - Expand upon previous concepts.
  - Introduce only the next logical topics (not too advanced).
  - Maintain a smooth difficulty gradient.
- Avoid repeating concepts from previous layers.
- Each new concept must have at least one parent from the previous layer (if previous layer exists).
- Return the output **only as a JSON array** with the following minimal fields:
  - "name": concept name
  - "description": short explanation (1–2 sentences)
  - "parents": array of concept names from the previous layer that lead to this one (or empty array if first layer)
  - "children": empty array []

## Example
If concept = "Machine Learning" and previous layer = ["Data", "Algorithms"],
the next layer might include:
[
  {"name": "Supervised Learning", "description": "Training models on labeled data.", "parents": ["Data", "Algorithms"], "children": []},
  {"name": "Unsupervised Learning", "description": "Finding patterns without labels.", "parents": ["Data", "Algorithms"], "children": []}
]

Return **only** the JSON array for the next layer.`;

  // Call LLM
  const response = await callLLM({
    systemPrompt: progressiveExpandSystemPrompt,
    userPrompt: userPrompt,
  });

  // Extract and parse JSON array
  let results: any[];
  try {
    results = extractJSONArray(response.content);
  } catch (error) {
    throw new Error(`Failed to parse LLM response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Get parent names from previous layer for validation
  const previousLayerNames = previousLayers.map(c => c.name);

  // Normalize and validate results
  const normalizedResults: Concept[] = results.map((item: any) => {
    const normalized = normalizeConcept(item);
    
    // Validate that each concept has at least one parent from previous layer (if previous layer exists)
    if (previousLayers.length > 0) {
      const hasValidParent = normalized.parents.some(p => previousLayerNames.includes(p));
      if (!hasValidParent && normalized.parents.length === 0 && previousLayerNames.length > 0) {
        // If no parents specified, add first parent from previous layer
        normalized.parents.push(previousLayerNames[0]);
      }
    }
    
    // Set layer number
    normalized.layer = nextLayer;
    
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
      throw new Error(`Invalid concept in progressiveExpand result: ${conceptName}`);
    }
  }

  // Update parent concepts from previous layer to include new children
  const updatedParents: Concept[] = [];
  for (const parentConcept of previousLayers) {
    const newChildrenNames = normalizedResults
      .filter(c => c.parents.includes(parentConcept.name))
      .map(c => c.name);
    
    if (newChildrenNames.length > 0) {
      updatedParents.push({
        ...parentConcept,
        layer: parentConcept.layer, // Explicitly preserve layer
        children: [...new Set([...parentConcept.children, ...newChildrenNames])],
      });
    }
  }

  // Return new layer concepts and updated parent concepts
  return updatedParents.length > 0 ? [...normalizedResults, ...updatedParents] : normalizedResults;
}

