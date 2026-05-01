import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, Swords, AlertTriangle, ChevronRight, Dices, RotateCcw } from 'lucide-react';
import type { Item } from '../types';

interface BotLobby {
  id: string;
  name: string;
  avatar: string;
  item: Item;
}

const mockBotNames = ['xX_Snipe_Xx', 'LootKing', 'LuckyDog', 'Gambler99', 'Skins4Life', 'Tilted'];

const generateMockItem = (): Item => {
  const value = Math.floor(Math.random() * 500) + 10;
  return {
    id: crypto.randomUUID(),
    title: `Mystery Skin Level ${Math.floor(value / 50) + 1}`,
    image: 'https://images.unsplash.com/photo-1616781296155-fc8d13238ed?w=200&dpr=2', // Placeholder pattern 
    value: value,
    rarity: value > 200 ? 'Exotic' : 'Restricted',
    wear: 'Factory New',
    durability: 100,
    caseType: 'Coinflip Bot',
  };
};

const generateLobbies = (): BotLobby[] => {
  return Array.from({ length: 4 }).map(() => ({
    id: crypto.randomUUID(),
    name: mockBotNames[Math.floor(Math.random() * mockBotNames.length)],
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
    item: generateMockItem(),
  }));
};

export function Coinflip() {
  const { profile, preferences, payEntryFee, claimCashReward, inventory, executeItemCoinflip } = useGameStore();
  const [activeTab, setActiveTab] = useState<'single' | 'multi'>('single');
  
  // Singleplayer State
  const [betAmount, setBetAmount] = useState('10');
  const [chosenSide, setChosenSide] = useState<'heads'|'tails'>('heads');
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipResult, setFlipResult] = useState<'heads'|'tails'|null>(null);
  const [flipStatus, setFlipStatus] = useState<'idle'|'won'|'lost'>('idle');

  // Multiplayer State
  const [lobbies, setLobbies] = useState<BotLobby[]>([]);
  const [selectedLobby, setSelectedLobby] = useState<BotLobby | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  useEffect(() => {
    setLobbies(generateLobbies());
  }, []);

  const formatCurrency = (val: number) => {
    return preferences.currency === 'CR' 
      ? val.toLocaleString() + ' CR' 
      : '$' + val.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})
  };

  const handleSingleplayerFlip = async () => {
    if (isFlipping) return;
    const bet = parseFloat(betAmount);
    if (isNaN(bet) || bet <= 0 || !profile || profile.credits < bet) return;

    setFlipResult(null);
    setFlipStatus('idle');

    const paid = await payEntryFee(bet);
    if (!paid) return;

    setIsFlipping(true);

    setTimeout(async () => {
      const isHeads = Math.random() < 0.5;
      const result = isHeads ? 'heads' : 'tails';
      setFlipResult(result);
      
      if (result === chosenSide) {
        await claimCashReward(bet * 2);
        setFlipStatus('won');
      } else {
        setFlipStatus('lost');
      }
      setIsFlipping(false);
    }, 2000);
  };

  const handleBotMatchFlip = async () => {
    if (isFlipping || !selectedLobby || !selectedItem) return;

    setFlipResult(null);
    setFlipStatus('idle');

    // Muted validation check if value difference too high could go here
    setIsFlipping(true);

    setTimeout(async () => {
      const isHeads = Math.random() < 0.5;
      const result = isHeads ? 'heads' : 'tails';
      setFlipResult(result);
      
      const isWin = result === chosenSide;
      const success = await executeItemCoinflip(selectedItem.id!, isWin ? selectedLobby.item : null);

      if (success) {
         setFlipStatus(isWin ? 'won' : 'lost');
      }
      
      setLobbies(prev => prev.filter(l => l.id !== selectedLobby.id));
      setIsFlipping(false);
    }, 2000);
  };

  const closeMatchResult = () => {
    setFlipResult(null);
    setFlipStatus('idle');
    setSelectedLobby(null);
    setSelectedItem(null);
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto w-full p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight text-white mb-2">Coinflip</h1>
          <p className="text-gray-400">The simplest way to double your net worth.</p>
        </div>
        
        <div className="flex bg-black/40 p-1 rounded-xl glass border border-white/5 w-fit">
           <button 
             onClick={() => setActiveTab('single')}
             className={`px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'single' ? 'bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'text-gray-400 hover:text-white'}`}
           >
             <Coins className="w-4 h-4" /> Singleplayer
           </button>
           <button 
             onClick={() => setActiveTab('multi')}
             className={`px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'multi' ? 'bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'text-gray-400 hover:text-white'}`}
           >
             <Swords className="w-4 h-4" /> Multiplayer
           </button>
        </div>
      </div>

      {activeTab === 'single' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="glass p-8 rounded-3xl border border-white/5 flex flex-col items-center justify-center min-h-[400px]">
              
              <div className="relative w-48 h-48 perspective-1000">
                <motion.div 
                  className="w-full h-full relative"
                  style={{ transformStyle: 'preserve-3d' }}
                  animate={{ 
                     rotateY: isFlipping ? 3600 : (flipResult === 'tails' || chosenSide === 'tails' && !flipResult ? 180 : 0) 
                  }}
                  transition={{ 
                     duration: isFlipping ? 2 : 0.5, 
                     ease: isFlipping ? "easeInOut" : "easeOut" 
                  }}
                >
                   {/* Heads */}
                   <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center border-8 border-yellow-700 shadow-2xl backface-hidden">
                      <span className="text-5xl font-black text-yellow-900 drop-shadow-md pb-1">H</span>
                   </div>
                   {/* Tails */}
                   <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center border-8 border-slate-600 shadow-2xl backface-hidden" style={{ transform: 'rotateY(180deg)' }}>
                      <span className="text-5xl font-black text-slate-800 drop-shadow-md pb-1">T</span>
                   </div>
                </motion.div>
              </div>

              {flipStatus !== 'idle' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-8 px-8 py-4 rounded-xl border font-black uppercase tracking-widest text-xl ${
                    flipStatus === 'won' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-red-500/20 text-red-400 border-red-500/50'
                  }`}
                >
                   {flipStatus === 'won' ? 'You Won!' : 'You Lost'}
                </motion.div>
              )}

           </div>

           <div className="glass p-8 rounded-3xl border border-white/5 flex flex-col justify-center">
              <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-6">Place Your Bet</h3>
              
              <div className="space-y-6">
                 <div>
                    <label className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2 block">Bet Amount</label>
                    <div className="relative">
                       <input 
                         type="number" 
                         value={betAmount}
                         onChange={(e) => setBetAmount(e.target.value)}
                         disabled={isFlipping}
                         className="w-full bg-black/50 border border-white/10 rounded-xl py-4 px-4 text-white font-mono font-bold outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50 text-xl"
                       />
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                          {preferences.currency}
                       </div>
                    </div>
                 </div>

                 <div>
                    <label className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2 block">Choose Side</label>
                    <div className="flex gap-4">
                       <button 
                         disabled={isFlipping}
                         onClick={() => setChosenSide('heads')}
                         className={`flex-1 py-4 font-black text-lg transition-all border-b-4 ${
                           chosenSide === 'heads' 
                           ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500' 
                           : 'bg-black/30 text-gray-500 border-transparent hover:bg-black/50 hover:text-white'
                         } disabled:opacity-50`}
                       >
                         HEADS
                       </button>
                       <button 
                         disabled={isFlipping}
                         onClick={() => setChosenSide('tails')}
                         className={`flex-1 py-4 font-black text-lg transition-all border-b-4 ${
                           chosenSide === 'tails' 
                           ? 'bg-slate-500/20 text-slate-300 border-slate-400' 
                           : 'bg-black/30 text-gray-500 border-transparent hover:bg-black/50 hover:text-white'
                         } disabled:opacity-50`}
                       >
                         TAILS
                       </button>
                    </div>
                 </div>

                 <button 
                   onClick={handleSingleplayerFlip}
                   disabled={isFlipping || parseFloat(betAmount) <= 0 || !profile || profile.credits < parseFloat(betAmount)}
                   className="w-full py-5 bg-blue-500 hover:bg-blue-400 text-white font-black text-xl uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-4"
                 >
                   {isFlipping ? 'Flipping...' : 'Flip Coin'}
                 </button>

                 {profile && (
                     <div className="text-center text-sm font-bold text-gray-400">
                        Balance: <span className="text-white">{formatCurrency(profile.credits)}</span>
                     </div>
                 )}
              </div>
           </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
           {/* Multiplayer / PvP Bot Lobbies */}
           {!selectedLobby ? (
             <div className="space-y-4">
                <div className="flex justify-between items-end mb-6">
                    <h2 className="text-2xl font-black uppercase text-white">Open Matches</h2>
                    <button 
                      onClick={() => setLobbies(generateLobbies())}
                      className="text-sm font-bold text-gray-400 hover:text-white flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10"
                    >
                      <RotateCcw className="w-4 h-4" /> Refresh
                    </button>
                </div>

                {lobbies.length === 0 ? (
                    <div className="text-center text-gray-500 py-12 glass rounded-2xl border-white/5">
                       No matches found. Refresh to find opponents.
                    </div>
                ) : (
                    lobbies.map(lobby => (
                        <div key={lobby.id} className="glass p-6 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-colors flex flex-col md:flex-row items-center gap-6">
                           <div className="flex items-center gap-4 flex-1">
                               <img src={lobby.avatar} alt="Avatar" className="w-16 h-16 rounded-full bg-white/10 border-2 border-white/10" />
                               <div>
                                   <div className="font-bold text-white text-lg">{lobby.name}</div>
                                   <div className="text-sm text-gray-400">Win Rate: {Math.floor(Math.random() * 30 + 40)}%</div>
                               </div>
                           </div>

                           <div className="flex items-center gap-4 flex-1 justify-center bg-black/40 px-6 py-4 rounded-xl border border-white/5">
                               <img src={lobby.item.image} alt={lobby.item.title} className="w-12 h-12 object-contain" />
                               <div>
                                  <div className="font-bold text-purple-400">{lobby.item.title}</div>
                                  <div className="text-sm text-gray-400 font-mono">{formatCurrency(lobby.item.value)}</div>
                               </div>
                           </div>

                           <div className="flex-1 flex justify-end">
                               <button 
                                 onClick={() => setSelectedLobby(lobby)}
                                 className="px-8 py-3 bg-purple-500 hover:bg-purple-400 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:-translate-y-1 block md:inline-flex w-full md:w-auto text-center justify-center"
                               >
                                 Challenge
                               </button>
                           </div>
                        </div>
                    ))
                )}
             </div>
           ) : (
             <div className="glass p-8 rounded-3xl border border-white/5 flex flex-col items-center">
                
                <h2 className="text-3xl font-black uppercase text-white mb-2">Vs {selectedLobby.name}</h2>
                <button onClick={closeMatchResult} className="text-gray-400 hover:text-white mb-8 text-sm font-bold uppercase tracking-wider flex items-center gap-1">
                   &lt; Back to Lobbies
                </button>

                <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 w-full max-w-4xl opacity-100">
                    
                    {/* Bot's Side */}
                    <div className="flex flex-col items-center gap-4 w-full md:w-1/3">
                        <div className="text-sm font-bold text-gray-500 uppercase tracking-widest bg-black/40 px-4 py-1 rounded-full">{selectedLobby.name}'s Wager</div>
                        <div className="bg-black/40 border border-white/10 rounded-2xl p-6 flex flex-col items-center w-full aspect-square justify-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent"></div>
                            <img src={selectedLobby.item.image} alt="" className="w-24 h-24 object-contain mb-4 z-10 drop-shadow-xl" />
                            <div className="font-bold text-white text-center z-10">{selectedLobby.item.title}</div>
                            <div className="text-purple-400 font-mono font-bold mt-1 z-10">{formatCurrency(selectedLobby.item.value)}</div>
                        </div>
                        <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">{selectedLobby.name} chose Tails</div>
                    </div>

                    <div className="text-4xl font-black text-gray-600">VS</div>

                    {/* Your Side */}
                    <div className="flex flex-col items-center gap-4 w-full md:w-1/3">
                        <div className="text-sm font-bold text-gray-500 uppercase tracking-widest bg-black/40 px-4 py-1 rounded-full">Your Wager</div>
                        {!selectedItem ? (
                           <div className="bg-black/40 border border-dashed border-white/20 rounded-2xl p-6 flex flex-col items-center w-full aspect-square justify-center relative hover:bg-black/60 transition-colors">
                              <p className="text-gray-400 text-sm text-center mb-4">Select an item from your inventory to wager against {selectedLobby.name}.</p>
                              
                              <select 
                                className="w-full bg-black border border-white/20 text-white rounded-lg p-2 font-bold focus:border-purple-500 outline-none"
                                onChange={(e) => setSelectedItem(inventory.find(i => i.id === e.target.value) || null)}
                                value=""
                              >
                                 <option value="" disabled>Choose an item...</option>
                                 {inventory.map(item => (
                                    <option key={item.id} value={item.id}>{item.title} - {formatCurrency(item.value)}</option>
                                 ))}
                              </select>
                           </div>
                        ) : (
                           <div className="bg-black/40 border border-white/10 rounded-2xl p-6 flex flex-col items-center w-full aspect-square justify-center relative overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent"></div>
                              <button onClick={() => setSelectedItem(null)} disabled={isFlipping} className="absolute top-2 right-2 text-xs text-gray-500 hover:text-white z-20">Change</button>
                              <img src={selectedItem.image} alt="" className="w-24 h-24 object-contain mb-4 z-10 drop-shadow-xl" />
                              <div className="font-bold text-white text-center z-10">{selectedItem.title}</div>
                              <div className="text-blue-400 font-mono font-bold mt-1 z-10">{formatCurrency(selectedItem.value)}</div>
                           </div>
                        )}
                        <div className="text-sm font-bold text-yellow-400 uppercase tracking-widest mt-2">You chose Heads</div>
                    </div>
                </div>

                {selectedItem && (
                    <div className="mt-8 flex flex-col items-center w-full">
                       {/* Middle Coin Flip Logic */}
                       
                       <div className="relative w-32 h-32 perspective-1000 mb-8 mt-4">
                          <motion.div 
                            className="w-full h-full relative z-30"
                            style={{ transformStyle: 'preserve-3d' }}
                            animate={{ 
                               rotateY: isFlipping ? 3600 : (flipResult === 'tails' ? 180 : 0) 
                            }}
                            transition={{ 
                               duration: isFlipping ? 2 : 0.5, 
                               ease: isFlipping ? "easeInOut" : "easeOut" 
                            }}
                          >
                             {/* Heads */}
                             <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center border-4 border-yellow-700 shadow-2xl backface-hidden">
                                <span className="text-4xl font-black text-yellow-900 drop-shadow-md pb-1">H</span>
                             </div>
                             {/* Tails */}
                             <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center border-4 border-slate-600 shadow-2xl backface-hidden" style={{ transform: 'rotateY(180deg)' }}>
                                <span className="text-4xl font-black text-slate-800 drop-shadow-md pb-1">T</span>
                             </div>
                          </motion.div>
                       </div>


                       {flipStatus !== 'idle' ? (
                           <div className="flex flex-col items-center text-center">
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`text-4xl font-black uppercase tracking-tight mb-2 ${flipStatus === 'won' ? 'text-emerald-400' : 'text-red-500'}`}
                              >
                                {flipStatus === 'won' ? 'You Won!' : 'You Lost!'}
                              </motion.div>
                              <div className="text-gray-400">
                                {flipStatus === 'won' ? `You won the ${selectedLobby.item.title}!` : `You lost your ${selectedItem.title}.`}
                              </div>
                              <button 
                                onClick={closeMatchResult}
                                className="mt-6 px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-colors"
                              >
                                Continue
                              </button>
                           </div>
                       ) : (
                           <button 
                             onClick={handleBotMatchFlip}
                             disabled={isFlipping}
                             className="px-16 py-5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-black text-2xl uppercase tracking-widest rounded-2xl transition-all shadow-xl hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                           >
                             {isFlipping ? 'Flipping...' : 'Start Match!'}
                           </button>
                       )}
                    </div>
                )}
             </div>
           )}

        </div>
      )}
    </div>
  );
}
