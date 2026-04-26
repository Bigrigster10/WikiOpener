import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { motion, AnimatePresence } from 'motion/react';
import { Ticket, Coins, RefreshCcw } from 'lucide-react';

export function ScratchTickets() {
  const { profile, playScratchTicket } = useGameStore();
  const [cost, setCost] = useState(500);
  const [isScratching, setIsScratching] = useState(false);
  const [result, setResult] = useState<{ winAmount: number, spaces: number[] } | null>(null);
  const [scratchedSpaces, setScratchedSpaces] = useState<Set<number>>(new Set());

  const canAfford = (profile?.credits ?? 0) >= cost;

  const handleBuy = async () => {
    if (!canAfford || isScratching) return;
    setIsScratching(true);
    setResult(null);
    setScratchedSpaces(new Set());
    const res = await playScratchTicket(cost);
    setResult(res);
    setIsScratching(false);
  };

  const scratchSpace = (index: number) => {
    if (!result || isScratching) return;
    setScratchedSpaces(prev => {
        const next = new Set(prev);
        next.add(index);
        return next;
    });
  };

  const scratchAll = () => {
      if (!result || isScratching) return;
      setScratchedSpaces(new Set([0,1,2,3,4,5,6,7,8]));
  };

  const restart = () => {
      setResult(null);
      setIsScratching(false);
      setScratchedSpaces(new Set());
  };

  const isFinished = result && scratchedSpaces.size === 9;

  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-4 border-b border-white/10 pb-6 w-full mb-8">
        <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
          <Ticket className="w-6 h-6 text-green-400" />
        </div>
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white">Scratch Tickets</h1>
          <p className="text-gray-400 text-sm mt-1">Buy a ticket, scratch to match 3 prizes, and win big.</p>
        </div>
      </div>

      <div className="glass p-8 rounded-3xl w-full max-w-2xl mx-auto flex flex-col items-center">
        
        {!result && !isScratching && (
          <div className="flex flex-col items-center gap-6 w-full">
            <h2 className="text-2xl font-bold text-white uppercase tracking-wider text-center">Buy a Ticket</h2>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              {[100, 500, 2500, 10000].map(p => (
                <button
                  key={p}
                  onClick={() => setCost(p)}
                  className={`p-4 rounded-xl border-2 transition-all font-bold flex flex-col items-center gap-2 ${
                    cost === p ? 'border-accent bg-accent/20 text-white' : 'border-white/5 hover:border-white/20 text-gray-400 hover:text-white'
                  }`}
                >
                  <Coins className="w-6 h-6" />
                  {p.toLocaleString()} CR
                </button>
              ))}
            </div>

            <button
              onClick={handleBuy}
              disabled={!canAfford}
              className={`w-full py-4 text-xl font-black uppercase tracking-widest rounded-xl transition-all ${
                canAfford ? 'bg-accent hover:bg-accent-light text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'bg-white/5 text-gray-500 cursor-not-allowed'
              }`}
            >
              Buy Ticket ({cost.toLocaleString()} CR)
            </button>
            {!canAfford && <p className="text-red-400 text-sm font-medium">Insufficient credits</p>}
          </div>
        )}

        {isScratching && !result && (
          <div className="flex flex-col items-center py-12">
            <RefreshCcw className="w-12 h-12 text-accent animate-spin mb-4" />
            <p className="text-white font-bold animate-pulse">Printing Ticket...</p>
          </div>
        )}

        {result && (
           <div className="flex flex-col w-full">
               <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-black text-white uppercase">Your Ticket</h2>
                 {scratchedSpaces.size < 9 && (
                    <button onClick={scratchAll} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-bold text-white transition-colors">
                        Scratch All
                    </button>
                 )}
               </div>

               <div className="grid grid-cols-3 gap-4 mb-8">
                 {result.spaces.map((val, idx) => {
                     const isRevealed = scratchedSpaces.has(idx);
                     /* Check if it's one of the winning values */
                     const isWinningCell = isFinished && result.winAmount > 0 && val === result.winAmount;

                     return (
                         <div 
                           key={idx}
                           onClick={() => scratchSpace(idx)}
                           className={`aspect-square rounded-2xl flex items-center justify-center font-black text-2xl md:text-3xl transition-all cursor-pointer select-none ${
                               !isRevealed 
                               ? 'bg-gray-700/50 hover:bg-gray-600/50 border-2 border-dashed border-gray-500 shadow-inner' 
                               : isWinningCell 
                                  ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)] scale-[1.02]' 
                                  : 'bg-white/10 text-gray-300'
                           }`}
                         >
                            {isRevealed ? `${val.toLocaleString()}` : <Ticket className="w-8 h-8 text-gray-500" />}
                         </div>
                     );
                 })}
               </div>

               {isFinished && (
                   <div className="flex flex-col items-center animate-fade-in gap-4">
                       {result.winAmount > 0 ? (
                           <div className="text-center">
                               <h3 className="text-4xl font-black text-green-400 drop-shadow-lg animate-bounce">YOU WON!</h3>
                               <p className="text-xl font-bold text-white mt-2">+{result.winAmount.toLocaleString()} CR</p>
                           </div>
                       ) : (
                           <h3 className="text-3xl font-black text-gray-500">BETTER LUCK NEXT TIME</h3>
                       )}
                       <button
                           onClick={restart}
                           className="mt-6 px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl uppercase tracking-wider transition-colors"
                       >
                           Play Again
                       </button>
                   </div>
               )}
           </div>
        )}
      </div>
    </div>
  );
}
