import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ShinyImpactProps {
  type: string;
  onComplete?: () => void;
}

export function ShinyImpact({ type, onComplete }: ShinyImpactProps) {
  const getImpactColors = () => {
    switch (type) {
      case 'Shiny': return ['rgba(255, 223, 0, 0)', 'rgba(255, 223, 0, 0.4)', 'rgba(255, 223, 0, 0)'];
      case 'Glimmering': return ['rgba(34, 211, 238, 0)', 'rgba(34, 211, 238, 0.5)', 'rgba(34, 211, 238, 0)'];
      case 'Radiant': return ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0)'];
      case 'Rainbow': return ['transparent', 'rgba(255, 255, 255, 0.5)', 'transparent'];
      case 'Prismatic': return ['rgba(232, 121, 249, 0)', 'rgba(232, 121, 249, 0.7)', 'rgba(232, 121, 249, 0)'];
      case 'Celestial': return ['rgba(147, 51, 234, 0)', 'rgba(147, 51, 234, 0.9)', 'rgba(147, 51, 234, 0)'];
      case 'Dark Matter': return ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 1)', 'rgba(0, 0, 0, 0)'];
      default: return ['transparent', 'transparent', 'transparent'];
    }
  };

  const getParticleCount = () => {
    switch (type) {
      case 'Shiny': return 10;
      case 'Glimmering': return 15;
      case 'Radiant': return 25;
      case 'Rainbow': return 30;
      case 'Prismatic': return 40;
      case 'Celestial': return 60;
      case 'Dark Matter': return 100;
      default: return 0;
    }
  };

  const intensity = getParticleCount();
  const colors = getImpactColors();

  return (
    <div className="fixed inset-0 z-[300] pointer-events-none flex items-center justify-center overflow-hidden">
      {/* Background Flash */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: [0, 1, 0],
          backgroundColor: colors
        }}
        transition={{ duration: 0.8, times: [0, 0.2, 1] }}
        onAnimationComplete={onComplete}
        className="absolute inset-0"
      />

      {/* Shockwave */}
      <motion.div 
        initial={{ scale: 0, opacity: 1, borderWidth: '0px' }}
        animate={{ 
          scale: 4, 
          opacity: 0,
          borderWidth: ['20px', '2px']
        }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-64 h-64 border-white rounded-full border-solid absolute"
        style={{ borderColor: colors[1] }}
      />

      {/* Particles */}
      {Array.from({ length: intensity }).map((_, i) => {
        const angle = (i / intensity) * Math.PI * 2;
        const velocity = 50 + Math.random() * 400;
        const x = Math.cos(angle) * velocity;
        const y = Math.sin(angle) * velocity;
        const size = 2 + Math.random() * 8;
        
        return (
          <motion.div
            key={i}
            initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
            animate={{ 
              scale: [1, 0.5, 0], 
              x, 
              y, 
              opacity: [1, 1, 0],
              rotate: Math.random() * 720
            }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute rounded-sm shadow-[0_0_10px_currentColor]"
            style={{ 
              width: size, 
              height: size, 
              backgroundColor: colors[1],
              color: colors[1]
            }}
          />
        );
      })}

      {/* Center Glare */}
      <motion.div 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: [0, 2, 0],
          opacity: [0, 1, 0]
        }}
        transition={{ duration: 0.5 }}
        className="w-32 h-32 bg-white blur-3xl rounded-full absolute"
      />
    </div>
  );
}
