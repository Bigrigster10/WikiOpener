import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { motion } from 'motion/react';
import { Rocket, AlertTriangle, TrendingUp, ChevronLeft } from 'lucide-react';

interface GameState {
  status: 'idle' | 'playing' | 'cashed_out' | 'crashed';
  multiplier: number;
  bet: number;
  cashOutMulti: number | null;
}

export function Crash() {
  const { profile, preferences, payEntryFee, claimCashReward } = useGameStore();
  const [gameState, setGameState] = useState<GameState>({
    status: 'idle',
    multiplier: 1.0,
    bet: 10,
    cashOutMulti: null,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const [betAmount, setBetAmount] = useState<string>('10');

  const crashPointRef = useRef<number>(1.0);
  const startTimeRef = useRef<number>(0);
  const historyRef = useRef<{time: number, multi: number}[]>([]);

  const formatCurrency = (val: number) => {
    return preferences.currency === 'CR' 
      ? val.toLocaleString() + ' CR' 
      : '$' + val.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})
  };

  const getCrashPoint = () => {
    const r = Math.random();
    const crash = Math.max(1.00, 0.99 / (1.0 - r));
    return Math.floor(crash * 100) / 100;
  };

  const initGame = useCallback(async () => {
    const bet = parseFloat(betAmount);
    if (isNaN(bet) || bet <= 0 || !profile || profile.credits < bet) return;
    
    const paid = await payEntryFee(bet);
    if (!paid) return;

    crashPointRef.current = getCrashPoint();
    startTimeRef.current = performance.now();
    historyRef.current = [];

    setGameState({
      status: 'playing',
      multiplier: 1.0,
      bet: bet,
      cashOutMulti: null,
    });
  }, [betAmount, profile, payEntryFee]);

  const handleCashOut = async () => {
    if (gameState.status !== 'playing') return;
    const currentMulti = gameState.multiplier;
    const win = gameState.bet * currentMulti;
    await claimCashReward(win);
    setGameState(prev => ({ ...prev, status: 'cashed_out', cashOutMulti: currentMulti }));
  };

  const updateGame = useCallback(() => {
    if (gameState.status === 'idle') {
      drawCanvas(1.0, [], 'idle');
      requestRef.current = requestAnimationFrame(updateGame);
      return;
    }

    if (gameState.status === 'playing' || gameState.status === 'cashed_out') {
      const now = performance.now();
      const elapsedMs = now - startTimeRef.current;
      
      // Calculate current multiplier
      let currentMulti = Math.exp((0.00015) * elapsedMs); // exponential growth
      
      // Don't let it go below 1.00
      currentMulti = Math.max(1.00, currentMulti);
      // Floor to 2 decimals for display/logic
      currentMulti = Math.floor(currentMulti * 100) / 100;

      if (currentMulti >= crashPointRef.current) {
        currentMulti = crashPointRef.current;
        setGameState(prev => ({ ...prev, status: 'crashed', multiplier: currentMulti }));
      } else {
        setGameState(prev => ({ ...prev, multiplier: currentMulti }));
      }
      
      historyRef.current.push({ time: elapsedMs, multi: currentMulti });
      drawCanvas(currentMulti, historyRef.current, gameState.status);
    } else {
      // Still draw if crashed or cashed out to show the final state
      drawCanvas(gameState.multiplier, historyRef.current, gameState.status);
    }
    
    requestRef.current = requestAnimationFrame(updateGame);
  }, [gameState.status, gameState.multiplier]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateGame);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [updateGame]);

  const drawCanvas = (currentMulti: number, history: {time: number, multi: number}[], status: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Draw background grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < width; x += 50) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = 0; y < height; y += 50) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    if (history.length === 0) return;

    // Determine scale
    const maxTime = Math.max(5000, history[history.length - 1].time);
    const maxMulti = Math.max(2.0, currentMulti * 1.2);

    const mapX = (t: number) => (t / maxTime) * (width - 40) + 20;
    const mapY = (m: number) => height - 20 - ((m - 1.0) / (maxMulti - 1.0)) * (height - 60);

    // Draw curve
    ctx.beginPath();
    ctx.moveTo(mapX(0), mapY(1.0));
    
    for (let i = 0; i < history.length; i++) {
      ctx.lineTo(mapX(history[i].time), mapY(history[i].multi));
    }

    ctx.strokeStyle = status === 'crashed' ? '#ef4444' : (status === 'cashed_out' ? '#10b981' : '#3b82f6');
    ctx.lineWidth = 4;
    ctx.stroke();

    // Fill under curve
    ctx.lineTo(mapX(history[history.length - 1].time), height - 20);
    ctx.lineTo(mapX(0), height - 20);
    ctx.closePath();
    
    const grad = ctx.createLinearGradient(0, mapY(currentMulti), 0, height);
    if (status === 'crashed') grad.addColorStop(0, 'rgba(239, 68, 68, 0.2)');
    else if (status === 'cashed_out') grad.addColorStop(0, 'rgba(16, 185, 129, 0.2)');
    else grad.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Draw Rocket / Point
    const lastPoint = history[history.length - 1];
    const px = mapX(lastPoint.time);
    const py = mapY(lastPoint.multi);

    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fillStyle = status === 'crashed' ? '#ef4444' : (status === 'cashed_out' ? '#10b981' : '#fff');
    ctx.fill();
    ctx.shadowBlur = 10;
    ctx.shadowColor = ctx.fillStyle;
    
    if (status === 'playing') {
       ctx.beginPath();
       ctx.arc(px, py, 12, 0, Math.PI * 2);
       ctx.fillStyle = 'rgba(255,255,255, 0.2)';
       ctx.fill();
    }
    ctx.shadowBlur = 0;

  };

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full h-full min-h-[600px] flex-1">
      
      {/* Left side: Controls */}
      <div className="w-full md:w-80 flex flex-col gap-4">
        <div className="bg-black/30 p-6 rounded-2xl border border-white/5 shadow-xl glass relative overflow-hidden flex flex-col items-center">
            <div className="absolute inset-0 bg-blue-500/5"></div>
            
            <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex flex-col items-center justify-center shrink-0 border border-blue-500/20 mb-4 z-10">
               <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>

            <h3 className="font-black text-2xl uppercase tracking-widest text-white mb-2 z-10">Crash</h3>
            <p className="text-gray-400 text-sm text-center mb-6 z-10 max-w-[200px]">
                Cash out before the multiplier crashes!
            </p>

            <div className="w-full mb-4 z-10">
              <label className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1 block">Bet Amount</label>
              <div className="relative">
                 <input 
                   type="number" 
                   value={betAmount}
                   onChange={(e) => setBetAmount(e.target.value)}
                   disabled={gameState.status === 'playing'}
                   className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white font-mono font-bold outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50"
                 />
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                    {preferences.currency}
                 </div>
              </div>
              {profile && (
                 <div className="mt-2 text-xs font-bold text-gray-500 flex justify-between">
                    <span>Balance:</span>
                    <span className="text-white">{formatCurrency(profile.credits)}</span>
                 </div>
              )}
            </div>

            {gameState.status === 'idle' || gameState.status === 'crashed' ? (
                <button 
                  onClick={initGame}
                  disabled={!!profile && profile.credits < parseFloat(betAmount || '0') || parseFloat(betAmount) <= 0}
                  className="w-full py-4 bg-blue-500 hover:bg-blue-400 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:-translate-y-1 z-10 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  Place Bet
                </button>
            ) : gameState.status === 'playing' ? (
                <button 
                  onClick={handleCashOut}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:-translate-y-1 z-10"
                >
                  Cash Out ({(gameState.bet * gameState.multiplier).toFixed(2)})
                </button>
            ) : (
                <button 
                  disabled
                  className="w-full py-4 bg-gray-500/50 text-white/50 font-black uppercase tracking-widest rounded-xl transition-all z-10 cursor-not-allowed"
                >
                  Cashed Out
                </button>
            )}

        </div>
      </div>

      {/* Right side: Game visualization */}
      <div className="flex-1 bg-black/40 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col">
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-none flex flex-col items-center justify-start pt-8">
            <motion.div 
               key={gameState.multiplier}
               initial={{ scale: 1.1 }}
               animate={{ scale: 1 }}
               className={`text-6xl font-black tracking-tight ${
                 gameState.status === 'crashed' ? 'text-red-500' :
                 gameState.status === 'cashed_out' ? 'text-white/50' : 
                 'text-white'
               } drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]`}
            >
               {gameState.multiplier.toFixed(2)}x
            </motion.div>
            {gameState.status === 'crashed' && (
               <div className="mt-2 text-red-500 font-bold uppercase tracking-widest flex items-center gap-2 bg-red-500/20 px-4 py-1 rounded-full border border-red-500/50">
                  <AlertTriangle className="w-4 h-4" /> Crashed
               </div>
            )}
            {gameState.cashOutMulti !== null && (
               <div className="mt-2 text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-2 bg-emerald-500/20 px-4 py-1 rounded-full border border-emerald-500/50">
                  <TrendingUp className="w-4 h-4" /> Cashed Out at {gameState.cashOutMulti?.toFixed(2)}x
               </div>
            )}
        </div>

        <div className="flex-1 w-full relative">
            <canvas 
              ref={canvasRef}
              width={800}
              height={500}
              className="w-full h-full object-fill"
            />
        </div>
      </div>
    </div>
  );
}
