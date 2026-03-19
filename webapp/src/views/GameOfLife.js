import { createGrid, step, PATTERNS } from '../logic/gameLogic.js';

export default function GameOfLife(container) {
  let canvas, ctx;
  let gridSize = 30;
  let cellSize;
  let grid = [];
  let generation = 0;
  let isRunning = false;
  let intervalId = null;
  let speed = 10;
  let selectedPattern = 'glider';

  const CANVAS_SIZE = 600;

  function countNeighbors(x, y) {
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
          count += grid[ny][nx];
        }
      }
    }
    return count;
  }

  function nextGeneration() {
    grid = step(grid);
    generation++;
    renderStats();
    draw();
  }

  function draw() {
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        if (grid[y][x]) {
          ctx.fillStyle = '#00ff88';
          ctx.shadowColor = '#00ff88';
          ctx.shadowBlur = 4;
          ctx.fillRect(x * cellSize + 1, y * cellSize + 1, cellSize - 2, cellSize - 2);
          ctx.shadowBlur = 0;
        }
      }
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= gridSize; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, CANVAS_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(CANVAS_SIZE, i * cellSize);
      ctx.stroke();
    }
  }

  function renderStats() {
    const genEl = document.getElementById('gol-generation');
    const aliveEl = document.getElementById('gol-alive');
    if (genEl) genEl.textContent = generation;
    if (aliveEl) aliveEl.textContent = grid.flat().reduce((a, b) => a + b, 0);
  }

  function initGrid(size) {
    gridSize = size;
    cellSize = Math.floor(CANVAS_SIZE / gridSize);
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    grid = createGrid(gridSize, gridSize);
    generation = 0;
    renderStats();
    draw();
  }

  function loadPattern(patternName) {
    const pattern = PATTERNS[patternName] || PATTERNS.glider;
    const offsetX = Math.floor(gridSize / 2) - 2;
    const offsetY = Math.floor(gridSize / 2) - 2;
    
    for (const [px, py] of pattern) {
      const x = offsetX + px;
      const y = offsetY + py;
      if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
        grid[y][x] = 1;
      }
    }
    renderStats();
    draw();
  }

  function play() {
    if (isRunning) return;
    isRunning = true;
    const ms = Math.floor(1000 / speed);
    intervalId = setInterval(nextGeneration, ms);
    updateButtonStates();
  }

  function pause() {
    isRunning = false;
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    updateButtonStates();
  }

  function stepSimulation() {
    pause();
    nextGeneration();
  }

  function randomize() {
    pause();
    grid = Array(gridSize).fill(null).map(() =>
      Array(gridSize).fill(null).map(() => Math.random() > 0.7 ? 1 : 0)
    );
    generation = 0;
    renderStats();
    draw();
  }

  function clearGrid() {
    pause();
    grid = createGrid(gridSize, gridSize);
    generation = 0;
    renderStats();
    draw();
  }

  function resetGrid() {
    pause();
    initGrid(30);
  }

  function updateButtonStates() {
    const playBtn = document.getElementById('gol-play');
    const pauseBtn = document.getElementById('gol-pause');
    if (playBtn) playBtn.disabled = isRunning;
    if (pauseBtn) pauseBtn.disabled = !isRunning;
  }

  function bindEvents() {
    const playBtn = document.getElementById('gol-play');
    const pauseBtn = document.getElementById('gol-pause');
    const stepBtn = document.getElementById('gol-step');
    const randomBtn = document.getElementById('gol-random');
    const clearBtn = document.getElementById('gol-clear');
    const resetBtn = document.getElementById('gol-reset');
    const speedRange = document.getElementById('gol-speed');
    const sizeRange = document.getElementById('gol-size');
    const patternSelect = document.getElementById('gol-pattern');
    const loadPatternBtn = document.getElementById('gol-load-pattern');

    if (playBtn) playBtn.addEventListener('click', play);
    if (pauseBtn) pauseBtn.addEventListener('click', pause);
    if (stepBtn) stepBtn.addEventListener('click', stepSimulation);
    if (randomBtn) randomBtn.addEventListener('click', randomize);
    if (clearBtn) clearBtn.addEventListener('click', clearGrid);
    if (resetBtn) resetBtn.addEventListener('click', resetGrid);

    if (speedRange) {
      speedRange.addEventListener('input', (e) => {
        speed = parseInt(e.target.value);
        const valEl = document.getElementById('gol-speed-value');
        if (valEl) valEl.textContent = speed;
        if (isRunning) {
          pause();
          play();
        }
      });
    }

    if (sizeRange) {
      sizeRange.addEventListener('input', (e) => {
        const newSize = parseInt(e.target.value);
        const valEl = document.getElementById('gol-size-value');
        if (valEl) valEl.textContent = newSize;
        pause();
        initGrid(newSize);
      });
    }

    if (loadPatternBtn) {
      loadPatternBtn.addEventListener('click', () => {
        pause();
        initGrid(gridSize);
        loadPattern(selectedPattern);
      });
    }

    if (patternSelect) {
      patternSelect.addEventListener('change', (e) => {
        selectedPattern = e.target.value;
      });
    }

    let isPainting = false;
    let paintValue = 1;

    function paintCell(e) {
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / cellSize);
      const y = Math.floor((e.clientY - rect.top) / cellSize);
      if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
        if (grid[y][x] !== paintValue) {
          grid[y][x] = paintValue;
          renderStats();
          draw();
        }
      }
    }

    if (canvas) {
      canvas.addEventListener('mousedown', (e) => {
        e.preventDefault();
        pause();
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / cellSize);
        const y = Math.floor((e.clientY - rect.top) / cellSize);
        if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
          paintValue = grid[y][x] ? 0 : 1;
          isPainting = true;
          grid[y][x] = paintValue;
          renderStats();
          draw();
        }
      });

      canvas.addEventListener('mousemove', (e) => {
        if (isPainting) {
          paintCell(e);
        }
      });

      canvas.addEventListener('mouseup', () => {
        isPainting = false;
      });

      canvas.addEventListener('mouseleave', () => {
        isPainting = false;
      });
    }
  }

  function render() {
    container.innerHTML = `
      <div class="page-header">
        <h1>Conway's Game of Life</h1>
      </div>

      <div class="gol-layout">
        <div class="gol-sidebar">
          <div class="card">
            <div class="card-header">
              <span class="card-title">Controls</span>
            </div>
            <div class="gol-controls">
              <div class="gol-buttons">
                <button id="gol-play" class="btn btn-success">Play</button>
                <button id="gol-pause" class="btn btn-warning" disabled>Pause</button>
                <button id="gol-step" class="btn">Step</button>
                <button id="gol-random" class="btn">Randomize</button>
                <button id="gol-clear" class="btn btn-danger">Clear</button>
                <button id="gol-reset" class="btn">Reset (30x30)</button>
              </div>

              <div class="gol-slider-group">
                <label class="gol-label">
                  Speed: <span id="gol-speed-value">${speed}</span> gen/s
                </label>
                <input type="range" id="gol-speed" min="1" max="30" value="${speed}" class="gol-range">
              </div>

              <div class="gol-slider-group">
                <label class="gol-label">
                  Grid Size: <span id="gol-size-value">${gridSize}</span>x<span id="gol-size-value2">${gridSize}</span>
                </label>
                <input type="range" id="gol-size" min="5" max="60" value="${gridSize}" class="gol-range">
              </div>

              <div class="gol-pattern-select">
                <label class="gol-label">Pattern</label>
                <select id="gol-pattern">
                  <option value="glider">Glider</option>
                  <option value="blinker">Blinker</option>
                  <option value="block">Block</option>
                </select>
              </div>
              <button id="gol-load-pattern" class="btn">Load Pattern</button>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <span class="card-title">Statistics</span>
            </div>
            <div class="gol-stats">
              <div class="gol-stat-row">
                <span>Generation</span>
                <span id="gol-generation" class="gol-stat-value">0</span>
              </div>
              <div class="gol-stat-row">
                <span>Live Cells</span>
                <span id="gol-alive" class="gol-stat-value">0</span>
              </div>
              <div class="gol-stat-row">
                <span>Grid Size</span>
                <span id="gol-grid-size" class="gol-stat-value">${gridSize} x ${gridSize}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="gol-canvas-wrapper">
          <canvas id="gol-canvas" width="${CANVAS_SIZE}" height="${CANVAS_SIZE}"></canvas>
        </div>
      </div>
    `;

    canvas = document.getElementById('gol-canvas');
    ctx = canvas.getContext('2d');

    const sizeRange = document.getElementById('gol-size');
    if (sizeRange) {
      sizeRange.addEventListener('input', (e) => {
        const valEl2 = document.getElementById('gol-size-value2');
        if (valEl2) valEl2.textContent = e.target.value;
        const sizeEl = document.getElementById('gol-grid-size');
        if (sizeEl) sizeEl.textContent = `${e.target.value} x ${e.target.value}`;
      });
    }

    bindEvents();
    initGrid(30);
  }

  render();

  return {
    destroy() {
      pause();
    },
  };
}
