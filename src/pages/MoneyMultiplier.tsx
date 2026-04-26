import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Zap, Skull, TrendingUp, AlertTriangle, Pause, Play } from 'lucide-react';

interface GameState {
  status: 'idle' | 'playing' | 'cashed_out' | 'crashed';
  isPaused: boolean;
  multiplier: number;
  bet: number;
  playerY: number;
  maxPlayerY: number;
  comboActive: boolean;
  intensity: number;
}

const TILE_SIZE = 60;
const PADDING = 20;

export function MoneyMultiplier() {
  const { profile, preferences, payEntryFee, claimCashReward } = useGameStore();
  const [gameState, setGameState] = useState<GameState>({
    status: 'idle',
    isPaused: false,
    multiplier: 1.0,
    bet: 10,
    playerY: 0,
    maxPlayerY: 0,
    comboActive: false,
    intensity: 0,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const [betAmount, setBetAmount] = useState<string>('10');

  // Game internals
  const stateRef = useRef({
    player: { x: 3, y: 0, isShielded: false },
    rows: [] as any[],
    cameraY: 0,
    lastHops: [] as number[],
    lanes: 7,
    lastHopTime: 0,
    particles: [] as any[],
    shieldTimer: 0,
    lastShieldTime: 0,
    screenShake: 0,
    velocitySurge: false,
  });

  const formatCurrency = (val: number) => {
    return preferences.currency === 'CR' 
      ? val.toLocaleString() + ' CR' 
      : '$' + val.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})
  };

  const initGame = useCallback(async () => {
    const bet = parseFloat(betAmount);
    if (isNaN(bet) || bet <= 0 || !profile || profile.credits < bet) return;
    
    const paid = await payEntryFee(bet);
    if (!paid) return;

    stateRef.current = {
      player: { x: 3, y: 0, isShielded: false },
      rows: generateRows(0, 30),
      cameraY: 0,
      lastHops: [],
      lanes: 7,
      lastHopTime: performance.now(),
      particles: [],
      shieldTimer: 0,
      lastShieldTime: 0,
      screenShake: 0,
      velocitySurge: false,
    };

    setGameState({
      status: 'playing',
      isPaused: false,
      multiplier: 1.0,
      bet: bet,
      playerY: 0,
      maxPlayerY: 0,
      comboActive: false,
      intensity: 0,
    });
  }, [betAmount, profile, payEntryFee]);

  const generateRows = (startY: number, count: number) => {
    const newRows = [];
    for (let i = 0; i < count; i++) {
      const y = startY + i;
      let type = 'safe';
      let speed = 0;
      let obstacles: any[] = [];
      let direction = Math.random() > 0.5 ? 1 : -1;

      if (y > 2) {
        const rand = Math.random();
        if (rand < 0.6) type = 'road';
        else if (rand < 0.8) type = 'river';

        if (type !== 'safe') {
          // Base speed increases with Y
          speed = (2 + Math.random() * 2 + (y * 0.05)) * direction;
          let numObstacles = Math.floor(Math.random() * 3) + 1;
          for(let o=0; o<numObstacles; o++) {
             obstacles.push({
               x: Math.random() * 7,
               width: type === 'river' ? 1.5 : 1, // logs vs cars
             });
          }
        }
      }

      newRows.push({ y, type, speed, obstacles, direction });
    }
    return newRows;
  };

  const handleCashOut = async () => {
    if (gameState.status !== 'playing') return;
    const win = gameState.bet * gameState.multiplier;
    await claimCashReward(win);
    setGameState(prev => ({ ...prev, status: 'cashed_out' }));
  };

  const handleCrash = () => {
    setGameState(prev => ({ ...prev, status: 'crashed' }));
    stateRef.current.screenShake = 20;
    // Explode particles
    for(let i=0; i<30; i++) {
       stateRef.current.particles.push({
         x: stateRef.current.player.x + 0.5,
         y: stateRef.current.player.y + 0.5,
         vx: (Math.random() - 0.5) * 10,
         vy: (Math.random() - 0.5) * 10,
         life: 1.0,
         color: '#ef4444'
       });
    }
  };

  const hop = useCallback((dx: number, dy: number) => {
    if (gameState.status !== 'playing' || gameState.isPaused) return;
    const st = stateRef.current;
    
    // Limits
    if (st.player.x + dx < 0 || st.player.x + dx >= st.lanes) return;
    if (st.player.y + dy < 0) return;

    st.player.x += dx;
    st.player.y += dy;

    const now = performance.now();
    st.lastHops.push(now);
    if (st.lastHops.length > 5) st.lastHops.shift();
    
    let isSurge = (st.player.y > 0 && st.player.y % 10 === 0) || (st.player.y > 0 && Math.floor(st.player.y/10) < Math.floor((st.player.y+dy)/10));

    // Check combo
    let comboActive = gameState.comboActive;
    if (st.lastHops.length === 5 && (now - st.lastHops[0] < 3000) && st.shieldTimer <= 0) {
       if (st.lastShieldTime === 0 || now - st.lastShieldTime >= 15000) {
           st.shieldTimer = 3000; // 3 sec shield
           st.lastShieldTime = now;
           comboActive = true;
           st.lastHops = []; // reset combo
       }
    }

    setGameState(prev => {
      let nextMaxY = Math.max(prev.maxPlayerY, st.player.y);
      let baseMulti = 1.0 + (nextMaxY * 0.1);
      // Velocity surge multiplier bonus
      let surgeBonus = Math.floor(nextMaxY / 10) * 0.5; 
      
      if (isSurge && prev.maxPlayerY !== nextMaxY) {
         st.screenShake = 10; // flash
      }

      return {
        ...prev,
        playerY: st.player.y,
        maxPlayerY: nextMaxY,
        multiplier: parseFloat((baseMulti + surgeBonus).toFixed(2)),
        comboActive,
        intensity: Math.min(1.0, nextMaxY / 50)
      };
    });

    // Generate new rows if close to edge
    if (st.rows[st.rows.length - 1].y < st.player.y + 15) {
       st.rows.push(...generateRows(st.rows[st.rows.length - 1].y + 1, 10));
    }
  }, [gameState.status, gameState.isPaused, gameState.comboActive]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
          setGameState(p => {
             if (p.status === 'playing') {
                 return { ...p, isPaused: !p.isPaused };
             }
             return p;
          });
      }
      if (e.key === 'ArrowUp' || e.key === 'w') hop(0, 1);
      else if (e.key === 'ArrowDown' || e.key === 's') hop(0, -1);
      else if (e.key === 'ArrowLeft' || e.key === 'a') hop(-1, 0);
      else if (e.key === 'ArrowRight' || e.key === 'd') hop(1, 0);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hop]);

  // Main Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const loop = (time: number) => {
      requestRef.current = requestAnimationFrame(loop);
      let dt = (time - lastTime) / 1000;
      lastTime = time;

      const st = stateRef.current;
      if (gameState.status !== 'playing' && gameState.status !== 'crashed') return;
      if (gameState.isPaused) dt = 0;

      // Update Shield Timer
      if (st.shieldTimer > 0) {
        st.shieldTimer -= dt * 1000;
        st.player.isShielded = true;
        if (st.shieldTimer <= 0) {
            setGameState(p => ({ ...p, comboActive: false }));
        }
      } else {
        st.player.isShielded = false;
      }

      // Check Surge
      st.velocitySurge = Math.floor(st.player.y / 10) > 0 && (st.player.y % 10 >= 8 || st.player.y % 10 === 0);

      // Camera Follow Smooth
      let targetCameraY = st.player.y - 5; 
      if (targetCameraY < 0) targetCameraY = 0;
      st.cameraY += (targetCameraY - st.cameraY) * 5 * dt;

      // Logic
      let currentRow = st.rows.find(r => r.y === st.player.y);
      let hit = false;
      let onLog = false;

      if (gameState.status === 'playing') {
          for (let row of st.rows) {
             // Surge multiplier
             let speedMult = 1;
             if (Math.floor(row.y / 10) === Math.floor(st.player.y / 10) && st.velocitySurge) {
                 speedMult = 2.0;
             }
             
             for (let obs of row.obstacles) {
                obs.x += row.speed * speedMult * dt;
                // Wrap around
                if (row.speed > 0 && obs.x > st.lanes) obs.x = -obs.width;
                if (row.speed < 0 && obs.x < -obs.width) obs.x = st.lanes;

                // Collision
                if (row.y === st.player.y) {
                   if (st.player.x < obs.x + obs.width - 0.2 && st.player.x + 0.8 > obs.x + 0.2) {
                       if (row.type === 'road') hit = true;
                       if (row.type === 'river') onLog = true;
                   }
                }
             }
          }

          if (currentRow?.type === 'river' && !onLog) hit = true; // drowned

          if (hit && !st.player.isShielded) {
              handleCrash();
          }
      } else {
        // Just animate the obstacles during crash
        for (let row of st.rows) {
           for (let obs of row.obstacles) {
              obs.x += row.speed * dt;
              if (row.speed > 0 && obs.x > st.lanes) obs.x = -obs.width;
              if (row.speed < 0 && obs.x < -obs.width) obs.x = st.lanes;
           }
        }
      }

      // Update particles
      for (let i = st.particles.length - 1; i >= 0; i--) {
         let p = st.particles[i];
         p.x += p.vx * dt;
         p.y += p.vy * dt;
         p.life -= dt;
         if (p.life <= 0) st.particles.splice(i, 1);
      }

      // Screen shake decay
      if (st.screenShake > 0) st.screenShake *= 0.9;

      // Draw
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      
      // Apply shake
      if (st.screenShake > 0.5) {
          ctx.translate((Math.random()-0.5) * st.screenShake, (Math.random()-0.5) * st.screenShake);
      }

      // Chromatic aberration at high intensity
      if (gameState.intensity > 0) {
           // Can be done via CSS filter on canvas
      }

      const drawY = (y: number) => canvas.height - ((y - st.cameraY) * TILE_SIZE) - TILE_SIZE - PADDING;
      
      ctx.translate(canvas.width / 2 - (st.lanes * TILE_SIZE)/2, 0);

      // Draw Grid & Floor
      for (let row of st.rows) {
         let dy = drawY(row.y);
         if (dy < -TILE_SIZE || dy > canvas.height) continue; // cull

         // Surge visual
         if (row.y % 10 === 0 && row.y > 0) {
            ctx.fillStyle = `rgba(168, 85, 247, ${0.1 + (Math.sin(time/200)*0.1)})`; // Purple glow line
            ctx.fillRect(0, dy, st.lanes * TILE_SIZE, TILE_SIZE);
         }

         if (row.type === 'safe') ctx.fillStyle = '#111827'; // Dark gray
         if (row.type === 'road') ctx.fillStyle = '#0f172a'; // Slightly darker
         if (row.type === 'river') ctx.fillStyle = '#082f49'; // Very dark blueish
         
         ctx.fillRect(0, dy, st.lanes * TILE_SIZE, TILE_SIZE);
         
         // Grid lines
         ctx.strokeStyle = 'rgba(255,255,255,0.02)';
         ctx.lineWidth = 1;
         ctx.strokeRect(0, dy, st.lanes * TILE_SIZE, TILE_SIZE);

         // Obstacles
         for (let obs of row.obstacles) {
            if (row.type === 'road') {
                ctx.fillStyle = '#ef4444'; // Red cars
                ctx.shadowColor = '#ef4444';
                ctx.shadowBlur = 10;
                ctx.fillRect(obs.x * TILE_SIZE + 5, dy + 10, obs.width * TILE_SIZE - 10, TILE_SIZE - 20);
                ctx.shadowBlur = 0;
            } else if (row.type === 'river') {
                ctx.fillStyle = '#10b981'; // Green logs
                ctx.fillRect(obs.x * TILE_SIZE + 2, dy + 5, obs.width * TILE_SIZE - 4, TILE_SIZE - 10);
            }
         }
      }

      // Draw Player
      if (gameState.status !== 'crashed') {
          let py = drawY(st.player.y);
          ctx.fillStyle = st.player.isShielded ? '#a855f7' : '#3b82f6';
          if (st.player.isShielded) {
             ctx.shadowColor = '#a855f7';
             ctx.shadowBlur = 20;
          }
          ctx.fillRect(st.player.x * TILE_SIZE + 10, py + 10, TILE_SIZE - 20, TILE_SIZE - 20);
          ctx.shadowBlur = 0;
      }

      // Particles
      for (let p of st.particles) {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life;
          ctx.beginPath();
          ctx.arc(p.x * TILE_SIZE, drawY(p.y) + TILE_SIZE/2, 5, 0, Math.PI*2);
          ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      ctx.restore();
    };

    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState.status, gameState.intensity, gameState.isPaused]);

  const cssFilter = `hue-rotate(${gameState.intensity * 90}deg) saturate(${100 + gameState.intensity * 100}%)`;

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full max-w-6xl mx-auto flex-1 h-full min-h-[600px] mt-6 relative">
      
      {/* Game Canvas Container */}
      <div 
         className="flex-1 glass rounded-3xl relative overflow-hidden flex items-center justify-center border-2 border-white/5 bg-black"
         style={{ filter: cssFilter }}
      >
        <canvas 
           ref={canvasRef} 
           width={800} 
           height={600} 
           className="w-full h-full object-contain max-h-[700px] bg-[#020617]" 
        />
        
        {/* UI Overlay */}
        <div className="absolute top-6 left-6 flex items-center gap-4">
           <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 flex flex-col">
              <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Multiplier</span>
              <span className={`text-4xl font-black ${gameState.comboActive ? 'text-purple-400 animate-pulse' : 'text-emerald-400'}`}>
                 {gameState.multiplier.toFixed(2)}x
              </span>
           </div>
           
           {gameState.comboActive && (
              <div className="bg-purple-500/20 text-purple-400 border border-purple-500/50 px-4 py-2 rounded-full flex items-center gap-2 animate-bounce">
                <Zap fill="currentColor" className="w-4 h-4" /> Shield Active
              </div>
           )}
        </div>

        {stateRef.current.velocitySurge && (
           <div className="absolute top-6 right-6 bg-red-500/20 text-red-500 border border-red-500/50 px-4 py-2 rounded-full flex items-center gap-2 animate-pulse">
              <AlertTriangle className="w-4 h-4" /> Velocity Surge
           </div>
        )}

        {gameState.isPaused && gameState.status === 'playing' && (
           <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-40">
              <div className="text-center">
                 <h2 className="text-6xl font-black text-white tracking-widest uppercase mb-4 opacity-80">Paused</h2>
                 <p className="text-blue-400 font-mono text-xl uppercase">Click Cash Out to secure your winnings!</p>
              </div>
           </div>
        )}

        <AnimatePresence>
           {gameState.status === 'idle' && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-black/80 flex items-center justify-center p-6">
                 <div className="max-w-sm w-full bg-slate-900 border border-slate-700 p-8 rounded-3xl shadow-2xl text-center flex flex-col gap-6">
                    <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-blue-500/30">
                       <TrendingUp className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tight">Money Multiplier</h2>
                    <p className="text-gray-400 text-sm">Hop forward to increase your multiplier. Cash out before you crash!</p>
                    
                    <div className="bg-black/50 p-4 rounded-xl text-left border border-white/5 space-y-2">
                       <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">How to play</div>
                       <div className="text-sm text-gray-300 flex items-center gap-2"><ChevronRight className="w-4 h-4 text-emerald-500"/> Use Arrow Keys or WASD to hop.</div>
                       <div className="text-sm text-gray-300 flex items-center gap-2"><ChevronRight className="w-4 h-4 text-emerald-500"/> Every 10 rows is a Velocity Surge.</div>
                       <div className="text-sm text-purple-400 flex items-center gap-2"><Zap className="w-4 h-4"/> 5 fast hops = 3sec Shield (15s cooldown).</div>
                    </div>

                    <div className="flex flex-col gap-2 mt-4">
                       <label className="text-xs text-gray-500 text-left font-bold uppercase">Bet Amount ({preferences.currency})</label>
                       <input 
                          type="number" 
                          value={betAmount}
                          onChange={(e) => setBetAmount(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono"
                          min="1"
                       />
                    </div>
                    <button 
                       onClick={initGame}
                       className="w-full py-4 rounded-xl bg-blue-500 text-white font-black uppercase tracking-widest hover:bg-blue-600 transition-colors shadow-[0_0_20px_rgba(59,130,246,0.3)] mt-2"
                    >
                       Start Game
                    </button>
                 </div>
              </motion.div>
           )}

           {gameState.status === 'crashed' && (
              <motion.div initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} className="absolute inset-0 bg-red-950/80 flex flex-col items-center justify-center p-6 backdrop-blur-sm z-50">
                 <Skull className="w-24 h-24 text-red-500 mb-6 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                 <h2 className="text-5xl font-black text-white uppercase tracking-tighter mb-2">Crashed</h2>
                 <p className="text-red-400 text-xl font-mono mb-8">Lost {formatCurrency(gameState.bet)}</p>
                 <button 
                    onClick={() => setGameState(p => ({...p, status: 'idle'}))}
                    className="px-8 py-4 rounded-xl bg-white/10 text-white border border-white/20 font-black uppercase tracking-widest hover:bg-white/20 transition-all hover:scale-105"
                 >
                    Try Again
                 </button>
              </motion.div>
           )}

           {gameState.status === 'cashed_out' && (
              <motion.div initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} className="absolute inset-0 bg-emerald-950/80 flex flex-col items-center justify-center p-6 backdrop-blur-sm z-50">
                 <TrendingUp className="w-24 h-24 text-emerald-400 mb-6 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
                 <h2 className="text-5xl font-black text-white uppercase tracking-tighter mb-2">Cashed Out!</h2>
                 <p className="text-emerald-400 font-mono text-3xl font-bold mb-2">
                    +{formatCurrency(gameState.bet * gameState.multiplier)}
                 </p>
                 <p className="text-gray-400 text-sm mb-8 font-mono">({gameState.multiplier.toFixed(2)}x Multiplier)</p>
                 <button 
                    onClick={() => setGameState(p => ({...p, status: 'idle'}))}
                    className="px-8 py-4 rounded-xl bg-emerald-500 text-white font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105"
                 >
                    Play Again
                 </button>
              </motion.div>
           )}
        </AnimatePresence>
      </div>

      {/* Side Panel for controls/cashout */}
      <div className="w-full md:w-80 flex flex-col gap-4">
         <div className="glass p-6 rounded-3xl border-2 border-white/5 flex flex-col gap-4">
             <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <span className="text-gray-400 font-bold uppercase tracking-widest text-xs">Current Bet</span>
                <span className="text-white font-mono font-bold">{formatCurrency(gameState.bet)}</span>
             </div>
             
             <div className="flex flex-col gap-1 text-center py-4">
                 <span className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-1">Potential Payout</span>
                 <span className="text-3xl font-black text-emerald-400 font-mono">
                    {formatCurrency(gameState.bet * gameState.multiplier)}
                 </span>
             </div>

             <div className="flex gap-2">
                 <button 
                    onClick={() => setGameState(p => ({ ...p, isPaused: !p.isPaused }))}
                    disabled={gameState.status !== 'playing'}
                    className={`p-5 rounded-2xl flex items-center justify-center transition-all flex-shrink-0 ${
                      gameState.status === 'playing'
                         ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50 hover:bg-blue-500/30'
                         : 'bg-white/5 border border-white/5 text-white/20 cursor-not-allowed'
                    }`}
                 >
                    {gameState.isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
                 </button>
                 
                 <button 
                    onClick={handleCashOut}
                    disabled={gameState.status !== 'playing'}
                    className={`flex-1 py-5 rounded-2xl font-black uppercase tracking-widest text-xl transition-all ${
                      gameState.status === 'playing'
                         ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-105 hover:bg-emerald-400 relative overflow-hidden group'
                         : 'bg-white/5 border border-white/5 text-white/20 cursor-not-allowed'
                    }`}
                 >
                    {gameState.status === 'playing' ? (
                       <>
                         <span className="relative z-10">Cash Out</span>
                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]" />
                       </>
                    ) : 'Cash Out'}
                 </button>
             </div>
         </div>

         <div className="bg-black/30 p-6 rounded-3xl border border-white/5 text-xs text-gray-500 space-y-3">
             <h4 className="font-bold uppercase text-white/40 tracking-widest mb-1 text-center">Controls & Mechanics</h4>
             <p>Use your keyboard arrow keys or WASD to navigate the grid. You must interact with the game window first.</p>
             <p className="text-red-400/80 mt-2">Dodge the horizontal traffic and rivers. Hitting an obstacle instantly crashes the bet.</p>
             <p className="text-purple-400/80 mt-2">String 5 hops together quickly (&lt;3s) for a brief invincibility shield (15s cooldown).</p>
         </div>
      </div>
    </div>
  );
}
