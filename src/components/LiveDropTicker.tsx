import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '../store/gameStore';

interface TickerDrop {
  id: string;
  user: string;
  itemName: string;
  rarity: string;
  value: number;
}

const USERNAMES = [
  "ShadowKiller", "AWP_God", "TradeMaster", "xX_Sniper_Xx", "Gaben", 
  "Rank1_Trader", "luckypickle", "NoScope_1337", "LootGoblin", "unboxer_99",
  "AlphaStrike", "OmegaLul", "GhostInTheShell", "PityTimerHater", "DropKing",
  "These names are definitely not bots i swear"
];

const HIGH_TIER_ITEMS = [
  { name: "AWP | Dragon Lore", rarity: "Exceedingly Rare", baseValue: 150000 },
  { name: "Karambit | Fade", rarity: "Exceedingly Rare", baseValue: 80000 },
  { name: "M4A4 | Howl", rarity: "Covert", baseValue: 45000 },
  { name: "AK-47 | Fire Serpent", rarity: "Covert", baseValue: 20000 },
  { name: "Glock-18 | Fade", rarity: "Classified", baseValue: 8000 },
  { name: "Butterfly Knife | Doppler", rarity: "Exceedingly Rare", baseValue: 120000 },
  { name: "Sport Gloves | Vice", rarity: "Exceedingly Rare", baseValue: 95000 },
  { name: "Sentient AI", rarity: "Covert", baseValue: 50000 },
  { name: "Quantum Supercomputer", rarity: "Exceedingly Rare", baseValue: 100000 },
  { name: "Lost City of Atlantis", rarity: "Exceedingly Rare", baseValue: 250000 },
  { name: "The Mona Lisa", rarity: "Exceedingly Rare", baseValue: 500000 },
  { name: "Roman Colosseum", rarity: "Covert", baseValue: 30000 },
  { name: "Ferrari F40", rarity: "Covert", baseValue: 1200000 },
  { name: "Rosetta Stone", rarity: "Exceedingly Rare", baseValue: 350000 },
  // Automotive
  { name: "McLaren F1", rarity: "Exceedingly Rare", baseValue: 20000000 },
  { name: "Toyota Supra MK4", rarity: "Covert", baseValue: 80000 },
  { name: "Nissan Skyline GT-R R34", rarity: "Covert", baseValue: 150000 },
  { name: "Porsche 911 GT3 RS", rarity: "Covert", baseValue: 250000 },
  { name: "Bugatti Chiron", rarity: "Exceedingly Rare", baseValue: 3000000 },
  { name: "Koenigsegg Jesko", rarity: "Exceedingly Rare", baseValue: 2800000 },
  // Wiki 
  { name: "Dyson Sphere Blueprint", rarity: "Exceedingly Rare", baseValue: 950000 },
  { name: "Cure for the Common Cold", rarity: "Exceedingly Rare", baseValue: 5000000 },
  { name: "Time Machine Prototype", rarity: "Covert", baseValue: 850000 },
  { name: "Area 51 Security Badge", rarity: "Classified", baseValue: 65000 },
  { name: "Holy Grail", rarity: "Exceedingly Rare", baseValue: 10000000 },
  { name: "Philosopher's Stone", rarity: "Exceedingly Rare", baseValue: 2500000 },
  { name: "First Enigma Machine", rarity: "Covert", baseValue: 350000 },
  { name: "Einstein's Original Notes", rarity: "Covert", baseValue: 120000 },
];

function generateSimulatedDrop(): TickerDrop {
  const item = HIGH_TIER_ITEMS[Math.floor(Math.random() * HIGH_TIER_ITEMS.length)];
  let user = USERNAMES[Math.floor(Math.random() * (USERNAMES.length - 1))];
  
  if (Math.random() < 0.01) {
    user = "These names are definitely not bots i swear";
  }
  
  const value = item.baseValue * (0.8 + Math.random() * 0.4);
  
  return {
    id: crypto.randomUUID(),
    user,
    itemName: item.name,
    rarity: item.rarity,
    value: Math.floor(value)
  };
}

export function LiveDropTicker() {
  const { preferences, addBotJackpotContribution } = useGameStore();
  const [drops, setDrops] = useState<TickerDrop[]>([]);

  useEffect(() => {
    // Initial drops 
    const initialDrops = Array.from({ length: 8 }).map(generateSimulatedDrop);
    setDrops(initialDrops);

    const interval = setInterval(() => {
      const drop = generateSimulatedDrop();
      setDrops(prev => {
        const newDrops = [drop, ...prev];
        if (newDrops.length > 20) newDrops.pop(); // keep a max of 20 elements
        return newDrops;
      });

      // 10% chance to contribute to jackpot to prevent spamming DB, or 100% chance if Exceedingly Rare
      if (Math.random() < 0.1 || drop.rarity === 'Exceedingly Rare') {
         addBotJackpotContribution(drop.value, drop.rarity === 'Exceedingly Rare');
      }

    }, 3000 + Math.random() * 5000); // 3 to 8 seconds delay
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-black/80 border-b border-white/5 h-10 overflow-hidden flex items-center sticky top-0 z-[100]">
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-gray-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-gray-950 to-transparent z-10 pointer-events-none" />
      
      <div className="flex items-center h-full gap-8 px-4 w-full">
        <AnimatePresence initial={false}>
          {drops.map(drop => (
            <motion.div 
              layout
              key={drop.id}
              initial={{ opacity: 0, x: -50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex items-center gap-2 whitespace-nowrap shrink-0 text-xs font-bold"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse hidden sm:block"></div>
              <span className="text-gray-400">{drop.user}</span>
              <span className="text-gray-600">unboxed</span>
              <span className={`px-1.5 py-0.5 rounded border uppercase text-[9px] tracking-wider ${
                drop.rarity === 'Exceedingly Rare' ? 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10' :
                drop.rarity === 'Covert' ? 'text-red-400 border-red-400/20 bg-red-400/10' :
                'text-pink-400 border-pink-400/20 bg-pink-400/10'
              }`}>
                {drop.rarity}
              </span>
              <span className="text-white drop-shadow-md">{drop.itemName}</span>
              <span className="text-emerald-400 font-mono ml-1">
                {preferences.currency === 'CR' 
                  ? `${drop.value.toLocaleString()} CR` 
                  : `$${drop.value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
                }
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
