import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { Item } from '../types';
import { CASES, drawRarity, generateDurability, getWearInfo, calculateValue, fetchRandomWikiArticle, CaseType, RARITIES, determineShinyType, SECRET_BILLION_CASE } from '../lib/gameLogic';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, Loader2, Search, Filter, Info, X, ChevronLeft, Gem, Crosshair, Package, Gamepad2, Sparkles, Key } from 'lucide-react';

import { playSound } from '../lib/sounds';
import { CaseRoulette } from '../components/CaseRoulette';
import { ShinyEffect } from '../components/ShinyEffect';
import { ShinyImpact } from '../components/ShinyImpact';

export function Play() {
  const navigate = useNavigate();
  const { profile, openCase, preferences, sellItem, recordAdWatch, devForcedRarity, devForcedShiny, showSecretCase } = useGameStore();
  const [selectedMode, setSelectedMode] = useState<'original' | 'csgo' | 'premium' | null>(null);
  
  const [opening, setOpening] = useState(false);
  const [activeCaseData, setActiveCaseData] = useState<CaseType | null>(null);
  const [spinReward, setSpinReward] = useState<Item | null>(null);
  const [reward, setReward] = useState<Item | null>(null);
  const [oddsModal, setOddsModal] = useState<CaseType | null>(null);
  
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('default');
  const [adModal, setAdModal] = useState<CaseType | null>(null);
  const [adPlaying, setAdPlaying] = useState(false);
  const [adTimeLeft, setAdTimeLeft] = useState<number>(0);
  const [adCooldownRemaining, setAdCooldownRemaining] = useState<number>(0);
  const [selectedFocuses, setSelectedFocuses] = useState<Record<string, string>>({});

  // Dev Item Reveal States
  const [showDevReveal, setShowDevReveal] = useState(false);
  const [devRevealStep, setDevRevealStep] = useState<'white' | 'popup' | 'flip' | 'result'>('white');
  const [isFlipping, setIsFlipping] = useState(false);
  
  // Shiny Impact States
  const [activeShinyImpact, setActiveShinyImpact] = useState<string | null>(null);
  const [screenShake, setScreenShake] = useState(false);

  const handleFocusChange = (caseId: string, focusQuery: string) => {
    setSelectedFocuses(prev => ({ ...prev, [caseId]: focusQuery }));
  };

  useEffect(() => {
    setSortOrder('default');
    setSearch('');
  }, [selectedMode]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (profile && profile.lastAdWatchedAt) {
        const remaining = 3 * 60 * 60 * 1000 - (Date.now() - profile.lastAdWatchedAt);
        if (remaining > 0) {
          setAdCooldownRemaining(remaining);
        } else {
          setAdCooldownRemaining(0);
        }
      } else {
        setAdCooldownRemaining(0);
      }
    }, 1000);
    // Initial check
    if (profile && profile.lastAdWatchedAt) {
      const remaining = 3 * 60 * 60 * 1000 - (Date.now() - profile.lastAdWatchedAt);
      if (remaining > 0) setAdCooldownRemaining(remaining);
    }
    return () => clearInterval(interval);
  }, [profile]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const handleWatchAd = (caseData: CaseType) => {
    setAdModal(caseData);

    if (profile?.adsRemoved) {
      setAdPlaying(false);
      setAdTimeLeft(0);
      return;
    }

    setAdPlaying(true);
    setAdTimeLeft(30);
    
    // Simulate a 30 second ad countdown
    const timer = setInterval(() => {
      setAdTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setAdPlaying(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleClaimAdReward = async () => {
    if (adModal) {
      try {
        await recordAdWatch();
        // Free open without cost
        handleOpen(adModal.id, true);
        setAdModal(null);
      } catch (error) {
        console.error("Failed to claim ad reward:", error);
        alert("Failed to claim reward. Please try again.");
        setAdModal(null);
      }
    }
  };

  const categoryFilteredCases = useMemo(() => {
    let base = [];
    if (selectedMode === 'csgo') {
      base = CASES.filter(c => c.category === 'CS:GO');
    } else if (selectedMode === 'premium') {
      base = CASES.filter(c => c.isPremium);
    } else {
      // Original mode: exclude CSGO, Premium, and Secret (unless unlocked)
      base = CASES.filter(c => {
        if (c.category === 'CS:GO' || c.isPremium) return false;
        if (c.category === 'Secret') return showSecretCase;
        return true;
      });
    }

    return base;
  }, [selectedMode, showSecretCase]);

  const filteredCases = useMemo(() => {
    let result = [...categoryFilteredCases];
    
    // Apple Search Filter
    if (search) {
      result = result.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Apply Sort Order
    const getActiveCost = (c: CaseType) => {
        let base = c.cost;
        if (c.focuses && selectedFocuses[c.id] && selectedFocuses[c.id] !== 'no-focus') {
           base = base === 0 ? 250 : Math.floor(base * 1.5);
        }
        return base;
    };
    const getPrice = (c: CaseType) => c.isPremium ? (c.realMoneyPrice || 0) : getActiveCost(c);

    if (sortOrder === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === 'name-desc') {
      result.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortOrder === 'price-desc') {
      result.sort((a, b) => getPrice(b) - getPrice(a));
    } else if (sortOrder === 'price-asc') {
      result.sort((a, b) => getPrice(a) - getPrice(b));
    } else if (sortOrder === 'category-asc') {
      result.sort((a, b) => a.category.localeCompare(b.category));
    } else if (sortOrder === 'category-desc') {
      result.sort((a, b) => b.category.localeCompare(a.category));
    }

    return result;
  }, [search, sortOrder, categoryFilteredCases]);

  const handleOpenComplete = async (caseId: string, item: Item, costOverride?: number) => {
    try {
      const result = await openCase(caseId, item, costOverride);
      
      setSpinReward(null);
      setOpening(false);
      setActiveCaseData(null);

      if (result?.wonJackpot) {
         playSound('legendary');
         setTimeout(() => {
           alert(`🎰 UNBELIEVABLE! You just hit the Progressive Jackpot for ${result.winAmount.toLocaleString()} credits!`);
         }, 1000);
      }

      if (item.shinyType === 'Dev') {
        setShowDevReveal(true);
        setDevRevealStep('white');
        setReward(item); 
        playSound('legendary');
        
        setTimeout(() => {
          setDevRevealStep('popup');
        }, 1500);
      } else {
        setReward(item);
        
        // Shiny Impact
        if (item.shinyType && item.shinyType !== 'None') {
          setActiveShinyImpact(item.shinyType);
          setScreenShake(true);
          setTimeout(() => setScreenShake(false), 500);
        }

        // awesome sounds
        if (item.rarity === RARITIES.EXCEEDINGLY_RARE.name) {
            playSound('legendary');
        } else if (item.rarity === RARITIES.COVERT.name || item.rarity === RARITIES.CLASSIFIED.name) {
            playSound('epic');
        } else {
            playSound('success');
        }
      }
    } catch (error) {
      console.error("Failed to open case:", error);
      alert("Failed to claim item. Please try again.");
      setOpening(false);
      setSpinReward(null);
      setActiveCaseData(null);
    }
  };

  const getActiveCostForCase = (c: CaseType) => {
      let base = c.cost;
      if (c.focuses && selectedFocuses[c.id] && selectedFocuses[c.id] !== 'no-focus') {
         base = base === 0 ? 250 : Math.floor(base * 1.5);
      }
      return base;
  };

  const handleOpen = async (caseId: string, free: boolean = false) => {
    if (!profile || opening) return;
    const caseData = CASES.find(c => c.id === caseId);
    if (!caseData) return;
    
    const activeCost = getActiveCostForCase(caseData);
    if (!free && !caseData.isPremium && profile.credits < activeCost) return;

    setOpening(true);
    setActiveCaseData(caseData);
    setReward(null);
    playSound('open');

    try {
      let rarity = drawRarity(caseId, profile.pityCounter || 0);
      if (devForcedRarity) {
        const forced = Object.values(RARITIES).find(r => r.id === devForcedRarity);
        if (forced) rarity = forced;
      }

      const shinyType = determineShinyType(devForcedShiny || undefined);
      const durability = generateDurability();
      const wearInfo = getWearInfo(durability);
      const value = calculateValue(rarity.id, wearInfo.multiplier, caseData, shinyType);
      
      let title = "Unknown Item";
      let image = "https://steamcommunity-a.akamaihd.net/economy/image/class/730/error";
      let pageId = 0;

      if (caseData.category === 'CS:GO' && caseData.csgoDrops) {
         // Get the list of items for the specific rarity
         let dropKey = rarity.id.toUpperCase().replace('-', '_');
         if (dropKey === 'GOLD') dropKey = 'EXCEEDINGLY_RARE';
         let options = caseData.csgoDrops[dropKey];
         
         // Fallback if that exact rarity is missing from csgoDrops but got rolled
         if (!options || options.length === 0) {
             options = Object.values(caseData.csgoDrops).flat();
         }
         
         if (options && options.length > 0) {
            const randomDrop = options[Math.floor(Math.random() * options.length)];
            title = randomDrop.name;
            image = randomDrop.image;
         }
      } else {
         let focusQuery = caseData.category === 'Random' ? '' : caseData.category;
         if (caseData.focuses && caseData.focuses.length > 0) {
           const selected = selectedFocuses[caseId] ?? 'no-focus';
           if (selected !== 'no-focus') {
             focusQuery = selected;
           }
         }
         
         const wikiData = await fetchRandomWikiArticle(focusQuery);
         title = wikiData.title;
         image = wikiData.image;
         pageId = wikiData.pageId;
      }

      const newItem: Item = {
        id: crypto.randomUUID(),
        title,
        image,
        pageId,
        rarity: rarity.name,
        wear: wearInfo.label,
        durability,
        value,
        caseType: caseData.name,
        shinyType: shinyType as any,
        timestamp: Date.now()
      };

      if (!preferences.fastOpen) {
        setSpinReward(newItem);
        // handoff to roulette
      } else {
        await handleOpenComplete(caseId, newItem, activeCost);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to open case.");
      setOpening(false);
      setActiveCaseData(null);
    }
  };

  const handleStartFlip = () => {
    setDevRevealStep('flip');
    setIsFlipping(true);
    
    setTimeout(() => {
      setIsFlipping(false);
      setDevRevealStep('result');
      if (reward && reward.value > 1) {
        playSound('success');
      } else {
        playSound('womp');
      }
    }, 3000);
  };

  const rarityColorMap: Record<string, string> = {
    'Consumer Grade': 'text-gray-400 bg-gray-400/5',
    'Mil-Spec': 'text-blue-500 bg-blue-500/5',
    'Restricted': 'text-purple-500 bg-purple-500/5',
    'Classified': 'text-pink-500 bg-pink-500/5',
    'Covert': 'text-red-500 bg-red-500/5 text-shadow-sm',
    'Exceedingly Rare': 'text-yellow-400 bg-yellow-400/5 text-shadow-[0_0_10px_rgba(250,204,21,0.5)]',
  };

  const getModalVariants = (rarity: string, isShiny: boolean) => {
    const base = (() => {
      switch (rarity) {
        case 'Exceedingly Rare':
          return {
            initial: { scale: 0.1, opacity: 0, rotate: -45, y: -500 },
            animate: { 
              scale: 1, 
              opacity: 1, 
              rotate: 0, 
              y: 0,
              transition: { type: "spring", damping: 10, stiffness: 200, mass: 1.5 } 
            }
          };
        case 'Covert':
          return {
            initial: { scale: 0.05, opacity: 0 },
            animate: { 
              scale: 1, 
              opacity: 1, 
              transition: { type: "spring", damping: 12, stiffness: 250 } 
            }
          };
        case 'Classified':
          return {
            initial: { scale: 0.5, opacity: 0, y: 300 },
            animate: { 
              scale: 1, 
              opacity: 1, 
              y: 0, 
              transition: { type: "spring", damping: 14, stiffness: 180 } 
            }
          };
        case 'Restricted':
          return {
            initial: { x: -300, opacity: 0, skewX: -30 },
            animate: { 
              x: 0, 
              opacity: 1, 
              skewX: 0, 
              transition: { type: "spring", damping: 15, stiffness: 150 } 
            }
          };
        case 'Mil-Spec':
          return {
            initial: { scale: 0.2, opacity: 0 },
            animate: { 
              scale: 1, 
              opacity: 1, 
              transition: { type: "spring", damping: 18, stiffness: 220 } 
            }
          };
        default:
          return {
            initial: { scale: 0.8, opacity: 0, y: 40 },
            animate: { 
              scale: 1, 
              opacity: 1, 
              y: 0, 
              transition: { type: "spring", damping: 20, stiffness: 120 } 
            }
          };
      }
    })();

    if (isShiny) {
      return {
        initial: { ...base.initial, scale: 0, filter: 'blur(30px)' },
        animate: { 
          ...base.animate, 
          scale: 1.1, 
          filter: 'blur(0px)',
          transition: { 
            ...base.animate.transition, 
            delay: 0.3,
            // @ts-ignore
            duration: base.animate.transition.duration ? base.animate.transition.duration * 1.5 : 0.8
          } 
        }
      };
    }
    return base;
  };

  if (!selectedMode) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full max-w-5xl mx-auto py-12 px-4 space-y-12 shrink-0 my-auto">
        <div className="text-center space-y-4">
          <h2 className="text-4xl sm:text-5xl font-black uppercase text-white tracking-tighter">Choose Your Drop Path</h2>
          <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto">Select a category of cases to explore and unlock hidden Wikipedia knowledge. Rarer cases contain highly coveted internet artifacts.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8 w-full">
          <button 
            onClick={() => setSelectedMode('original')}
            className="group flex flex-col bg-black/40 border border-white/10 hover:border-emerald-500/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-[0_0_40px_rgba(16,185,129,0.2)] transition-all transform hover:-translate-y-2 text-left"
          >
            <div className="h-40 bg-gradient-to-br from-emerald-900/40 to-black flex flex-col justify-center items-center relative overflow-hidden">
               <Package className="w-16 h-16 text-emerald-400 z-10 group-hover:scale-110 transition-transform duration-500" />
               <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.2)_0%,transparent_70%)]" />
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2 group-hover:text-emerald-400 transition-colors">Original Cases</h3>
              <p className="text-gray-400 text-sm">Classic wiki-article drops modeled after generic physical loot boxes. A great place to start your journey.</p>
            </div>
          </button>

          <button 
            onClick={() => setSelectedMode('csgo')}
            className="group flex flex-col bg-black/40 border border-white/10 hover:border-blue-500/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-[0_0_40px_rgba(59,130,246,0.2)] transition-all transform hover:-translate-y-2 text-left"
          >
            <div className="h-40 bg-gradient-to-br from-blue-900/40 to-black flex flex-col justify-center items-center relative overflow-hidden">
               <Crosshair className="w-16 h-16 text-blue-400 z-10 group-hover:scale-110 transition-transform duration-500" />
               <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.2)_0%,transparent_70%)]" />
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2 group-hover:text-blue-400 transition-colors">CS:GO Cases</h3>
              <p className="text-gray-400 text-sm">Cases engineered closely to legendary eSports crates. Contains high-volatility rarity distributions.</p>
            </div>
          </button>

          <button 
            onClick={() => setSelectedMode('premium')}
            className="group flex flex-col bg-black/40 border border-white/10 hover:border-purple-500/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-[0_0_40px_rgba(168,85,247,0.2)] transition-all transform hover:-translate-y-2 text-left"
          >
            <div className="h-40 bg-gradient-to-br from-purple-900/40 to-black flex flex-col justify-center items-center relative overflow-hidden">
               <Gem className="w-16 h-16 text-purple-400 z-10 group-hover:scale-110 transition-transform duration-500" />
               <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.2)_0%,transparent_70%)]" />
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2 group-hover:text-purple-400 transition-colors">Premium Caches</h3>
              <p className="text-gray-400 text-sm">Exclusive, high-roller crates containing the rarest and most legendary internet pages. Requires Ads or Purchases.</p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      animate={screenShake ? { 
        x: activeShinyImpact === 'Dark Matter' || activeShinyImpact === 'Celestial' || activeShinyImpact === 'Dev'
          ? [0, -40, 40, -40, 40, -20, 20, 0] 
          : activeShinyImpact === 'Prismatic' || activeShinyImpact === 'Rainbow'
          ? [0, -25, 25, -25, 25, 0]
          : [0, -15, 15, -15, 15, 0],
        y: activeShinyImpact === 'Dark Matter' || activeShinyImpact === 'Celestial' || activeShinyImpact === 'Dev'
          ? [0, 20, -20, 20, -20, 10, -10, 0]
          : [0, 10, -10, 10, -10, 0]
      } : {}}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12 overflow-y-auto"
    >
      <div className="flex items-center gap-4 mt-2">
        <button 
          onClick={() => setSelectedMode(null)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg text-sm font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Categories
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mt-2">
        <div className="space-y-1 w-full md:w-auto text-center md:text-left">
          <h2 className="text-3xl font-black tracking-tighter uppercase text-white">
            {selectedMode === 'csgo' ? 'CS:GO Cases' : selectedMode === 'premium' ? 'Premium Caches' : 'Original Cases'}
          </h2>
          <p className="text-gray-400 text-sm">
            Spend your credits to open thematic cases.
          </p>
          {(profile?.pityCounter || 0) > 50 && (
             <div className="inline-flex items-center gap-1.5 mt-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-[0_0_10px_rgba(234,179,8,0.1)]">
               <Sparkles className="w-3 h-3" />
               Luck Protection Active (+{(((profile?.pityCounter || 0) - 50) * 0.5).toFixed(1)}% High Tier Rate)
             </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto flex-1 md:max-w-2xl justify-end">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search cases..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <div className="relative shrink-0">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <select 
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full sm:w-auto appearance-none bg-black/20 border border-white/10 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white focus:outline-none focus:border-accent transition-colors cursor-pointer"
            >
              <option value="default" className="bg-gray-900">Sort: Default</option>
              <option value="name-asc" className="bg-gray-900">Name (A-Z)</option>
              <option value="name-desc" className="bg-gray-900">Name (Z-A)</option>
              <option value="price-desc" className="bg-gray-900">Price (High-Low)</option>
              <option value="price-asc" className="bg-gray-900">Price (Low-High)</option>
              <option value="category-asc" className="bg-gray-900">Category (A-Z)</option>
              <option value="category-desc" className="bg-gray-900">Category (Z-A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Case Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredCases.map((c) => {
          const activeCost = getActiveCostForCase(c);
          const afford = profile ? profile.credits >= activeCost : false;
          return (
            <div key={c.id} className="glass overflow-hidden flex flex-col transition-transform hover:scale-[1.02] cursor-default shadow-lg group">
              <div className="h-40 relative w-full overflow-hidden flex items-center justify-center p-4 border-b border-white/5 bg-black/20">
                <img 
                  src={c.image} 
                  alt={c.name} 
                  loading="lazy" 
                  decoding="async" 
                  onError={(e) => {
                    e.currentTarget.src = `https://picsum.photos/seed/${c.id}/300/300`;
                    e.currentTarget.className = "object-cover h-full w-full opacity-30 mix-blend-screen grayscale";
                  }}
                  className="object-cover h-full w-full opacity-60 group-hover:opacity-100 transition-opacity drop-shadow-xl saturate-50 group-hover:saturate-100 mix-blend-screen" 
                  referrerPolicy="no-referrer" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c]/80 to-transparent mix-blend-overlay"></div>
                <div className="absolute top-2 left-2">
                  <span className="bg-black/50 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded text-[9px] text-white font-bold uppercase tracking-wider">{c.category}</span>
                </div>
                <div className="absolute top-2 right-2 z-10">
                  <button 
                    onClick={() => setOddsModal(c)}
                    className="bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/10 p-1.5 rounded transition-colors text-gray-300 hover:text-white"
                    title="View Odds"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-4 flex flex-col flex-1 gap-3 bg-white/5">
                <div className="flex flex-col">
                  <h3 className="font-bold text-white text-sm truncate" title={c.name}>{c.name}</h3>
                  <p className="text-[10px] text-gray-400 line-clamp-2 mt-1 leading-snug h-7" title={c.description}>{c.description}</p>
                </div>
                
                <div className="flex justify-between items-center bg-black/30 rounded px-2 py-1.5 border border-white/5">
                   <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold text-sm">
                    {c.isPremium ? (
                      <span className="text-yellow-400">Premium Case</span>
                    ) : (
                      preferences.currency === 'CR' ? (
                        <span>{getActiveCostForCase(c) === 0 ? 'FREE' : getActiveCostForCase(c).toLocaleString() + ' CR'}</span>
                      ) : (
                        <span>${getActiveCostForCase(c) === 0 ? '0.00' : getActiveCostForCase(c).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      )
                    )}
                  </div>
                </div>

                {/* Focus Selector */}
                {c.focuses && (
                  <div className="w-full mt-1">
                    <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1 block">Selected Focus</label>
                    <select 
                      className="w-full bg-black/60 border border-white/10 rounded overflow-hidden p-1.5 text-xs text-gray-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 appearance-none cursor-pointer"
                      style={{ backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: `right .2rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.2em 1.2em`, paddingRight: `1.5rem` }}
                      value={selectedFocuses[c.id] ?? 'no-focus'}
                      onChange={(e) => handleFocusChange(c.id, e.target.value)}
                    >
                      <option value="no-focus" className="bg-gray-900 text-gray-400 italic">No Focus ({c.category} Pool)</option>
                      {c.focuses.map(f => (
                        <option key={f.id} value={f.searchQuery} className="bg-gray-900">{f.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {c.isPremium ? (
                  <div className="flex flex-col gap-2">
                    <button
                      disabled={opening || (adCooldownRemaining > 0 && !profile?.adsRemoved)}
                      onClick={() => handleWatchAd(c)}
                      className={`w-full py-2.5 rounded-lg flex-1 font-bold uppercase tracking-widest text-[10px] transition-all flex flex-col justify-center items-center shadow ${(adCooldownRemaining > 0 && !profile?.adsRemoved) ? 'bg-black/20 text-gray-500 cursor-not-allowed border border-white/5' : 'bg-purple-600 hover:bg-purple-500 text-white'}`}
                      title={(adCooldownRemaining > 0 && !profile?.adsRemoved) ? "Next ad available in " + formatTime(adCooldownRemaining) : (profile?.adsRemoved ? "Open Instantly (Ads Removed)" : "Watch Ad")}
                    >
                      {(adCooldownRemaining > 0 && !profile?.adsRemoved) ? (
                         <>
                           <span className="text-[9px]">Cooldown</span>
                           <span>{formatTime(adCooldownRemaining)}</span>
                         </>
                      ) : (
                        <span>{profile?.adsRemoved ? 'Free Open' : 'Watch Ad'}</span>
                      )}
                    </button>
                    <button
                      disabled={opening}
                      onClick={() => handleOpen(c.id, true)}
                      className={`w-full py-2.5 rounded-lg flex-1 font-bold uppercase tracking-widest text-[10px] transition-all flex justify-center items-center shadow bg-emerald-600 hover:bg-emerald-500 text-white`}
                    >
                      Buy ${c.realMoneyPrice}
                    </button>
                  </div>
                ) : (
                  <button
                    disabled={opening || !afford}
                    onClick={() => handleOpen(c.id)}
                    className={`w-full py-2.5 rounded-lg font-bold uppercase tracking-widest text-[11px] transition-all flex justify-center items-center shadow ${
                      !afford 
                        ? 'bg-black/20 text-gray-500 cursor-not-allowed border border-white/5' 
                        : opening
                          ? 'bg-accent/50 text-white/50 cursor-wait'
                          : 'bg-accent hover:brightness-110 text-white shadow-accent/20'
                    }`}
                  >
                    {opening ? "..." : afford ? 'Open' : 'Locked'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Probability Odds Modal */}
      <AnimatePresence>
        {oddsModal && !opening && !reward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              className="glass max-w-sm w-full shadow-2xl flex flex-col p-6 gap-6 relative"
            >
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <h3 className="text-xl font-bold text-white">{oddsModal.name} Odds</h3>
                <button 
                  onClick={() => setOddsModal(null)} 
                  className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                {(() => {
                  let adjustedOdds = [...oddsModal.odds.map(o => ({...o}))];
                  const pity = profile?.pityCounter || 0;
                  if (pity > 50) {
                      const pityBonus = (pity - 50) * 0.005; 
                      const classifiedIdx = adjustedOdds.findIndex(o => o.rarity.name === RARITIES.CLASSIFIED.name);
                      const covertIdx = adjustedOdds.findIndex(o => o.rarity.name === RARITIES.COVERT.name);
                      const exceedinglyRareIdx = adjustedOdds.findIndex(o => o.rarity.name === RARITIES.EXCEEDINGLY_RARE.name);
                      
                      if (classifiedIdx !== -1) adjustedOdds[classifiedIdx].chance += pityBonus * 0.6;
                      if (covertIdx !== -1) adjustedOdds[covertIdx].chance += pityBonus * 0.3;
                      if (exceedinglyRareIdx !== -1) adjustedOdds[exceedinglyRareIdx].chance += pityBonus * 0.1;
                      
                      const totalChance = adjustedOdds.reduce((sum, o) => sum + o.chance, 0);
                      adjustedOdds.forEach(o => o.chance /= totalChance);
                  }
                  
                  return adjustedOdds.map((odd, idx) => {
                    const originalOdd = oddsModal.odds[idx];
                    const boosted = odd.chance > originalOdd.chance;
                    return (
                      <div key={idx} className={`flex justify-between items-center p-3 rounded-lg border ${boosted ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-black/20 border-white/5'}`}>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-sm ${odd.rarity.color}`}>{odd.rarity.name}</span>
                          {boosted && <Sparkles className="w-3 h-3 text-yellow-500" />}
                        </div>
                        <span className={`font-mono text-sm ${boosted ? 'text-yellow-400 font-bold' : 'text-white'}`}>{(odd.chance * 100).toFixed(2)}%</span>
                      </div>
                    );
                  });
                })()}
              </div>
              <button 
                onClick={() => setOddsModal(null)} 
                className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold transition-colors uppercase text-sm tracking-widest"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Roulette Animation */}
      {spinReward && activeCaseData && (
        <CaseRoulette 
          targetItem={spinReward} 
          activeCase={activeCaseData} 
          onFinish={() => handleOpenComplete(activeCaseData.id, spinReward, getActiveCostForCase(activeCaseData))} 
        />
      )}

      {/* Reveal Modal */}
      <AnimatePresence>
        {reward && !showDevReveal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[100] flex flex-col items-center p-4 backdrop-blur-xl overflow-y-auto ${
              reward.rarity === 'Exceedingly Rare' ? 'bg-yellow-500/20' : 
              reward.rarity === 'Covert' ? 'bg-red-900/40' : 
              'bg-black/80'
            }`}
          >
            {/* spacer to help center the modal if less than full height */}
            <div className="flex-grow shrink-0 h-4 min-h-[4vh]"></div>

            {/* Huge screen flash bang for high rarity items */}
            {(reward.rarity === 'Exceedingly Rare' || reward.rarity === 'Covert' || reward.rarity === 'Classified' || reward.rarity === 'Restricted') && (
              <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="fixed inset-0 z-50 bg-white pointer-events-none mix-blend-overlay"
              />
            )}

            {/* Crazy glow effect for high tier items */}
            {reward.rarity === 'Exceedingly Rare' && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0, rotate: 0 }}
                 animate={{ opacity: [0, 1, 0.8], scale: [0, 2, 1.5], rotate: [0, 90, 180] }}
                 transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                 className="fixed inset-0 z-[-1] pointer-events-none flex items-center justify-center"
               >
                 <div className="w-[200vw] h-[20vw] bg-yellow-400/20 blur-[60px] transform rotate-45"></div>
                 <div className="w-[200vw] h-[20vw] bg-yellow-500/20 blur-[60px] transform -rotate-45 absolute"></div>
               </motion.div>
            )}
            {reward.rarity === 'Covert' && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0 }}
                 animate={{ opacity: [0, 0.8, 0.5], scale: [0, 1.5, 1.2] }}
                 transition={{ duration: 3, repeat: Infinity, repeatType: "mirror" }}
                 className="fixed inset-0 z-[-1] pointer-events-none flex items-center justify-center -translate-y-20"
               >
                 <div className="w-[100vw] h-[100vw] rounded-full bg-red-600/30 blur-[100px]"></div>
                 <div className="w-[50vw] h-[50vw] rounded-full bg-red-500/40 blur-[80px] absolute"></div>
               </motion.div>
            )}
            {reward.rarity === 'Classified' && (
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: [0, 0.5, 0.3], scale: [1, 1.2, 1] }}
                 transition={{ duration: 4, repeat: Infinity }}
                 className="fixed inset-0 z-[-1] pointer-events-none flex items-center justify-center"
               >
                 <div className="w-[80vw] h-[80vw] rounded-full bg-pink-500/20 blur-[100px]"></div>
               </motion.div>
            )}

            <motion.div 
              variants={getModalVariants(reward.rarity, reward.shinyType !== 'None')}
              initial="initial"
              animate="animate"
              className={`glass max-w-lg w-full shadow-2xl flex flex-col overflow-hidden relative shrink-0 border-2 ${
                reward.rarity === 'Exceedingly Rare' ? 'border-yellow-400/50 shadow-[0_0_50px_rgba(250,204,21,0.3)]' :
                reward.rarity === 'Covert' ? 'border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.3)]' :
                rarityColorMap[reward.rarity]?.split(' ')?.[1] || 'border-gray-500'
              }`}
            >
              <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-50"></div>
              
              <div className="p-8 pb-4 flex flex-col items-center text-center gap-4">
                <div className="bg-black/30 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 mb-2 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${rarityColorMap[reward.rarity]?.split(' ')[0] || 'text-white'}`}>
                    {reward.rarity} Drop
                  </span>
                </div>

                <div className="relative w-56 h-56 flex items-center justify-center my-4 group">
                  <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-white/5 rounded-2xl -rotate-6 transition-transform group-hover:rotate-0 border border-white/10"></div>
                    <div className="absolute inset-0 bg-black/20 rounded-2xl rotate-3 transition-transform group-hover:rotate-0 border border-white/5 backdrop-blur-sm"></div>
                  </div>
                  
                  <ShinyEffect key={reward.id + '-' + reward.shinyType} type={reward.shinyType} className="p-6 relative z-10">
                    {reward.shinyType !== 'None' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                        className="absolute -top-4 left-1/2 -translate-x-1/2 z-20"
                      >
                         <div className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-[0.3em] shadow-xl border-2 whitespace-nowrap
                          ${reward.shinyType === 'Dev' ? 'bg-green-500 text-black border-green-300 animate-pulse' : 
                            reward.shinyType === 'Dark Matter' ? 'bg-black text-white border-purple-900/50' :
                            reward.shinyType === 'Celestial' ? 'bg-purple-600 text-white border-purple-400' :
                            reward.shinyType === 'Prismatic' ? 'bg-pink-500 text-white border-pink-300' :
                            reward.shinyType === 'Rainbow' ? 'bg-white text-black border-gray-200' :
                            'bg-yellow-400 text-black border-yellow-200'
                          }`}>
                          {reward.shinyType} TIER
                        </div>
                      </motion.div>
                    )}
                    <motion.img 
                      initial={{ y: 50, scale: 0.5, rotate: -20 }}
                      animate={{ y: [0, -10, 0], scale: 1, rotate: 0 }}
                      transition={{ 
                        y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 },
                        scale: { type: "spring", stiffness: 300, damping: 12 },
                        rotate: { type: "spring", stiffness: 300, damping: 12 }
                      }}
                      src={reward.image} 
                      alt={reward.title} 
                      className="max-h-full object-cover drop-shadow-2xl rounded-lg" 
                      referrerPolicy="no-referrer"
                    />
                  </ShinyEffect>
                </div>

                <h2 className="text-3xl font-black text-white leading-tight drop-shadow-md">{reward.title}</h2>
                <div className="flex gap-2 text-xs font-mono">
                  <span className="text-gray-400 bg-black/40 px-2 py-0.5 rounded border border-white/10 uppercase font-bold tracking-wider">{reward.caseType}</span>
                  <span className={`px-2 py-0.5 rounded border border-white/10 font-bold uppercase ${
                    reward.wear === 'Factory New' ? 'text-emerald-400 bg-emerald-400/10' :
                    reward.wear === 'Minimal Wear' ? 'text-green-400 bg-green-400/10' :
                    reward.wear === 'Field-Tested' ? 'text-yellow-400 bg-yellow-400/10' :
                    reward.wear === 'Well-Worn' ? 'text-orange-400 bg-orange-400/10' :
                    'text-red-400 bg-red-400/10'
                  }`}>
                    {reward.wear}
                  </span>
                </div>
                
                <div className="mt-4 flex items-center justify-center bg-black/30 w-full py-4 rounded-xl border border-white/5 gap-3">
                  <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Market Value</span>
                  <div className="font-mono text-2xl font-bold text-emerald-400 flex items-center drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">
                    {preferences.currency === 'CR' ? (
                      <span>{reward.value.toLocaleString()} CR</span>
                    ) : (
                      <span>${reward.value.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    )}
                  </div>
                </div>

                {reward.shinyType === 'Dev' && (
                  <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl w-full">
                    <div className="flex items-center justify-center gap-2 mb-2">
                       <div className="w-8 h-8 rounded-full bg-yellow-400 border-2 border-yellow-600 flex items-center justify-center text-xs font-bold text-yellow-800 animate-bounce">
                          {reward.value > 1 ? 'H' : 'T'}
                       </div>
                       <span className="text-xs font-black text-green-400 uppercase tracking-widest">
                          Dev Coin Flip: {reward.value > 1 ? 'HEADS (JACKPOT!)' : 'TAILS (RIP)'}
                       </span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-tight">
                      Dev items trigger a mandatory coin flip. Heads: $1,000,000,000. Tails: $0.01.
                    </p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-black/40 border-t border-white/5 flex flex-col gap-2">
                <button 
                  onClick={() => setReward(null)}
                  className="w-full py-4 bg-white hover:bg-gray-200 text-black rounded-lg font-black transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)] uppercase tracking-widest text-sm"
                >
                  Keep Item
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => navigate('/minigames', { state: { autoSelectItemId: reward.id, activeGame: 'upgrader' } })}
                    className="py-3 bg-accent/20 hover:bg-accent/40 text-accent rounded-lg font-black transition-all border border-accent/30 hover:border-accent shadow-[0_0_10px_rgba(var(--color-accent),0.1)] uppercase tracking-widest text-[10px] flex justify-center items-center gap-1"
                  >
                    <Gamepad2 className="w-3 h-3" />
                    Upgrader
                  </button>
                  <button
                    onClick={() => navigate('/minigames', { state: { autoSelectItemId: reward.id, activeGame: 'contract' } })}
                    className="py-3 bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 rounded-lg font-black transition-all border border-blue-500/30 hover:border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.1)] uppercase tracking-widest text-[10px] flex justify-center items-center gap-1"
                  >
                    <Gamepad2 className="w-3 h-3" />
                    Contract
                  </button>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      playSound('sell');
                      sellItem(reward.id, reward.value);
                      setReward(null);
                    }}
                    className="flex-1 py-3 bg-black/40 hover:bg-red-500/20 hover:text-red-400 text-gray-400 rounded-lg font-bold transition-all border border-white/10 hover:border-red-500/50 uppercase tracking-widest text-[10px] flex justify-center items-center gap-2"
                  >
                    Sell Instantly
                  </button>
                </div>
              </div>
            </motion.div>
            
            {/* bottom spacer to ensure scrolling creates space below modal */}
            <div className="flex-grow shrink-0 h-10 min-h-[10vh]"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ad Modal */}
      {/* Secret Reveal Cutscene */}
      <AnimatePresence>
        {activeShinyImpact && (
          <ShinyImpact 
            type={activeShinyImpact} 
            onComplete={() => setActiveShinyImpact(null)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {adPlaying && adModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black flex items-center justify-center p-4"
          >
            <div className="flex flex-col items-center justify-center max-w-sm text-center">
              <div className="w-16 h-16 relative">
                <Loader2 className="w-16 h-16 text-accent animate-spin absolute" />
              </div>
              <h2 className="text-3xl font-black mt-8 mb-4 uppercase tracking-tighter text-white">Ad Playing...</h2>
              <p className="text-gray-400">Please wait while the simulated advertisement finishes to receive your {adModal.name}.</p>
              
              <div className="mt-8 bg-gray-900 border border-white/10 rounded-lg p-6 w-full relative overflow-hidden">
                <div 
                  className="absolute bottom-0 left-0 h-1 bg-emerald-500 transition-all duration-1000 ease-linear"
                  style={{ width: `${((30 - adTimeLeft) / 30) * 100}%` }}
                ></div>
                <p className="text-xl font-mono text-emerald-400 font-bold mb-2">00:{adTimeLeft.toString().padStart(2, '0')}</p>
                <p className="text-xs text-gray-500 uppercase tracking-widest">Remaining</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!adPlaying && adModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black flex items-center justify-center p-4"
          >
            <div className="flex flex-col items-center justify-center max-w-sm text-center bg-gray-900 p-8 rounded-xl border border-white/10 shadow-2xl">
              <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter text-emerald-400">Reward Unlocked!</h2>
              {profile?.adsRemoved ? (
                <p className="text-gray-300 mb-6">Because you purchased Ads Removed, you can instantly open {adModal.name} for free!</p>
              ) : (
                <p className="text-gray-300 mb-6">You've successfully watched the ad. You can now open {adModal.name} for free!</p>
              )}
              <button
                onClick={handleClaimAdReward}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 rounded text-white font-bold uppercase tracking-widest text-sm"
              >
                Claim Reward
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDevReveal && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-0 bg-black"
          >
            {/* Step 1: Blinding White Screen */}
            {devRevealStep === 'white' && (
              <motion.div 
                initial={{ opacity: 1 }}
                animate={{ opacity: [1, 1, 1, 0] }}
                transition={{ duration: 1.5, times: [0, 0.2, 0.8, 1] }}
                className="fixed inset-0 bg-white z-[210]"
              />
            )}

            {/* Background for Flip/Popup */}
            {devRevealStep !== 'white' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[205]"
              />
            )}

            {/* Step 2: Popup */}
            {devRevealStep === 'popup' && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative z-[220] flex flex-col items-center text-center p-8 glass max-w-sm rounded-3xl border-2 border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.3)]"
              >
                <div className="w-24 h-24 mb-6 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center rotate-3 shadow-lg shadow-green-500/20">
                  <Key className="w-12 h-12 text-black" />
                </div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4 italic">Founder’s Key found</h2>
                <p className="text-green-400 font-bold mb-8">You have found the Founder’s Key. Flip to reveal your fortune.</p>
                <button 
                  onClick={handleStartFlip}
                  className="w-full py-4 bg-green-500 hover:bg-green-400 text-black font-black uppercase tracking-widest text-lg rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all transform hover:scale-105 active:scale-95"
                >
                  Flip Coin
                </button>
              </motion.div>
            )}

            {/* Step 3: Coin Flip Animation */}
            {devRevealStep === 'flip' && (
              <div className="relative z-[220] flex flex-col items-center">
                <motion.div 
                  initial={{ rotateY: 0 }}
                  animate={{ 
                    rotateY: 1800,
                    y: [-100, -250, 0],
                    scale: [1, 1.5, 1]
                  }}
                  transition={{ duration: 3, ease: "easeInOut" }}
                  className="w-48 h-48 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-600 border-4 border-yellow-700 shadow-2xl flex items-center justify-center text-6xl font-black text-yellow-900"
                >
                   ?
                </motion.div>
                <p className="mt-12 text-xl font-mono text-white animate-pulse">FLIPPING...</p>
              </div>
            )}

            {/* Step 4: Result */}
            {devRevealStep === 'result' && reward && (
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative z-[220] flex flex-col items-center text-center p-8"
              >
                {reward.value > 1 ? (
                  <>
                    <motion.div 
                      initial={{ y: 20 }}
                      animate={{ y: 0 }}
                      className="text-[60px] sm:text-[120px] font-black text-green-500 leading-none drop-shadow-[0_0_30px_rgba(34,197,94,0.5)] mb-4"
                    >
                      1,000,000,000
                    </motion.div>
                    <div className="text-xl sm:text-3xl font-black text-white uppercase tracking-widest mb-8 px-4">HEADS - ULTIMATE JACKPOT</div>
                    <motion.div 
                       animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 1, 0.5]
                       }}
                       transition={{ duration: 0.5, repeat: Infinity }}
                       className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle,rgba(34,197,94,0.2)_0%,transparent_70%)]"
                    />
                  </>
                ) : (
                  <>
                    <motion.div 
                      initial={{ y: 20 }}
                      animate={{ y: 0 }}
                      className="text-[120px] font-black text-gray-700 leading-none mb-4"
                    >
                      0.01
                    </motion.div>
                    <div className="text-3xl font-black text-gray-500 uppercase tracking-widest mb-8 px-4">TAILS - WOMP WOMP</div>
                  </>
                )}
                <button 
                  onClick={() => setShowDevReveal(false)}
                  className="mt-8 px-12 py-4 bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-widest rounded-full transition-all border border-white/10"
                >
                  Collect Fortune
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
