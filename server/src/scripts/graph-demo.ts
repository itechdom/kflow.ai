/**
 * Interactive Graph Demo Script for Phase 1
 * 
 * REPL-style interface to test all operations interactively
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as readline from 'readline';
import { Concept } from '../types/concept';
import {
  expand,
  expandList,
  synthesize,
  deriveParents,
  explore,
  refocus,
  validateLinks,
  tracePath,
  deriveSummary,
} from '../operations';
import { createGraph, addConceptsToGraph, getAllConcepts } from '../utils/graph';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

// Global state
let graph = createGraph();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * Prompt user for input
 */
function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

/**
 * Display concept list
 */
function displayConcepts(concepts: Concept[], title: string = 'Concepts') {
  console.log(`\n${title}:\n`);
  if (concepts.length === 0) {
    console.log('  (no concepts)');
    return;
  }
  concepts.forEach((concept, i) => {
    console.log(`  ${i + 1}. ${concept.name}`);
    console.log(`     ${concept.description}`);
    if (concept.parents.length > 0) {
      console.log(`     Parents: ${concept.parents.join(', ')}`);
    }
    if (concept.children.length > 0) {
      console.log(`     Children: ${concept.children.join(', ')}`);
    }
    console.log('');
  });
}

/**
 * Select a concept by name or index
 */
async function selectConcept(promptText: string = 'Select a concept'): Promise<Concept | null> {
  const allConcepts = getAllConcepts(graph);
  if (allConcepts.length === 0) {
    console.log('\n⚠️  No concepts in graph. Please create some first.\n');
    return null;
  }

  displayConcepts(allConcepts);
  const input = await question(`${promptText} (name or number, or 'cancel'): `);
  
  if (input.toLowerCase() === 'cancel') {
    return null;
  }

  // Try as index
  const index = parseInt(input, 10);
  if (!isNaN(index) && index > 0 && index <= allConcepts.length) {
    return allConcepts[index - 1];
  }

  // Try as name
  const concept = allConcepts.find(c => c.name.toLowerCase() === input.toLowerCase());
  if (concept) {
    return concept;
  }

  console.log('❌ Concept not found');
  return null;
}

/**
 * Select multiple concepts
 */
async function selectConcepts(promptText: string = 'Select concepts'): Promise<Concept[]> {
  const allConcepts = getAllConcepts(graph);
  if (allConcepts.length === 0) {
    console.log('\n⚠️  No concepts in graph. Please create some first.\n');
    return [];
  }

  console.log('\nOptions:');
  console.log('  1. Use all concepts from graph');
  console.log('  2. Select specific concepts');
  console.log('  3. Cancel');

  const choice = await question('\nChoice (1-3): ');
  
  if (choice === '1') {
    return allConcepts;
  } else if (choice === '2') {
    const selected: Concept[] = [];
    displayConcepts(allConcepts, 'Available Concepts');
    
    while (true) {
      const input = await question('Enter concept number/name (or "done" to finish): ');
      if (input.toLowerCase() === 'done') {
        break;
      }

      const index = parseInt(input, 10);
      let concept: Concept | undefined;
      
      if (!isNaN(index) && index > 0 && index <= allConcepts.length) {
        concept = allConcepts[index - 1];
      } else {
        concept = allConcepts.find(c => c.name.toLowerCase() === input.toLowerCase());
      }

      if (concept && !selected.find(c => c.name === concept!.name)) {
        selected.push(concept);
        console.log(`✓ Added: ${concept.name}`);
      } else if (concept) {
        console.log('⚠️  Already selected');
      } else {
        console.log('❌ Concept not found');
      }
    }
    
    return selected;
  }
  
  return [];
}

/**
 * Operation: expand
 */
async function runExpand() {
  console.log('\n📖 Expand Operation');
  console.log('Generates 3-7 sub-concepts of a concept\n');
  
  const concept = await selectConcept('Select concept to expand');
  if (!concept) return;

  try {
    console.log('\n⏳ Generating...');
    const results = await expand(concept);
    graph = addConceptsToGraph(graph, results);
    
    console.log(`\n✅ Generated ${results.length} child concepts:`);
    displayConcepts(results, 'New Concepts');
    console.log('✓ Added to graph\n');
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
  }
}

/**
 * Operation: expandList
 */
async function runExpandList() {
  console.log('\n📋 Expand List Operation');
  console.log('Generates concepts from multiple parents\n');
  
  const concepts = await selectConcepts('Select parent concepts');
  if (concepts.length === 0) return;

  try {
    console.log('\n⏳ Generating...');
    const results = await expandList(concepts);
    graph = addConceptsToGraph(graph, results);
    
    console.log(`\n✅ Generated ${results.length} concepts:`);
    displayConcepts(results, 'New Concepts');
    console.log('✓ Added to graph\n');
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
  }
}

/**
 * Operation: synthesize
 */
