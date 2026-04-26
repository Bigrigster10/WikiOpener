import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { Item } from '../types';
import { CASES, CaseType, generateBattleItems } from '../lib/gameLogic';
import { motion, AnimatePresence } from 'motion/react';
import { Swords, User, Bot, Loader2, Sparkles, AlertTriangle, ChevronRight, X, Trophy } from 'lucide-react';
import { playSound } from '../lib/sounds';
import { ShinyEffect } from '../components/ShinyEffect';

type BattleState = 'setup' | 'matchmaking' | 'battle' | 'result';

export function Battles() {
    const { user, profile, preferences, executeBattle, devForcedRarity, devForcedShiny } = useGameStore();
    
    const [battleState, setBattleState] = useState<BattleState>('setup');
    const [selectedCase, setSelectedCase] = useState<CaseType | null>(null);
    const [amount, setAmount] = useState<number>(1);
    const [opponentMode, setOpponentMode] = useState<'player' | 'bot'>('bot');
    
    const [userItems, setUserItems] = useState<Item[]>([]);
    const [botItems, setBotItems] = useState<Item[]>([]);
    const [round, setRound] = useState<number>(0);
    const [isGenerating, setIsGenerating] = useState(false);
    
    // Result State
    const [battleResult, setBattleResult] = useState<'win' | 'loss' | 'tie' | null>(null);

    const amounts = [1, 5, 10, 25, 50, 100];
    const totalCost = selectedCase ? selectedCase.cost * amount : 0;
    const canAfford = profile && profile.credits >= totalCost;

    const formatCurrency = (val: number) => {
        return preferences.currency === 'CR' 
          ? val.toLocaleString() + ' CR' 
          : '$' + val.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})
      };

    const handleStartMatchmaking = async () => {
        if (!selectedCase || !canAfford) return;
        setBattleState('matchmaking');
        
        // Matchmaking delay simulation
        setTimeout(async () => {
            if (opponentMode === 'player') {
                // If they picked player, warn them and switch to bot
                setOpponentMode('bot');
            }
            startBattle();
        }, opponentMode === 'player' ? 3000 : 500);
    };

    const startBattle = async () => {
        setIsGenerating(true);
        // Generate User side
        const userSide = await generateBattleItems(selectedCase!, amount, profile?.pityCounter || 0, devForcedRarity, devForcedShiny);
        // Generate Bot side (bots don't get the user's pity buff, they start native)
        const botSide = await generateBattleItems(selectedCase!, amount, 0);
        
        setUserItems(userSide.items);
        setBotItems(botSide.items);
        
        const uTotal = userSide.items.reduce((acc, i) => acc + i.value, 0);
        const bTotal = botSide.items.reduce((acc, i) => acc + i.value, 0);

        let wonItems: Item[] = [];
        let rResult: 'win' | 'loss' | 'tie' = 'tie';
        let cashPrize = 0;
        if (uTotal > bTotal) {
            wonItems = [...userSide.items, ...botSide.items];
            rResult = 'win';
            cashPrize = totalCost; // Refund their entry cost
        } else if (uTotal < bTotal) {
            wonItems = [];
            rResult = 'loss';
        } else {
            wonItems = [...userSide.items];
            rResult = 'tie';
        }

        const newPity = userSide.finalPity;
        
        // Execute atomical backend transaction
        const success = await executeBattle(totalCost, amount, wonItems, newPity, rResult === 'win', cashPrize);
        setIsGenerating(false);

        if (success) {
            setBattleResult(rResult);
            setBattleState('battle');
            setRound(0); // Start animation loop
        } else {
            alert("Failed to start battle. Check balance.");
            setBattleState('setup');
        }
    };

    // Animation Loop
    useEffect(() => {
        if (battleState === 'battle' && round < amount) {
            let delay = 1000; // default 1 case delay
            if (amount >= 100) delay = 150;
            else if (amount >= 25) delay = 250;
            else if (amount >= 10) delay = 400;
            else if (amount >= 5) delay = 600;

            const timer = setTimeout(() => {
                playSound('tick');
                setRound(r => r + 1);
            }, delay);
            return () => clearTimeout(timer);
        } else if (battleState === 'battle' && round >= amount) {
            const timer = setTimeout(() => {
                if (battleResult === 'win') playSound('success');
                setBattleState('result');
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [battleState, round, amount, battleResult]);


    const reset = () => {
        setBattleState('setup');
        setUserItems([]);
        setBotItems([]);
        setRound(0);
        setBattleResult(null);
    };

    if (battleState === 'setup') {
        const affordableCases = CASES.filter(c => c.cost > 0 && !c.isPremium); // Filter out free and real money premiums for battles
        
        return (
            <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-full flex-1">
                <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 border-b border-white/10 pb-6">
                    <div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
                            <Swords className="w-8 h-8 text-red-500" />
                            Case Battles
                        </h2>
                        <p className="text-gray-400 mt-1 max-w-md">Go head-to-head opening cases. Whoever unboxes the highest total value keeps EVERYTHING.</p>
                    </div>

                    <div className="glass p-4 rounded-xl border border-white/10 flex flex-col sm:flex-row gap-6 w-full md:w-auto shrink-0 shadow-2xl">
                         <div>
                            <div className="text-xs uppercase tracking-widest font-bold text-gray-500 mb-2">Round Count</div>
                            <div className="flex flex-wrap gap-1">
                                {amounts.map(amt => (
                                    <button 
                                      key={amt}
                                      onClick={() => setAmount(amt)}
                                      className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${amount === amt ? 'bg-red-500 text-white' : 'bg-black/40 text-gray-400 hover:bg-white/10'}`}
                                    >
                                        x{amt}
                                    </button>
                                ))}
                            </div>
                         </div>
                         <div className="h-full w-px bg-white/10 hidden sm:block"></div>
                         <div>
                            <div className="text-xs uppercase tracking-widest font-bold text-gray-500 mb-2">Opponent</div>
                            <div className="flex gap-1">
                                <button
                                  onClick={() => setOpponentMode('bot')}
                                  className={`px-4 py-1.5 rounded flex items-center gap-2 text-xs font-bold transition-all ${opponentMode === 'bot' ? 'bg-gray-700 text-white' : 'bg-black/40 text-gray-400 hover:bg-white/10'}`}
                                >
                                    <Bot className="w-3.5 h-3.5" /> Bot
                                </button>
                                <button
                                  onClick={() => setOpponentMode('player')}
                                  className={`px-4 py-1.5 rounded flex items-center gap-2 text-xs font-bold transition-all ${opponentMode === 'player' ? 'bg-blue-600 text-white' : 'bg-black/40 text-gray-400 hover:bg-white/10'}`}
                                >
                                    <User className="w-3.5 h-3.5" /> Player
                                </button>
                            </div>
                         </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {affordableCases.map(c => (
                        <div 
                           key={c.id} 
                           onClick={() => setSelectedCase(c)}
                           className={`glass p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col relative overflow-hidden group ${
                               selectedCase?.id === c.id 
                                ? 'border-red-500 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.2)]' 
                                : 'border-white/5 hover:border-white/20'
                           }`}
                        >
                            <div className="w-full h-32 mb-4 bg-black/40 rounded-lg flex items-center justify-center p-2 group-hover:scale-105 transition-transform">
                                <img src={c.image} alt={c.name} className="max-h-full object-contain mix-blend-screen drop-shadow-2xl" />
                            </div>
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{c.category}</div>
                            <h3 className="font-bold text-white uppercase text-base tracking-tight truncate pb-1">{c.name}</h3>
                            <div className="text-emerald-400 font-mono font-bold">{formatCurrency(c.cost)}</div>
                        </div>
                    ))}
                </div>

                <div className="mt-auto glass p-6 sticky bottom-4 rounded-2xl border-white/10 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border-t-4 border-t-red-500">
                     <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                             <Swords className="w-6 h-6 text-red-500" />
                         </div>
                         <div>
                             <div className="text-sm font-bold text-white uppercase">{selectedCase ? `${selectedCase.name} x${amount}` : 'Select a Case'}</div>
                             <div className="text-xs text-gray-400">Winner takes all</div>
                         </div>
                     </div>
                     <button
                        onClick={handleStartMatchmaking}
                        disabled={!selectedCase || !canAfford}
                        className={`px-8 py-4 rounded-xl font-black text-lg uppercase tracking-widest transition-transform ${
                            !selectedCase || !canAfford 
                              ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                              : 'bg-red-500 text-white hover:scale-105 hover:bg-red-400 shadow-[0_0_30px_rgba(239,68,68,0.4)]'
                        }`}
                     >
                         {selectedCase && !canAfford ? 'Insufficient Funds' : `Start Battle • ${formatCurrency(totalCost)}`}
                     </button>
                </div>
            </div>
        );
    }

    if (battleState === 'matchmaking') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
                <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
                <h2 className="text-3xl font-black uppercase tracking-widest text-white">Matchmaking...</h2>
                {opponentMode === 'player' && (
                    <div className="text-gray-400 max-w-sm">Searching for an opponent looking for <span className="text-white">{selectedCase?.name} x{amount}</span></div>
                )}
                {opponentMode === 'bot' && (
                    <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 p-4 rounded-xl flex items-center justify-center gap-3 text-sm font-bold">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <div className="text-left">
                            <div>No players found online.</div>
                            <div className="text-yellow-500/70 text-xs">Switching to Bot Opponent...</div>
                        </div>
                    </motion.div>
                )}
                {isGenerating && (
                    <div className="text-accent text-sm uppercase tracking-widest font-bold mt-4 animate-pulse">Generating Artifacts...</div>
                )}
            </div>
        );
    }

    // Calculating dynamic running totals for the animation
    const userCurrentTotal = userItems.slice(0, round).reduce((acc, i) => acc + i.value, 0);
    const botCurrentTotal = botItems.slice(0, round).reduce((acc, i) => acc + i.value, 0);

    const isWinner = battleResult === 'win';
    const isLoser = battleResult === 'loss';
    
    // Top border color for columns
    const userBorder = userCurrentTotal > botCurrentTotal ? 'border-t-emerald-500' : 'border-t-red-500';
    const botBorder = botCurrentTotal > userCurrentTotal ? 'border-t-emerald-500' : 'border-t-red-500';

    return (
        <div className="flex flex-col gap-4 w-full max-w-7xl mx-auto flex-1 md:h-full overflow-hidden">
             
             {/* Battle Header */}
             <div className={`glass p-4 rounded-xl flex items-center justify-between border-t-2 relative overflow-hidden transition-colors ${battleState === 'result' ? (isWinner ? 'border-emerald-500' : isLoser ? 'border-red-500' : 'border-gray-500') : 'border-white/10'}`}>
                 {battleState === 'result' && isWinner && (
                     <div className="absolute inset-0 bg-emerald-500/10 animate-pulse pointer-events-none"></div>
                 )}
                 <div className="flex flex-col items-center flex-1">
                     <div className="text-[10px] uppercase font-black tracking-widest text-gray-500">YOU</div>
                     <div className="text-2xl md:text-4xl font-mono font-black text-white">{formatCurrency(userCurrentTotal)}</div>
                 </div>
                 
                 <div className="flex flex-col items-center flex-[0.5] shrink-0 border-l border-r border-white/10 px-4">
                     <div className="text-xs uppercase font-black tracking-widest text-gray-400 mb-1">
                         {battleState === 'battle' ? `Round ${round}/${amount}` : 'Final Result'}
                     </div>
                     <Swords className={`w-8 h-8 ${battleState === 'battle' ? 'text-blue-500 animate-pulse' : isWinner ? 'text-emerald-500' : 'text-red-500'}`} />
                 </div>

                 <div className="flex flex-col items-center flex-1">
                     <div className="text-[10px] uppercase font-black tracking-widest text-gray-500">BOT</div>
                     <div className="text-2xl md:text-4xl font-mono font-black text-rose-500">{formatCurrency(botCurrentTotal)}</div>
                 </div>
             </div>

             {/* Result Overlay */}
             {battleState === 'result' && (
                 <motion.div 
                    initial={{opacity: 0, scale: 0.9, y: 20}} 
                    animate={{opacity: 1, scale: 1, y: 0}}
                    className="w-full glass p-8 rounded-2xl flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden shrink-0 border border-white/10"
                 >
                     <div className="absolute inset-0 top-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
                     <Trophy className={`w-16 h-16 mb-4 ${isWinner ? 'text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.5)]' : isLoser ? 'text-red-500 opacity-50' : 'text-gray-400'}`} />
                     
                     <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-2">
                         {isWinner ? "You Win!" : isLoser ? "You Lost" : "Tie Game"}
                     </h2>
                     <p className="text-gray-400 mb-4 max-w-lg">
                         {isWinner ? "Wow. You completely swept the board. Both yours and the bot's items have been deposited directly into your inventory!" : 
                          isLoser ? "The bot pulled more value than you did. You lose all items from this battle. Better luck next time." :
                          "A perfect tie. You keep the items you pulled, but don't get the bot's."}
                     </p>

                     {isWinner && (
                         <motion.div 
                             initial={{opacity: 0, scale: 0.8}} 
                             animate={{opacity: 1, scale: 1}}
                             className="mb-6 bg-emerald-500/20 border border-emerald-500/30 px-6 py-2 rounded-xl"
                         >
                             <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-0.5">Victor's Spoils: Entry Fee Refunded</div>
                             <div className="text-xl font-mono font-black text-emerald-300">+{formatCurrency(totalCost)}</div>
                         </motion.div>
                     )}

                     <div className="flex gap-4 mt-2">
                         <button onClick={reset} className="px-8 py-4 bg-white hover:bg-gray-200 text-black rounded-xl font-black uppercase tracking-widest transition-transform hover:scale-105 text-sm">
                             New Battle
                         </button>
                     </div>
                 </motion.div>
             )}

             {/* Battle Arena */}
             <div className="flex-1 flex overflow-hidden min-h-[400px]">
                 {/* User Column */}
                 <div className={`flex-1 flex flex-col border-r border-white/5 glass rounded-l-2xl overflow-hidden border-t-2 ${userBorder} transition-colors bg-black/20`}>
                     <div className="p-4 flex flex-col gap-2 overflow-y-auto custom-scrollbar flex-1-0-0 min-h-0 relative items-center pt-8">
                         <AnimatePresence>
                            {userItems.slice(0, round).reverse().map((item, idx) => (
                                <BattleItemCard key={`${item.id}-user-${idx}`} item={item} isLatest={idx === 0 && battleState === 'battle'} formatCurrency={formatCurrency} />
                            ))}
                        </AnimatePresence>
                     </div>
                 </div>

                 {/* Bot Column */}
                 <div className={`flex-1 flex flex-col glass rounded-r-2xl overflow-hidden border-t-2 ${botBorder} transition-colors bg-black/20`}>
                     <div className="p-4 flex flex-col gap-2 overflow-y-auto custom-scrollbar flex-1-0-0 min-h-0 relative items-center pt-8">
                         <AnimatePresence>
                            {botItems.slice(0, round).reverse().map((item, idx) => (
                                <BattleItemCard key={`${item.id}-bot-${idx}`} item={item} isLatest={idx === 0 && battleState === 'battle'} formatCurrency={formatCurrency} />
                            ))}
                        </AnimatePresence>
                     </div>
                 </div>
             </div>
        </div>
    );
}


interface BattleItemCardProps {
    item: Item;
    isLatest: boolean;
    formatCurrency: (val: number) => string;
    key?: string;
}

function BattleItemCard({ item, isLatest, formatCurrency }: BattleItemCardProps) {
    return (
        <ShinyEffect type={item.shinyType} className={isLatest ? 'z-10' : ''}>
            <motion.div 
                initial={isLatest ? { opacity: 0, scale: 0.8, y: -20 } : false}
                animate={{ opacity: 1, scale: isLatest ? 1.05 : 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`w-full max-w-[280px] rounded-xl flex flex-col items-center p-3 relative overflow-hidden text-center shrink-0 border-l-[3px] border-b border-t border-r border-r-white/5 border-t-white/5 border-b-white/5 bg-black/40 ${isLatest ? 'shadow-2xl mb-4 bg-white/5' : 'mb-2 opacity-80'}`}
                style={{ borderLeftColor: getBorderColor(item.rarity) }}
            >
                <div className="w-16 h-16 border border-white/10 bg-black/40 rounded-lg p-1.5 flex items-center justify-center mb-2 overflow-hidden shrink-0">
                    <img src={item.image} className="max-h-full object-contain mix-blend-screen" />
                </div>
                <div className="text-[9px] uppercase tracking-widest font-black text-gray-500 w-full truncate">{item.rarity}</div>
                <div className="font-bold text-xs text-white max-w-full truncate">{item.title}</div>
                <div className="text-emerald-400 font-mono font-bold mt-1 text-sm">{formatCurrency(item.value)}</div>
            </motion.div>
        </ShinyEffect>
    );
}

function getBorderColor(rarity: string) {
    if (rarity === 'Consumer Grade') return '#9ca3af';
    if (rarity === 'Mil-Spec') return '#3b82f6';
    if (rarity === 'Restricted') return '#a855f7';
    if (rarity === 'Classified') return '#ec4899';
    if (rarity === 'Covert') return '#ef4444';
    if (rarity === 'Exceedingly Rare') return '#eab308';
    return '#4b5563';
}
