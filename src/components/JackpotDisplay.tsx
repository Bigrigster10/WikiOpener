import { useGameStore } from '../store/gameStore';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy } from 'lucide-react';

export function JackpotDisplay() {
  const { jackpot, lastJackpotWinner, preferences } = useGameStore();

  const formatCurrency = (val: number) => {
    if (preferences.currency === 'CR') return `${Math.floor(val).toLocaleString()} CR`;
    return `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="w-full flex justify-center mb-2">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-500 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
        <div className="relative flex items-center bg-black/60 border border-yellow-500/50 rounded-full px-6 py-2 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500 rounded-full p-1 shadow-[0_0_10px_rgba(234,179,8,0.5)]">
              <Trophy className="w-4 h-4 text-black" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-black tracking-[.2em] text-yellow-500/80 leading-none">Progressive Jackpot</span>
              <motion.span 
                key={jackpot}
                initial={{ scale: 1.1, color: '#fbbf24' }}
                animate={{ scale: 1, color: '#ffffff' }}
                className="text-xl font-mono font-bold leading-tight drop-shadow-sm"
              >
                {formatCurrency(jackpot)}
              </motion.span>
            </div>
          </div>
          
          <AnimatePresence>
            {lastJackpotWinner && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="ml-6 pl-6 border-l border-white/10 hidden md:flex flex-col"
              >
                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Last Winner</span>
                <span className="text-sm font-medium text-white flex items-center gap-2">
                  {lastJackpotWinner}
                  <Sparkles className="w-3 h-3 text-yellow-500" />
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
