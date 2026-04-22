import { Link, Outlet, useLocation } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { loginWithGoogle, logout } from '../lib/firebase';
import { Box, Trophy, Backpack, LogIn, LogOut, Coins, Settings } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export function Layout() {
  const { user, profile, loading, preferences } = useGameStore();
  const location = useLocation();

  const navLinks = [
    { name: 'Cases', path: '/', icon: Box },
    { name: 'Inventory', path: '/inventory', icon: Backpack },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  if (loading) {
    return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <>
      <div className="mesh-bg"></div>
      <div className="min-h-screen text-gray-100 flex flex-col font-sans p-4 sm:p-6 gap-6 relative z-10 w-full max-w-7xl mx-auto">
        <header className="glass p-4 px-6 sm:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 md:top-4 z-50">
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
            <a 
              href="https://ko-fi.com/energyvault" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-2 bg-[#FF5E5B] hover:bg-[#FF5E5B]/90 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg transition-transform hover:scale-105"
            >
              <img src="https://storage.ko-fi.com/cdn/cup-border.png" alt="Ko-fi" className="w-5 h-5 drop-shadow-sm" />
              <span className="hidden sm:inline">Support Me</span>
            </a>

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
              
              <div className="flex flex-col items-center gap-3 z-10 mt-4">
                <button 
                  onClick={loginWithGoogle}
                  className="flex items-center space-x-2 bg-white text-black hover:bg-gray-200 px-8 py-4 rounded-xl font-black text-lg shadow-xl uppercase tracking-tighter transition-all transform hover:scale-105"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Login with Google</span>
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
             <Link to="/about" className="text-gray-400 hover:text-accent transition-colors">About / How to Play</Link>
             <Link to="/legal#privacy" className="text-gray-400 hover:text-accent transition-colors">Privacy Policy</Link>
             <Link to="/legal#terms" className="text-gray-400 hover:text-accent transition-colors">Terms of Service</Link>
             <Link to="/legal#disclaimer" className="text-gray-400 hover:text-accent transition-colors">Disclaimer</Link>
             <Link to="/legal#cookies" className="text-gray-400 hover:text-accent transition-colors">Cookie Policy</Link>
             <Link to="/legal#contact" className="text-gray-400 hover:text-accent transition-colors">Contact Us</Link>
           </div>
        </footer>
      </div>
    </>
  );
}
