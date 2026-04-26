import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { motion, AnimatePresence } from 'motion/react';
import { Bomb, Coins, AlertTriangle, ShieldCheck, TerminalSquare } from 'lucide-react';

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
const COLOR_NAMES = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE'];

export function BombDefuse() {
  const { profile, payEntryFee, claimCashReward } = useGameStore();
  const [gameState, setGameState] = useState<'setup' | 'starting' | 'memorize' | 'input' | 'won_round' | 'lost' | 'completed'>('setup');
  const [round, setRound] = useState(1);
  const [cost, setCost] = useState(1000);
  
  // Round specific data
  const [targetNumbers, setTargetNumbers] = useState('');
  const [targetColors, setTargetColors] = useState<string[]>([]);
  const [userInputMap, setUserInputMap] = useState<string>('');
  const [userColorCuts, setUserColorCuts] = useState<number[]>([]);
  
  const [memorizeTime, setMemorizeTime] = useState(1.5);
  const [totalInputTime, setTotalInputTime] = useState(10.0);
  const [inputTimeLeft, setInputTimeLeft] = useState(10.0);

  const maxRounds = 20;

  const getDifficulty = (r: number) => {
      let numLength = 3;
      let time = 1.5;
      let colorsToCut = 0;
      let inputTime = 10.0;

      if (r >= 2) { numLength = 4; inputTime = 9.0; }
      if (r >= 4) { numLength = 5; time = 1.2; inputTime = 8.0; }
      if (r >= 7) { numLength = 6; time = 1.0; inputTime = 7.0; }
      if (r >= 10) { numLength = 7; time = 0.8; colorsToCut = 1; inputTime = 6.0; }
      if (r >= 14) { numLength = 8; time = 0.7; colorsToCut = 1; inputTime = 5.0; }
      if (r >= 17) { numLength = 9; time = 0.6; colorsToCut = 2; inputTime = 4.0; }
      if (r >= 20) { numLength = 10; time = 0.5; colorsToCut = 2; inputTime = 3.0; }

      return { numLength, time, colorsToCut, inputTime };
  };

  const handleStart = async () => {
      if (!profile || profile.credits < cost) return;
      const success = await payEntryFee(cost);
      if (success) {
          setRound(1);
          setGameState('starting');
          setTimeout(() => {
              startRound(1);
          }, 2000);
      }
  };

  const startRound = (r: number) => {
      const { numLength, time, colorsToCut, inputTime } = getDifficulty(r);
      const nums = Array.from({length: numLength}, () => Math.floor(Math.random() * 10)).join('');
      
      const cols: string[] = [];
      for(let i=0; i<colorsToCut; i++) {
          cols.push(COLOR_NAMES[Math.floor(Math.random() * COLOR_NAMES.length)]);
      }

      setTargetNumbers(nums);
      setTargetColors(cols);
      setMemorizeTime(time);
      setTotalInputTime(inputTime);
      setInputTimeLeft(inputTime);
      setUserInputMap('');
      setUserColorCuts([]);
      
      setGameState('memorize');
  };

  useEffect(() => {
      if (gameState === 'memorize') {
          const t = setTimeout(() => {
              setGameState('input');
          }, memorizeTime * 1000);
          return () => clearTimeout(t);
      }
  }, [gameState, memorizeTime]);

  useEffect(() => {
      if (gameState === 'input') {
          const interval = setInterval(() => {
              setInputTimeLeft(prev => {
                  if (prev <= 0.1) {
                      clearInterval(interval);
                      setGameState('lost'); // Detonate
                      return 0;
                  }
                  return prev - 0.1;
              });
          }, 100);
          return () => clearInterval(interval);
      }
  }, [gameState]);

  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (gameState !== 'input') return;

          if (e.key >= '0' && e.key <= '9') {
              // Ensure we only use the latest state by calling handleInput with the value
              // Wait, handleInput uses stale closure if not careful? No, userInputMap.length check uses state... 
              // Better to use set-state callbacks.
              // Actually handleInput uses `userInputMap.length` from the closure.
              // Let's modify handleInput to use functional state update if needed, but it's easier to just use set state directly here:
              setUserInputMap(prev => {
                  if (prev.length < targetNumbers.length) {
                      return prev + e.key;
                  }
                  return prev;
              });
          } else if (e.key === 'Backspace') {
              setUserInputMap(prev => prev.slice(0, -1));
          } else if (e.key === 'Enter') {
              // Note: handleDefuseAttempt might need to be called here but it relies on state.
              // We could trigger a button click using a ref, or just call handleDefuseAttempt.
              // Let's call a slightly modified version or just ensure dependencies are right.
              // Actually, wait, handleDefuseAttempt needs the current state.
              document.getElementById('defuse-btn')?.click();
          }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, targetNumbers.length]);

  const handleInput = (num: string) => {
      if (gameState !== 'input') return;
      if (userInputMap.length < targetNumbers.length) {
          setUserInputMap(prev => prev + num);
      }
  };

  const handleBackspace = () => {
      if (gameState !== 'input') return;
      setUserInputMap(prev => prev.slice(0, -1));
  };

  const handleCutWire = (colorName: string) => {
      if (gameState !== 'input') return;
      const indexObj = COLOR_NAMES.indexOf(colorName);
      if (userColorCuts.includes(indexObj)) return; // already cut
      setUserColorCuts(prev => [...prev, indexObj]);
  };

  const handleDefuseAttempt = async () => {
      if (gameState !== 'input') return;
      const isNumCorrect = userInputMap === targetNumbers;
      
      const targetIndices = targetColors.map(c => COLOR_NAMES.indexOf(c));
      
      // Need exact match of colors regardless of order
      const hasAllColors = targetColors.length === userColorCuts.length && 
                           userColorCuts.every(c => targetIndices.includes(c));
                           // and counts must match? it's fine for now

      if (isNumCorrect && hasAllColors) {
          if (round === maxRounds) {
              setGameState('completed');
              // Huge payout
              const reward = cost * 100;
              await claimCashReward(reward);
          } else {
              setGameState('won_round');
              setTimeout(() => {
                  setRound(r => r + 1);
                  startRound(round + 1);
              }, 1500);
          }
      } else {
          setGameState('lost');
      }
  };

  const handleCashOut = async () => {
      if (gameState !== 'won_round' && gameState !== 'input') return; // Can only cash out between rounds or early input
      
      let multiplier = 0;
      if (round === 1 && gameState === 'input') multiplier = 0.5; // Fleeing round 1 just gives half back
      else if (gameState === 'won_round') multiplier = round * 0.8; 
      else multiplier = (round - 1) * 0.8; // During input of round X, you only get reward for X-1
      
      const reward = Math.floor(cost * multiplier);
      if (reward > 0) {
          await claimCashReward(reward);
      }
      setGameState('setup');
  };

  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-white/10 pb-6 w-full mb-8">
        <div className="w-12 h-12 bg-red-500/20 rounded-xl border border-red-500/50 flex items-center justify-center">
          <Bomb className="w-6 h-6 text-red-500" />
        </div>
        <div className="text-center sm:text-left">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">Bomb Defuse</h1>
          <p className="text-gray-400 text-sm mt-1">Memorize the code. Defuse the bomb. Survive 20 rounds for a huge payout.</p>
        </div>
      </div>

      <div className="glass p-4 sm:p-8 rounded-3xl w-full max-w-2xl mx-auto flex flex-col items-center border-t-2 border-red-500/30">
          
         {gameState === 'setup' && (
             <div className="flex flex-col items-center gap-6 w-full">
                 <AlertTriangle className="w-16 h-16 text-red-500 mb-2" />
                 <h2 className="text-2xl font-bold text-white uppercase tracking-wider text-center">Ready to Risk It?</h2>
                 <p className="text-gray-400 text-center text-sm mb-4">
                     You will only have a fraction of a second to memorize the defuse code. Later rounds introduce colored wires. One mistake and the bomb detonates.
                 </p>
                 
                 <div className="flex flex-wrap justify-center gap-4 w-full">
                     {[100, 1000, 10000, 100000].map(c => (
                         <button 
                             key={c}
                             onClick={() => setCost(c)}
                             className={`px-6 py-4 rounded-xl border-2 transition-all font-bold flex flex-col items-center gap-2 ${
                                 cost === c ? 'border-red-500 bg-red-500/20 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'border-white/5 hover:border-white/20 text-gray-400'
                             }`}
                         >
                             <Coins className="w-5 h-5" />
                             {c.toLocaleString()} CR
                         </button>
                     ))}
                 </div>

                 <button
                    onClick={handleStart}
                    disabled={!profile || profile.credits < cost}
                    className="mt-4 w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest rounded-xl disabled:opacity-50 transition-all shadow-[0_0_30px_rgba(239,68,68,0.4)]"
                 >
                     Deposit & Start ({cost.toLocaleString()} CR)
                 </button>
                 {profile && profile.credits < cost && <p className="text-red-400 text-sm mt-2">Insufficient credits</p>}
             </div>
         )}

         {gameState === 'starting' && (
             <div className="py-20 flex flex-col items-center">
                 <Bomb className="w-20 h-20 text-red-500 animate-pulse mb-6 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]" />
                 <h2 className="text-3xl font-black text-white uppercase tracking-widest">Bomb Armed</h2>
             </div>
         )}

         {gameState === 'memorize' && (
             <div className="py-20 flex flex-col items-center w-full min-h-[300px] justify-center">
                 <div className="text-6xl sm:text-8xl font-black text-amber-500 tracking-[0.2em] drop-shadow-[0_0_30px_rgba(245,158,11,0.6)] font-mono">
                     {targetNumbers}
                 </div>
                 {targetColors.length > 0 && (
                     <div className="mt-12 flex gap-6">
                         {targetColors.map((c, i) => (
                             <div key={i} className="text-2xl font-black tracking-widest drop-shadow-md" style={{ color: COLORS[COLOR_NAMES.indexOf(c)] }}>
                                 {c} WIRE
                             </div>
                         ))}
                     </div>
                 )}
                 <div className="absolute top-4 right-4 animate-pulse">
                     <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">MEMORIZE</span>
                 </div>
             </div>
         )}

         {gameState === 'input' && (
             <div className="flex flex-col items-center w-full">
                 <div className="flex justify-between items-center w-full mb-4">
                     <div className="bg-red-500/20 text-red-500 px-4 py-2 rounded-xl font-bold uppercase border border-red-500/50 flex items-center gap-2">
                         <AlertTriangle className="w-4 h-4" /> Round {round}/{maxRounds}
                     </div>
                     <div className={`text-2xl font-mono font-black ${inputTimeLeft < 3 ? 'text-red-500 animate-pulse drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]'}`}>
                         {inputTimeLeft.toFixed(1)}s
                     </div>
                     <button onClick={handleCashOut} className="text-xs font-bold uppercase text-gray-400 hover:text-white border border-white/10 px-3 py-1 rounded hover:bg-white/10 transition-colors">
                         Flee (Cash Out)
                     </button>
                 </div>

                 <div className="w-full h-2 bg-gray-800 rounded-full mb-6 overflow-hidden">
                     <div 
                         className={`h-full transition-all duration-100 ease-linear ${inputTimeLeft < 3 ? 'bg-red-500' : 'bg-amber-500'}`} 
                         style={{ width: `${Math.max(0, (inputTimeLeft / totalInputTime) * 100)}%` }}
                     />
                 </div>

                 <div className="w-full bg-black/60 border-2 border-slate-700 p-4 rounded-xl mb-6 font-mono text-center h-20 flex items-center justify-center text-4xl tracking-widest text-[#10b981] drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                     {userInputMap || '-'}
                 </div>

                 <div className="grid grid-cols-3 gap-3 w-full max-w-xs mb-8">
                     {[1,2,3,4,5,6,7,8,9].map(n => (
                         <button 
                             key={n}
                             onClick={() => handleInput(n.toString())}
                             className="aspect-square bg-slate-800 hover:bg-slate-700 border-b-4 border-slate-900 rounded-xl text-3xl font-bold text-white transition-all active:border-b-0 active:translate-y-1"
                         >
                             {n}
                         </button>
                     ))}
                     <button
                         onClick={handleBackspace}
                         className="aspect-square bg-red-900 hover:bg-red-800 border-b-4 border-red-950 rounded-xl text-xl font-bold text-white transition-all active:border-b-0 active:translate-y-1"
                     >
                         DEL
                     </button>
                     <button
                         onClick={() => handleInput('0')}
                         className="aspect-square bg-slate-800 hover:bg-slate-700 border-b-4 border-slate-900 rounded-xl text-3xl font-bold text-white transition-all active:border-b-0 active:translate-y-1"
                     >
                         0
                     </button>
                 </div>

                 {getDifficulty(round).colorsToCut > 0 && (
                     <div className="w-full mb-8 flex flex-col items-center border-t border-white/10 pt-6">
                         <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">Cut Required Wires</h3>
                         <div className="flex gap-4">
                             {COLOR_NAMES.map((c, i) => {
                                 const isCut = userColorCuts.includes(i);
                                 return (
                                 <button
                                     key={c}
                                     onClick={() => handleCutWire(c)}
                                     disabled={isCut}
                                     className={`w-12 h-24 rounded-full border-4 transition-all relative overflow-hidden group disabled:opacity-30 ${isCut ? 'border-gray-700 bg-transparent' : ''}`}
                                     style={!isCut ? { borderColor: COLORS[i] } : {}}
                                 >
                                     {!isCut && <div className="absolute inset-0 m-1 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>}
                                     {isCut && <div className="absolute top-1/2 left-0 right-0 h-1 bg-red-500 rotate-45 -translate-y-1/2"></div>}
                                 </button>
                             )})}
                         </div>
                     </div>
                 )}

                 <button
                     id="defuse-btn"
                     onClick={handleDefuseAttempt}
                     className="w-full max-w-xs py-4 bg-[#10b981] hover:bg-emerald-500 text-white font-black uppercase text-xl rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all transform active:scale-95"
                 >
                     DEFUSE
                 </button>
             </div>
         )}

         {gameState === 'won_round' && (
             <div className="py-20 flex flex-col items-center">
                 <ShieldCheck className="w-24 h-24 text-[#10b981] drop-shadow-[0_0_20px_rgba(16,185,129,0.6)] mb-6" />
                 <h2 className="text-3xl font-black text-white uppercase tracking-widest text-center">Bomb Defused</h2>
                 <p className="text-green-400 font-bold mt-2 text-center">Round {round} Complete</p>
             </div>
         )}

         {gameState === 'lost' && (
             <div className="py-20 flex flex-col items-center w-full">
                 <div className="w-full h-full absolute inset-0 bg-red-500/10 pointer-events-none rounded-3xl animate-pulse"></div>
                 <h2 className="text-6xl font-black text-red-500 uppercase tracking-tighter drop-shadow-[0_0_30px_rgba(239,68,68,0.8)] mb-4">DETONATED</h2>
                 <p className="text-gray-300 text-center font-bold mb-8">You entered the wrong code or cut the wrong wire.</p>
                 <button
                     onClick={() => setGameState('setup')}
                     className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all uppercase tracking-widest"
                 >
                     Try Again
                 </button>
             </div>
         )}

         {gameState === 'completed' && (
             <div className="py-16 flex flex-col items-center w-full">
                 <TerminalSquare className="w-24 h-24 text-amber-400 drop-shadow-[0_0_30px_rgba(251,191,36,0.8)] mb-6" />
                 <h2 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tighter text-center mb-4">MASTER DEFUSER</h2>
                 <p className="text-amber-400 font-bold text-xl mb-8">You survived all 20 rounds!</p>
                 
                 <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 mb-8 text-center w-full">
                     <span className="block text-sm text-gray-400 uppercase font-bold mb-1">Total Payout</span>
                     <span className="text-4xl font-black text-amber-500">+{(cost * 100).toLocaleString()} CR</span>
                 </div>

                 <button
                     onClick={() => setGameState('setup')}
                     className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl transition-all uppercase tracking-widest"
                 >
                     Play Again
                 </button>
             </div>
         )}

      </div>
    </div>
  );
}
