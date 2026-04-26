import { useState, FormEvent } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { loginWithGoogle, loginWithEmail, signUpWithEmail, logout } from '../lib/firebase';
import { Box, Trophy, Backpack, LogIn, LogOut, Coins, Settings, Gamepad2, Swords, Mail, Lock, Heart, ExternalLink, X, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { LiveDropTicker } from './LiveDropTicker';
import { JackpotDisplay } from './JackpotDisplay';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export function Layout() {
  const { user, profile, loading, preferences } = useGameStore();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processingState, setProcessingState] = useState<'idle' | 'processing' | 'success'>('idle');

  const handlePurchaseRemoveAds = async () => {
    setProcessingState('processing');
    setTimeout(async () => {
      window.open('https://ko-fi.com/energyvault', '_blank');
      setProcessingState('success');
      setTimeout(() => {
        setShowPaymentModal(false);
        setProcessingState('idle');
      }, 2000);
    }, 1500);
  };

  const handleEmailAuth = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please check your credentials.');
    }
  };

  const navLinks = [
    { name: 'Cases', path: '/', icon: Box },
    { name: 'Inventory', path: '/inventory', icon: Backpack },
    { name: 'Mini Games', path: '/minigames', icon: Gamepad2 },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  if (loading) {
    return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <>
      <div className="mesh-bg"></div>
      <LiveDropTicker />
      <div className="min-h-screen text-gray-100 flex flex-col font-sans p-4 sm:p-6 pt-2 sm:pt-4 gap-4 sm:gap-6 relative z-10 w-full max-w-7xl mx-auto">
        <JackpotDisplay />
        <header className="glass p-4 px-6 sm:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-10 md:top-14 z-50">
          <div className="flex items-center gap-4 justify-between md:justify-start">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-tr from-accent to-accent/50 rounded-lg flex items-center justify-center font-bold text-white shadow-lg">
                <Box className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">WIKI<span className="text-accent">OPENER</span></h1>
            </div>
            {/* Mobile Nav Toggle can go here if needed, keeping simple for now */}
          </div>
          
          <nav className="flex gap-4 md:gap-6 text-sm text-gray-400 font-medium overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap transition-colors",
                  location.pathname === link.path 
                    ? "text-white border-b-2 border-accent pb-1" 
                    : "hover:text-white pb-1"
                )}
              >
                <link.icon className="w-4 h-4" />
                <span>{link.name}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4 md:gap-6 justify-between md:justify-end">
            {profile?.adsRemoved ? (
              <div className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-600 text-black px-4 py-2 rounded-full font-black text-xs shadow-lg uppercase tracking-tighter">
                <span className="text-sm">👑</span>
                <span>Supporter</span>
              </div>
            ) : (
              <button 
                onClick={() => setShowPaymentModal(true)}
                className="flex items-center gap-2 bg-[#FF5E5B] hover:bg-[#FF5E5B]/90 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg transition-transform hover:scale-105"
              >
                <img src="https://storage.ko-fi.com/cdn/cup-border.png" alt="Ko-fi" className="w-5 h-5 drop-shadow-sm" />
                <span className="hidden sm:inline">Support Me</span>
              </button>
            )}

            {user && profile ? (
              <div className="flex items-center gap-4 md:gap-6">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Balance</span>
                  <span className="text-lg font-mono text-emerald-400">
                    {preferences.streamerMode ? (
                      <span className="opacity-50 blur-sm select-none">HIDDEN</span>
                    ) : (
                      preferences.currency === 'CR' ? 
                        `${profile.credits.toLocaleString()} CR` : 
                        `$${profile.credits.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <img src={profile.photoURL || 'https://images.unsplash.com/photo-1531297172867-4f50fe567361?auto=format&fit=crop&q=80&w=40&h=40'} alt="Avatar" className="w-10 h-10 rounded-full border border-gray-700 shadow-lg" referrerPolicy="no-referrer" />
                  <button onClick={() => {
                    if (user.uid === 'dev-studio-user') {
                      localStorage.removeItem('dev-mock-profile');
                      localStorage.removeItem('dev-mock-inventory');
                      window.location.reload();
                    } else {
                      logout();
                    }
                  }} className="text-gray-400 hover:text-white transition-colors" title="Log Out">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={loginWithGoogle}
                className="bg-accent hover:brightness-110 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-2 transition-all transform hover:scale-105"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 flex flex-col overflow-hidden">
          {!user && !['/about', '/legal'].includes(location.pathname) ? (
            <div className="flex-1 glass flex flex-col items-center justify-center text-center space-y-6 p-8 relative overflow-hidden">
              {/* Added Legal/TOS disclaimer to home sign in page for compliance */}
              <div className="w-24 h-24 bg-gradient-to-tr from-accent to-accent/50 rounded-3xl flex items-center justify-center shadow-2xl mb-4">
                <Box className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white uppercase z-10">WIKI<span className="text-accent">OPENER</span></h1>
              <p className="text-gray-400 max-w-md text-lg z-10">
                Sign in to open cases containing randomly generated Wikipedia artifacts. Trade them, build your net worth, and climb the leaderboard.
              </p>
              
              <div className="flex flex-col items-center gap-4 z-10 mt-4 w-full max-w-sm">
                
                <form onSubmit={handleEmailAuth} className="flex flex-col gap-3 w-full bg-black/40 p-4 rounded-2xl border border-white/10">
                  {authError && (
                    <div className="text-red-400 text-xs bg-red-400/10 p-2 rounded border border-red-400/20 text-center">
                      {authError}
                    </div>
                  )}
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="email" 
                      required
                      placeholder="Email Address" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="password" 
                      required
                      placeholder="Password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-3 bg-accent hover:brightness-110 text-white rounded-lg font-bold transition-all shadow-lg text-sm mt-1"
                  >
                    {isSignUp ? 'Create Account' : 'Sign In'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setIsSignUp(!isSignUp); setAuthError(''); }}
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
                  </button>
                </form>

                <div className="flex items-center w-full gap-4 py-2">
                   <div className="h-px bg-white/10 flex-1"></div>
                   <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">OR</span>
                   <div className="h-px bg-white/10 flex-1"></div>
                </div>

                <button 
                  onClick={loginWithGoogle}
                  className="w-full flex justify-center items-center space-x-2 bg-white text-black hover:bg-gray-200 px-8 py-3 rounded-xl font-black text-sm shadow-xl uppercase tracking-tighter transition-all transform hover:scale-105"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Continue with Google</span>
                </button>
                <div className="text-xs text-gray-500 mt-2 max-w-sm text-center">
                  By logging in, you agree to our <Link to="/legal#terms" className="text-accent hover:underline">Terms of Service</Link> and <Link to="/legal#privacy" className="text-accent hover:underline">Privacy Policy</Link>. This is a simulator with no real-world cash value.
                </div>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>

        {/* Global Footer for AdSense navigation compliance */}
        <footer className="mt-auto py-6 border-t border-white/10 text-center flex flex-col md:flex-row items-center justify-between gap-4 px-4">
           <div className="text-xs text-gray-500">
             &copy; {new Date().getFullYear()} WikiOpener. All rights reserved. <br className="md:hidden" />
             Not affiliated with Wikipedia or Valve Corp.
           </div>
           
           <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium">
             <button
               onClick={() => {
                 if (!profile) return;
                 alert("You have found the secret case! To proceed, you must have 1 billion dollars");
                 if (profile.credits >= 1000000000) {
                   useGameStore.getState().setSecretUnlocked(true);
                   alert("Success! The Sovereign Reliquary has been unlocked on your Cases page.");
                 }
               }}
               className="w-1 h-1 opacity-0 cursor-default"
               aria-hidden="true"
             >
               _
             </button>
             <Link to="/about" className="text-gray-400 hover:text-accent transition-colors">About / How to Play</Link>
             <Link to="/legal#privacy" className="text-gray-400 hover:text-accent transition-colors">Privacy Policy</Link>
             <Link to="/legal#terms" className="text-gray-400 hover:text-accent transition-colors">Terms of Service</Link>
             <Link to="/legal#disclaimer" className="text-gray-400 hover:text-accent transition-colors">Disclaimer</Link>
             <Link to="/legal#cookies" className="text-gray-400 hover:text-accent transition-colors">Cookie Policy</Link>
             <Link to="/legal#contact" className="text-gray-400 hover:text-accent transition-colors">Contact Us</Link>
           </div>
        </footer>
      </div>
      
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-black/90 max-w-md w-full rounded-3xl p-6 md:p-8 flex flex-col relative border-2 border-accent/20 shadow-2xl">
            <button 
              onClick={() => {
                if (processingState !== 'processing') setShowPaymentModal(false);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white mb-2">Support Development</h2>
            <p className="text-gray-400 text-sm mb-6">
              I am an independent developer. Your support goes directly into improving the app! As a special bonus, donating automatically <strong>removes all ads</strong> permanently!
            </p>

            {processingState === 'idle' && (
              <div className="space-y-3">
                <a 
                  href="https://ko-fi.com/energyvault"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowPaymentModal(false)}
                  className="w-full flex items-center p-4 rounded-xl border border-white/10 bg-[#FF5E5B]/10 hover:bg-[#FF5E5B]/20 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#FF5E5B] flex items-center justify-center mr-4 shadow-lg shrink-0 group-hover:scale-110 transition-transform">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-white text-sm">Donate on Ko-fi</div>
                    <div className="text-[10px] text-gray-400">Support the app and get Supporter status!</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-white" />
                </a>
                <div className="text-[10px] text-gray-500 text-center mt-4">
                   (Note: Since this is an external service, you will need to manually grant yourself Supporter Status in the Settings menu after donating!)
                </div>
              </div>
            )}

            {processingState === 'processing' && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
                <div className="font-bold text-white animate-pulse">Waiting for Ko-fi confirmation...</div>
              </div>
            )}

            {processingState === 'success' && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                  <span className="text-3xl mb-1">🎉</span>
                </div>
                <div className="font-black text-xl text-emerald-400 uppercase tracking-widest text-center">Thanks for donating!</div>
                <div className="text-sm text-gray-400 mt-2 text-center">Because of your kindness, we've gotten rid of your ads for you! Opening Ko-fi...</div>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}
