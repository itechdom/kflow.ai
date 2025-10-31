# KFlow Prompt Templates

This directory contains documentation for the KFlow prompt template system used in Phase 1.

## Overview

The prompt template system provides a standardized way to:
- Define LLM prompts for concept graph operations
- Support variable interpolation
- Ensure consistent output schemas
- Enable easy testing and refinement

## Template Structure

All prompt templates are stored as JSON files in `server/src/prompts/templates/`.

### Template Format

```json
{
  "name": "operation_name",
  "system": "System prompt describing the assistant's role...",
  "user": "User prompt with {{variable}} placeholders...",
  "variables": ["variable1", "variable2"],
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

## Available Templates

1. **expand.json** - Generate sub-concepts (children) of a concept
2. **expandList.json** - Generate concepts from multiple parents
3. **synthesize.json** - Generate hybrid concepts combining multiple parents
4. **deriveParents.json** - Generate prerequisite/parent concepts
5. **explore.json** - Generate related concepts (lateral exploration)
6. **refocus.json** - Update attention scores based on goals
7. **validateLinks.json** - Validate relationships between concepts
8. **tracePath.json** - Generate learning path between concepts
9. **deriveSummary.json** - Generate summary concepts for a layer

## Usage

Templates are loaded and used by the operation functions in `server/src/operations/`.

Example:
```typescript
import { loadPrompt, interpolatePrompt } from '../prompts';

const template = await loadPrompt('expand');
const prompts = interpolatePrompt(template, {
  concept_name: 'JavaScript'
});
```

## Best Practices

1. **Consistency**: Always require the minimal schema fields (name, description, parents, children)
2. **Clarity**: Use clear, specific instructions in prompts
3. **Validation**: Include output_schema for documentation and future validation
4. **Variables**: Use descriptive variable names that match operation parameters

## Customization

To modify a prompt:
1. Edit the corresponding JSON file in `server/src/prompts/templates/`
2. Test using the test generation script: `npm run test:generation`
3. Validate output conforms to Concept schema

