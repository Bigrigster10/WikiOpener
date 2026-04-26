import { useEffect, useState, useMemo, useRef } from 'react';
import { motion } from 'motion/react';
import { Item } from '../types';
import { CaseType, RARITIES, drawRarity } from '../lib/gameLogic';
import { playSound } from '../lib/sounds';
import { ShinyEffect } from './ShinyEffect';

interface CaseRouletteProps {
  targetItem: Item;
  activeCase: CaseType;
  onFinish: () => void;
}

const RARITY_COLORS: Record<string, string> = {
  [RARITIES.CONSUMER.name]: 'bg-gray-500 shadow-gray-500',
  [RARITIES.MIL_SPEC.name]: 'bg-blue-500 shadow-blue-500',
  [RARITIES.RESTRICTED.name]: 'bg-purple-500 shadow-purple-500',
  [RARITIES.CLASSIFIED.name]: 'bg-pink-500 shadow-pink-500',
  [RARITIES.COVERT.name]: 'bg-red-500 shadow-red-500',
  [RARITIES.EXCEEDINGLY_RARE.name]: 'bg-yellow-400 shadow-yellow-400',
};

// Generate a random visual item for the spin
function generateDummyItem(activeCase: CaseType) {
  const r = drawRarity(activeCase.id);
  return {
    id: Math.random().toString(),
    rarity: r.name,
    color: RARITY_COLORS[r.name] || 'bg-gray-500 shadow-gray-500',
    isTarget: false,
    shinyType: 'None' as const
  };
}

