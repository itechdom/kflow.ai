import { Concept, ConceptGraph } from '../types/concept';
import { mergeIntoGraph } from './merge';

/**
 * Creates an empty concept graph
 */
export function createGraph(): ConceptGraph {
  return {
    concepts: new Map<string, Concept>(),
  };
}

/**
 * Adds concepts to a graph (with merge logic)
 */
export function addConceptsToGraph(
  graph: ConceptGraph,
  concepts: Concept[]
): ConceptGraph {
  return {
    concepts: mergeIntoGraph(graph.concepts, concepts),
  };
}

/**
 * Retrieves a concept by name
 */
export function getConcept(graph: ConceptGraph, name: string): Concept | undefined {
  return graph.concepts.get(name);
}

/**
 * Gets all concepts in the graph
 */
export function getAllConcepts(graph: ConceptGraph): Concept[] {
  return Array.from(graph.concepts.values());
}

/**
 * Builds hierarchical structure from graph
 * Returns concepts in a hierarchical order (parents before children)
 */
export function buildHierarchy(graph: ConceptGraph): Concept[] {
  const concepts = getAllConcepts(graph);
  const visited = new Set<string>();
  const result: Concept[] = [];

  // Topological sort: process concepts with no parents first
  function processConcept(concept: Concept) {
    if (visited.has(concept.name)) {
      return;
    }

    // Process parents first if they exist in the graph
    for (const parentName of concept.parents) {
      const parent = getConcept(graph, parentName);
      if (parent && !visited.has(parentName)) {
        processConcept(parent);
      }
    }

    visited.add(concept.name);
    result.push(concept);
  }

  // Process all concepts
  for (const concept of concepts) {
    processConcept(concept);
  }

  return result;
}

