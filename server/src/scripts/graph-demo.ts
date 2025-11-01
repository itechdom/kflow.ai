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
  tracePath,
  deriveSummary,
  progressiveExpand,
} from '../operations';
import { createGraph, addConceptsToGraph, getAllConcepts, getConcept } from '../utils/graph';

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
    if (concept.layer !== undefined) {
      console.log(`     Layer: ${concept.layer}`);
    }
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

  // Get the latest concept from graph to ensure we have current children list
  const latestConcept = getConcept(graph, concept.name) || concept;

  try {
    console.log('\n⏳ Generating...');
    const results = await expand(latestConcept);
    graph = addConceptsToGraph(graph, results);
    
    // Filter out the updated parent concept from display
    const newChildren = results.filter(r => r.name !== latestConcept.name);
    const updatedParent = results.find(r => r.name === latestConcept.name);
    
    console.log(`\n✅ Generated ${newChildren.length} child concepts:`);
    displayConcepts(newChildren, 'New Concepts');
    if (updatedParent) {
      console.log(`\n✓ Updated parent "${latestConcept.name}" children list: ${updatedParent.children.join(', ')}`);
    }
    console.log('\n✓ Added to graph\n');
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

  // Get the latest concept from graph to ensure we have current state
  const latestConcept = getConcept(graph, concept.name) || concept;

  const diversityInput = await question('Diversity level (low/medium/high) [high]: ');
  const diversity = ['low', 'medium', 'high'].includes(diversityInput.toLowerCase())
    ? diversityInput.toLowerCase() as 'low' | 'medium' | 'high'
    : 'high';

  try {
    console.log('\n⏳ Generating...');
    const results = await explore(latestConcept, diversity);
    graph = addConceptsToGraph(graph, results);
    
    // Filter out updated parent concepts from display
    const newSiblings = results.filter(r => !latestConcept.parents.includes(r.name) && r.name !== latestConcept.name);
    const updatedParents = results.filter(r => latestConcept.parents.includes(r.name));
    
    console.log(`\n✅ Generated ${newSiblings.length} sibling concepts:`);
    displayConcepts(newSiblings, 'New Sibling Concepts');
    if (updatedParents.length > 0) {
      console.log(`\n✓ Updated ${updatedParents.length} parent concept(s) to include siblings`);
    } else if (latestConcept.parents.length === 0) {
      console.log(`\n✓ Root-level concepts (siblings of "${latestConcept.name}")`);
    }
    console.log('\n✓ Added to graph\n');
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
  console.log('Generates summary concepts for a specific layer\n');
  
  // Get all concepts with layer numbers
  const allConcepts = getAllConcepts(graph);
  const conceptsWithLayers = allConcepts.filter(c => c.layer !== undefined);
  
  if (conceptsWithLayers.length === 0) {
    console.log('\n⚠️  No concepts with layer numbers found. Please create concepts with layers first.\n');
    return;
  }
  
  // Find available layer numbers
  const availableLayers = Array.from(new Set(conceptsWithLayers.map(c => c.layer!))).sort((a, b) => a - b);
  
  console.log('\nAvailable layers:');
  availableLayers.forEach(layer => {
    const layerConcepts = conceptsWithLayers.filter(c => c.layer === layer);
    console.log(`  Layer ${layer}: ${layerConcepts.length} concept(s)`);
  });
  console.log('');
  
  // Ask for layer number
  const layerInput = await question('Enter layer number to summarize: ');
  const layerNumber = parseInt(layerInput, 10);
  
  if (isNaN(layerNumber) || !availableLayers.includes(layerNumber)) {
    console.log(`\n❌ Invalid layer number. Please choose from: ${availableLayers.join(', ')}\n`);
    return;
  }
  
  // Filter concepts by layer number
  const concepts = conceptsWithLayers.filter(c => c.layer === layerNumber);
  
  if (concepts.length === 0) {
    console.log(`\n⚠️  No concepts found for layer ${layerNumber}\n`);
    return;
  }
  
  console.log(`\n📚 Found ${concepts.length} concept(s) in layer ${layerNumber}:`);
  concepts.forEach((c, i) => {
    console.log(`  ${i + 1}. ${c.name}`);
  });
  console.log('');

  try {
    console.log('⏳ Generating summary...');
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
 * Operation: progressiveExpand
 */
async function runProgressiveExpand() {
  console.log('\n⚙️  Progressive Expand Operation');
  console.log('Generates next layer of concepts building on previous layers\n');
  
  const seedConcept = await selectConcept('Select seed concept for learning path');
  if (!seedConcept) return;

  // Get the latest concept from graph
  const latestSeedConcept = getConcept(graph, seedConcept.name) || seedConcept;
  
  // Automatically determine previous layers based on layer numbers
  const allConcepts = getAllConcepts(graph);
  
  // Calculate what the next layer number will be
  const conceptsWithLayers = allConcepts.filter(c => c.layer !== undefined);
  
  const maxLayer = conceptsWithLayers.length > 0
    ? Math.max(...conceptsWithLayers.map(c => c.layer!))
    : 0;
  const nextLayer = maxLayer + 1;
  
  // Find all concepts from previous layers (ONLY those with layer numbers)
  const previousLayers = allConcepts.filter(c => {
    // Only include concepts that have a layer number
    if (c.layer === undefined) {
      return false;
    }
    // Exclude the seed concept itself
    if (c.name === latestSeedConcept.name) {
      return false;
    }
    // Only include concepts from previous layers (lower layer numbers)
    return c.layer < nextLayer;
  });
  
  if (previousLayers.length > 0) {
    console.log(`\n📚 Automatically found ${previousLayers.length} concept(s) from previous layers:`);
    previousLayers.forEach((c, i) => {
      console.log(`  ${i + 1}. ${c.name}${c.layer !== undefined ? ` (Layer ${c.layer})` : ''}`);
    });
    console.log('');
  } else {
    console.log('\n📚 No previous layers found - this will be the first layer\n');
  }
  
  try {
    console.log('⏳ Generating next layer...');
    const results = await progressiveExpand(latestSeedConcept, previousLayers);
    graph = addConceptsToGraph(graph, results);
    
    // Filter out updated parent concepts from display
    const newConcepts = results.filter(r => !previousLayers.find(p => p.name === r.name));
    const updatedParents = results.filter(r => previousLayers.find(p => p.name === r.name));
    
    console.log(`\n✅ Generated ${newConcepts.length} concepts for next layer:`);
    newConcepts.forEach((concept, i) => {
      console.log(`\n  ${i + 1}. ${concept.name} (Layer ${concept.layer || 'N/A'})`);
      console.log(`     ${concept.description}`);
      if (concept.parents.length > 0) {
        console.log(`     Parents: ${concept.parents.join(', ')}`);
      }
    });
    
    if (updatedParents.length > 0) {
      console.log(`\n✓ Updated ${updatedParents.length} parent concept(s) from previous layer`);
    }
    console.log('\n✓ Added to graph\n');
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
  console.log('  7. 🛤️  Trace Path - Generate learning path');
  console.log('  8. 📝 Derive Summary - Generate layer summary');
  console.log('  9. ⚙️  Progressive Expand - Generate next learning layer');
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
        await runTracePath();
        break;
      case '8':
        await runDeriveSummary();
        break;
      case '9':
        await runProgressiveExpand();
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
