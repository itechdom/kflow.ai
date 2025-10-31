# 🎯 Phase 1 Implementation Plan: Core JSON + Prompt Testing

**Document Version:** 1.0  
**Created:** 2025-01-XX  
**Status:** In Progress  
**Goal:** Establish the foundation of KFlow's concept graph system with composable prompt functions

---

## 📋 Overview

Phase 1 focuses on creating a solid foundation for KFlow's concept graph system. This includes:
- Defining the minimal JSON schema
- Implementing 9 composable prompt functions
- Building merge utilities for graph operations
- Creating a testing framework to validate consistency across topics

**Key Principle:** All prompt functions must be composable, meaning they accept and return the same minimal schema structure, enabling seamless chaining and integration.

---

## 🎯 Objectives

1. ✅ Finalize the **minimal JSON schema** used by all operations
2. ✅ Implement **9 composable prompt functions** that conform to the schema
3. ✅ Build **merge utilities** for graph consistency
4. ✅ Create **testing framework** to validate prompt consistency across topics
5. ✅ Develop **graph assembly script** for local testing
6. ✅ Validate **composability** - functions can be chained and combined

---

## 📐 Core Schema Definition

### TypeScript Interface

```typescript
/**
 * Minimal Concept Schema - Core structure for all KFlow operations
 * All prompt functions must accept and return this structure
 */
export interface Concept {
  name: string;
  description: string;
  parents: string[];      // Array of parent concept names
  children: string[];     // Array of child concept names
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
```

### Schema Location

**File:** `server/src/types/concept.ts`

This will define the core types used throughout Phase 1 and beyond.

---

## 🔧 Implementation Structure

### Directory Structure

```
server/
├── src/
│   ├── types/
│   │   ├── concept.ts           # Core schema definitions
│   │   └── index.ts             # Re-exports
│   ├── prompts/
│   │   ├── templates/           # Prompt templates (JSON/YAML)
│   │   │   ├── expand.json
│   │   │   ├── expandList.json
│   │   │   ├── synthesize.json
│   │   │   ├── deriveParents.json
│   │   │   ├── explore.json
│   │   │   ├── refocus.json
│   │   │   ├── validateLinks.json
│   │   │   ├── tracePath.json
│   │   │   └── deriveSummary.json
│   │   └── index.ts             # Prompt loader utility
│   ├── operations/
│   │   ├── expand.ts             # expand(concept) function
│   │   ├── expandList.ts         # expand(list) function
│   │   ├── synthesize.ts         # synthesize(parents[]) function
│   │   ├── deriveParents.ts      # derive_parents(concept) function
│   │   ├── explore.ts             # explore(concept, diversity) function
│   │   ├── refocus.ts             # refocus(concept_list, goal) function
│   │   ├── validateLinks.ts      # validate_links(concept_list) function
│   │   ├── tracePath.ts          # trace_path(start, end) function
│   │   ├── deriveSummary.ts      # derive_summary(layer) function
│   │   └── index.ts              # Re-exports all operations
│   ├── utils/
│   │   ├── merge.ts              # Merge utilities for concepts
│   │   ├── graph.ts              # Graph assembly and manipulation
│   │   └── validation.ts         # Schema validation
│   ├── services/
│   │   └── llm.ts                # LLM client wrapper
│   └── scripts/
│       ├── test-generation.ts    # Test runner for all operations
│       └── graph-demo.ts         # Demo visualization script
├── tests/
│   ├── operations/
│   │   ├── expand.test.ts
│   │   ├── synthesize.test.ts
│   │   └── ... (tests for all 9 operations)
│   ├── utils/
│   │   ├── merge.test.ts
│   │   └── graph.test.ts
│   └── integration/
│       └── composability.test.ts
└── prompts/
    └── README.md                  # Documentation for prompt templates
```

---

## 🚀 Implementation Steps

### Step 1: Schema Definition & Types ✅

**Location:** `server/src/types/concept.ts`

**Implementation:**

```typescript
// server/src/types/concept.ts
export interface Concept {
  name: string;
  description: string;
  parents: string[];
  children: string[];
}

export interface ExtendedConcept extends Concept {
  attention_score?: number;
  validation_score?: number;
  importance?: 'low' | 'medium' | 'high';
}

export type OperationResult = Concept[];
export type ComposableFunction = (input: Concept | Concept[]) => Promise<OperationResult>;
```

**Validation:** Use `zod` or `joi` for runtime schema validation.

