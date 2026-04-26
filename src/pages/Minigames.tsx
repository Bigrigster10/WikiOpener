import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { Item } from '../types';
import { fetchRandomWikiArticle, RARITIES } from '../lib/gameLogic';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, ShieldAlert, Sparkles, RefreshCcw, FileSignature, Swords, ChevronLeft, Gamepad2 } from 'lucide-react';
import { Battles } from './Battles';

export function Minigames() {
  const location = useLocation();
  const [activeGame, setActiveGame] = useState(location.state?.activeGame || 'menu');

  useEffect(() => {
    if (location.state?.activeGame) {
      setActiveGame(location.state.activeGame);
    }
    // Clear out router history state so refreshes don't re-trigger it
    if (location.state) {
        window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const renderGame = () => {
      switch (activeGame) {
          case 'upgrader':
              return (
                 <div className="glass p-6 min-h-[600px] flex flex-col relative overflow-hidden mt-6">
                     <Upgrader autoSelectItemId={location.state?.autoSelectItemId} />
                 </div>
              );
          case 'contract':
              return (
                 <div className="glass p-6 min-h-[600px] flex flex-col relative overflow-hidden mt-6">
                     <Contract autoSelectItemId={location.state?.autoSelectItemId} />
                 </div>
              );
          case 'battles':
              return <div className="mt-6 flex-1 flex flex-col"><Battles /></div>;
          default:
              return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                      {/* Upgrader Tile */}
                      <button 
                        onClick={() => setActiveGame('upgrader')}
                        className="glass relative overflow-hidden group rounded-3xl p-8 border-2 border-white/5 hover:border-accent/50 text-left transition-all duration-300 hover:shadow-[0_0_40px_rgba(59,130,246,0.15)] flex flex-col items-start gap-4 hover:-translate-y-1"
                      >
                          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="w-14 h-14 rounded-2xl bg-accent/20 flex flex-col items-center justify-center shrink-0 border border-accent/20">
                              <ArrowUpRight className="w-7 h-7 text-accent" />
                          </div>
                          <div>
                              <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-2">Upgrader</h3>
                              <p className="text-gray-400 text-sm leading-relaxed">
                                  Risk an item from your inventory to attempt an upgrade. Choose your multiplier, beat the odds, and walk away with a richer prize.
                              </p>
                          </div>
                      </button>

                      {/* Trade-Up Contract Tile */}
                      <button 
                        onClick={() => setActiveGame('contract')}
                        className="glass relative overflow-hidden group rounded-3xl p-8 border-2 border-white/5 hover:border-purple-500/50 text-left transition-all duration-300 hover:shadow-[0_0_40px_rgba(168,85,247,0.15)] flex flex-col items-start gap-4 hover:-translate-y-1"
                      >
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex flex-col items-center justify-center shrink-0 border border-purple-500/20">
                              <FileSignature className="w-7 h-7 text-purple-400" />
                          </div>
                          <div>
                              <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-2">Trade-Up</h3>
                              <p className="text-gray-400 text-sm leading-relaxed">
                                  Sign a contract to burn 10 items of the exact same rarity. In exchange, receive 1 highly-coveted item from the next rarity tier.
                              </p>
                          </div>
                      </button>

                      {/* Case Battles Tile */}
                      <button 
                        onClick={() => setActiveGame('battles')}
                        className="glass relative overflow-hidden group rounded-3xl p-8 border-2 border-white/5 hover:border-red-500/50 text-left transition-all duration-300 hover:shadow-[0_0_40px_rgba(239,68,68,0.15)] flex flex-col items-start gap-4 hover:-translate-y-1 md:col-span-2 lg:col-span-1"
                      >
                          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="w-14 h-14 rounded-2xl bg-red-500/20 flex flex-col items-center justify-center shrink-0 border border-red-500/20">
                              <Swords className="w-7 h-7 text-red-500" />
                          </div>
                          <div>
                              <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-2">Case Battles</h3>
                              <p className="text-gray-400 text-sm leading-relaxed">
                                  Go head-to-head in a high stakes box opening. The player who unpacks the most total value keeps absolutely everything.
                              </p>
                          </div>
                      </button>
                  </div>
              );
      }
  };

  return (
    <div className="flex flex-col gap-2 max-w-7xl mx-auto w-full flex-1">
      
      {activeGame !== 'menu' && (
        <button 
          onClick={() => setActiveGame('menu')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors w-fit mb-2 text-sm font-bold uppercase tracking-widest"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Mini Games
        </button>
      )}

      {activeGame === 'menu' && (
        <div className="flex items-center gap-4 border-b border-white/10 pb-6">
            <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
               <Gamepad2 className="w-6 h-6 text-gray-300" />
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter text-white">Mini Games</h1>
              <p className="text-gray-400 text-sm mt-1">Risk your inventory items to win big or battle against others.</p>
            </div>
        </div>
      )}

      {renderGame()}

    </div>
  );
}

function Contract({ autoSelectItemId }: { autoSelectItemId?: string }) {
  const { inventory, profile, preferences, tradeUpItems } = useGameStore();
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [rolling, setRolling] = useState(false);
  const [rewardItem, setRewardItem] = useState<Item | null>(null);

  useEffect(() => {
    if (autoSelectItemId && inventory.length > 0 && selectedItems.length === 0 && !rewardItem && !rolling) {
      const itemToSelect = inventory.find(i => i.id === autoSelectItemId);
      if (itemToSelect && itemToSelect.rarity !== RARITIES.EXCEEDINGLY_RARE.name) {
        setSelectedItems([itemToSelect]);
      }
    }
  }, [autoSelectItemId, inventory, selectedItems.length, rewardItem, rolling]);

  const formatCurrency = (val: number) => {
    return preferences.currency === 'CR' 
      ? val.toLocaleString() + ' CR' 
      : '$' + val.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})
  };

  const getRarityHierarchy = () => {
    return [
      RARITIES.CONSUMER.name,
      RARITIES.MIL_SPEC.name,
      RARITIES.RESTRICTED.name,
      RARITIES.CLASSIFIED.name,
      RARITIES.COVERT.name,
      RARITIES.EXCEEDINGLY_RARE.name
    ];
  };

  const targetRarityName = selectedItems.length > 0 ? (() => {
    const hierarchy = getRarityHierarchy();
    const currentIndex = hierarchy.indexOf(selectedItems[0].rarity);
    if (currentIndex >= 0 && currentIndex < hierarchy.length - 1) {
      return hierarchy[currentIndex + 1];
    }
    return null;
  })() : null;

  const validItems = inventory.filter(item => {
    if (item.rarity === RARITIES.EXCEEDINGLY_RARE.name) return false; // Can't trade up max tier
    if (selectedItems.length === 0) return true;
    return item.rarity === selectedItems[0].rarity && !selectedItems.find(s => s.id === item.id);
  });

  const handleSelectItem = (item: Item) => {
    if (selectedItems.length >= 10) return;
    setSelectedItems([...selectedItems, item]);
  };

  const handleDeselectItem = (item: Item) => {
    setSelectedItems(selectedItems.filter(i => i.id !== item.id));
  };

  const handleSignContract = async () => {
    if (selectedItems.length !== 10 || rolling || !targetRarityName) return;
    setRolling(true);
    setRewardItem(null);

    try {
      const avgValue = selectedItems.reduce((acc, i) => acc + i.value, 0) / 10;
      // Bonus multiplier for trading up, making it roughly equal to or slightly more than the inputs depending on roll
      const targetValue = Math.max(0.03, Math.round(avgValue * 10 * (0.8 + Math.random() * 0.4) * 100) / 100); 

      const wikiData = await fetchRandomWikiArticle('Random');

      const newItem: Item = {
        id: crypto.randomUUID(),
        title: wikiData.title,
        image: wikiData.image,
        pageId: wikiData.pageId,
        rarity: targetRarityName,
        wear: 'Factory New', // Usually contracts give FN or very low flat wear
        durability: 1.0,
        value: targetValue,
        caseType: 'Trade-Up Contract',
        timestamp: Date.now()
      };

      const success = await tradeUpItems(selectedItems, newItem);
      
      if (success) {
        setRewardItem(newItem);
        setSelectedItems([]);
      } else {
        alert("Transaction failed");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to process contract.");
    } finally {
      setRolling(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 w-full h-full flex-1">
      {/* Left side: Inventory Selection */}
      <div className="flex-1 flex flex-col gap-4 border-r border-white/5 pr-0 md:pr-8">
        <h2 className="font-bold text-lg text-white flex items-center gap-2">
          <BackpackIcon className="w-5 h-5 text-accent" />
          Eligible Items
          {selectedItems.length > 0 && <span className="text-xs font-normal text-gray-500 ml-2">({selectedItems[0].rarity} only)</span>}
        </h2>
        
        <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
          {validItems.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 text-sm">
              {selectedItems.length === 0 ? "You need items (Consumer to Covert) to trade up." : "No more items of this rarity."}
            </div>
          )}
          {validItems.map((item) => (
            <button
              key={item.id}
              disabled={rolling || selectedItems.length >= 10}
              onClick={() => handleSelectItem(item)}
              className={`relative flex flex-col items-center p-2 rounded-lg border text-left transition-all bg-black/40 hover:bg-white/5 border-white/5 hover:border-white/10 ${
                (rolling || selectedItems.length >= 10) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div className="w-full aspect-square mb-1 overflow-hidden rounded bg-black/20 flex items-center justify-center">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover mix-blend-screen opacity-80" />
              </div>
              <div className="w-full">
                <div className="text-[9px] text-gray-500 truncate w-full uppercase">{item.rarity}</div>
                <div className="font-bold text-[10px] text-white truncate w-full">{item.title}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right side: Contract Mechanics */}
      <div className="flex-[1.5] flex flex-col items-center justify-center gap-6 py-4 md:py-0">
        
        <AnimatePresence mode="wait">
          {!rewardItem && !rolling && (
             <motion.div key="signing" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="w-full flex justify-center flex-col items-center">
                <FileSignature className="w-12 h-12 text-accent mb-4 opacity-50" />
                <h3 className="font-bold text-xl uppercase tracking-tighter text-white">Trade-Up Contract</h3>
                <p className="text-sm text-gray-400 mb-6">Trade 10 items of the same rarity for 1 item of the next rarity.</p>
                
                <div className="flex flex-wrap justify-center gap-2 max-w-sm mb-6">
                  {Array.from({ length: 10 }).map((_, i) => {
                    const item = selectedItems[i];
                    return (
                      <div 
                        key={i} 
                        onClick={() => item && handleDeselectItem(item)}
                        className={`w-14 h-14 rounded-lg border flex items-center justify-center transition-all ${
                          item ? 'border-accent bg-accent/10 cursor-pointer hover:border-red-500 hover:bg-red-500/20' : 'border-white/10 bg-black/40 border-dashed'
                        }`}
                        title={item ? "Click to remove" : "Empty Slot"}
                      >
                        {item ? (
                          <img src={item.image} alt="slot item" className="w-full h-full object-cover mix-blend-screen p-1 rounded" />
                        ) : (
                          <span className="text-gray-600 font-black opacity-30">{i + 1}</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="bg-black/30 w-full max-w-sm p-4 rounded-xl border border-white/5 mb-6 text-center">
                   <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Target Reward</div>
                   {targetRarityName ? (
                     <div className="text-lg font-black uppercase text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">{targetRarityName} Drop</div>
                   ) : (
                     <div className="text-sm text-gray-600">Select an item to see target</div>
                   )}
                </div>

                <button 
                  disabled={selectedItems.length !== 10 || rolling}
                  onClick={handleSignContract}
                  className={`w-full max-w-sm py-4 rounded-xl font-black uppercase tracking-widest text-lg transition-transform ${
                    selectedItems.length !== 10
                      ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                      : 'bg-accent text-white hover:scale-105 shadow-[0_0_20px_rgba(var(--color-accent),0.4)]'
                  }`}
                >
                  {selectedItems.length === 10 ? 'Sign Contract' : `${selectedItems.length}/10 Items Selected`}
                </button>
             </motion.div>
          )}

          {rolling && (
             <motion.div key="rolling" initial={{opacity:0}} animate={{opacity:1}} className="flex flex-col items-center w-full">
                <RefreshCcw className="w-16 h-16 text-accent animate-spin mb-4" />
                <div className="text-xl font-black uppercase tracking-widest text-white animate-pulse">Filing Paperwork...</div>
                <div className="mt-4 w-full max-w-xs h-2 bg-white/10 rounded-full overflow-hidden relative">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: "100%" }}
                     transition={{ duration: 2.5, ease: "easeInOut" }}
                     className="h-full bg-accent"
                   />
                </div>
             </motion.div>
           )}

           {rewardItem && !rolling && (
             <motion.div key="reward" initial={{opacity:0, scale:0.5}} animate={{opacity:1, scale:1}} className="flex flex-col items-center w-full text-center">
                <div className="relative w-48 h-48 mb-6">
                  <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-2xl"></div>
                  <img src={rewardItem.image} className="w-full h-full object-cover rounded-2xl mix-blend-screen drop-shadow-2xl z-10 relative saturate-150" />
                </div>
                <div className="flex items-center gap-2 text-emerald-400 mb-2">
                   <Sparkles className="w-5 h-5" />
                   <span className="font-black text-2xl uppercase tracking-wider">Contract Fulfilled</span>
                </div>
                <div className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest mb-3">
                  {rewardItem.rarity}
                </div>
                <h3 className="font-bold text-xl text-white max-w-sm">{rewardItem.title}</h3>
                <div className="text-emerald-400 font-mono font-bold text-2xl mt-2">{formatCurrency(rewardItem.value)}</div>

                <button 
                  onClick={() => setRewardItem(null)}
                  className="mt-8 w-full max-w-sm py-4 rounded-xl font-black uppercase tracking-widest text-lg bg-white/10 text-white hover:bg-white/20 transition-all hover:scale-105"
                >
                  Sign Another
                </button>
             </motion.div>
           )}
        </AnimatePresence>

      </div>
    </div>
  );
}

function Upgrader({ autoSelectItemId }: { autoSelectItemId?: string }) {
  const { inventory, profile, preferences, upgradeItem } = useGameStore();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [multiplier, setMultiplier] = useState<number>(2);
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<'win' | 'loss' | null>(null);
  const [rewardItem, setRewardItem] = useState<Item | null>(null);

  useEffect(() => {
    if (autoSelectItemId && inventory.length > 0 && !selectedItem && !result && !rolling) {
      const itemToSelect = inventory.find(i => i.id === autoSelectItemId);
      if (itemToSelect) setSelectedItem(itemToSelect);
    }
  }, [autoSelectItemId, inventory, selectedItem, result, rolling]);

  const formatCurrency = (val: number) => {
    return preferences.currency === 'CR' 
      ? val.toLocaleString() + ' CR' 
      : '$' + val.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})
  };

  const winProbability = Math.max(0, Math.min(100, (1 / multiplier) * 0.90 * 100));
  const targetValue = selectedItem ? Math.max(0.03, Math.round(selectedItem.value * multiplier * 100) / 100) : 0;

  const handleUpgrade = async () => {
    if (!selectedItem || rolling) return;
    setRolling(true);
    setResult(null);
    setRewardItem(null);

    try {
      // 1. Generate target item content first so we have it if they win
      const wikiData = await fetchRandomWikiArticle('Random');
      
      let rarity = 'Consumer Grade';
      if (targetValue > 10000) rarity = 'Exceedingly Rare';
      else if (targetValue > 2000) rarity = 'Covert';
      else if (targetValue > 500) rarity = 'Classified';
      else if (targetValue > 100) rarity = 'Restricted';
      else if (targetValue > 20) rarity = 'Mil-Spec';

      const newItem: Item = {
        id: crypto.randomUUID(),
        title: wikiData.title,
        image: wikiData.image,
        pageId: wikiData.pageId,
        rarity,
        wear: 'Factory New',
        durability: 1.0,
        value: targetValue,
        caseType: 'Upgrader',
        timestamp: Date.now()
      };

      // 2. Roll
      const isWin = await upgradeItem(selectedItem, multiplier, newItem);
      
      setResult(isWin ? 'win' : 'loss');
      if (isWin) setRewardItem(newItem);
      setSelectedItem(null);

    } catch (err) {
      console.error(err);
      alert("Failed to process upgrade.");
    } finally {
      setRolling(false);
    }
  };

  const multipliers = [1.5, 2, 3, 5, 10];

  return (
    <div className="flex flex-col md:flex-row gap-8 w-full h-full flex-1">
      {/* Left side: Inventory Selection */}
      <div className="flex-1 flex flex-col gap-4 border-r border-white/5 pr-0 md:pr-8">
        <h2 className="font-bold text-lg text-white flex items-center gap-2">
          <BackpackIcon className="w-5 h-5 text-accent" />
          Select Item to Upgrade
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
          {inventory.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 text-sm">
              Your inventory is empty.
            </div>
          )}
          {inventory.map((item) => (
            <button
              key={item.id}
              disabled={rolling}
              onClick={() => setSelectedItem(item)}
              className={`relative flex flex-col items-center p-3 rounded-xl border text-left transition-all ${
                selectedItem?.id === item.id 
                  ? 'border-accent bg-accent/10 shadow-[0_0_15px_rgba(var(--color-accent),0.3)]' 
                  : 'border-white/5 bg-black/40 hover:bg-white/5 hover:border-white/10'
              } ${rolling ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="w-full aspect-square mb-2 overflow-hidden rounded bg-black/20 flex items-center justify-center">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover mix-blend-screen opacity-80" />
              </div>
              <div className="w-full">
                <div className="text-[10px] text-gray-500 truncate w-full uppercase">{item.rarity}</div>
                <div className="font-bold text-xs text-white truncate w-full mb-1">{item.title}</div>
                <div className="text-emerald-400 font-mono text-xs font-bold">{formatCurrency(item.value)}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right side: Upgrader mechanics */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 py-8 md:py-0">
        
        {/* State Display */}
        <div className="relative w-full max-w-sm aspect-square flex items-center justify-center">
             <AnimatePresence mode="wait">
               {!selectedItem && result === null && (
                 <motion.div key="empty" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex flex-col items-center text-gray-500 gap-3">
                   <ShieldAlert className="w-12 h-12 opacity-50" />
                   <p className="text-sm">Select an item from your inventory</p>
                 </motion.div>
               )}

               {selectedItem && !rolling && result === null && (
                 <motion.div key="ready" initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} exit={{opacity:0}} className="flex flex-col items-center w-full">
                    <div className="relative w-40 h-40 mb-6">
                      <div className="absolute inset-0 bg-accent/20 rounded-full blur-xl animate-pulse"></div>
                      <img src={selectedItem.image} className="w-full h-full object-cover rounded-2xl mix-blend-screen drop-shadow-2xl z-10 relative" />
                    </div>
                    <h3 className="font-bold text-xl text-white text-center px-4 line-clamp-1">{selectedItem.title}</h3>
                    <div className="text-emerald-400 font-mono font-bold text-lg mt-1">{formatCurrency(selectedItem.value)}</div>
                    <ArrowUpRight className="w-6 h-6 text-gray-500 my-4" />
                    <div className="text-accent font-mono font-black text-2xl drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{formatCurrency(targetValue)}</div>
                 </motion.div>
               )}

               {rolling && (
                 <motion.div key="rolling" initial={{opacity:0}} animate={{opacity:1}} className="flex flex-col items-center w-full">
                    <RefreshCcw className="w-16 h-16 text-accent animate-spin mb-4" />
                    <div className="text-xl font-black uppercase tracking-widest text-white animate-pulse">Upgrading...</div>
                    <div className="mt-4 w-full h-2 bg-white/10 rounded-full overflow-hidden relative">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: "100%" }}
                         transition={{ duration: 2, ease: "easeInOut" }}
                         className="h-full bg-accent"
                       />
                    </div>
                 </motion.div>
               )}

               {result !== null && !rolling && (
                 <motion.div key="result" initial={{opacity:0, scale:0.5}} animate={{opacity:1, scale:1}} className="flex flex-col items-center w-full text-center">
                    {result === 'win' && rewardItem ? (
                      <>
                        <div className="relative w-40 h-40 mb-6">
                          <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-2xl"></div>
                          <img src={rewardItem.image} className="w-full h-full object-cover rounded-2xl mix-blend-screen drop-shadow-2xl z-10 relative saturate-150" />
                        </div>
                        <div className="flex items-center gap-2 text-emerald-400 mb-2">
                           <Sparkles className="w-5 h-5" />
                           <span className="font-black text-2xl uppercase tracking-wider">Success!</span>
                        </div>
                        <h3 className="font-bold text-lg text-white">{rewardItem.title}</h3>
                        <div className="text-emerald-400 font-mono font-bold text-xl mt-1">{formatCurrency(rewardItem.value)}</div>
                      </>
                    ) : (
                      <>
                        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                           <ShieldAlert className="w-12 h-12 text-red-500" />
                        </div>
                        <div className="text-red-500 font-black text-3xl uppercase tracking-wider mb-2">Failed</div>
                        <p className="text-gray-400">The upgrade failed and your item was destroyed.</p>
                      </>
                    )}
                 </motion.div>
               )}
             </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="w-full max-w-sm flex flex-col gap-4">
          <div className="bg-black/30 p-4 rounded-xl border border-white/5">
            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-3">Target Multiplier</div>
            <div className="flex gap-2 justify-between">
              {multipliers.map(m => (
                <button
                  key={m}
                  disabled={rolling || result !== null}
                  onClick={() => setMultiplier(m)}
                  className={`flex-1 py-2 rounded font-mono font-bold text-sm transition-colors ${
                    multiplier === m 
                      ? 'bg-accent text-white' 
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  } ${rolling || result !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {m}x
                </button>
              ))}
            </div>
            
            <div className="flex justify-between items-center mt-5 p-3 bg-black/40 rounded-lg">
               <span className="text-sm text-gray-400">Win Chance</span>
               <span className="font-mono font-bold text-lg text-emerald-400">{winProbability.toFixed(2)}%</span>
            </div>
          </div>

          {!result ? (
            <button 
              disabled={!selectedItem || rolling}
              onClick={handleUpgrade}
              className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-lg transition-transform ${
                !selectedItem || rolling
                  ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                  : 'bg-accent text-white hover:scale-105 shadow-[0_0_20px_rgba(var(--color-accent),0.4)]'
              }`}
            >
              {rolling ? 'Processing...' : 'Upgrade Item'}
            </button>
          ) : (
            <button 
              onClick={() => {
                setResult(null);
                setRewardItem(null);
              }}
              className="w-full py-4 rounded-xl font-black uppercase tracking-widest text-lg bg-white/10 text-white hover:bg-white/20 transition-all hover:scale-105"
            >
              Play Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function BackpackIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 10v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10" />
      <path d="M8 10V6a4 4 0 0 1 8 0v4" />
      <path d="M12 10v4" />
      <path d="M8 22V10" />
      <path d="M16 22V10" />
    </svg>
  )
}
