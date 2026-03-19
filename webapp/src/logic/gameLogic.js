export const PATTERNS = {
  glider: [[1, 0], [2, 1], [0, 2], [1, 2], [2, 2]],
  blinker: [[1, 0], [1, 1], [1, 2]],
  block: [[0, 0], [1, 0], [0, 1], [1, 1]],
};

export function createGrid(width, height, initialCells = []) {
  const grid = Array.from({ length: height }, () => Array(width).fill(0));
  for (const [x, y] of initialCells) {
    if (x >= 0 && x < width && y >= 0 && y < height) {
      grid[y][x] = 1;
    }
  }
  return grid;
}

export function cloneGrid(grid) {
  return grid.map(row => [...row]);
}

export function getCell(grid, x, y) {
  const height = grid.length;
  const width = grid[0]?.length || 0;
  if (x < 0 || x >= width || y < 0 || y >= height) {
    return 0;
  }
  return grid[y][x];
}

export function countNeighbors(grid, x, y) {
  let count = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      count += getCell(grid, x + dx, y + dy);
    }
  }
  return count;
}

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