---

### Step 2: Merge Utilities

**Location:** `server/src/utils/merge.ts`

**Functions to Implement:**

```typescript
/**
 * Merges two concepts by name
 * - Unions parents arrays (removes duplicates)
 * - Unions children arrays (removes duplicates)
 * - Preserves existing data (non-destructive merge)
 */
export function mergeConcepts(existing: Concept, incoming: Concept): Concept;

/**
 * Merges an array of concepts into a graph
 * Returns a map keyed by concept name
 */
export function mergeIntoGraph(
  graph: Map<string, Concept>,
  concepts: Concept[]
): Map<string, Concept>;

/**
 * Unions two string arrays, removing duplicates
 */
export function unionArrays(arr1: string[], arr2: string[]): string[];
```

**Requirements:**
- Idempotent: merging the same concept multiple times yields the same result
- Non-destructive: existing data is preserved
- Name-based: concepts are identified by `name` field
- Array union: `parents` and `children` arrays are merged without duplicates

**Test Cases:**
- Merge new concept into empty graph
- Merge concept with existing name (updates parents/children)
- Merge concept with partial overlap
- Multiple merges maintain consistency

---

### Step 3: LLM Service Wrapper

**Location:** `server/src/services/llm.ts`

**Implementation:**

```typescript
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
 * Calls LLM API with structured prompt
 * Handles JSON extraction and validation
 */
export async function callLLM(request: LLMRequest): Promise<LLMResponse>;

/**
 * Extracts JSON array from LLM response
 * Handles cases where LLM wraps JSON in markdown or text
 */
export function extractJSONArray(response: string): any[];
```

**Requirements:**
- Supports OpenAI API (existing integration)
- Extracts JSON arrays from responses
- Handles malformed JSON gracefully
- Provides fallback mechanisms

---

### Step 4: Prompt Template System

**Location:** `server/src/prompts/templates/*.json`

**Template Format:**

```json
{
  "name": "expand",
  "system": "You are a helpful assistant that generates concept hierarchies...",
  "user": "Generate 3–7 sub-concepts of \"{{concept_name}}\" as a JSON array. For each sub-concept, include only: name, description, parents (include \"{{concept_name}}\"), children (empty array). Return JSON array only, no text.",
  "variables": ["concept_name"],
  "output_schema": {
    "type": "array",
    "items": {
      "type": "object",
      "required": ["name", "description", "parents", "children"],
      "properties": {
        "name": { "type": "string" },
        "description": { "type": "string" },
        "parents": { "type": "array", "items": { "type": "string" } },
        "children": { "type": "array", "items": { "type": "string" } }
      }
    }
  }
}
```

**Template Loader:** `server/src/prompts/index.ts`

```typescript
export async function loadPrompt(name: string): Promise<PromptTemplate>;
export function interpolatePrompt(template: PromptTemplate, vars: Record<string, any>): string;
```

---

### Step 5: Composable Operation Functions

Each operation function follows this signature:

```typescript
/**
 * Composable function signature
 * Input: Concept or Concept[]
 * Output: Promise<Concept[]>
 */
async function operation(input: Concept | Concept[]): Promise<Concept[]> {
  // 1. Validate input
  // 2. Load prompt template
  // 3. Interpolate variables
  // 4. Call LLM
  // 5. Parse and validate response
  // 6. Ensure output conforms to Concept schema
  // 7. Return array of Concept objects
}
```

#### 5.1 `expand(concept)` - Sub-concepts / children

**Location:** `server/src/operations/expand.ts`

```typescript
/**
 * Generates 3-7 sub-concepts of the input concept
 * @param concept - Concept to expand
 * @returns Array of child concepts with parent relationship established
 */
export async function expand(concept: Concept): Promise<Concept[]> {
  // Input: { name, description, parents, children }
  // Output: Array of { name, description, parents: [concept.name], children: [] }
}
```

**Prompt Logic:**
- System: "You are a helpful assistant that creates hierarchical concept structures..."
- User: "Generate 3–7 sub-concepts of \"{concept.name}\"..."
- Validate output has `parents` array containing `concept.name`
- Ensure all outputs have `children: []` (empty for new concepts)

---

#### 5.2 `expandList(parents[])` - Multi-parent layer

**Location:** `server/src/operations/expandList.ts`

