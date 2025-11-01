/**
 * KFlow Operations - Composable concept graph functions
 * 
 * All operations follow the composable function pattern:
 * - Input: Concept | Concept[]
 * - Output: Promise<Concept[]>
 * 
 * This allows seamless chaining and integration of operations.
 */

export { expand } from './expand';
export { expandList } from './expandList';
export { synthesize } from './synthesize';
export { deriveParents } from './deriveParents';
export { explore } from './explore';
export { refocus } from './refocus';
export { tracePath } from './tracePath';
export { deriveSummary } from './deriveSummary';
export { progressiveExpand } from './progressiveExpand';

export * from '../types/concept';

