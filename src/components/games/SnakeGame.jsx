import React, { useRef, useEffect, useState } from "react";

const GRID_COLS = 20; // تعداد ستون‌ها
const GRID_ROWS = 20; // تعداد ردیف‌ها
const INITIAL_SPEED = 150; // ms per step

function getRandomFood(snake) {
  while (true) {
    const x = Math.floor(Math.random() * GRID_COLS);
    const y = Math.floor(Math.random() * GRID_ROWS);
    const collides = snake.some(([sx, sy]) => sx === x && sy === y);
    if (!collides) return [x, y];
  }
}

const SnakeGame = ({ canvasSize = 480 }) => {
  const canvasRef = useRef(null);

  // mutable refs for game loop
  const snakeRef = useRef([[Math.floor(GRID_COLS/2), Math.floor(GRID_ROWS/2)]]);
  const dirRef = useRef([1, 0]); // [dx, dy] in grid coords (dx horizontally)
  const foodRef = useRef(getRandomFood(snakeRef.current));
  const runningRef = useRef(false);
  const speedRef = useRef(INITIAL_SPEED);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(0);
  const accumulatorRef = useRef(0);
  const [score, setScore] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // handle keyboard
  useEffect(() => {
    const handleKey = (e) => {
      if (!runningRef.current && (e.key === " " || e.key === "Spacebar")) {
        // space to toggle
        toggleRunning();
        e.preventDefault();
        return;
      }
      const [dx, dy] = dirRef.current;
      if (e.key === "ArrowUp" && !(dx === 0 && dy === 1)) dirRef.current = [0, -1];
      if (e.key === "ArrowDown" && !(dx === 0 && dy === -1)) dirRef.current = [0, 1];
      if (e.key === "ArrowLeft" && !(dx === 1 && dy === 0)) dirRef.current = [-1, 0];
      if (e.key === "ArrowRight" && !(dx === -1 && dy === 0)) dirRef.current = [1, 0];
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // draw function
  const draw = (ctx, width, height) => {
    // clear
    ctx.clearRect(0, 0, width, height);

    // compute cell size
    const cellW = width / GRID_COLS;
    const cellH = height / GRID_ROWS;

    // background
    ctx.fillStyle = "#0b1220";
    ctx.fillRect(0, 0, width, height);

    // draw food
    ctx.fillStyle = "#ff4d4d";
    ctx.beginPath();
    const [fx, fy] = foodRef.current;
    ctx.rect(fx * cellW + 1, fy * cellH + 1, cellW - 2, cellH - 2);
    ctx.fill();

    // draw snake
    ctx.fillStyle = "#4ade80";
    snakeRef.current.forEach(([sx, sy], i) => {
      ctx.fillStyle = i === 0 ? "#86efac" : "#4ade80";
      ctx.fillRect(sx * cellW + 1, sy * cellH + 1, cellW - 2, cellH - 2);
    });

    // draw grid (subtle)
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_COLS; i++) {
      const x = i * cellW;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let j = 0; j <= GRID_ROWS; j++) {
      const y = j * cellH;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  // step (move snake one cell)
  const step = () => {
    const snake = snakeRef.current;
    const dir = dirRef.current;
    const head = snake[0];
    const newHead = [head[0] + dir[0], head[1] + dir[1]];

    // wall collision
    if (
      newHead[0] < 0 || newHead[0] >= GRID_COLS ||
      newHead[1] < 0 || newHead[1] >= GRID_ROWS
    ) {
      endGame();
      return;
    }

    // self collision
    if (snake.some(([sx, sy]) => sx === newHead[0] && sy === newHead[1])) {
      endGame();
      return;
    }

    // add new head
    const newSnake = [newHead, ...snake];
    // eat food?
    const [fx, fy] = foodRef.current;
    if (newHead[0] === fx && newHead[1] === fy) {
      // increase score, generate new food
      const newFood = getRandomFood(newSnake);
      foodRef.current = newFood;
      setScore((s) => s + 1);
    } else {
      newSnake.pop();
    }

    snakeRef.current = newSnake;
  };

  const endGame = () => {
    runningRef.current = false;
    setIsRunning(false);
    setGameOver(true);
    cancelAnimationFrame(rafRef.current);
  };

  // game loop via RAF with accumulator to respect speedRef (ms per move)
  const loop = (time) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const width = canvasRef.current.width / dpr;
    const height = canvasRef.current.height / dpr;

    if (!lastTimeRef.current) lastTimeRef.current = time;
    const delta = time - lastTimeRef.current;
    lastTimeRef.current = time;
    accumulatorRef.current += delta;

    // render every frame for smooth visuals
    draw(ctx, width, height);

    // advance game state according to speed
    const stepMs = speedRef.current;
    while (accumulatorRef.current >= stepMs && runningRef.current) {
      step();
      accumulatorRef.current -= stepMs;
    }

    rafRef.current = requestAnimationFrame(loop);
  };

  // start the RAF loop (keeps drawing even if paused)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    // initial draw
    draw(ctx, rect.width, rect.height);

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleRunning = () => {
    if (gameOver) return;
    runningRef.current = !runningRef.current;
    setIsRunning(runningRef.current);
    // reset timing accumulators to avoid jumps
    lastTimeRef.current = 0;
    accumulatorRef.current = 0;
  };

  const restart = () => {
    snakeRef.current = [[Math.floor(GRID_COLS/2), Math.floor(GRID_ROWS/2)]];
    dirRef.current = [1, 0];
    foodRef.current = getRandomFood(snakeRef.current);
    setScore(0);
    setGameOver(false);
    runningRef.current = true;
    setIsRunning(true);
    lastTimeRef.current = 0;
    accumulatorRef.current = 0;
  };

  // small UI + canvas
  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="w-full flex items-center justify-between">
        <div className="text-white">Score: <span className="font-semibold">{score}</span></div>
        <div className="flex gap-2">
          <button
            onClick={toggleRunning}
            className="px-3 py-1 rounded bg-indigo-600 text-white text-sm"
          >
            {isRunning ? "Pause" : gameOver ? "Game Over" : "Play"}
          </button>
          <button
            onClick={restart}
            className="px-3 py-1 rounded bg-gray-700 text-white text-sm"
          >
            Restart
          </button>
        </div>
      </div>

      <div className="w-full max-w-[480px]">
        <div className="bg-gray-800 rounded p-2">
          <canvas
            ref={canvasRef}
            style={{ width: "100%", height: `${canvasSize}px`, display: "block", borderRadius: 6 }}
            aria-label="Snake game canvas"
          />
        </div>
        {gameOver && (
          <div className="mt-2 text-red-400 text-sm">Game Over — press Restart to play again</div>
        )}
        <div className="mt-2 text-xs text-gray-300">Use Arrow keys to control. Space = Play/Pause</div>
      </div>
    </div>
  );
};

export default SnakeGame;
