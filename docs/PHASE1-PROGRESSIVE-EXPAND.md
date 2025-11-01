⚙️ The Progressive Concept Generation Framework

Let’s call this operation:

progressive_expand(concept, previous_layers)
🧩 Prompt Template
You are a learning architect building a progressive learning path for the topic "{{concept}}".

## Current Knowledge
Below is the list of concepts the learner already understands:
{{previous_layers}}

## Task
Now generate the **next layer of concepts** the learner should learn **immediately after** the current ones.
Ensure each concept builds on what came before and increases slightly in complexity and abstraction.

## Rules
- The learner starts from no prior knowledge.
- Each new layer should:
  - Expand upon previous concepts.
  - Introduce only the next logical topics (not too advanced).
  - Maintain a smooth difficulty gradient.
- Avoid repeating concepts from previous layers.
- Each new concept must have at least one parent from the previous layer.
- Return the output **only as a JSON array** with the following minimal fields:
  - "name": concept name
  - "description": short explanation (1–2 sentences)
  - "parents": array of concept names from the previous layer that lead to this one
  - "children": []

## Example
If concept = "Machine Learning" and previous layer = ["Data", "Algorithms"],
the next layer might include:
[
  {"name": "Supervised Learning", "description": "Training models on labeled data.", "parents": ["Data", "Algorithms"], "children": []},
  {"name": "Unsupervised Learning", "description": "Finding patterns without labels.", "parents": ["Data", "Algorithms"], "children": []}
]

## Output
Return **only** the JSON array for the next layer.

add a layer key to the concept type and increment layer by one each time.

update the demo to add this new function as well. 