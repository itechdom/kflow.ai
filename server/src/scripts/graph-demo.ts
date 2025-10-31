/**
 * Graph Demo Script for Phase 1
 * 
 * Demonstrates full workflow:
 * - Seed concept
 * - Expand to children
 * - Explore related concepts
 * - Synthesize hybrid concepts
 * - Build and visualize concept graph
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { Concept } from '../types/concept';
import {
  expand,
  expandList,
  explore,
  synthesize,
} from '../operations';
import { createGraph, addConceptsToGraph, getAllConcepts } from '../utils/graph';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

/**
 * Visualize graph in terminal
 */
function visualizeGraph(concepts: Concept[]) {
  console.log('\n📊 Concept Graph Visualization\n');
  console.log('='.repeat(80));

  // Group by level (simplified - concepts with no parents are level 0)
  const rootConcepts = concepts.filter(c => c.parents.length === 0);
  
  console.log('\nRoot Concepts:');
  rootConcepts.forEach(concept => {
    console.log(`\n🌱 ${concept.name}`);
    console.log(`   ${concept.description}`);
    if (concept.children.length > 0) {
      console.log(`   Children: ${concept.children.join(', ')}`);
    }
  });

  // Show concepts with parents
  const childConcepts = concepts.filter(c => c.parents.length > 0);
  if (childConcepts.length > 0) {
    console.log('\n\nChild Concepts:');
    childConcepts.forEach(concept => {
      console.log(`\n  📝 ${concept.name}`);
      console.log(`     ${concept.description}`);
      console.log(`     Parents: ${concept.parents.join(', ')}`);
    });
  }

  console.log('\n' + '='.repeat(80));
  console.log(`\nTotal Concepts: ${concepts.length}`);
  console.log(`Root Concepts: ${rootConcepts.length}`);
  console.log(`Child Concepts: ${childConcepts.length}\n`);
}

/**
 * Export graph as JSON
 */
function exportGraphJSON(concepts: Concept[], filename: string) {
  const fs = require('fs');
  const filepath = path.join(__dirname, '..', '..', filename);
  
  fs.writeFileSync(filepath, JSON.stringify(concepts, null, 2));
  console.log(`\n💾 Graph exported to: ${filepath}\n`);
}

/**
 * Main demo workflow
 */
async function runDemo() {
  console.log('🚀 KFlow Graph Demo\n');
  console.log('Demonstrating: seed → expand → explore → synthesize\n');

  // 1. Seed concept
  const seed: Concept = {
    name: 'JavaScript',
    description: 'A high-level, interpreted programming language',
    parents: [],
    children: [],
  };

  console.log(`\n1️⃣  Seed Concept: ${seed.name}`);
  console.log(`   ${seed.description}\n`);

  // 2. Expand
  console.log('2️⃣  Expanding seed concept...');
  const children = await expand(seed);
  console.log(`   Generated ${children.length} child concepts\n`);
  children.forEach((child, i) => {
    console.log(`   ${i + 1}. ${child.name}: ${child.description}`);
  });

  // 3. Explore
  console.log('\n3️⃣  Exploring related concepts...');
  const related = await explore(seed, 'high');
  console.log(`   Found ${related.length} related concepts\n`);
  related.slice(0, 5).forEach((rel, i) => {
    console.log(`   ${i + 1}. ${rel.name}: ${rel.description}`);
  });

  // 4. Expand list
  if (children.length >= 2) {
    console.log('\n4️⃣  Expanding from multiple parents...');
    const multiChildren = await expandList(children.slice(0, 2));
    console.log(`   Generated ${multiChildren.length} concepts from multiple parents\n`);
    multiChildren.slice(0, 3).forEach((child, i) => {
      console.log(`   ${i + 1}. ${child.name}: ${child.description}`);
      console.log(`      Parents: ${child.parents.join(', ')}`);
    });
  }

  // 5. Synthesize
  if (children.length >= 2) {
    console.log('\n5️⃣  Synthesizing hybrid concepts...');
    const synthesized = await synthesize(children.slice(0, 2));
    console.log(`   Created ${synthesized.length} hybrid concepts\n`);
    synthesized.forEach((syn, i) => {
      console.log(`   ${i + 1}. ${syn.name}: ${syn.description}`);
      console.log(`      Parents: ${syn.parents.join(', ')}`);
    });
  }

  // 6. Build graph
  console.log('\n6️⃣  Building concept graph...');
  let graph = createGraph();
  
  // Add all concepts
  graph = addConceptsToGraph(graph, [seed]);
  graph = addConceptsToGraph(graph, children);
  graph = addConceptsToGraph(graph, related);
  if (children.length >= 2) {
    const multiChildren = await expandList(children.slice(0, 2));
    graph = addConceptsToGraph(graph, multiChildren);
    
    const synthesized = await synthesize(children.slice(0, 2));
    graph = addConceptsToGraph(graph, synthesized);
  }

  const allConcepts = getAllConcepts(graph);
  console.log(`   Graph contains ${allConcepts.length} concepts\n`);

  // 7. Visualize
  visualizeGraph(allConcepts);

  // 8. Export
  exportGraphJSON(allConcepts, 'demo-graph.json');

  console.log('✨ Demo complete!\n');
}

/**
 * Main execution
 */
async function main() {
  try {
    await runDemo();
  } catch (error) {
    console.error('Error running demo:', error);
    if (error instanceof Error && error.message.includes('OPENAI_API_KEY')) {
      console.error('\n⚠️  Please set OPENAI_API_KEY in your .env file\n');
    }
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { runDemo, visualizeGraph, exportGraphJSON };