async function runSynthesize() {
  console.log('\n🔀 Synthesize Operation');
  console.log('Generates hybrid concepts combining multiple parents\n');
  
  const concepts = await selectConcepts('Select parent concepts to synthesize');
  if (concepts.length === 0) return;

  try {
    console.log('\n⏳ Generating...');
    const results = await synthesize(concepts);
    graph = addConceptsToGraph(graph, results);
    
    console.log(`\n✅ Generated ${results.length} hybrid concepts:`);
    displayConcepts(results, 'New Concepts');
    console.log('✓ Added to graph\n');
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
  }
}

/**
 * Operation: deriveParents
 */
async function runDeriveParents() {
  console.log('\n⬆️  Derive Parents Operation');
  console.log('Generates prerequisite concepts\n');
  
  const concept = await selectConcept('Select concept to derive parents for');
  if (!concept) return;

  try {
    console.log('\n⏳ Generating...');
    const results = await deriveParents(concept);
    graph = addConceptsToGraph(graph, results);
    
    console.log(`\n✅ Generated ${results.length} prerequisite concepts:`);
    displayConcepts(results, 'New Concepts');
    console.log('✓ Added to graph\n');
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
  }
}

/**
 * Operation: explore
 */
async function runExplore() {
  console.log('\n🔍 Explore Operation');
  console.log('Generates related concepts (lateral exploration)\n');
  
  const concept = await selectConcept('Select concept to explore');
  if (!concept) return;

  const diversityInput = await question('Diversity level (low/medium/high) [high]: ');
  const diversity = ['low', 'medium', 'high'].includes(diversityInput.toLowerCase())
    ? diversityInput.toLowerCase() as 'low' | 'medium' | 'high'
    : 'high';

  try {
    console.log('\n⏳ Generating...');
    const results = await explore(concept, diversity);
    graph = addConceptsToGraph(graph, results);
    
    console.log(`\n✅ Generated ${results.length} related concepts:`);
    displayConcepts(results, 'New Concepts');
    console.log('✓ Added to graph\n');
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
  }
}

/**
 * Operation: refocus
 */
async function runRefocus() {
  console.log('\n🎯 Refocus Operation');
  console.log('Updates attention scores based on a goal\n');
  
  const concepts = await selectConcepts('Select concepts to refocus');
  if (concepts.length === 0) return;

  const goal = await question('Enter learning goal: ');
  if (!goal.trim()) {
    console.log('❌ Goal is required');
    return;
  }

  try {
    console.log('\n⏳ Generating...');
    const results = await refocus(concepts, goal.trim());
    graph = addConceptsToGraph(graph, results.map(r => ({
      name: r.name,
      description: r.description,
      parents: r.parents,
      children: r.children,
    })));
    
    console.log(`\n✅ Updated ${results.length} concepts with attention scores:`);
    results.forEach((result, i) => {
      console.log(`\n  ${i + 1}. ${result.name}`);
      console.log(`     Attention: ${result.attention_score?.toFixed(2) || 'N/A'}`);
      console.log(`     Importance: ${result.importance || 'N/A'}`);
    });
    console.log('\n✓ Updated in graph\n');
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
  }
}

/**
 * Operation: validateLinks
 */
async function runValidateLinks() {
  console.log('\n✓ Validate Links Operation');
  console.log('Validates relationships between concepts\n');
  
  const concepts = await selectConcepts('Select concepts to validate');
  if (concepts.length === 0) return;

  try {
    console.log('\n⏳ Validating...');
    const results = await validateLinks(concepts);
    graph = addConceptsToGraph(graph, results.map(r => ({
      name: r.name,
      description: r.description,
      parents: r.parents,
      children: r.children,
    })));
    
    console.log(`\n✅ Validated ${results.length} concepts:`);
    results.forEach((result, i) => {
      console.log(`\n  ${i + 1}. ${result.name}`);
      console.log(`     Validation Score: ${result.validation_score?.toFixed(2) || 'N/A'}`);
      console.log(`     Parents: ${result.parents.join(', ') || 'none'}`);
    });
    console.log('\n✓ Updated in graph\n');
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
  }
}

/**
 * Operation: tracePath
 */
async function runTracePath() {
  console.log('\n🛤️  Trace Path Operation');
  console.log('Generates learning path between two concepts\n');
  
  console.log('Select start concept:');
  const start = await selectConcept('Start');
  if (!start) return;

  console.log('\nSelect end concept:');
  const end = await selectConcept('End');
  if (!end) return;

  try {
    console.log('\n⏳ Generating path...');
    const results = await tracePath(start, end);
    graph = addConceptsToGraph(graph, results);
    
    console.log(`\n✅ Generated path with ${results.length} concepts:`);
    results.forEach((concept, i) => {
      console.log(`  ${i + 1}. ${concept.name}`);
    });
    console.log('\n✓ Added to graph\n');
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
  }
}

