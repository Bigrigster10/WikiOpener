import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Coins, PackageOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { playSound } from '../lib/sounds';

export function Inventory() {
  const { inventory, sellItem, preferences } = useGameStore();
  const [sellingId, setSellingId] = useState<string | null>(null);

  const handleSell = async (itemId: string, value: number) => {
    setSellingId(itemId);
    playSound('sell');
    await sellItem(itemId, value);
    setSellingId(null);
  };

  const rarityColorMap: Record<string, string> = {
    'Consumer Grade': 'text-gray-400 border-gray-400/20 shadow-gray-400/5',
    'Mil-Spec': 'text-blue-500 border-blue-500/20 shadow-blue-500/10',
    'Restricted': 'text-purple-500 border-purple-500/20 shadow-purple-500/10',
    'Classified': 'text-pink-500 border-pink-500/20 shadow-pink-500/20',
    'Covert': 'text-red-500 border-red-500/30 shadow-red-500/20',
    'Exceedingly Rare': 'text-yellow-400 border-yellow-400/40 shadow-yellow-400/20 ring-1 ring-yellow-400/20',
  };

  if (inventory.length === 0) {
    return (
      <div className="flex-1 glass flex flex-col items-center justify-center text-center space-y-6 p-12 max-w-2xl mx-auto my-12 w-full">
        <PackageOpen className="w-24 h-24 text-gray-700 drop-shadow-xl" />
        <h2 className="text-2xl font-bold text-gray-400 tracking-tight uppercase">Your inventory is empty</h2>
        <Link to="/" className="bg-white text-black px-8 py-3 rounded-xl font-black uppercase tracking-widest text-sm shadow-xl transition-transform hover:scale-105">
          Open Some Cases
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 w-full max-w-7xl mx-auto overflow-y-auto pr-2">
      <div className="flex items-center justify-between glass p-4 px-6 sticky top-0 z-20">
        <div>
          <h2 className="text-xl font-bold tracking-tight uppercase text-white">Inventory <span className="text-accent">Collection</span></h2>
        </div>
        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest bg-black/20 px-3 py-1.5 rounded-md border border-white/5">
          {inventory.length} items
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {inventory.map((item) => {
          const colorClass = rarityColorMap[item.rarity] || 'border-gray-700 shadow-transparent';
          const isSelling = sellingId === item.id;
          return (
            <div key={item.id} className={`glass overflow-hidden flex flex-col relative group transition-transform hover:scale-105 hover:z-10 shadow-lg ${colorClass}`}>
              <div className="h-32 bg-black/20 flex items-center justify-center p-3 relative">
                <img src={item.image} alt={item.title} loading="lazy" decoding="async" className="max-h-full object-contain drop-shadow-lg z-10" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c]/80 to-transparent mix-blend-overlay"></div>
              </div>
              <div className="p-3 flex flex-col flex-1 bg-white/5 border-t border-white/5">
                <div className="flex-1">
                  <div className={`text-[10px] font-black uppercase tracking-wider opacity-90 truncate ${rarityColorMap[item.rarity]?.split(' ')[0]}`}>{item.rarity}</div>
                  <h4 className="font-bold text-sm leading-tight text-white truncate mt-1" title={item.title}>{item.title}</h4>
                  <div className="text-[10px] text-gray-400 mt-1 truncate font-mono bg-black/20 inline-block px-1.5 py-0.5 rounded border border-white/5">{item.wear}</div>
                </div>
                
                <div className="mt-4 flex items-center justify-between bg-black/30 p-2 rounded-lg border border-white/5">
                  <div className="flex items-center space-x-1 text-emerald-400 text-sm font-bold font-mono">
                    {preferences.currency === 'CR' ? (
                      <span>{item.value.toLocaleString()} CR</span>
                    ) : (
                      <span>${item.value.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    )}
                  </div>
                  <button 
                    disabled={isSelling}
                    onClick={() => item.id && handleSell(item.id, item.value)}
                    className="text-[10px] uppercase font-bold px-3 py-1.5 bg-red-500/20 hover:bg-red-500 hover:text-white text-red-300 rounded border border-red-500/30 transition-colors disabled:opacity-50 tracking-widest"
                  >
                    {isSelling ? '...' : 'Sell'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
