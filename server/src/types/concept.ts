/**
 * Minimal Concept Schema - Core structure for all KFlow operations
 * All prompt functions must accept and return this structure
 */
export interface Concept {
  name: string;
  description: string;
  parents: string[];      // Array of parent concept names
  children: string[];     // Array of child concept names
  layer?: number;         // Optional layer number for progressive expansion
}

/**
 * Extended Concept with optional metadata
 * Operations may add fields like attention_score, validation_score, etc.
 */
export interface ExtendedConcept extends Concept {
  attention_score?: number;      // 0-1 for refocus operations
  validation_score?: number;     // 0-1 for validate_links operations
  importance?: 'low' | 'medium' | 'high';  // For refocus operations
}

/**
 * Operation Result - Standard return type for all prompt functions
 */
export type OperationResult = Concept[];

/**
 * Graph Store - In-memory representation of the concept graph
 */
export interface ConceptGraph {
  concepts: Map<string, Concept>;  // Keyed by concept name
}

/**
 * Composable function type signature
 */
export type ComposableFunction = (input: Concept | Concept[]) => Promise<OperationResult>;