```typescript
/**
 * Generates new concepts based on multiple parent concepts
 * @param parents - Array of parent concepts
 * @returns Array of concepts with one or more parents from the input list
 */
export async function expandList(parents: Concept[]): Promise<Concept[]> {
  // Input: Array of concepts
  // Output: Array of { name, description, parents: [parent.name(s)], children: [] }
}
```

**Prompt Logic:**
- User: "Generate new concepts based on the following parent list: {parent_names}..."
- Each output concept must have at least one parent from the input list
- Output concepts are children of one or more parents

---

#### 5.3 `synthesize(parents[])` - Multi-parent intersection

**Location:** `server/src/operations/synthesize.ts`

```typescript
/**
 * Generates hybrid concepts combining multiple parents
 * @param parents - Array of parent concepts to synthesize
 * @returns Array of concepts that combine aspects of all parents
 */
export async function synthesize(parents: Concept[]): Promise<Concept[]> {
  // Input: Array of concepts
  // Output: Array of { name, description, parents: [all parent names], children: [] }
}
```

**Prompt Logic:**
- System: "Generate hybrid concepts that combine ideas from multiple parent concepts..."
- Each output must have ALL input parents in its `parents` array
- Focus on intersection/combination rather than expansion

---

#### 5.4 `deriveParents(concept)` - Upward / prerequisites

**Location:** `server/src/operations/deriveParents.ts`

```typescript
/**
 * Generates prerequisite or parent concepts for a given concept
 * @param concept - Concept to derive parents for
 * @returns Array of prerequisite concepts with the input concept as their child
 */
export async function deriveParents(concept: Concept): Promise<Concept[]> {
  // Input: { name, description, parents, children }
  // Output: Array of { name, description, parents: [], children: [concept.name] }
}
```

**Prompt Logic:**
- User: "For \"{concept.name}\", generate 3-6 prerequisite or parent concepts..."
- Each output must have `children: [concept.name]`
- Outputs represent foundational concepts needed to understand the input

---

#### 5.5 `explore(concept, diversity?)` - Lateral / related concepts

**Location:** `server/src/operations/explore.ts`

```typescript
/**
 * Generates related concepts (lateral exploration)
 * @param concept - Concept to explore around
 * @param diversity - Optional diversity parameter (default: "high")
 * @returns Array of related concepts (may not have direct parent-child relationship)
 */
export async function explore(
  concept: Concept,
  diversity: 'low' | 'medium' | 'high' = 'high'
): Promise<Concept[]> {
  // Input: Concept + optional diversity
  // Output: Array of { name, description, parents: [], children: [] }
  // Note: These are related concepts, not hierarchical children
}
```

**Prompt Logic:**
- User: "Generate 5-10 concepts related to \"{concept.name}\", including diverse ideas..."
- Outputs are related but not necessarily parent/child
- `parents` and `children` arrays may be empty (relationships determined later)

---

#### 5.6 `refocus(concept_list, goal)` - Update attention

**Location:** `server/src/operations/refocus.ts`

```typescript
/**
 * Updates attention scores for concepts based on a goal
 * @param concepts - Array of concepts to refocus
 * @param goal - Learning goal or focus area
 * @returns Array of concepts with updated attention_score and importance
 */
export async function refocus(
  concepts: Concept[],
  goal: string
): Promise<ExtendedConcept[]> {
  // Input: Array of concepts + goal string
  // Output: Array of ExtendedConcept with attention_score and importance
}
```

**Prompt Logic:**
- User: "Given concepts: {concept_list} and goal: \"{goal}\", update attention..."
- Output includes `attention_score` (0-1) and `importance` ("low"|"medium"|"high")
- Returns `ExtendedConcept` type

---

#### 5.7 `validateLinks(concept_list)` - Validation

**Location:** `server/src/operations/validateLinks.ts`

```typescript
/**
 * Validates relationships between concepts
 * @param concepts - Array of concepts to validate
 * @returns Array of concepts with validation_score and corrected parent relationships
 */
export async function validateLinks(concepts: Concept[]): Promise<ExtendedConcept[]> {
  // Input: Array of concepts
  // Output: Array of ExtendedConcept with validation_score and possibly updated parents
}
```

**Prompt Logic:**
- User: "Validate relationships among: {concept_list}..."
- Output includes `validation_score` (0-1)
- May update `parents` array if relationships are incorrect
- Returns `ExtendedConcept` type

---

#### 5.8 `tracePath(start, end)` - Learning path

**Location:** `server/src/operations/tracePath.ts`

