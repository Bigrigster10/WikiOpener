import React from 'react';
import { motion } from 'motion/react';
import { ShinyType } from '../types';

interface ShinyEffectProps {
  type?: ShinyType;
  children: React.ReactNode;
  className?: string;
  key?: string | number;
}

export function ShinyEffect({ type, children, className = "" }: ShinyEffectProps) {
  if (!type || type === 'None') return <>{children}</>;

  const getGlowStyles = () => {
    switch (type) {
      case 'Shiny':
        return "shadow-[0_0_30px_rgba(255,223,0,0.4)]";
      case 'Glimmering':
        return "shadow-[0_0_35px_rgba(34,211,238,0.5)]";
      case 'Radiant':
        return "shadow-[0_0_40px_rgba(255,255,255,0.6)]";
      case 'Rainbow':
        return "shadow-[0_0_45px_rgba(255,255,255,0.3)]";
      case 'Prismatic':
        return "shadow-[0_0_50px_rgba(232,121,249,0.5)]";
      case 'Celestial':
        return "shadow-[0_0_60px_rgba(147,51,234,0.7)] scale-[1.02]";
      case 'Dark Matter':
        return "shadow-[0_0_50px_rgba(0,0,0,1)]";
      case 'Dev':
        return "shadow-[0_0_80px_rgba(34,197,94,0.8)] scale-[1.05]";
      default:
        return "";
    }
  };

  const getBorderStyles = () => {
    switch (type) {
      case 'Shiny': return "border-yellow-400/50";
      case 'Glimmering': return "border-cyan-400/60";
      case 'Radiant': return "border-white/70";
      case 'Rainbow': return "border-white/30";
      case 'Prismatic': return "border-fuchsia-400/80";
      case 'Celestial': return "border-purple-500 shadow-[inset_0_0_20px_rgba(147,51,234,0.3)]";
      case 'Dark Matter': return "border-gray-900";
      case 'Dev': return "border-green-500 shadow-[inset_0_0_30px_rgba(34,197,94,0.5)]";
      default: return "";
    }
  };

  return (
    <motion.div 
      className={`relative group/shiny ${className} ${getGlowStyles()} rounded-lg`}
      animate={type === 'Dev' ? { 
        x: [0, -1, 1, -1, 1, 0],
        y: [0, 1, -1, 1, -1, 0]
      } : {}}
      transition={type === 'Dev' ? { 
        duration: 0.15, 
        repeat: Infinity,
        repeatType: "mirror"
      } : {}}
    >
      <div className={`relative w-full h-full rounded-lg overflow-hidden border-2 ${getBorderStyles()}`}>
        {/* Background Layer Effects */}
        {type === 'Shiny' && (
          <motion.div 
            className="absolute inset-0 z-0 bg-yellow-400/10"
            animate={{ opacity: [0, 0.2, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        {type === 'Glimmering' && (
          <motion.div 
            className="absolute inset-0 z-0 bg-cyan-400/10"
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
             {/* Twinkle dots */}
             {Array.from({ length: 10 }).map((_, i) => (
                <motion.div 
                   key={i}
                   className="absolute w-1 h-1 bg-white rounded-full blur-[1px]"
                   style={{ 
                      top: `${Math.random() * 100}%`, 
                      left: `${Math.random() * 100}%` 
                   }}
                   animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
                   transition={{ duration: 1 + Math.random(), repeat: Infinity, delay: Math.random() }}
                />
             ))}
          </motion.div>
        )}

        {type === 'Rainbow' && (
          <motion.div 
            className="absolute inset-0 z-0 opacity-80"
            animate={{
              background: [
                'linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8b00ff)',
                'linear-gradient(135deg, #8b00ff, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082)',
                'linear-gradient(225deg, #4b0082, #8b00ff, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff)',
                'linear-gradient(315deg, #0000ff, #4b0082, #8b00ff, #ff0000, #ff7f00, #ffff00, #00ff00)',
              ]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        )}

        {type === 'Celestial' && (
          <>
            <motion.div 
               className="absolute inset-0 z-0 bg-purple-900/60"
               animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.1, 1] }}
               transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-80 mix-blend-screen" />
            {/* Pulsing Core */}
            <motion.div 
              className="absolute inset-0 z-0 bg-[radial-gradient(circle,rgba(147,51,234,0.4)_0%,transparent_70%)]"
              animate={{ scale: [0.8, 1.5, 0.8], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-0 z-0 bg-gradient-to-t from-purple-500/40 via-transparent to-purple-500/40"
              animate={{ y: ['100%', '-100%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
          </>
        )}

        {type === 'Radiant' && (
          <motion.div 
            className="absolute inset-0 z-0 bg-white/20"
            animate={{ 
              opacity: [0.1, 0.5, 0.1],
              background: [
                'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4) 0%, transparent 70%)',
                'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.0) 0%, transparent 70%)',
              ]
            }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}

        {type === 'Dark Matter' && (
          <motion.div 
            className="absolute inset-0 z-0 bg-black"
            animate={{ opacity: [0.85, 1.0, 0.85] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
              <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_20%,rgba(0,0,0,1)_100%)]" />
              {/* Event Horizon Swirl */}
              <motion.div 
                className="absolute inset-[-50%] z-0 rounded-full bg-[conic-gradient(from_0deg,transparent,rgba(147,51,234,0.3),transparent)]"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              />
              <motion.div 
                className="absolute inset-0 bg-purple-950/30"
                animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
          </motion.div>
        )}

        {type === 'Dev' && (
          <>
            <motion.div 
              className="absolute inset-0 z-0 bg-black/95 font-mono text-[10px] text-green-500 overflow-hidden break-all whitespace-pre-wrap leading-tight"
              animate={{ y: [-20, 0] }}
              transition={{ duration: 0.05, repeat: Infinity }}
            >
              {Array(40).fill("SYSTEM_CRITICAL_CORE_OVERRIDE_0x00FF").join(" ")}
            </motion.div>
            <motion.div 
              className="absolute inset-0 z-10 bg-green-500/20 pointer-events-none shadow-[inset_0_0_50px_rgba(34,197,94,0.5)]"
              animate={{ opacity: [0.1, 0.5, 0.1] }}
              transition={{ duration: 0.2, repeat: Infinity }}
            />
          </>
        )}

        {/* Overlay Shine Effect */}
        <motion.div
          className="absolute inset-0 z-10 pointer-events-none"
          animate={{
            background: [
              "linear-gradient(105deg, transparent 0%, rgba(255,255,255,0) 45%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0) 55%, transparent 100%)",
              "linear-gradient(105deg, transparent 0%, rgba(255,255,255,0) 95%, rgba(255,255,255,0.6) 100%, rgba(255,255,255,0) 105%, transparent 100%)",
            ],
            backgroundPosition: ["-200% 0", "200% 0"]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />

        <div className="relative z-20 h-full w-full">
          {children}
        </div>

        {/* Tag */}
        <motion.div 
          animate={type === 'Dev' ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.2, repeat: Infinity }}
          className={`absolute top-1 right-1 z-30 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest shadow-lg
          ${type === 'Dev' ? 'bg-green-500 text-black' : 
            type === 'Dark Matter' ? 'bg-black text-white border border-white/40' :
            type === 'Celestial' ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,1)]' :
            type === 'Prismatic' ? 'bg-pink-500 text-white shadow-[0_0_10px_rgba(236,72,153,0.5)]' :
            type === 'Rainbow' ? 'bg-white text-black font-bold' :
            type === 'Radiant' ? 'bg-blue-100 text-blue-700' :
            'bg-yellow-400 text-black shadow-[0_0_10px_rgba(234,179,8,0.5)]'
          }`}>
          {type}
        </motion.div>
      </div>
    </motion.div>
  );
}