export function CaseRoulette({ targetItem, activeCase, onFinish }: CaseRouletteProps) {
  const TARGET_INDEX = 55; // Where the winning item sits in the array
  const ITEM_WIDTH = 140; // Card width
  const GAP = 16; // Margin
  const FULL_ITEM_WIDTH = ITEM_WIDTH + GAP;
  
  const [complete, setComplete] = useState(false);
  const audioContextRef = useRef<number>(0);

  const getRarityConfig = (rarity: string) => {
    switch (rarity) {
      case RARITIES.EXCEEDINGLY_RARE.name: // Gold
        return {
          color: '#facc15', // yellow-400
          twColor: '!border-yellow-400 ring-yellow-400/50',
          shakeX: [-30, 30, -25, 25, -15, 15, -10, 10, -5, 5, 0],
          shakeY: [-15, 15, -10, 10, -5, 5, 0],
          scale: [1, 1.25, 1],
          cardScale: 1.25,
          flashOpacity: 1,
          flashDuration: 1.5,
          indicatorColor: 'bg-yellow-400',
          indicatorShadow: 'drop-shadow-[0_0_25px_#facc15]'
        };
      case RARITIES.COVERT.name: // Red
        return {
          color: '#ef4444', // red-500
          twColor: '!border-red-500 ring-red-500/50',
          shakeX: [-25, 25, -20, 20, -10, 10, -5, 5, 0],
          shakeY: [-10, 10, -5, 5, 0],
          scale: [1, 1.15, 1],
          cardScale: 1.2,
          flashOpacity: 0.9,
          flashDuration: 1.2,
          indicatorColor: 'bg-red-500',
          indicatorShadow: 'drop-shadow-[0_0_20px_#ef4444]'
        };
      case RARITIES.CLASSIFIED.name: // Pink
        return {
          color: '#ec4899', // pink-500
          twColor: '!border-pink-500 ring-pink-500/50',
          shakeX: [-20, 20, -15, 15, -10, 10, -5, 5, 0],
          shakeY: [-5, 5, -2, 2, 0],
          scale: [1, 1.1, 1],
          cardScale: 1.15,
          flashOpacity: 0.8,
          flashDuration: 1.0,
          indicatorColor: 'bg-pink-500',
          indicatorShadow: 'drop-shadow-[0_0_15px_#ec4899]'
        };
      case RARITIES.RESTRICTED.name: // Purple
        return {
          color: '#a855f7', // purple-500
          twColor: '!border-purple-500 ring-purple-500/50',
          shakeX: [-15, 15, -10, 10, -5, 5, 0],
          shakeY: [-2, 2, -1, 1, 0],
          scale: [1, 1.05, 1],
          cardScale: 1.1,
          flashOpacity: 0.6,
          flashDuration: 0.8,
          indicatorColor: 'bg-purple-500',
          indicatorShadow: 'drop-shadow-[0_0_12px_#a855f7]'
        };
      case RARITIES.MIL_SPEC.name: // Blue
        return {
          color: '#3b82f6', // blue-500
          twColor: '!border-blue-500 ring-blue-500/50',
          shakeX: [-10, 10, -5, 5, 0],
          shakeY: [0],
          scale: [1, 1.02, 1],
          cardScale: 1.05,
          flashOpacity: 0.4,
          flashDuration: 0.6,
          indicatorColor: 'bg-blue-500',
          indicatorShadow: 'drop-shadow-[0_0_8px_#3b82f6]'
        };
      default: // Consumer (Gray)
        return {
          color: '#6b7280', // gray-500
          twColor: '!border-gray-500 ring-gray-500/50',
          shakeX: [-5, 5, -2, 2, 0],
          shakeY: [0],
          scale: [1, 1.01, 1],
          cardScale: 1.02,
          flashOpacity: 0.2,
          flashDuration: 0.5,
          indicatorColor: 'bg-gray-500',
          indicatorShadow: 'drop-shadow-[0_0_5px_#6b7280]'
        };
    }
  };

  const config = useMemo(() => getRarityConfig(targetItem.rarity), [targetItem.rarity]);

  // Generate the fixed spin track
  const trackItems = useMemo(() => {
    const items = [];
    for (let i = 0; i < 70; i++) {
      if (i === TARGET_INDEX) {
        // Inject the real target
        items.push({
          id: 'target',
          rarity: targetItem.rarity,
          color: RARITY_COLORS[targetItem.rarity] || 'bg-gray-500 shadow-gray-500',
          isTarget: true,
          image: targetItem.image,
          shinyType: targetItem.shinyType || 'None'
        });
      } else {
        items.push(generateDummyItem(activeCase));
      }
    }
    return items;
  }, [targetItem, activeCase]);

  const stopOffsetMultiplier = useMemo(() => Math.random() * 0.8 - 0.4, []); 
  const extraOffset = stopOffsetMultiplier * ITEM_WIDTH;

  // Since paddingLeft is 50vw, the 0-point of the track is exactly at the center of the screen.
  // To place TARGET_INDEX at the center line, we need to shift the track left by its exact distance from the 0-point
  // plus half of its width (so the center of the item hits the center line).
  const targetX = -(TARGET_INDEX * FULL_ITEM_WIDTH) - (ITEM_WIDTH / 2) - extraOffset;

  const onFinishRef = useRef(onFinish);
  useEffect(() => {
     onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 5500; // 5.5 seconds spin

    // Logic to play ticking sounds based on position
    let lastTickIndex = 0;
    
    // We roughly estimate the curve of easeOut to trigger ticks manually.
    // framer-motion handles visual, we handle audio.
    const tickInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        if (elapsed > duration) {
            clearInterval(tickInterval);
            return;
        }

        // easeOutQuart approximation
        const t = elapsed / duration;
        const progress = 1 - Math.pow(1 - t, 4);
        const currentX = (targetX * progress);
        
        // How many items have we scrolled past?
        const currentIndex = Math.floor(Math.abs(currentX) / FULL_ITEM_WIDTH);
        
        if (currentIndex > lastTickIndex) {
            playSound('tick');
            lastTickIndex = currentIndex;
        }
    }, 16);

    const finishTimeout = setTimeout(() => {
      setComplete(true);
      clearInterval(tickInterval);
      if (onFinishRef.current) {
          onFinishRef.current();
      }
    }, duration + 500); // Add 500ms suspense before showing modal

    return () => {
      clearTimeout(finishTimeout);
      clearInterval(tickInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetX, FULL_ITEM_WIDTH]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-3xl overflow-hidden">
      
      {/* Background crazy lights */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="absolute w-[150vw] h-[150vw] bg-[conic-gradient(var(--tw-gradient-stops))] from-transparent via-white/5 to-transparent pointer-events-none mix-blend-screen"
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,black_100%)] pointer-events-none z-10" />

      {/* Stop Flash */}
      {complete && (
        <motion.div 
          initial={{ opacity: config.flashOpacity, backgroundColor: config.color }}
          animate={{ opacity: 0 }}
          transition={{ duration: config.flashDuration, ease: "easeOut" }}
          className="absolute inset-0 z-40 pointer-events-none mix-blend-screen"
        />
      )}

      {complete && config.flashOpacity > 0.5 && (
        <motion.div 
          initial={{ scale: 0.5, opacity: 1, borderColor: config.color, borderWidth: 20 }}
          animate={{ scale: 3, opacity: 0, borderWidth: 0 }}
          transition={{ duration: config.flashDuration, ease: "easeOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full z-30 pointer-events-none"
          style={{ width: 200, height: 200 }}
        />
      )}

      {complete && (
        <motion.div 
          initial={{ scale: 1, opacity: 1 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.8, ease: "circOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-64 blur-[40px] rounded-full z-40 pointer-events-none"
          style={{ backgroundColor: config.color, opacity: 0.4 }}
        />
      )}

      {/* Center line indicator */}
      <motion.div 
        animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ repeat: Infinity, duration: 1 }}
        className={`absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-1 z-30 flex flex-col items-center justify-between ${complete ? config.indicatorShadow : 'drop-shadow-[0_0_15px_#facc15]'}`}
      >
        <div className={`w-5 h-5 rotate-45 border-4 border-black ${complete ? config.indicatorColor : 'bg-yellow-400'}`} />
        <div className={`w-1 h-full bg-gradient-to-b ${complete ? `from-transparent via-${config.twColor.split('-')[1]}-${config.twColor.split('-')[2]?.split(' ')[0]} to-transparent` : 'from-yellow-400 via-yellow-400/80 to-yellow-400'} ${complete ? config.indicatorColor : ''}`} style={complete ? { backgroundColor: config.color } : {}} />
        <div className={`w-5 h-5 rotate-45 border-4 border-black ${complete ? config.indicatorColor : 'bg-yellow-400'}`} />
      </motion.div>

      <motion.div 
        animate={complete ? { x: config.shakeX, y: config.shakeY, scale: config.scale } : {}}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full h-56 relative overflow-visible flex items-center z-20 shadow-[0_0_100px_rgba(0,0,0,0.9)]"
      >
        <div className="absolute inset-0 border-y border-white/10 bg-black/40 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] z-30 pointer-events-none" />
        
        <motion.div 
          className="flex flex-row items-center absolute left-0 h-full"
          initial={{ x: 0 }}
          animate={{ x: targetX }}
          transition={{
            duration: 5.5,
            ease: [0.15, 0.95, 0.25, 1] // Custom ease out for snappy start, slow finish
          }}
          style={{ gap: `${GAP}px`, paddingLeft: '50vw' }} // Starts slightly offscreen conceptually
        >
          {trackItems.map((item, i) => {
            const isTarget = item.isTarget;
            return (
              <motion.div 
                key={`${item.id}-${i}`}
                initial={{ scale: 1 }}
                animate={isTarget && complete ? { scale: config.cardScale, zIndex: 50, borderColor: config.color } : {}}
                className={`w-[140px] h-44 shrink-0 relative flex flex-col justify-end overflow-hidden rounded bg-black border border-white/10 shadow-[0_4px_25px_rgba(0,0,0,0.5)] group ${isTarget && complete ? `z-50 ring-4 ${config.twColor}` : ''}`}
                style={isTarget && complete ? { boxShadow: `0 0 40px ${config.color}`, borderColor: config.color } : {}}
              >
                  {isTarget && complete && item.shinyType !== 'None' && (
                    <>
                      <ShinyEffect type={item.shinyType as any} className="absolute inset-0 z-10" children={<div className="w-full h-full" />} />
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-40 bg-white text-black text-[10px] font-black px-2 py-0.5 rounded shadow-[0_0_10px_rgba(255,255,255,0.8)] animate-bounce uppercase">
                        {item.shinyType}
                      </div>
                    </>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/80 z-10 pointer-events-none"/>
                  
                  <div className="absolute inset-0 flex items-center justify-center z-0 group-hover:scale-110 transition-transform">
                    <span className="text-[90px] font-black text-white/10 drop-shadow-2xl translate-y-[-10px]">?</span>
                  </div>
                  
                  {/* Glowing Bottom Line */}
                  <div className={`w-full h-3 border-t border-black/50 relative z-20 overflow-hidden shadow-[0_0_15px_currentColor] ${item.color.split(' ')[0]} ${item.color.split(' ')[1]}`}>
                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                  </div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </div>
  );
}