```typescript
/**
 * Generates an ordered learning path between two concepts
 * @param start - Starting concept
 * @param end - Ending concept
 * @returns Ordered array of concepts representing a learning path
 */
export async function tracePath(start: Concept, end: Concept): Promise<Concept[]> {
  // Input: Two concepts
  // Output: Ordered array of concepts (path from start to end)
}
```

**Prompt Logic:**
- User: "Generate an ordered learning path from \"{start.name}\" to \"{end.name}\"..."
- Output is an ordered array (sequence matters)
- Concepts may include minimal info (name is primary identifier)

---

#### 5.9 `deriveSummary(layer)` - Layer summary

**Location:** `server/src/operations/deriveSummary.ts`

```typescript
/**
 * Generates summary concepts for a layer of concepts
 * @param concepts - Array of concepts in a layer
 * @returns Array of 1-2 summary concepts
 */
export async function deriveSummary(concepts: Concept[]): Promise<Concept[]> {
  // Input: Array of concepts (a layer)
  // Output: Array of 1-2 summary concepts with parents pointing to layer concepts
}
```

**Prompt Logic:**
- User: "Given these layer concepts: {layer_concepts}, generate 1-2 summary nodes..."
- Output summary concepts have `parents` array containing representative concepts from the layer

---

### Step 6: Graph Utilities

**Location:** `server/src/utils/graph.ts`

**Functions:**

```typescript
/**
 * Creates an empty concept graph
 */
export function createGraph(): ConceptGraph;

/**
 * Adds concepts to a graph (with merge logic)
 */
export function addConceptsToGraph(
  graph: ConceptGraph,
  concepts: Concept[]
): ConceptGraph;

/**
 * Retrieves a concept by name
 */
export function getConcept(graph: ConceptGraph, name: string): Concept | undefined;

/**
 * Gets all concepts in the graph
 */
export function getAllConcepts(graph: ConceptGraph): Concept[];

/**
 * Builds hierarchical structure from graph
 */
export function buildHierarchy(graph: ConceptGraph): Concept[];
```

---

### Step 7: Testing Framework

**Location:** `server/tests/operations/*.test.ts`

**Test Structure:**

```typescript
describe('expand operation', () => {
  it('should return array of concepts with correct schema', async () => {
    const input: Concept = {
      name: 'JavaScript',
      description: 'Programming language',
      parents: [],
      children: []
    };
    
    const result = await expand(input);
    
    // Validate schema
    expect(Array.isArray(result)).toBe(true);
    result.forEach(concept => {
      expect(concept).toHaveProperty('name');
      expect(concept).toHaveProperty('description');
      expect(concept).toHaveProperty('parents');
      expect(concept).toHaveProperty('children');
      expect(Array.isArray(concept.parents)).toBe(true);
      expect(Array.isArray(concept.children)).toBe(true);
    });
    
    // Validate parent relationship
    result.forEach(concept => {
      expect(concept.parents).toContain('JavaScript');
    });
  });
  
  it('should work across multiple topics', async () => {
    const topics = ['JavaScript', 'Machine Learning', 'Ecology'];
    // Test each topic...
  });
});
```

**Integration Tests:**

```typescript
describe('Composability', () => {
  it('should chain operations', async () => {
    const seed: Concept = { name: 'AI', description: '...', parents: [], children: [] };
    
    // Chain: expand -> expandList -> synthesize
    const children = await expand(seed);
    const grandchildren = await expandList(children);
    const synthesized = await synthesize(grandchildren.slice(0, 2));
    
    // All outputs should conform to Concept schema
    [...children, ...grandchildren, ...synthesized].forEach(validateConcept);
  });
});
```

---

### Step 8: Test Generation Script

**Location:** `server/src/scripts/test-generation.ts`

**Features:**
- Runs all 9 operations on multiple test topics
- Validates schema compliance
- Tests merge logic
- Generates report with success/failure rates
- Outputs sample concept graphs

**Usage:**
```bash
npm run test:generation
# or
ts-node src/scripts/test-generation.ts
```

---

### Step 9: Graph Demo Script

**Location:** `server/src/scripts/graph-demo.ts`

**Features:**
- Demonstrates full workflow: seed → expand → explore → synthesize
- Builds a concept graph
- Outputs graph visualization (terminal or JSON)
- Shows merge behavior

---

## 📦 Deliverables Checklist

