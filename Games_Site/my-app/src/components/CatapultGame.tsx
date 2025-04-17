import React, { useState, useEffect, useRef } from 'react';
import '../styles/CatapultGame.css';

interface TrailPoint {
  x: number;
  y: number;
  age: number;
}

const CatapultGame: React.FC = () => {
  // Game states
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(3);
  const [dragging, setDragging] = useState(false);
  const [projectilePos, setProjectilePos] = useState({ x: 100, y: 350 });
  const [projectileStart, setProjectileStart] = useState({ x: 100, y: 350 });
  const [projectileFlying, setProjectileFlying] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [lastShotScore, setLastShotScore] = useState(0);
  const [showHint, setShowHint] = useState(true);
  
  // Trail effect
  const [trailPoints, setTrailPoints] = useState<TrailPoint[]>([]);
  const MAX_TRAIL_POINTS = 20;
  const TRAIL_LIFETIME = 30; // frames
  
  // Canvas references
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  
  // Target position
  const targetPos = { x: 700, y: 350, radius: 50 };
  const targetRings = [
    { radius: 50, points: 10, color: '#FF0000' },    // Bullseye
    { radius: 75, points: 5, color: '#FFFFFF' },     // Middle ring
    { radius: 100, points: 1, color: '#0000FF' }     // Outer ring
  ];
  
  // Physics constants
  const gravity = 0.5;
  const groundLevel = 400;
  const maxDragDistance = 150;
  
  // Projectile physics
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  
  // Initialize the game
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        drawGame(ctx);
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameActive, gameOver, projectileFlying, projectilePos, dragging]);
  
  // Draw all game elements
  const drawGame = (ctx: CanvasRenderingContext2D) => {
    // Clear canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Draw sky
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, ctx.canvas.width, groundLevel);
    
    // Draw ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, groundLevel, ctx.canvas.width, ctx.canvas.height - groundLevel);
    
    // Draw target rings from outside in
    targetRings.slice().reverse().forEach(ring => {
      ctx.beginPath();
      ctx.arc(targetPos.x, targetPos.y, ring.radius, 0, Math.PI * 2);
      ctx.fillStyle = ring.color;
      ctx.fill();
      ctx.closePath();
    });
    
    // Draw trail if flying
    if (projectileFlying || trailPoints.length > 0) {
      // Draw trail points
      trailPoints.forEach((point, index) => {
        const opacity = 1 - point.age / TRAIL_LIFETIME;
        const size = 8 * (1 - point.age / TRAIL_LIFETIME);
        
        ctx.beginPath();
        ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 0, 0, ${opacity})`;
        ctx.fill();
      });
    }
    
    // Draw catapult base
    ctx.fillStyle = '#654321';
    ctx.fillRect(60, groundLevel - 30, 80, 30);
    
    // Draw catapult arm
    ctx.beginPath();
    ctx.moveTo(100, groundLevel - 20);
    
    // Draw arm based on projectile position
    ctx.lineTo(projectilePos.x, projectilePos.y);
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#000000';
    ctx.stroke();
    
    // Draw trajectory prediction line if dragging
    if (dragging) {
      // Calculate distance and angle
      const dx = projectileStart.x - projectilePos.x;
      const dy = projectileStart.y - projectilePos.y;
      const distance = Math.min(Math.sqrt(dx * dx + dy * dy), maxDragDistance);
      const power = distance / maxDragDistance;
      
      // Draw a dotted line showing predicted trajectory
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(projectilePos.x, projectilePos.y);
      
      // Simulate trajectory (simplified)
      let simX = projectilePos.x;
      let simY = projectilePos.y;
      const simVX = dx * 0.2;
      const simVY = dy * 0.2;
      
      for (let i = 0; i < 10; i++) {
        simX += simVX / 10;
        simY += simVY / 10 + (i * gravity) / 2;
        
        // Stop if hitting ground
        if (simY >= groundLevel) break;
        
        ctx.lineTo(simX, simY);
      }
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Draw power meter
      const meterWidth = 200;
      ctx.fillStyle = '#333333';
      ctx.fillRect(ctx.canvas.width / 2 - meterWidth / 2, 50, meterWidth, 20);
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(ctx.canvas.width / 2 - meterWidth / 2, 50, power * meterWidth, 20);
      
      // Power text
      ctx.fillStyle = '#000000';
      ctx.font = '16px Arial';
      ctx.fillText(`Power: ${Math.floor(power * 100)}%`, ctx.canvas.width / 2 - 40, 40);
    }
    
    // Draw projectile
    ctx.beginPath();
    ctx.arc(projectilePos.x, projectilePos.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#8B0000';
    ctx.fill();
    
    // Draw attempts remaining
    ctx.fillStyle = '#000000';
    ctx.font = '20px Arial';
    ctx.fillText(`Attempts: ${attempts}`, 50, 30);
    ctx.fillText(`Score: ${score}`, ctx.canvas.width - 150, 30);
    
    // Draw last shot score if available
    if (lastShotScore > 0 && !projectileFlying) {
      ctx.fillStyle = '#FF0000';
      ctx.font = 'bold 24px Arial';
      ctx.fillText(`+${lastShotScore}`, 350, 100);
    }
  };
  
  // Handle mouse down
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!gameActive) {
      setGameActive(true);
      setGameOver(false);
      setShowResults(false);
    }
    
    // Hide the hint when user starts interacting
    setShowHint(false);
    
    if (!projectileFlying && attempts > 0 && !gameOver) {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Check if clicked near the projectile
        const dx = x - projectilePos.x;
        const dy = y - projectilePos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 30) {
          setDragging(true);
        }
      }
    }
  };
  
  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragging && !projectileFlying && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Calculate distance from original position
      const dx = projectileStart.x - mouseX;
      const dy = projectileStart.y - mouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Limit the distance
      if (distance <= maxDragDistance) {
        setProjectilePos({ x: mouseX, y: mouseY });
      } else {
        // Scale the position to max distance
        const ratio = maxDragDistance / distance;
        setProjectilePos({
          x: projectileStart.x - dx * ratio,
          y: projectileStart.y - dy * ratio
        });
      }
    }
  };
  
  // Handle mouse up - release the catapult
  const handleMouseUp = () => {
    if (dragging && !projectileFlying && attempts > 0) {
      setDragging(false);
      setLastShotScore(0);
      
      // Clear any existing trail
      setTrailPoints([]);
      
      // Calculate velocity based on distance from start position
      const dx = projectileStart.x - projectilePos.x;
      const dy = projectileStart.y - projectilePos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Only launch if there's enough dragging distance
      if (distance > 10) {
        console.log("Launching ball!");
        
        // Calculate launch velocity based on drag distance and direction
        // Scale factor controls the power
        const scaleFactor = 0.15;
        const newVelocity = { 
          x: dx * scaleFactor, 
          y: dy * scaleFactor 
        };
        
        // Set the velocity state
        setVelocity(newVelocity);
        
        // Set projectile flying state to true
        setProjectileFlying(true);
        
        // Save current position and velocity for animation
        const initialPos = { ...projectilePos };
        
        // Run animation independent of React's state updates
        // This is critical for smooth animation
        runAnimation(initialPos, newVelocity);
      } else {
        // If barely dragged, just reset position
        setProjectilePos({ x: projectileStart.x, y: projectileStart.y });
      }
    }
  };
  
  // Run animation with vanilla JS for better performance
  const runAnimation = (initialPos: {x: number, y: number}, initialVelocity: {x: number, y: number}) => {
    // Cancel any existing animation
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
    }
    
    let pos = { ...initialPos };
    let vel = { ...initialVelocity };
    let trail: TrailPoint[] = [];
    
    // Animation function that runs each frame
    const animateFrame = () => {
      // If no longer flying, stop animation
      if (!projectileFlying) return;
      
      // Apply physics
      vel.y += gravity;
      pos.x += vel.x;
      pos.y += vel.y;
      
      // Update trail
      trail.unshift({ x: pos.x, y: pos.y, age: 0 });
      trail = trail
        .map(p => ({ ...p, age: p.age + 1 }))
        .filter(p => p.age < TRAIL_LIFETIME)
        .slice(0, MAX_TRAIL_POINTS);
      
      // Update React state (minimally, for rendering)
      setProjectilePos(pos);
      setTrailPoints(trail);
      
      // Check for ground collision
      if (pos.y >= groundLevel - 10) {
        console.log("Hit ground!");
        setProjectileFlying(false);
        setAttempts(prev => prev - 1);
        
        // Reset ball after delay
        setTimeout(() => {
          setProjectilePos({ x: projectileStart.x, y: projectileStart.y });
        }, 500);
        
        // Check if game is over
        if (attempts <= 1) {
          setGameOver(true);
          setShowResults(true);
        }
        
        return;
      }
      
      // Check for target collision
      const distanceToTarget = Math.sqrt(
        Math.pow(pos.x - targetPos.x, 2) + 
        Math.pow(pos.y - targetPos.y, 2)
      );
      
      // Check which ring was hit
      for (let i = 0; i < targetRings.length; i++) {
        if (distanceToTarget <= targetRings[i].radius) {
          console.log("Hit target ring:", i);
          const shotScore = targetRings[i].points;
          setLastShotScore(shotScore);
          setScore(prev => prev + shotScore);
          setProjectileFlying(false);
          setAttempts(prev => prev - 1);
          
          // Reset ball after delay
          setTimeout(() => {
            setProjectilePos({ x: projectileStart.x, y: projectileStart.y });
          }, 800);
          
          // Check if game is over
          if (attempts <= 1) {
            setGameOver(true);
            setShowResults(true);
          }
          
          return;
        }
      }
      
      // Check if ball went off screen
      const canvasWidth = canvasRef.current?.width || 800;
      if (pos.x > canvasWidth || pos.x < 0 || pos.y < 0) {
        console.log("Off screen!");
        setProjectileFlying(false);
        setAttempts(prev => prev - 1);
        
        // Reset ball after delay
        setTimeout(() => {
          setProjectilePos({ x: projectileStart.x, y: projectileStart.y });
        }, 500);
        
        // Check if game is over
        if (attempts <= 1) {
          setGameOver(true);
          setShowResults(true);
        }
        
        return;
      }
      
      // Continue animation
      animationRef.current = requestAnimationFrame(animateFrame);
    };
    
    // Start animation on next frame
    animationRef.current = requestAnimationFrame(animateFrame);
  };
  
  // Restart the game
  const restartGame = () => {
    setScore(0);
    setAttempts(3);
    setGameActive(true);
    setGameOver(false);
    setProjectileFlying(false);
    setDragging(false);
    setShowResults(false);
    setLastShotScore(0);
    setShowHint(true);
    setTrailPoints([]);
    setProjectilePos({ x: projectileStart.x, y: projectileStart.y });
  };
  
  // Handle touch events for mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (canvasRef.current && e.touches.length > 0) {
      const rect = canvasRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      // Simulate mouse event
      const mouseEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY
      } as React.MouseEvent<HTMLCanvasElement>;
      
      handleMouseDown(mouseEvent);
    }
  };
  
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (dragging && canvasRef.current && e.touches.length > 0) {
      const touch = e.touches[0];
      
      // Simulate mouse event
      const mouseEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY
      } as React.MouseEvent<HTMLCanvasElement>;
      
      handleMouseMove(mouseEvent);
    }
  };
  
  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    handleMouseUp();
  };

  return (
    <div className="catapult-game-container">
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={500} 
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
      
      {showHint && gameActive && !dragging && !projectileFlying && !gameOver && (
        <div className="hint-text">
          Click and drag the ball
        </div>
      )}
      
      {!gameActive && !gameOver && (
        <div className="game-overlay">
          <div className="overlay-content">
            <h2>Catapult Challenge</h2>
            <p>Click and drag the ball to aim</p>
            <p>Release to launch the projectile</p>
            <p>Try to hit the target bullseye!</p>
            <button className="game-button" onClick={restartGame}>Start Game</button>
          </div>
        </div>
      )}
      
      {showResults && (
        <div className="game-overlay">
          <div className="overlay-content">
            <h2>Game Over!</h2>
            <p>Your final score: {score}</p>
            <button className="game-button" onClick={restartGame}>Play Again</button>
          </div>
        </div>
      )}
      
      <div className="game-controls">
        <p>Click and drag the ball to aim and set power</p>
        <p>You have {attempts} attempts</p>
      </div>
    </div>
  );
};

export default CatapultGame; 