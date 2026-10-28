import React, { useState, useEffect } from 'react';
import { Trophy, Flame } from 'lucide-react';
import { LiveWinner } from '../types';

export const LiveWinnersTicker: React.FC = () => {
  const [winners, setWinners] = useState<LiveWinner[]>([
    { id: '1', name: 'Rohan Shrestha', city: 'Kathmandu', game: 'Aviator (Everest Flight)', amount: 48500, timeAgo: '2m ago' },
    { id: '2', name: 'Bishal Gurung', city: 'Pokhara', game: 'Langur Burja', amount: 15200, timeAgo: '4m ago' },
    { id: '3', name: 'Pooja Thapa', city: 'Lalitpur', game: 'Teen Patti Royale', amount: 32000, timeAgo: '6m ago' },
    { id: '4', name: 'Deepak KC', city: 'Butwal', game: 'Himalayan Slot', amount: 89000, timeAgo: '8m ago' },
    { id: '5', name: 'Kavita Rai', city: 'Dharan', game: 'Kathmandu Roulette', amount: 24500, timeAgo: '11m ago' },
  ]);

  // Periodically insert fresh simulated wins from Nepal players
  useEffect(() => {
    const interval = setInterval(() => {
      const cities = ['Kathmandu', 'Pokhara', 'Chitwan', 'Biratnagar', 'Hetauda', 'Bhaktapur', 'Dharan', 'Itahari'];
      const names = ['Aayush K.', 'Prakash B.', 'Santosh M.', 'Sunita P.', 'Suman T.', 'Gopal D.', 'Manisha S.'];
      const games = ['Langur Burja', 'Aviator Crash', 'Teen Patti', 'Roulette #17', 'Everest Slot'];
      const amounts = [12500, 28000, 45000, 16000, 62000, 95000, 140000];

      const newWinner: LiveWinner = {
        id: Date.now().toString(),
        name: names[Math.floor(Math.random() * names.length)],
        city: cities[Math.floor(Math.random() * cities.length)],
        game: games[Math.floor(Math.random() * games.length)],
        amount: amounts[Math.floor(Math.random() * amounts.length)],
        timeAgo: 'Just now',
      };

      setWinners((prev) => [newWinner, ...prev.slice(0, 7)]);
    }, 18000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-[#05110c] border-y border-amber-500/20 py-2.5 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        
        {/* Ticker Lead */}
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 shrink-0">
          <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
          <span className="uppercase tracking-wider">Live Real-Money Payouts:</span>
        </div>

        {/* Scrolling Items */}
        <div className="flex items-center gap-6 overflow-x-auto text-xs whitespace-nowrap scrollbar-none py-0.5">
          {winners.map((w) => (
            <div key={w.id} className="flex items-center gap-2 text-slate-300 shrink-0 bg-[#091a13] px-3 py-1 rounded-full border border-slate-800">
              <span className="font-semibold text-white">{w.name}</span>
              <span className="text-[11px] text-slate-400">({w.city})</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">{w.game}</span>
              <span className="text-emerald-400 font-bold font-mono-numbers">
                +रू {w.amount.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-500">{w.timeAgo}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