### Core Files
- [ ] `server/src/types/concept.ts` - Schema definitions
- [ ] `server/src/utils/merge.ts` - Merge utilities
- [ ] `server/src/utils/graph.ts` - Graph manipulation
- [ ] `server/src/utils/validation.ts` - Schema validation
- [ ] `server/src/services/llm.ts` - LLM wrapper

### Prompt Templates
- [ ] `server/src/prompts/templates/expand.json`
- [ ] `server/src/prompts/templates/expandList.json`
- [ ] `server/src/prompts/templates/synthesize.json`
- [ ] `server/src/prompts/templates/deriveParents.json`
- [ ] `server/src/prompts/templates/explore.json`
- [ ] `server/src/prompts/templates/refocus.json`
- [ ] `server/src/prompts/templates/validateLinks.json`
- [ ] `server/src/prompts/templates/tracePath.json`
- [ ] `server/src/prompts/templates/deriveSummary.json`
- [ ] `server/src/prompts/index.ts` - Template loader

### Operation Functions
- [ ] `server/src/operations/expand.ts`
- [ ] `server/src/operations/expandList.ts`
- [ ] `server/src/operations/synthesize.ts`
- [ ] `server/src/operations/deriveParents.ts`
- [ ] `server/src/operations/explore.ts`
- [ ] `server/src/operations/refocus.ts`
- [ ] `server/src/operations/validateLinks.ts`
- [ ] `server/src/operations/tracePath.ts`
- [ ] `server/src/operations/deriveSummary.ts`
- [ ] `server/src/operations/index.ts` - Re-exports

### Tests
- [ ] Unit tests for all 9 operations
- [ ] Tests for merge utilities
- [ ] Tests for graph utilities
- [ ] Integration tests for composability
- [ ] Cross-topic validation tests

### Scripts
- [ ] `server/src/scripts/test-generation.ts`
- [ ] `server/src/scripts/graph-demo.ts`

### Documentation
- [ ] `server/prompts/README.md` - Prompt documentation
- [ ] JSDoc comments for all functions
- [ ] Usage examples in code comments

---

## 🧪 Testing Strategy

### Unit Tests
- Each operation function tested in isolation
- Schema validation for all inputs/outputs
- Error handling for malformed LLM responses

### Integration Tests
- Chaining multiple operations
- Graph building and merging
- Cross-topic consistency

### Validation Tests
- Test on 5+ diverse topics:
  - JavaScript (programming)
  - Machine Learning (technical)
  - Ecology (scientific)
  - Philosophy (abstract)
  - Music Theory (creative)

### Success Criteria
- ✅ All operations return valid Concept[] arrays
- ✅ Merge logic maintains graph consistency
- ✅ Functions can be chained without errors
- ✅ 90%+ success rate across test topics
- ✅ All outputs conform to schema

---

## 🔄 Composability Requirements

**Critical:** All functions must be composable, meaning:

1. **Uniform Interface:**
   - Input: `Concept | Concept[]`
   - Output: `Promise<Concept[]>`
   - Always returns array, even for single-concept operations

2. **Schema Consistency:**
   - Input and output use same `Concept` interface
   - No operation breaks the schema contract

3. **Stateless Operations:**
   - Functions don't maintain internal state
   - Can be called multiple times with same result

4. **Chainable:**
   ```typescript
   // Example: All operations can be chained
   const result = await expandList(
     await expand(seedConcept)
   );
   ```

5. **Merge-Safe:**
   - Outputs can be merged into graph without conflicts
   - Duplicate concepts are handled gracefully

---

## 📊 Success Metrics

- **Schema Compliance:** 100% of outputs validate against Concept schema
- **Cross-Topic Consistency:** Operations work on 5+ diverse topics
- **Composability:** Functions can be chained in any order
- **Merge Reliability:** Graph operations maintain consistency
- **Test Coverage:** 80%+ code coverage for operations and utilities

---

## 🚦 Next Steps (Phase 2 Preparation)

Once Phase 1 is complete, the system will be ready for:
- API endpoint integration (Phase 2)
- Database persistence (Phase 2)
- Frontend integration (Phase 3)

---

## 📝 Notes

- **LLM Model:** Start with `gpt-3.5-turbo` or `gpt-4-turbo`, can upgrade to `gpt-5` when available
- **Error Handling:** All operations should have fallback mechanisms for LLM failures
- **Performance:** Consider caching prompt templates and LLM responses during testing
- **Extensibility:** Design operations to easily add new fields (e.g., `attention_score`) without breaking composability

---

**End of Phase 1 Implementation Plan**

