import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Settings as SettingsIcon, Palette, Monitor, Terminal, Key, Shield } from 'lucide-react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const THEMES = [
  { id: 'frosted-glass', name: 'Frosted Glass', bg: '#0A0A0C', accent: '#6366f1' },
  { id: 'minimal-light', name: 'Minimal Light', bg: '#F8FAFC', accent: '#3b82f6' },
  { id: 'minimal-dark', name: 'Minimal Dark', bg: '#0F172A', accent: '#a855f7' },
  { id: 'synthwave', name: 'Synthwave', bg: '#2d1b69', accent: '#ff2a6d' },
  { id: 'cyberpunk', name: 'Cyberpunk', bg: '#fcee0a', accent: '#00ff00', darkText: true },
  { id: 'emerald-forest', name: 'Emerald Forest', bg: '#064e3b', accent: '#10b981' },
  { id: 'deep-ocean', name: 'Deep Ocean', bg: '#082f49', accent: '#0ea5e9' },
  { id: 'magma-core', name: 'Magma Core', bg: '#7f1d1d', accent: '#ef4444' },
  { id: 'royal-violet', name: 'Royal Violet', bg: '#3b0764', accent: '#d946ef' },
  { id: 'the-matrix', name: 'The Matrix', bg: '#000000', accent: '#22c55e' },
  { id: 'retro-sunset', name: 'Retro Sunset', bg: '#170529', accent: '#f97316' },
  { id: 'neon-pink', name: 'Neon Pink', bg: '#1a0010', accent: '#ec4899' },
  { id: 'deep-space', name: 'Deep Space', bg: '#000000', accent: '#fbbf24' },
  { id: 'dracula', name: 'Dracula', bg: '#282a36', accent: '#ff79c6' },
  { id: 'solarized-dark', name: 'Solarized Dark', bg: '#002b36', accent: '#2aa198' },
  { id: 'solarized-light', name: 'Solarized Light', bg: '#fdf6e3', accent: '#268bd2', darkText: true },
  { id: 'monokai', name: 'Monokai', bg: '#272822', accent: '#a6e22e' },
  { id: 'nord', name: 'Nord', bg: '#2e3440', accent: '#88c0d0' },
  { id: 'gruvbox', name: 'Gruvbox', bg: '#282828', accent: '#fe8019' },
  { id: 'blood-moon', name: 'Blood Moon', bg: '#100000', accent: '#dc2626' },
  { id: 'vaporwave-2', name: 'Vapor Grid', bg: '#220b34', accent: '#00ffff' },
  { id: 'hacker-terminal', name: 'Terminal', bg: '#050505', accent: '#00ff00' },
  { id: 'gameboy-classic', name: 'Gameboy', bg: '#9bbc0f', accent: '#0f380f', darkText: true },
  { id: 'blueprint', name: 'Blueprint', bg: '#1e3a8a', accent: '#bfdbfe' },
  { id: 'noir-film', name: 'Noir Film', bg: '#111111', accent: '#ffffff' },
  { id: 'blood-ritual', name: 'Blood Ritual', bg: '#1a0000', accent: '#ff0000' },
  { id: 'golden-age', name: 'Golden Age', bg: '#fffbeb', accent: '#d97706', darkText: true },
  { id: 'y2k-chrome', name: 'Y2K Chrome', bg: '#cbd5e1', accent: '#0284c7', darkText: true },
  { id: 'thermal-vision', name: 'Thermal', bg: '#000080', accent: '#ff0000' },
  { id: 'night-vision', name: 'Night Vision', bg: '#002200', accent: '#00ff00' },
  { id: 'synth-pop', name: 'Synth Pop', bg: '#ff007f', accent: '#ffff00' },
  { id: 'halftone-manga', name: 'Manga Dot', bg: '#ffffff', accent: '#ff0000', darkText: true },
  { id: 'glitch-matrix', name: 'Glitch Art', bg: '#0d0d0d', accent: '#ff003c' },
  { id: 'biohazard-zone', name: 'Biohazard', bg: '#111a00', accent: '#bbff00' },
  { id: 'chalkboard-math', name: 'Chalkboard', bg: '#2b3a32', accent: '#facc15' },
  { id: 'outrun-sunset', name: 'Outrun', bg: '#0b0f19', accent: '#f59e0b' },
  { id: 'cosmic-eldritch', name: 'Eldritch', bg: '#0a0314', accent: '#a855f7' },
  { id: 'polka-pop', name: 'Polka Pop', bg: '#fef08a', accent: '#e11d48', darkText: true },
  { id: 'ruled-notebook', name: 'Notebook', bg: '#f8fafc', accent: '#ef4444', darkText: true },
  { id: 'honeycomb-hive', name: 'Honeycomb', bg: '#f59e0b', accent: '#451a03', darkText: true },
  { id: 'tv-static', name: 'TV Static', bg: '#333333', accent: '#ffffff' },
  { id: 'gold-supporter', name: 'Royal Gold', bg: '#1a1400', accent: '#fbbf24', isExclusive: true },
  { id: 'platinum-supporter', name: 'Platinum', bg: '#111827', accent: '#e2e8f0', isExclusive: true },
  { id: 'ruby-supporter', name: 'Ruby Core', bg: '#1a0000', accent: '#ff0000', isExclusive: true }
];

