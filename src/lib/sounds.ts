import { useGameStore } from '../store/gameStore';

let audioCtx: AudioContext | null = null;

function getContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playSound(type: 'click' | 'open' | 'success' | 'sell' | 'tick' | 'legendary' | 'epic' | 'womp') {
  const { preferences } = useGameStore.getState();
  if (!preferences.sound) return;

  try {
    const ctx = getContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    // Add a lowpass filter to remove the harsh digital high frequencies
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1500, ctx.currentTime);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;
    
    // Default to 0 gain immediately to prevent "popping" or "clicking" artifacts
    gainNode.gain.setValueAtTime(0, now);

    switch (type) {
      case 'womp':
        // Descending low tone
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.8);
        gainNode.gain.linearRampToValueAtTime(0.1, now + 0.1);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.8);
        osc.start(now);
        osc.stop(now + 0.8);
        break;
      case 'click':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
        gainNode.gain.linearRampToValueAtTime(0.08, now + 0.01); // Quick soft attack
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1); // Smooth release
        osc.start(now);
        osc.stop(now + 0.1);
        break;
        
      case 'tick':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(700, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
        gainNode.gain.linearRampToValueAtTime(0.05, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
        
      case 'open':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(500, now + 1.0);
        gainNode.gain.linearRampToValueAtTime(0.06, now + 0.2); // Swell in
        gainNode.gain.linearRampToValueAtTime(0, now + 1.0); // Fade out
        osc.start(now);
        osc.stop(now + 1.0);
        break;
        
      case 'success':
        // A nice, warm major arpeggio
        osc.type = 'sine';
        filter.frequency.setValueAtTime(2000, now);
        osc.frequency.setValueAtTime(440.00, now); // A4
        osc.frequency.setValueAtTime(554.37, now + 0.15); // C#5
        osc.frequency.setValueAtTime(659.25, now + 0.3); // E5
        gainNode.gain.linearRampToValueAtTime(0.08, now + 0.05);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.8);
        osc.start(now);
        osc.stop(now + 0.8);
        break;
        
      case 'epic':
        // Richer synth sweep using a filtered triangle wave
        osc.type = 'triangle';
        filter.frequency.setValueAtTime(600, now);
        filter.frequency.linearRampToValueAtTime(2500, now + 0.6); // Filter sweep opening up
        
        osc.frequency.setValueAtTime(329.63, now); // E4
        osc.frequency.setValueAtTime(415.30, now + 0.15); // G#4
        osc.frequency.setValueAtTime(493.88, now + 0.3); // B4
        osc.frequency.setValueAtTime(659.25, now + 0.45); // E5
        
        gainNode.gain.linearRampToValueAtTime(0.08, now + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        osc.start(now);
        osc.stop(now + 1.2);
        break;
        
      case 'legendary':
        // A majestic, warm chord progression using layered sines/triangles
        osc.type = 'triangle';
        const osc2 = ctx.createOscillator();
        const osc3 = ctx.createOscillator();
        osc2.type = 'sine';
        osc3.type = 'sine';
        
        osc2.connect(filter);
        osc3.connect(filter);
        
        // A major chord -> D major chord
        osc.frequency.setValueAtTime(220.00, now); // A3
        osc2.frequency.setValueAtTime(277.18, now); // C#4
        osc3.frequency.setValueAtTime(329.63, now); // E4
        
        osc.frequency.setValueAtTime(293.66, now + 0.6); // D4
        osc2.frequency.setValueAtTime(369.99, now + 0.6); // F#4
        osc3.frequency.setValueAtTime(440.00, now + 0.6); // A4
        
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.linearRampToValueAtTime(3000, now + 1.5);
        
        gainNode.gain.linearRampToValueAtTime(0.1, now + 0.4);
        gainNode.gain.linearRampToValueAtTime(0, now + 3.0);
        
        osc.start(now); osc2.start(now); osc3.start(now);
        osc.stop(now + 3.0); osc2.stop(now + 3.0); osc3.stop(now + 3.0);
        break;
        
      case 'sell':
        // A light, pleasant "cha-ching" style blip
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, now);
        osc.frequency.exponentialRampToValueAtTime(1600, now + 0.05);
        gainNode.gain.linearRampToValueAtTime(0.05, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
    }
  } catch (e) {
    console.error("Audio error", e);
  }
}
