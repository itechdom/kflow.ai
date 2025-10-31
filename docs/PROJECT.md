# 🧭 KFlow Project Specification

**Document Version:** 1.0  
**Last Updated:** 2025-10-29  
**Owner:** KFlow Product Team  
**System Type:** AI-driven Concept Graph & Learning Path Generator  
**Primary Engine:** GPT-based LLMs with embedding and attention integration  

---

## 1️⃣ Overview

KFlow is an intelligent concept graph generator and learning companion that uses the attention-like reasoning of large language models (LLMs) to help users discover, structure, and navigate learning paths across any field.

Unlike traditional course builders, KFlow starts from minimal input — a topic or concept — and dynamically builds layers of knowledge, linking them through concept expansion, synthesis, exploration, and validation.

The system adapts to users’ curiosity and level of understanding, allowing gradual complexity increase and nonlinear exploration while maintaining conceptual consistency.

---

## 2️⃣ Mission Statement

> “To model the natural way humans learn — by exploring connections, deepening understanding, and building mental maps — using the intelligence of large language models.”

---

## 3️⃣ Core Principles

| Principle              | Description                                                                 |
|------------------------|-----------------------------------------------------------------------------|
| **Layered Learning**    | Each generated layer increases conceptual complexity gradually.            |
| **Interconnected Knowledge** | Concepts are linked through parent-child, related, and hybrid relationships. |
| **Exploration + Focus** | Users can either dive deep into one branch or explore laterally across topics. |
| **Minimal JSON Core**   | Each operation outputs lean, mergeable JSON objects for efficient API integration. |
| **Adaptive Attention**  | Concepts adjust relevance based on user goals and context.                |

---

## 4️⃣ System Architecture

### 🧠 Concept Engine

- Uses LLM prompts to generate or refine concepts.
- Each operation follows a unified minimal JSON scheme for consistency.
- Supports hierarchical, lateral, and compositional concept relationships.

### 🧩 Core Data Schema (Minimal)

All operations adhere to this structure:

```json
{
  "name": "Concept Name",
  "description": "Short explanation of the concept.",
  "parents": [],
  "children": []
}
```
Additional fields (attention_score, validation_score, etc.) are added by specific operations as needed.

## 5️⃣ Data Flow Summary

1. **User Input:** A topic, concept, or list of concepts.  
2. **Operation Selection:** Expand, synthesize, explore, etc.  
3. **LLM Processing:** Prompt-based generation in JSON.  
4. **Concept Graph Update:** Merge results into global concept store.  
5. **Visualization:** Shown in mindmap or list view.  
6. **Feedback Loop:** User validates, refocuses, or traces paths.  

---

## 6️⃣ Core Operations and Prompts

Below are the canonical prompts for the KFlow system. Each is stateless, composable, and consistent across any topic.

### 1) `expand(concept)` — Sub-concepts / children

**Prompt:**

Generate 3–7 sub-concepts of "{{concept_name}}" as a JSON array.  
For each sub-concept, include only the minimal fields:

- `"name"`: concept name  
- `"description"`: short explanation  
- `"parents"`: array of parent concept names (include "{{concept_name}}")  
- `"children"`: empty array `[]`  

If a concept with the same name already exists, return the updated node:

- Merge parents (union by name)  
- Keep children empty for now  

Return JSON array only, no text, no extra fields.

---

### 2) `expand(list)` — Multi-parent layer

**Prompt:**

Generate new concepts based on the following parent list: {{parent_list}}.  
For each concept, include only:

- `"name"`  
- `"description"`  
- `"parents"`: one or more parent names from {{parent_list}}  
- `"children"`: empty array `[]`  

Return JSON array only, no extra fields or prose.

---

### 3) `synthesize(parents[])` — Multi-parent intersection

**Prompt:**

Generate hybrid concepts combining these parents: {{parents}}.  
For each concept, include only:

- `"name"`  
- `"description"`  
- `"parents"`: array of input parent names  

Return as a JSON array only. Merge parents if concept already exists.

---

### 4) `derive_parents(concept)` — Upward / prerequisites

**Prompt:**

For "{{concept_name}}", generate 3–6 prerequisite or parent concepts.  
Include only:

- `"name"`  
- `"description"`  
- `"children"`: array with "{{concept_name}}"  

Return JSON array only. Merge children if concept already exists.

---

### 5) `explore(concept, diversity)` — Lateral / related concepts

**Prompt:**

Generate 5–10 concepts related to "{{concept_name}}", including diverse ideas.  
Include only:

- `"name"`  
- `"description"` 

Return JSON array only. Merge related if concept already exists.

---

### 6) `refocus(concept_list, goal)` — Update attention

**Prompt:**

Given concepts: {{concept_list}} and goal: "{{goal}}", update attention.  
Include only:

- `"name"`  
- `"attention_score"` (0–1)  
- `"importance"`: "low", "medium", or "high"  

Return JSON array only. Merge with existing nodes in your system.

---

### 7) `validate_links(concept_list)` — Validation

**Prompt:**

Validate relationships among: {{concept_list}}.  
For each concept, include only:

- `"name"`  
- `"validation_score"` (0–1)  
- `"parents"`: array of parent names  

Return JSON array only. Merge parents if concept exists.

---

### 8) `trace_path(start, end)` — Learning path

**Prompt:**

Generate an ordered learning path from "{{start}}" to "{{end}}".  
Include only:

- `"name"`  

Return JSON array only. Keep nodes in path order.

---

### 9) `derive_summary(layer)` — Layer summary

**Prompt:**

Given these layer concepts: {{layer_concepts}}, generate 1–2 summary nodes.  
Include only:

- `"name"`  
- `"description"`  
- `"parents"`: array of representative concepts  

Return JSON array only. Merge with existing summary nodes if name matches.

---

## 7️⃣ Example Use Case: JavaScript Learner

| Layer | Concepts Generated               | Operation Used          |
|-------|---------------------------------|------------------------|
| 0     | “JavaScript”                     | Seed                   |
| 1     | Variables, Functions, Objects    | expand(concept)        |
| 2     | Closures, Promises, Event Loop   | expand(list)           |
| 3     | Async/Await, Component Lifecycle | synthesize(parents[])  |
| 4     | Web App Development Path          | trace_path(start, end) |

Users can expand to go deeper, explore laterally to find related technologies (e.g., Node.js, React), and refocus toward their goal (e.g., “Build a web app”).

---

## 8️⃣ User Interfaces

- **Mindmap View:** Visualizes concept interconnections and hierarchies.  
- **List View:** Displays layers and operations as expandable cards.  
- **Focus Panel:** Highlights concepts most relevant to current goal.  

Both share a synchronized concept graph powered by the unified JSON schema.

---

## 9️⃣ Integration Model

| Layer         | Component           | Function                               |
|---------------|-------------------|----------------------------------------|
| Frontend      | React / Tailwind   | Displays UI (graph + list)             |
| Backend       | FastAPI / Node.js  | Routes prompt requests                  |
| AI Engine     | OpenAI GPT-5       | Executes operations                     |
| Vector Store  | FAISS / Pinecone   | Embedding & similarity search           |
| Database      | PostgreSQL / Neo4j | Stores and links concept nodes          |

---

## 🔟 Roadmap

| Phase | Goal                               | Status              |
|-------|-----------------------------------|-------------------|
| Phase 1 | Core JSON + Prompt Testing       | ✅                 |
| Phase 2 | API + LLM Integration           | 🔄 In Progress     |
| Phase 3 | Mindmap + List UI               | 🧩 Design Complete |
| Phase 4 | Attention & Validation Engine   | ⏳ Upcoming        |
| Phase 5 | User Profiling + Adaptive Learning | Planned        |

---

## 11️⃣ License & Usage

- Internal research and educational application.  
- Prompts and schema are open-spec for integration into LLM APIs.  
- Outputs remain user-owned.  

---

## 12️⃣ Summary

KFlow merges AI reasoning and pedagogical structure to generate dynamic learning maps.  
Its nine standardized operations and minimal JSON schema make it adaptable for any topic — from JavaScript to biology — enabling learners to progress naturally while exploring related concepts.  

**KFlow = Curiosity → Structure → Mastery**
