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

export function gridToString(grid, aliveChar = 'O', deadChar = '.') {
  return grid.map(row => row.map(cell => cell ? aliveChar : deadChar).join(' ')).join('\n');
}