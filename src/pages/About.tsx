import { Box, Code, Sparkles, Server } from 'lucide-react';
import { Link } from 'react-router-dom';

export function About() {
  return (
    <div className="flex-1 glass overflow-y-auto w-full">
      <div className="max-w-4xl mx-auto p-6 sm:p-10 space-y-12">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-tr from-accent to-accent/50 rounded-2xl flex items-center justify-center shadow-xl mx-auto mb-6">
            <Box className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tight">About Wiki<span className="text-accent">Opener</span></h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            A totally free, educational loot box simulator powered by random Wikipedia articles.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-black/30 border border-white/5 p-6 rounded-2xl">
            <Sparkles className="w-8 h-8 text-yellow-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">The Concept</h3>
            <p className="text-sm text-gray-400">
              We took the thrilling mechanics of traditional case opening simulators and replaced the vanity skins with actual knowledge. Every "drop" is a randomly selected, real article pulled directly from the Wikipedia API.
            </p>
          </div>

          <div className="bg-black/30 border border-white/5 p-6 rounded-2xl">
            <Code className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">How It Works</h3>
            <p className="text-sm text-gray-400">
              When you open a case, the game engine rolls for a rarity tier (from Consumer Grade to Exceedingly Rare). It then queries the Wikipedia API for a random article, calculating a dynamic "market value" based on the article's length, views, and generated rarity.
            </p>
          </div>

          <div className="bg-black/30 border border-white/5 p-6 rounded-2xl">
            <Server className="w-8 h-8 text-emerald-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Total Simulation</h3>
            <p className="text-sm text-gray-400">
              WikiOpener requires no real money to play. All progression, cases, and leaderboards use a simulated virtual currency that has strictly zero real-world value.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-accent/20 to-transparent border border-accent/20 rounded-2xl p-8 text-center space-y-6">
          <h2 className="text-2xl font-bold text-white">How To Play</h2>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="space-y-2">
              <div className="text-accent font-black text-xl">01</div>
              <h4 className="text-white font-bold">Sign In</h4>
              <p className="text-xs text-gray-400">Log in with a Google account to save your inventory and track your net worth.</p>
            </div>
            <div className="space-y-2">
              <div className="text-accent font-black text-xl">02</div>
              <h4 className="text-white font-bold">Open Cases</h4>
              <p className="text-xs text-gray-400">Use your starter balance to unbox regular or CS:GO patterned cases.</p>
            </div>
            <div className="space-y-2">
              <div className="text-accent font-black text-xl">03</div>
              <h4 className="text-white font-bold">Watch Ads</h4>
              <p className="text-xs text-gray-400">If you run out of money, watch a rewarded ad every 3 hours to unlock extreme high-value Premium Cases.</p>
            </div>
            <div className="space-y-2">
              <div className="text-accent font-black text-xl">04</div>
              <h4 className="text-white font-bold">Trade Up</h4>
              <p className="text-xs text-gray-400">Sell your unpacked articles on the simulated market to afford more expensive cases and climb the leaderboard.</p>
            </div>
          </div>

          <div className="pt-6">
            <Link to="/" className="inline-block bg-accent hover:bg-accent/90 text-white font-bold px-8 py-3 rounded-full transition-transform hover:scale-105 shadow-lg">
              Start Playing Now
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
