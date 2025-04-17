import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../styles/SnakeGame.css';

// Game constants
const GRID_SIZE = 20;
const CELL_SIZE = 20;
const GAME_SPEED = 100; // milliseconds
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const DIRECTIONS = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  d: { x: 1, y: 0 },
};

const SnakeGame: React.FC = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState({ x: 0, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const gameLoopRef = useRef<number | null>(null);

  // Generate random food position
  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };

    // Make sure food doesn't spawn on snake
    if (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
      return generateFood();
    }

    return newFood;
  }, [snake]);

  // Handle keyboard controls
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!gameStarted && (e.key === 'ArrowUp' || e.key === 'ArrowDown' || 
        e.key === 'ArrowLeft' || e.key === 'ArrowRight' ||
        e.key === 'w' || e.key === 's' || e.key === 'a' || e.key === 'd')) {
      setGameStarted(true);
    }

    if (e.key === ' ') {
      setIsPaused(prev => !prev);
      return;
    }
    
    // Prevent moving in the opposite direction
    if (
      (e.key === 'ArrowUp' && direction.y !== 1) ||
      (e.key === 'w' && direction.y !== 1)
    ) {
      setDirection(DIRECTIONS.ArrowUp);
    } else if (
      (e.key === 'ArrowDown' && direction.y !== -1) ||
      (e.key === 's' && direction.y !== -1)
    ) {
      setDirection(DIRECTIONS.ArrowDown);
    } else if (
      (e.key === 'ArrowLeft' && direction.x !== 1) ||
      (e.key === 'a' && direction.x !== 1)
    ) {
      setDirection(DIRECTIONS.ArrowLeft);
    } else if (
      (e.key === 'ArrowRight' && direction.x !== -1) ||
      (e.key === 'd' && direction.x !== -1)
    ) {
      setDirection(DIRECTIONS.ArrowRight);
    }
  }, [direction, gameStarted]);

  // Check collisions
  const checkCollisions = useCallback((head: { x: number; y: number }) => {
    // Check wall collisions
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      return true;
    }

    // Check self collision (except for the last segment which will move)
    for (let i = 0; i < snake.length - 1; i++) {
      if (snake[i].x === head.x && snake[i].y === head.y) {
        return true;
      }
    }

    return false;
  }, [snake]);

  // Game loop
  const gameLoop = useCallback(() => {
    if (isPaused || !gameStarted || gameOver) return;

    setSnake(prevSnake => {
      const head = { ...prevSnake[0] };
      head.x += direction.x;
      head.y += direction.y;

      // Check collisions
      if (checkCollisions(head)) {
        setGameOver(true);
        return prevSnake;
      }

      const newSnake = [head, ...prevSnake];

      // Check if snake ate food
      if (head.x === food.x && head.y === food.y) {
        setScore(prevScore => prevScore + 1);
        setFood(generateFood());
      } else {
        // Remove tail if no food eaten
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, checkCollisions, generateFood, isPaused, gameStarted, gameOver]);

  // Set up game loop and keyboard listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    if (gameStarted && !gameOver && !isPaused) {
      gameLoopRef.current = window.setInterval(gameLoop, GAME_SPEED);
    } else if (isPaused || gameOver) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameLoop, handleKeyDown, gameStarted, gameOver, isPaused]);

  // Reset game
  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(generateFood());
    setDirection({ x: 0, y: 0 });
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
    setGameStarted(false);
  };

  // Rendering functions
  const renderGrid = (): React.ReactElement[] => {
    const grid: React.ReactElement[] = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const isSnake = snake.some(segment => segment.x === col && segment.y === row);
        const isHead = snake[0].x === col && snake[0].y === row;
        const isFood = food.x === col && food.y === row;
        const key = `${row}-${col}`;
        let cellClass = 'cell';
        
        if (isHead) {
          cellClass += ' snake-head';
        } else if (isSnake) {
          cellClass += ' snake-body';
        } else if (isFood) {
          cellClass += ' food';
        }
        
        grid.push(
          <div 
            key={key} 
            className={cellClass} 
            style={{ 
              top: row * CELL_SIZE + 'px', 
              left: col * CELL_SIZE + 'px',
              width: CELL_SIZE + 'px',
              height: CELL_SIZE + 'px' 
            }}
          />
        );
      }
    }
    return grid;
  };

  // Start game with controls on mobile
  const handleSwipe = (dir: 'up' | 'down' | 'left' | 'right') => {
    if (!gameStarted) {
      setGameStarted(true);
    }
    
    if (dir === 'up' && direction.y !== 1) {
      setDirection(DIRECTIONS.ArrowUp);
    } else if (dir === 'down' && direction.y !== -1) {
      setDirection(DIRECTIONS.ArrowDown);
    } else if (dir === 'left' && direction.x !== 1) {
      setDirection(DIRECTIONS.ArrowLeft);
    } else if (dir === 'right' && direction.x !== -1) {
      setDirection(DIRECTIONS.ArrowRight);
    }
  };

  return (
    <div className="snake-game-container">
      <div className="game-header">
        <h2>Snake Game</h2>
        <div className="score">Score: {score}</div>
      </div>
      
      <div className="game-board" style={{ width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE }}>
        {renderGrid()}
        
        {!gameStarted && !gameOver && (
          <div className="game-overlay">
            <div className="overlay-content">
              <h2>Snake Game</h2>
              <p>Press any arrow key to start</p>
              <p>Use arrow keys or WASD to move</p>
              <p>Space to pause</p>
            </div>
          </div>
        )}
        
        {gameOver && (
          <div className="game-overlay">
            <div className="overlay-content">
              <h2>Game Over!</h2>
              <p>Your score: {score}</p>
              <button className="restart-button" onClick={resetGame}>
                Play Again
              </button>
            </div>
          </div>
        )}
        
        {isPaused && !gameOver && (
          <div className="game-overlay">
            <div className="overlay-content">
              <h2>Paused</h2>
              <p>Press Space to continue</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="mobile-controls">
        <button className="control-btn up" onClick={() => handleSwipe('up')}>▲</button>
        <div className="middle-controls">
          <button className="control-btn left" onClick={() => handleSwipe('left')}>◀</button>
          <button className="control-btn right" onClick={() => handleSwipe('right')}>▶</button>
        </div>
        <button className="control-btn down" onClick={() => handleSwipe('down')}>▼</button>
      </div>
    </div>
  );
};

export default SnakeGame; 