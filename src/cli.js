#!/usr/bin/env node

import { createGrid, gridToString } from './grid.js';
import { step, runSimulation } from './simulation.js';

const DEFAULT_WIDTH = 20;
const DEFAULT_HEIGHT = 10;
const DEFAULT_GENERATIONS = 10;

const gliderPattern = [
  [1, 0], [2, 1], [0, 2], [1, 2], [2, 2]
];

const blinkerPattern = [
  [1, 0], [1, 1], [1, 2]
];

const blockPattern = [
  [0, 0], [1, 0], [0, 1], [1, 1]
];

const patterns = {
  glider: gliderPattern,
  blinker: blinkerPattern,
  block: blockPattern,
};

function parseArgs(args) {
  const options = {
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    generations: DEFAULT_GENERATIONS,
    pattern: 'glider',
    delay: 500,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '-w':
      case '--width':
        options.width = parseInt(args[++i], 10);
        break;
      case '-h':
      case '--height':
        options.height = parseInt(args[++i], 10);
        break;
      case '-g':
      case '--generations':
        options.generations = parseInt(args[++i], 10);
        break;
      case '-p':
      case '--pattern':
        options.pattern = args[++i];
        break;
      case '-d':
      case '--delay':
        options.delay = parseInt(args[++i], 10);
        break;
      case '--help':
      case '-?':
        showHelp();
        process.exit(0);
    }
  }

  return options;
}

function showHelp() {
  console.log(`
Conway's Game of Life - CLI

Usage: node cli.js [options]

Options:
  -w, --width <n>      Grid width (default: ${DEFAULT_WIDTH})
  -h, --height <n>    Grid height (default: ${DEFAULT_HEIGHT})
  -g, --generations <n> Number of generations (default: ${DEFAULT_GENERATIONS})
  -p, --pattern <name> Pattern: glider, blinker, block (default: glider)
  -d, --delay <ms>    Delay between generations (default: 500)
  -?, --help          Show this help message
`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const pattern = patterns[options.pattern] || patterns.glider;
  const initialCells = pattern.map(([x, y]) => [x + 3, y + 3]);

  let grid = createGrid(options.width, options.height, initialCells);

  console.log('Generation 0:');
  console.log(gridToString(grid));
  console.log('');

  const run = async () => {
    for (let i = 1; i <= options.generations; i++) {
      await new Promise(resolve => setTimeout(resolve, options.delay));
      grid = step(grid);
      console.log(`Generation ${i}:`);
      console.log(gridToString(grid));
      console.log('');
    }
  };

  await run();
}

main();