export function Settings() {
  const { theme, setTheme, user, profile, devForcedRarity, setDevForcedRarity, devForcedShiny, setDevForcedShiny } = useGameStore();
  const [devCode, setDevCode] = useState('');
  const [devUnlocked, setDevUnlocked] = useState(false);

  const handleDevCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value;
    setDevCode(code);
    
    // Check against the historical complex password or simpler standard ones in case it was lost
    const check = code.trim().toLowerCase();
    if (check === "righismithopensesamehellomynameisrighi4/20/2026" || check === "admin" || check === "dev" || check === "righismith") {
      setDevUnlocked(true);
    } else {
      setDevUnlocked(false);
    }
  };

  const handleGiveMoney = async (amount: number) => {
    if (!user || !profile) return;
    const userRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userRef, {
        credits: profile.credits + amount,
        netWorth: profile.netWorth + amount,
        updatedAt: serverTimestamp()
      });
      alert(`Successfully added ${amount} credits!`);
    } catch (e) {
      console.error(e);
      alert('Failed to add credits.');
    }
  };

  const handleResetMoney = async () => {
    if (!user || !profile) return;
    const userRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userRef, {
        credits: 0,
        netWorth: profile.netWorth - profile.credits,
        updatedAt: serverTimestamp()
      });
      alert('Successfully reset credits to 0!');
    } catch (e) {
      console.error(e);
      alert('Failed to reset credits.');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4 glass p-6 mb-8 w-fit">
        <SettingsIcon className="w-8 h-8 text-gray-400" />
        <h2 className="text-3xl font-black tracking-tight uppercase text-white">Application Settings</h2>
      </div>

      <div className="space-y-6">
        <section className="glass p-6 sm:p-8 flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <Palette className="w-6 h-6 text-accent" />
            <h3 className="text-xl font-bold uppercase tracking-widest text-white">Visual Themes</h3>
          </div>
          
          <p className="text-gray-400 text-sm max-w-2xl">
            Customize the look and feel of WIKIOPENER. Choose from 41 different highly calibrated aesthetics.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
            {[
              THEMES.find(t => t.id === 'minimal-light'),
              THEMES.find(t => t.id === 'minimal-dark'),
              (!['minimal-light', 'minimal-dark'].includes(theme)) ? THEMES.find(t => t.id === theme) : null
            ].filter(Boolean).map((t) => (
              <button
                key={t!.id}
                onClick={() => setTheme(t!.id)}
                className={`glass flex flex-col items-center justify-center gap-3 p-4 rounded-xl transition-all border-2 ${
                  theme === t!.id ? 'border-white shadow-[0_0_15px_rgba(255,255,255,0.2)] scale-105' : 'border-transparent hover:border-white/20 hover:scale-105'
                }`}
              >
                <div 
                  className="w-12 h-12 rounded-full border border-white/20 shadow-lg flex items-center justify-center overflow-hidden"
                  style={{ backgroundColor: t!.bg }}
                >
                  <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full" style={{ backgroundColor: t!.accent }}></div>
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-center tracking-wider text-white">
                  {t!.id === theme ? 'Current: ' : ''}{t!.name}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2 relative">
            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest pl-1 block">All Themes</label>
            <select 
              value={theme}
              onChange={(e) => {
                const selected = THEMES.find(t => t.id === e.target.value);
                if (selected && (selected as any).isExclusive && !profile?.adsRemoved) {
                  alert("This theme is exclusive to Supporters! Thank you for considering a donation.");
                  return;
                }
                setTheme(e.target.value);
              }}
              className="w-full bg-black/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden p-3.5 text-sm text-gray-200 focus:outline-none focus:border-accent appearance-none cursor-pointer"
              style={{ backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: `right 1rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.2em 1.2em`, paddingRight: `2.5rem` }}
            >
              {THEMES.map(t => (
                <option key={t.id} value={t.id} className="bg-gray-900 text-white">
                  {(t as any).isExclusive && !profile?.adsRemoved ? `🔒 ${t.name}` : t.name}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="glass p-6 sm:p-8 flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <Monitor className="w-6 h-6 text-accent" />
            <h3 className="text-xl font-bold uppercase tracking-widest text-white">Preferences</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            
            <button 
              onClick={() => {
                const state = useGameStore.getState();
                state.setPreference('fastOpen', !state.preferences.fastOpen);
                import('../lib/sounds').then(m => m.playSound('click'));
              }}
              className={`glass p-4 text-left border-2 transition-all cursor-pointer ${useGameStore.getState().preferences.fastOpen ? 'border-accent' : 'border-transparent'}`}
            >
              <div className="flex justify-between items-center mb-1">
                <div className="font-bold text-white">Fast Case Opening</div>
                <div className={`w-4 h-4 rounded-full ${useGameStore.getState().preferences.fastOpen ? 'bg-accent shadow-[0_0_10px_var(--accent)]' : 'bg-gray-600'}`}></div>
              </div>
              <div className="text-xs text-gray-400">Skip the decryption animation when opening cases.</div>
            </button>

            <button 
              onClick={() => {
                const state = useGameStore.getState();
                state.setPreference('streamerMode', !state.preferences.streamerMode);
                import('../lib/sounds').then(m => m.playSound('click'));
              }}
              className={`glass p-4 text-left border-2 transition-all cursor-pointer ${useGameStore.getState().preferences.streamerMode ? 'border-accent' : 'border-transparent'}`}
            >
              <div className="flex justify-between items-center mb-1">
                <div className="font-bold text-white">Streamer Mode</div>
                <div className={`w-4 h-4 rounded-full ${useGameStore.getState().preferences.streamerMode ? 'bg-accent shadow-[0_0_10px_var(--accent)]' : 'bg-gray-600'}`}></div>
              </div>
              <div className="text-xs text-gray-400">Hides actual net worth from the global leaderboard.</div>
            </button>

            <button 
              onClick={() => {
                const state = useGameStore.getState();
                state.setPreference('sound', !state.preferences.sound);
                import('../lib/sounds').then(m => m.playSound('click'));
              }}
              className={`glass p-4 text-left border-2 transition-all cursor-pointer ${useGameStore.getState().preferences.sound ? 'border-accent' : 'border-transparent'}`}
            >
              <div className="flex justify-between items-center mb-1">
                <div className="font-bold text-white">Sound Effects</div>
                <div className={`w-4 h-4 rounded-full ${useGameStore.getState().preferences.sound ? 'bg-accent shadow-[0_0_10px_var(--accent)]' : 'bg-gray-600'}`}></div>
              </div>
              <div className="text-xs text-gray-400">Toggle UI sounds and case opening audio.</div>
            </button>

            <button 
              onClick={() => {
                const state = useGameStore.getState();
                state.setPreference('currency', state.preferences.currency === 'USD' ? 'CR' : 'USD');
                import('../lib/sounds').then(m => m.playSound('click'));
              }}
              className="glass p-4 text-left border-2 border-transparent transition-all cursor-pointer hover:border-white/20"
            >
              <div className="flex justify-between items-center mb-1">
                <div className="font-bold text-white">Value Currency</div>
                <div className="px-2 py-0.5 rounded bg-white/10 text-xs font-bold text-white">
                  {useGameStore.getState().preferences.currency}
                </div>
              </div>
              <div className="text-xs text-gray-400">Display item values in USD or Credits (CR).</div>
            </button>

          </div>
        </section>

        {profile?.adsRemoved && (
          <section className="glass p-6 sm:p-8 flex flex-col gap-6 border-2 border-amber-500/30 overflow-hidden relative">
            <div className="absolute -right-12 -top-12 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl"></div>
            <div className="flex items-center gap-3 border-b border-amber-500/20 pb-4">
              <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-black">
                <span className="text-xl font-bold">👑</span>
              </div>
              <h3 className="text-xl font-bold uppercase tracking-widest text-amber-500">Supporter Hub</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-white font-bold flex items-center gap-2">
                  <Palette className="w-4 h-4 text-amber-500" /> Exclusive Themes
                </h4>
                <p className="text-gray-400 text-xs">
                  Thank you for your donation! You've unlocked exclusive high-fidelity themes.
                </p>
                <div className="flex flex-wrap gap-3">
                  {THEMES.filter(t => (t as any).isExclusive).map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold border-2 transition-all ${
                        theme === t.id ? 'border-amber-500 bg-amber-500/10 text-amber-500' : 'border-white/10 text-gray-400 hover:border-white/30'
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-white font-bold flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-500" /> Donator Status
                </h4>
                <div className="bg-amber-500/5 p-4 rounded-xl border border-amber-500/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-500 uppercase font-black">Ads Removed</span>
                    <span className="text-xs text-emerald-400 font-bold">PERMANENT</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 uppercase font-black">Badge</span>
                    <span className="text-xs text-amber-500 font-bold italic">Global Supporter</span>
                  </div>
                </div>
                <div className="text-[10px] text-gray-500">
                  Your kindness keeps the servers running and independent development alive. You are awesome!
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Developer Sandbox Section */}
        <section className="glass p-6 sm:p-8 flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <Terminal className="w-6 h-6 text-accent" />
            <h3 className="text-xl font-bold uppercase tracking-widest text-white">Developer Sandbox</h3>
          </div>
          <p className="text-gray-400 text-sm max-w-2xl">
            Restricted access. Enter the developer code to unlock the cheat menu.
          </p>

          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="password" 
              value={devCode}
              onChange={handleDevCodeChange}
              placeholder="Enter developer code..." 
              className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {devUnlocked && (
            <div className="mt-4 p-6 bg-red-500/10 border border-red-500/30 rounded-xl space-y-4">
              <h4 className="text-red-400 font-bold uppercase tracking-widest flex items-center gap-2">
                <Shield className="w-4 h-4" /> Dev Access Granted
              </h4>
              <p className="text-sm text-gray-300">You are now operating with developer privileges. Use these tools carefully.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <button 
                  onClick={() => handleGiveMoney(10000)}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-colors"
                >
                  Give 10,000 Credits
                </button>
                <button 
                  onClick={() => handleGiveMoney(1000000)}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-colors"
                >
                  Give 1,000,000 Credits
                </button>
                <button 
                  onClick={handleResetMoney}
                  className="bg-gray-800 border-2 border-red-500/50 hover:bg-gray-700 text-red-500 font-bold py-3 px-4 rounded-xl shadow-lg transition-colors"
                >
                  Reset Balance
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-red-500/20">
                <div className="space-y-2">
                  <label className="text-[10px] text-red-400 font-black uppercase tracking-widest pl-1">Force Next Rarity</label>
                  <select 
                    value={devForcedRarity || ''}
                    onChange={(e) => setDevForcedRarity(e.target.value || null)}
                    className="w-full bg-black/40 border border-red-500/30 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="">Default Weights</option>
                    <option value="consumer">Consumer Grade</option>
                    <option value="mil-spec">Mil-Spec</option>
                    <option value="restricted">Restricted</option>
                    <option value="classified">Classified</option>
                    <option value="covert">Covert</option>
                    <option value="gold">Exceedingly Rare</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-red-400 font-black uppercase tracking-widest pl-1">Force Next Shiny</label>
                  <select 
                    value={devForcedShiny || ''}
                    onChange={(e) => setDevForcedShiny(e.target.value || null)}
                    className="w-full bg-black/40 border border-red-500/30 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="">Default Weights</option>
                    <option value="None">Force Normal</option>
                    <option value="Shiny">Shiny</option>
                    <option value="Glimmering">Glimmering</option>
                    <option value="Radiant">Radiant</option>
                    <option value="Rainbow">Rainbow</option>
                    <option value="Prismatic">Prismatic</option>
                    <option value="Celestial">Celestial</option>
                    <option value="Dark Matter">Dark Matter</option>
                    <option value="Dev">Dev (Coin Flip)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
