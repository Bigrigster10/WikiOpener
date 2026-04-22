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

export function playSound(type: 'click' | 'open' | 'success' | 'sell' | 'tick' | 'legendary' | 'epic') {
  const { preferences } = useGameStore.getState();
  if (!preferences.sound) return;

  try {
    const ctx = getContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (type) {
      case 'click':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      case 'tick':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      case 'open':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.linearRampToValueAtTime(800, now + 1.2);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 1.2);
        osc.start(now);
        osc.stop(now + 1.2);
        break;
      case 'success':
        osc.type = 'square';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.setValueAtTime(600, now + 0.1);
        osc.frequency.setValueAtTime(800, now + 0.2);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
        break;
      case 'epic':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.2);
        osc.frequency.setValueAtTime(1200, now + 0.4);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 1.0);
        osc.start(now);
        osc.stop(now + 1.0);
        break;
      case 'legendary':
        // Complex chord/sweep for exceedingly rare
        osc.type = 'square';
        const osc2 = ctx.createOscillator();
        const osc3 = ctx.createOscillator();
        osc2.type = 'sawtooth';
        osc3.type = 'triangle';
        
        osc2.connect(gainNode);
        osc3.connect(gainNode);
        
        osc.frequency.setValueAtTime(400, now);
        osc2.frequency.setValueAtTime(500, now);
        osc3.frequency.setValueAtTime(600, now);
        
        osc.frequency.exponentialRampToValueAtTime(1000, now + 1.5);
        osc2.frequency.exponentialRampToValueAtTime(1250, now + 1.5);
        osc3.frequency.exponentialRampToValueAtTime(1500, now + 1.5);
        
        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.linearRampToValueAtTime(0.2, now + 0.5);
        gainNode.gain.linearRampToValueAtTime(0, now + 2.0);
        
        osc.start(now);
        osc2.start(now);
        osc3.start(now);
        osc.stop(now + 2.0);
        osc2.stop(now + 2.0);
        osc3.stop(now + 2.0);
        break;
      case 'sell':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
    }
  } catch (e) {
    console.error("Audio error", e);
  }
}
