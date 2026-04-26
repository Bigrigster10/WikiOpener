import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { Item } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, Plus, Swords, User as UserIcon, RefreshCcw, X, Target } from 'lucide-react';
import { fetchRandomWikiArticle } from '../lib/gameLogic';
import { db } from '../lib/firebase';
import { collection, doc, query, where, getDocs, setDoc, updateDoc, onSnapshot, serverTimestamp, runTransaction } from 'firebase/firestore';
import { Bot, Loader2 } from 'lucide-react';

interface PlayerInPool {
    id: string;
    name: string;
    avatarUrl?: string;
    color: string;
    items: Item[];
    totalValue: number;
}

const BOT_NAMES = ['CryptoKing', 'LootGoblin', 'SniperPro', 'DiamondHandz', 'xX_Slayer_Xx', 'LuckMaster'];
const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export function JackpotPool() {
  const { user, profile, inventory, executeJackpotLobby } = useGameStore();
  const [opponentMode, setOpponentMode] = useState<'player' | 'bot'>('bot');
  const activeLobbyRef = useRef<(() => void) | null>(null);
  const [joinedLobbyId, setJoinedLobbyId] = useState<string | null>(null);
  const [hostId, setHostId] = useState<string | null>(null);
  const [isMatchmaking, setIsMatchmaking] = useState(false);
  const [gameState, setGameState] = useState<'setup' | 'countdown' | 'spinning' | 'result'>('setup');
  
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [showInventory, setShowInventory] = useState(false);
  
  const [players, setPlayers] = useState<PlayerInPool[]>([]);
  const [timeLeft, setTimeLeft] = useState(15);
  const [winner, setWinner] = useState<PlayerInPool | null>(null);
  const [rouletteItems, setRouletteItems] = useState<PlayerInPool[]>([]);

  const selectedItems = inventory.filter(i => selectedItemIds.includes(i.id!));
  const myTotalValue = selectedItems.reduce((acc, i) => acc + i.value, 0);
  
  const baseValueRef = useRef<number>(500);

  const totalPoolValue = players.reduce((acc, p) => acc + p.totalValue, 0);

  useEffect(() => {
      baseValueRef.current = myTotalValue || 500;
  }, [myTotalValue]);

  const resetGame = async () => {
      if (activeLobbyRef.current) {
          activeLobbyRef.current();
          activeLobbyRef.current = null;
          if (hostId === user?.uid && joinedLobbyId) {
             try {
                await updateDoc(doc(db, 'jackpot_lobbies', joinedLobbyId), {
                    status: 'cancelled'
                });
             } catch(e) {}
          }
      }
      setIsMatchmaking(false);
      setJoinedLobbyId(null);
      setHostId(null);
      setGameState('setup');
      setSelectedItemIds([]);
      setPlayers([]);
      setTimeLeft(15);
      setWinner(null);
      setRouletteItems([]);
  };

  useEffect(() => {
     if (gameState === 'countdown') {
         const timer = setInterval(() => {
             // Only decrement if we have enough players
             if (opponentMode === 'bot' || players.length >= 2) {
                 setTimeLeft(prev => {
                     if (prev <= 1) {
                         clearInterval(timer);
                         if (opponentMode === 'bot') {
                             startSpin();
                         } else if (hostId === user?.uid && joinedLobbyId) {
                             startSpinHost();
                         }
                         return 0;
                     }
                     return prev - 1;
                 });
             }
         }, 1000);

         const botInterval = setInterval(() => {
             if (opponentMode === 'bot' && Math.random() < 0.3 && players.length < 5) {
                 joinBot();
             }
         }, 2000);

         return () => {
             clearInterval(timer);
             clearInterval(botInterval);
         };
     }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, players.length, opponentMode, hostId, joinedLobbyId]);

  const joinBot = async () => {
      const numItems = Math.floor(Math.random() * 4) + 1;
      const newItems: Item[] = [];
      const currentTargetBet = baseValueRef.current;
      
      for(let i=0; i<numItems; i++) {
          try {
             // Let bot grab roughly appropriate tier items relative to the pot
             const wikiData = await fetchRandomWikiArticle('Random');
             const r = Math.random();
             let val = 100;
             let rarity = 'Restricted';
             
             // Target average total bet is ~currentTargetBet.
             // We partition it across `numItems`.
             const itemTargetVal = currentTargetBet / numItems;
             
             // Scale their values somewhat randomly around the target
             const scale = 0.5 + Math.random(); // 0.5x to 1.5x of target
             val = itemTargetVal * scale;
             
             // Assign rarity bounds loosely based on pure value 
             if (val > 10000) { rarity = 'Exceedingly Rare'; }
             else if (val > 2500) { rarity = 'Covert'; }
             else if (val > 500) { rarity = 'Classified'; }
             else if (val > 100) { rarity = 'Restricted'; }
             else { rarity = 'Mil-Spec'; }

             newItems.push({
                 id: crypto.randomUUID(),
                 title: wikiData.title,
                 image: wikiData.image,
                 value: Math.floor(val) < 1 ? 1 : Math.floor(val),
                 rarity,
                 wear: 'Factory New',
                 durability: 100,
                 caseType: 'Random Bots'
             });
          } catch(e) {
             // Fallback
             newItems.push({
                 id: crypto.randomUUID(),
                 title: 'Bot Loot',
                 image: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Placeholder.png',
                 value: Math.max(250, Math.floor((currentTargetBet / numItems) * (0.8 + Math.random()*0.4))),
                 rarity: 'Restricted',
                 wear: 'Factory New',
                 durability: 100,
                 caseType: 'Random Bots'
             });
          }
      }
      const botValue = newItems.reduce((acc, i) => acc + i.value, 0);
      
      const newPlayer: PlayerInPool = {
          id: crypto.randomUUID(),
          name: BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)],
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          items: newItems,
          totalValue: botValue
      };
      
      setPlayers(prev => {
          if (prev.length >= 5) return prev;
          return [...prev, newPlayer];
      });
  };

  const handleJoin = async () => {
      if (selectedItems.length === 0) return;
      
      const me: PlayerInPool = {
          id: user?.uid || 'me',
          name: profile?.displayName || 'You',
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          items: selectedItems,
          totalValue: myTotalValue
      };

      if (opponentMode === 'bot') {
          setPlayers([me]);
          setGameState('countdown');
          setTimeout(() => joinBot(), 500);
          return;
      }

      // Multiplayer Matchmaking
      if (!user) return;
      setIsMatchmaking(true);
      
      try {
          const lobbiesCol = collection(db, 'jackpot_lobbies');
          const qWaiting = query(lobbiesCol, where('status', '==', 'waiting'));
          const wSnaps = await getDocs(qWaiting);
          
          let jId: string | null = null;
          let hId: string | null = null;
          
          for (const docSnap of wSnaps.docs) {
              try {
                  await runTransaction(db, async (t) => {
                      const fresh = await t.get(docSnap.ref);
                      const d = fresh.data();
                      if (d && (d.status === 'waiting' || (d.status === 'countdown' && d.players.length < 10))) {
                          const existingPlayers = d.players || [];
                          if (!existingPlayers.find((p: any) => p.id === user.uid)) {
                              const newPlayers = [...existingPlayers, me];
                              t.update(docSnap.ref, { 
                                  players: newPlayers,
                                  status: newPlayers.length >= 2 ? 'countdown' : 'waiting',
                              });
                              jId = docSnap.id;
                              hId = d.hostId;
                          }
                      }
                  });
                  if (jId) break;
              } catch(e) {}
          }

          if (!jId) {
              const qCount = query(lobbiesCol, where('status', '==', 'countdown'));
              const cSnaps = await getDocs(qCount);
              for (const docSnap of cSnaps.docs) {
                  try {
                      await runTransaction(db, async (t) => {
                          const fresh = await t.get(docSnap.ref);
                          const d = fresh.data();
                          if (d && d.status === 'countdown' && d.players.length < 10) {
                              const existingPlayers = d.players || [];
                              if (!existingPlayers.find((p: any) => p.id === user.uid)) {
                                  t.update(docSnap.ref, { players: [...existingPlayers, me] });
                                  jId = docSnap.id;
                                  hId = d.hostId;
                              }
                          }
                      });
                      if (jId) break;
                  } catch(e) {}
              }
          }

          if (!jId) {
              const newRef = doc(lobbiesCol);
              await setDoc(newRef, {
                  status: 'waiting',
                  players: [me],
                  hostId: user.uid,
                  createdAt: serverTimestamp()
              });
              jId = newRef.id;
              hId = user.uid;
          }

          setJoinedLobbyId(jId);
          setHostId(hId);

          activeLobbyRef.current = onSnapshot(doc(db, 'jackpot_lobbies', jId), (snap) => {
              const data = snap.data();
              if (!data) return;
              
              if (data.players) {
                  setPlayers(data.players);
              }

              if (data.status === 'countdown') {
                 setIsMatchmaking(false);
                 setGameState('countdown');
              } else if (data.status === 'spinning') {
                 setIsMatchmaking(false);
                 setGameState('spinning');
                 if (data.winnerId && data.rouletteItems) {
                     const winP = data.players.find((p: any) => p.id === data.winnerId);
                     if (winP) setWinner(winP);
                     setRouletteItems(data.rouletteItems);
                     
                     setTimeout(() => {
                         finishGame(winP || data.players[0]);
                     }, 6000);
                 }
              }
          });

      } catch (e: any) {
          console.error(e);
          alert("Matchmaking error: " + e.message);
          setIsMatchmaking(false);
      }
  };

  const startSpinHost = async () => {
      if (!joinedLobbyId) return;
      const total = players.reduce((acc, p) => acc + p.totalValue, 0);
      const roll = Math.random() * total;
      
      let cumulative = 0;
      let winningPlayer = players[0];
      if (players.length > 0) {
        for (const p of players) {
            cumulative += p.totalValue;
            if (roll <= cumulative) {
                winningPlayer = p;
                break;
            }
        }
      }

      const items: PlayerInPool[] = [];
      for(let i=0; i<45; i++) {
          let cum = 0;
          const r = Math.random() * total;
          let added = false;
          for (const p of players) {
             cum += p.totalValue;
             if (r <= cum) {
                 items.push(p);
                 added = true;
                 break;
             }
          }
          if (!added && players.length > 0) items.push(players[0]);
      }
      
      items[40] = winningPlayer;
      
      try {
          await updateDoc(doc(db, 'jackpot_lobbies', joinedLobbyId), {
              status: 'spinning',
              winnerId: winningPlayer.id,
              rouletteItems: items
          });
      } catch (e) {
          console.error(e);
      }
  };

  const startSpin = () => {
      setGameState('spinning');
      
      const total = players.reduce((acc, p) => acc + p.totalValue, 0);
      
      const roll = Math.random() * total;
      
      let cumulative = 0;
      let winningPlayer = players[0];
      if (players.length > 0) {
        for (const p of players) {
            cumulative += p.totalValue;
            if (roll <= cumulative) {
                winningPlayer = p;
                break;
            }
        }
      }

      const items: PlayerInPool[] = [];
      for(let i=0; i<45; i++) {
          let cum = 0;
          const r = Math.random() * total;
          let added = false;
          for (const p of players) {
             cum += p.totalValue;
             if (r <= cum) {
                 items.push(p);
                 added = true;
                 break;
             }
          }
          if (!added && players.length > 0) items.push(players[0]);
      }
      
      items[40] = winningPlayer;
      
      setRouletteItems(items);
      setWinner(winningPlayer);

      setTimeout(() => {
          finishGame(winningPlayer);
      }, 6000);
  };

  const finishGame = async (winningPlayer: PlayerInPool) => {
      setGameState('result');
      
      const isWinner = winningPlayer.id === (user?.uid || 'me');
      const allPotItems = players.flatMap(p => p.items);
      
      await executeJackpotLobby(selectedItems, allPotItems, isWinner);
  };

  const toggleItem = (item: Item) => {
      if (selectedItemIds.includes(item.id!)) {
          setSelectedItemIds(prev => prev.filter(id => id !== item.id));
      } else {
          if (selectedItemIds.length >= 6) return;
          setSelectedItemIds(prev => [...prev, item.id!]);
      }
  };

  return (
    <div className="flex flex-col items-center max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-4 border-b border-white/10 pb-6 w-full mb-8">
        <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
          <Target className="w-6 h-6 text-[#10b981]" />
        </div>
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white">Jackpot Pool</h1>
          <p className="text-gray-400 text-sm mt-1">Deposit up to 6 items. Winner takes the entire pool proportional to their odds.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
         
         <div className="lg:col-span-1 space-y-6">
            
            <div className="glass p-6 rounded-3xl border border-white/10 flex flex-col gap-4">
                 <h2 className="text-xl font-bold uppercase tracking-widest text-[#10b981]">Status</h2>
                 
                 {gameState === 'setup' && (
                     <div className="space-y-4">
                         <p className="text-sm text-gray-400">Select items from your inventory to join the lobby.</p>
                         <button 
                             onClick={() => setShowInventory(true)}
                             className="w-full py-4 bg-white/5 hover:bg-white/10 border-2 border-dashed border-white/20 rounded-xl text-white font-bold flex flex-col items-center gap-2 transition-all"
                         >
                            <Plus className="w-6 h-6" />
                            {selectedItems.length > 0 ? `${selectedItems.length}/6 Items Selected` : 'Select Items (Max 6)'}
                         </button>
                         {selectedItems.length > 0 && (
                             <div className="text-center font-bold text-amber-400">{myTotalValue.toLocaleString()} CR</div>
                         )}

                         <div className="flex bg-black/40 p-1 rounded-lg border border-white/10">
                              <button
                                  onClick={() => setOpponentMode('bot')}
                                  className={`flex-1 py-1.5 rounded flex items-center justify-center gap-2 text-xs font-bold transition-all ${opponentMode === 'bot' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-white/10'}`}
                              >
                                  <Bot className="w-3.5 h-3.5" /> Bot Lobby
                              </button>
                              <button
                                  onClick={() => setOpponentMode('player')}
                                  className={`flex-1 py-1.5 rounded flex items-center justify-center gap-2 text-xs font-bold transition-all ${opponentMode === 'player' ? 'bg-[#10b981] text-white' : 'text-gray-400 hover:bg-white/10'}`}
                              >
                                  <UserIcon className="w-3.5 h-3.5" /> Multiplayer
                              </button>
                         </div>

                         <button 
                             onClick={handleJoin}
                             disabled={selectedItems.length === 0 || isMatchmaking}
                             className="w-full py-3 bg-[#10b981] hover:bg-[#10b981]/80 text-white font-black uppercase tracking-widest rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                         >
                             {isMatchmaking ? (
                                <div className="flex items-center justify-center gap-2">
                                  <Loader2 className="w-4 h-4 animate-spin" /> Matchmaking
                                </div>
                             ) : 'Join Pool'}
                         </button>
                     </div>
                 )}

                 {gameState === 'countdown' && (
                                    <div className="text-center py-4 border-2 border-[#10b981]/50 rounded-xl bg-[#10b981]/10 flex flex-col items-center">
                        <div className="text-sm text-[#10b981] font-bold uppercase mb-1">
                           {opponentMode === 'player' && players.length < 2 ? 'Waiting for players...' : 'Rolling In'}
                        </div>
                        {players.length >= 2 || opponentMode === 'bot' ? (
                           <div className="text-5xl font-black text-white">{timeLeft}s</div>
                        ) : (
                           <div className="flex justify-center mt-2 mb-2">
                              <Loader2 className="w-8 h-8 text-[#10b981] animate-spin" />
                           </div>
                        )}
                        {opponentMode === 'player' && players.length < 2 && (
                            <button onClick={resetGame} className="mt-4 px-4 py-2 bg-red-500/20 text-red-500 rounded-lg text-xs font-bold hover:bg-red-500/30 transition-colors">
                                Cancel Matchmaking
                            </button>
                        )}
                     </div>
                 )}

                 {(gameState === 'spinning' || gameState === 'result') && winner && (
                    <div className="text-center py-4">
                        <div className="text-sm text-gray-400 font-bold uppercase mb-1">Total Pot</div>
                        <div className="text-3xl font-black text-white">{totalPoolValue.toLocaleString()} CR</div>
                    </div>
                 )}
            </div>

            {players.length > 0 && (
                <div className="glass p-6 rounded-3xl border border-white/10 flex flex-col gap-4">
                    <h2 className="text-xl font-bold uppercase tracking-widest text-white">Players ({players.length})</h2>
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                        {players.map((p, i) => {
                            const pct = totalPoolValue > 0 ? ((p.totalValue / totalPoolValue) * 100).toFixed(1) : '0.0';
                            return (
                            <div key={i} className="flex flex-col gap-2 p-3 rounded-xl bg-black/40 border border-white/5 relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: p.color }}></div>
                                <div className="flex justify-between items-center z-10 pl-2">
                                   <div className="flex items-center gap-2">
                                       <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-black" style={{ backgroundColor: p.color }}>
                                           <UserIcon className="w-3 h-3" />
                                       </div>
                                       <span className="font-bold text-white text-sm">{p.name} {p.id === 'me' && '(You)'}</span>
                                   </div>
                                   <span className="font-bold text-amber-400 text-sm">{p.totalValue.toLocaleString()} CR</span>
                                </div>
                                <div className="z-10 flex justify-between items-center text-xs text-gray-400 pl-2">
                                   <span>{p.items.length} Items</span>
                                   <span>{pct}% Chance</span>
                                </div>
                            </div>
                        )})}
                    </div>
                </div>
            )}
         </div>

         <div className="lg:col-span-2 space-y-6">
             <div className="glass p-6 rounded-3xl border border-white/10 min-h-[300px] flex flex-col">
                 <div className="flex justify-between items-center mb-6">
                     <h2 className="text-xl font-bold uppercase tracking-widest text-white">The Pool</h2>
                     <span className="text-amber-400 font-bold">{totalPoolValue.toLocaleString()} CR Total</span>
                 </div>

                 {players.length === 0 && gameState === 'setup' && (
                     <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                         <Target className="w-16 h-16 mb-4 opacity-50 text-[#10b981]" />
                         <p>Waiting for players...</p>
                     </div>
                 )}

                 {players.length > 0 && gameState !== 'setup' && (
                     <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                         {players.flatMap(p => p.items).map((item, idx) => (
                             <div key={idx} className="aspect-square bg-black/50 border border-white/10 rounded-xl flex items-center justify-center p-2 relative group hover:border-white/30 transition-colors">
                                 <img src={item.image} alt={item.title} className="max-w-full max-h-full object-contain drop-shadow-lg" />
                                 <div className="absolute inset-x-0 bottom-0 p-1 bg-black/80 text-[10px] text-white truncate text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    {item.title}
                                 </div>
                             </div>
                         ))}
                     </div>
                 )}
             </div>

             {(gameState === 'spinning' || gameState === 'result') && (
                 <div className="glass p-8 rounded-3xl border border-[#10b981]/50 flex flex-col items-center overflow-hidden relative shadow-[0_0_40px_rgba(16,185,129,0.1)]">
                      <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-white z-20 -translate-x-1/2 shadow-[0_0_15px_white]"></div>
                      <div className="w-full overflow-hidden h-32 relative flex items-center bg-black/40 rounded-xl border border-white/5 inset-shadow-sm">
                          <motion.div 
                              className="flex gap-2 absolute left-1/2 min-w-max"
                              initial={{ x: 0 }}
                              animate={{ x: `calc(-40 * 128px - 64px)` }}
                              transition={{ duration: 6, ease: [0.15, 0.85, 0.15, 1] }}
                          >
                              {rouletteItems.map((p, i) => (
                                  <div key={i} className="w-[120px] h-[120px] shrink-0 rounded-2xl flex flex-col items-center justify-center border-4 relative bg-black transition-all" style={{ borderColor: p.color }}>
                                      <div className="absolute inset-0 opacity-20" style={{ backgroundColor: p.color }}></div>
                                      <UserIcon className="w-10 h-10 mb-2 relative z-10" style={{ color: p.color }} />
                                      <span className="text-xs font-bold text-white truncate w-full text-center px-2 relative z-10">{p.name}</span>
                                  </div>
                              ))}
                          </motion.div>
                      </div>
                      
                      {gameState === 'result' && winner && (
                          <motion.div 
                             initial={{ opacity: 0, scale: 0.8, y: 20 }}
                             animate={{ opacity: 1, scale: 1, y: 0 }}
                             className="mt-8 flex flex-col items-center bg-black/50 w-full p-6 rounded-2xl border border-white/10"
                          >
                                <div className="text-4xl font-black uppercase mb-2 drop-shadow-lg" style={{ color: winner.color }}>
                                  {winner.name} WINS!
                              </div>
                              <div className="text-amber-400 font-bold mb-6 text-xl">
                                  Prize: {totalPoolValue.toLocaleString()} CR
                              </div>
                              
                              <button 
                                  onClick={resetGame}
                                  className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all uppercase tracking-widest border border-white/20"
                              >
                                  Play Again
                              </button>
                          </motion.div>
                      )}
                 </div>
             )}
         </div>
      </div>

      {showInventory && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex flex-col p-6 overflow-y-auto">
             <div className="flex justify-between items-center mb-6 max-w-6xl mx-auto w-full mt-10">
                 <h2 className="text-3xl font-black text-white uppercase">Your Inventory</h2>
                 <button onClick={() => setShowInventory(false)} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors">
                     <X className="w-6 h-6" />
                 </button>
             </div>
             
             <div className="max-w-6xl mx-auto w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 pb-32">
                 {inventory.map(item => {
                     const isSelected = selectedItemIds.includes(item.id!);
                     return (
                         <div 
                           key={item.id} 
                           onClick={() => toggleItem(item)}
                           className={`relative aspect-square glass rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all ${
                               isSelected ? 'border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.3)] bg-amber-400/10 scale-105 z-10' : 'border-white/5 hover:border-white/20 hover:scale-105'
                           }`}
                         >
                            {isSelected && (
                                <div className="absolute top-2 right-2 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center text-black font-black text-xs z-10 shadow-lg">
                                    ✓
                                </div>
                            )}
                            <img src={item.image} alt={item.title} className="h-20 w-20 md:h-24 md:w-24 object-contain mb-3 drop-shadow-lg" />
                            <div className="text-center w-full mt-auto">
                                <h3 className="text-[10px] md:text-xs font-bold text-gray-300 truncate w-full">{item.title}</h3>
                                <div className="text-amber-400 font-black mt-1 text-sm">{item.value.toLocaleString()} CR</div>
                            </div>
                         </div>
                     );
                 })}
                 {inventory.length === 0 && (
                     <div className="col-span-full py-20 text-center text-gray-500 font-bold text-xl uppercase">
                         Your inventory is empty
                     </div>
                 )}
             </div>
             
             <div className="fixed bottom-6 left-1/2 -translate-x-1/2 max-w-4xl w-[90%] flex justify-between items-center bg-gray-900/90 backdrop-blur-xl p-4 sm:p-6 rounded-3xl border border-white/20 shadow-2xl">
                 <div className="text-white font-bold flex items-center gap-4">
                     <div className="flex flex-col">
                        <span className="text-xs text-gray-400 uppercase tracking-widest">Selected</span>
                        <span className="text-xl text-amber-400">{selectedItems.length}/6</span>
                     </div>
                     <div className="w-px h-8 bg-white/20"></div>
                     <div className="flex flex-col">
                        <span className="text-xs text-gray-400 uppercase tracking-widest">Value</span>
                        <span className="text-xl text-amber-400">{myTotalValue.toLocaleString()} CR</span>
                     </div>
                 </div>
                 <button 
                     onClick={() => setShowInventory(false)}
                     className="px-8 py-3 bg-[#10b981] hover:bg-[#10b981]/80 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-[#10b981]/20"
                 >
                     Done
                 </button>
             </div>
          </div>
      )}

    </div>
  );
}
