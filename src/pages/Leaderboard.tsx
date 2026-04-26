import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Trophy, Swords, Box, DollarSign } from 'lucide-react';

export function Leaderboard() {
  const { leaderboard, fetchLeaderboard, preferences, profile } = useGameStore();
  const [currentSort, setCurrentSort] = useState('netWorth');

  useEffect(() => {
    fetchLeaderboard(currentSort);
  }, [fetchLeaderboard, currentSort]);

  const sortOptions = [
    { id: 'netWorth', label: 'Net Worth', icon: DollarSign },
    { id: 'battleWins', label: 'Battle Wins', icon: Swords },
    { id: 'casesOpened', label: 'Cases Opened', icon: Box },
  ];

  return (
    <div className="max-w-3xl mx-auto w-full space-y-8 flex flex-col items-center">
      <div className="text-center space-y-2 mt-4 glass p-6 px-12 inline-block">
        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Global Scale</h3>
        <h2 className="text-4xl font-black tracking-tighter uppercase text-white">Leaderboard</h2>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {sortOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setCurrentSort(opt.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-xs uppercase tracking-widest transition-all ${
              currentSort === opt.id 
                ? 'bg-accent border-accent text-white shadow-[0_0_20px_rgba(var(--color-accent),0.3)]' 
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
            }`}
          >
            <opt.icon className="w-3.5 h-3.5" />
            {opt.label}
          </button>
        ))}
      </div>

      <div className="glass w-full overflow-hidden flex flex-col p-4 sm:p-6 gap-4">
        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest px-2">Top Collectors</h3>
        {leaderboard.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-bold uppercase tracking-widest text-sm">
            No rankings available.
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((player, idx) => (
              <div key={player.userId} className={`flex items-center p-3 rounded-xl transition-transform hover:scale-[1.01] ${idx === 0 ? 'bg-yellow-500/10 border border-yellow-500/20 shadow-[0_0_15px_rgba(250,204,21,0.1)]' : 'bg-white/5 border border-white/5'}`}>
                <div className="flex-shrink-0 w-12 text-center">
                  <span className={`text-xl font-black ${
                    idx === 0 ? 'text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]' :
                    idx === 1 ? 'text-gray-300' :
                    idx === 2 ? 'text-amber-600' : 'text-gray-600'
                  }`}>
                    #{idx + 1}
                  </span>
                </div>
                
                <img 
                  src={player.photoURL || 'https://images.unsplash.com/photo-1531297172867-4f50fe567361?auto=format&fit=crop&q=80&w=40&h=40'} 
                  alt={player.displayName} 
                  className={`w-10 h-10 rounded-lg object-cover ml-2 ${idx === 0 ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-[#0a0a0c]' : 'border border-white/10'}`}
                  referrerPolicy="no-referrer"
                />
                
                <div className="ml-4 flex-1 overflow-hidden">
                  <div className="font-bold text-white text-md truncate flex items-center gap-2">
                    <span>{player.displayName}</span>
                    {idx === 0 && <span className="bg-yellow-500 text-black text-[9px] uppercase font-black px-1.5 py-0.5 rounded shadow-sm">Rank 1</span>}
                  </div>
                  <div className="flex gap-4 mt-1">
                    <div className="flex items-center gap-1.5 grayscale opacity-50">
                       <Box className="w-3 h-3" />
                       <span className="text-[10px] font-mono font-bold text-white">{player.casesOpened || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5 grayscale opacity-50">
                       <Swords className="w-3 h-3" />
                       <span className="text-[10px] font-mono font-bold text-white">{player.battleWins || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="ml-4 text-right flex flex-col items-end pr-2">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">
                    {currentSort === 'battleWins' ? 'Battle Wins' : currentSort === 'casesOpened' ? 'Cases Opened' : 'Net Worth'}
                  </div>
                  <div className={`flex items-center gap-1 font-mono font-bold ${currentSort === 'battleWins' ? 'text-blue-400' : currentSort === 'casesOpened' ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {profile && player.userId === profile.userId && preferences.streamerMode ? (
                      <span className="text-lg opacity-50 blur-sm select-none">HIDDEN</span>
                    ) : (
                      <span className="text-lg">
                        {currentSort === 'battleWins' ? 
                          player.battleWins || 0 :
                          currentSort === 'casesOpened' ?
                          player.casesOpened || 0 :
                          preferences.currency === 'CR' ? 
                          `${player.netWorth.toLocaleString()} CR` : 
                          `$${player.netWorth.toLocaleString(undefined, {minimumFractionDigits: 2})}`
                        }
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
