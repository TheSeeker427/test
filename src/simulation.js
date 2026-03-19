import { cloneGrid, countNeighbors } from './grid.js';

export function step(grid) {
  const height = grid.length;
  const width = grid[0].length;
  const newGrid = cloneGrid(grid);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const neighbors = countNeighbors(grid, x, y);
      const alive = grid[y][x] === 1;

      if (alive) {
        newGrid[y][x] = neighbors === 2 || neighbors === 3 ? 1 : 0;
      } else {
        newGrid[y][x] = neighbors === 3 ? 1 : 0;
      }
    }
  }

  return newGrid;
}

export function runSimulation(grid, generations, onStep) {
  let currentGrid = grid;
  for (let i = 0; i < generations; i++) {
    if (onStep) onStep(currentGrid, i);
    currentGrid = step(currentGrid);
  }
  return currentGrid;
}