/**
 * Operation: deriveSummary
 */
async function runDeriveSummary() {
  console.log('\n📝 Derive Summary Operation');
  console.log('Generates summary concepts for a layer\n');
  
  const concepts = await selectConcepts('Select concepts in layer');
  if (concepts.length === 0) return;

  try {
    console.log('\n⏳ Generating summary...');
    const results = await deriveSummary(concepts);
    graph = addConceptsToGraph(graph, results);
    
    console.log(`\n✅ Generated ${results.length} summary concepts:`);
    displayConcepts(results, 'Summary Concepts');
    console.log('✓ Added to graph\n');
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
  }
}

/**
 * Create a seed concept
 */
async function createSeed() {
  console.log('\n🌱 Create Seed Concept\n');
  
  const name = await question('Concept name: ');
  if (!name.trim()) {
    console.log('❌ Name is required');
    return;
  }

  const description = await question('Description: ');
  if (!description.trim()) {
    console.log('❌ Description is required');
    return;
  }

  const seed: Concept = {
    name: name.trim(),
    description: description.trim(),
    parents: [],
    children: [],
  };

  graph = addConceptsToGraph(graph, [seed]);
  console.log(`\n✅ Created seed concept: ${seed.name}\n`);
}

/**
 * Display graph statistics
 */
function showGraphStats() {
  const allConcepts = getAllConcepts(graph);
  const rootConcepts = allConcepts.filter(c => c.parents.length === 0);
  const childConcepts = allConcepts.filter(c => c.parents.length > 0);

  console.log('\n📊 Graph Statistics\n');
  console.log(`Total Concepts: ${allConcepts.length}`);
  console.log(`Root Concepts: ${rootConcepts.length}`);
  console.log(`Child Concepts: ${childConcepts.length}`);
  console.log('');
}

/**
 * Display all concepts in graph
 */
function showAllConcepts() {
  const allConcepts = getAllConcepts(graph);
  displayConcepts(allConcepts, 'All Concepts in Graph');
}

/**
 * Main menu
 */
async function showMenu() {
  console.log('\n' + '='.repeat(60));
  console.log('🎯 KFlow Interactive Demo - Phase 1');
  console.log('='.repeat(60));
  console.log('\nOperations:');
  console.log('  1. 📖 Expand - Generate sub-concepts');
  console.log('  2. 📋 Expand List - Generate from multiple parents');
  console.log('  3. 🔀 Synthesize - Generate hybrid concepts');
  console.log('  4. ⬆️  Derive Parents - Generate prerequisites');
  console.log('  5. 🔍 Explore - Generate related concepts');
  console.log('  6. 🎯 Refocus - Update attention scores');
  console.log('  7. ✓ Validate Links - Validate relationships');
  console.log('  8. 🛤️  Trace Path - Generate learning path');
  console.log('  9. 📝 Derive Summary - Generate layer summary');
  console.log('\nUtilities:');
  console.log('  10. 🌱 Create Seed - Add a new concept');
  console.log('  11. 📊 Show Graph Stats - Display statistics');
  console.log('  12. 📋 Show All Concepts - List all concepts');
  console.log('  13. ❌ Exit');
  console.log('');
}

/**
 * Main loop
 */
async function runDemo() {
  console.log('🚀 Starting KFlow Interactive Demo\n');
  console.log('Note: Make sure OPENAI_API_KEY is set in your .env file\n');

  // Optionally create an initial seed
  const createInitial = await question('Create an initial seed concept? (y/n) [y]: ');
  if (createInitial.toLowerCase() !== 'n') {
    await createSeed();
  }

  while (true) {
    await showMenu();
    const choice = await question('Select operation (1-13): ');

    switch (choice) {
      case '1':
        await runExpand();
        break;
      case '2':
        await runExpandList();
        break;
      case '3':
        await runSynthesize();
        break;
      case '4':
        await runDeriveParents();
        break;
      case '5':
        await runExplore();
        break;
      case '6':
        await runRefocus();
        break;
      case '7':
        await runValidateLinks();
        break;
      case '8':
        await runTracePath();
        break;
      case '9':
        await runDeriveSummary();
        break;
      case '10':
        await createSeed();
        break;
      case '11':
        showGraphStats();
        break;
      case '12':
        showAllConcepts();
        break;
      case '13':
      case 'exit':
      case 'quit':
        console.log('\n👋 Goodbye!\n');
        rl.close();
        return;
      default:
        console.log('\n❌ Invalid choice. Please select 1-13.\n');
    }

    // Small pause before showing menu again
    await question('\nPress Enter to continue...');
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    await runDemo();
  } catch (error) {
    console.error('\n❌ Error:', error);
    if (error instanceof Error && error.message.includes('OPENAI_API_KEY')) {
      console.error('\n⚠️  Please set OPENAI_API_KEY in your .env file\n');
    }
    rl.close();
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { runDemo };
