import { Concept, ExtendedConcept } from '../types/concept';

/**
 * Validates that an object conforms to the Concept schema
 */
export function validateConcept(obj: any): obj is Concept {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  if (typeof obj.name !== 'string' || obj.name.length === 0) {
    return false;
  }

  if (typeof obj.description !== 'string') {
    return false;
  }

  if (!Array.isArray(obj.parents)) {
    return false;
  }

  if (!obj.parents.every((p: any) => typeof p === 'string')) {
    return false;
  }

  if (!Array.isArray(obj.children)) {
    return false;
  }

  if (!obj.children.every((c: any) => typeof c === 'string')) {
    return false;
  }

  return true;
}

/**
 * Validates that an object conforms to the ExtendedConcept schema
 */
export function validateExtendedConcept(obj: any): obj is ExtendedConcept {
  if (!validateConcept(obj)) {
    return false;
  }

  const extended = obj as ExtendedConcept;

  // Optional fields validation
  if (extended.attention_score !== undefined) {
    if (typeof extended.attention_score !== 'number' || 
        extended.attention_score < 0 || 
        extended.attention_score > 1) {
      return false;
    }
  }

  if (extended.validation_score !== undefined) {
    if (typeof extended.validation_score !== 'number' || 
        extended.validation_score < 0 || 
        extended.validation_score > 1) {
      return false;
    }
  }

  if (extended.importance !== undefined) {
    if (!['low', 'medium', 'high'].includes(extended.importance)) {
      return false;
    }
  }

  return true;
}

/**
 * Validates an array of concepts
 */
export function validateConceptArray(concepts: any[]): concepts is Concept[] {
  return Array.isArray(concepts) && concepts.every(validateConcept);
}

/**
 * Ensures a concept has the minimal required structure
 * Fills in missing required fields with defaults
 */
export function normalizeConcept(obj: any): Concept {
  return {
    name: obj.name || '',
    description: obj.description || '',
    parents: Array.isArray(obj.parents) ? obj.parents.filter((p: any) => typeof p === 'string') : [],
    children: Array.isArray(obj.children) ? obj.children.filter((c: any) => typeof c === 'string') : [],
    layer: typeof obj.layer === 'number' ? obj.layer : undefined,
  };
}

