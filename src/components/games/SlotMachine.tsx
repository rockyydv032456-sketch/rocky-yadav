import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { RotateCw, Sparkles, Trophy, Zap, Info } from 'lucide-react';
import { sound } from '../../utils/audio';

interface SlotMachineProps {
  balance: number;
  onBalanceChange: (newBalance: number) => void;
  onWin: (amount: number, game: string) => void;
  onOpenDeposit: () => void;
}

interface SlotSymbol {
  id: string;
  name: string;
  icon: string;
  multiplier: number;
  isWild?: boolean;
  isScatter?: boolean;
}

const SYMBOLS: SlotSymbol[] = [
  { id: 'everest', name: 'Mt. Everest', icon: '🏔️', multiplier: 50 },
  { id: 'khukuri', name: 'Golden Khukuri', icon: '🗡️', multiplier: 25, isWild: true },
  { id: 'crown', name: 'Royal Crown', icon: '👑', multiplier: 15 },
  { id: 'rhododendron', name: 'Lali Gurans', icon: '🌺', multiplier: 10, isScatter: true },
  { id: 'temple', name: 'Kathmandu Pagoda', icon: '🏯', multiplier: 8 },
  { id: 'yak', name: 'Himalayan Yak', icon: '🐂', multiplier: 5 },
  { id: 'coin', name: 'Gold Mohar', icon: '🪙', multiplier: 3 },
];

export const SlotMachine: React.FC<SlotMachineProps> = ({
  balance,
  onBalanceChange,
  onWin,
  onOpenDeposit,
}) => {
  const [betPerLine, setBetPerLine] = useState<number>(20);
  const [reels, setReels] = useState<string[][]>([
    ['everest', 'khukuri', 'crown'],
    ['temple', 'everest', 'yak'],
    ['coin', 'crown', 'everest'],
    ['rhododendron', 'temple', 'coin'],
    ['everest', 'khukuri', 'temple'],
  ]);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [freeSpinsLeft, setFreeSpinsLeft] = useState<number>(0);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [winMessage, setWinMessage] = useState<string | null>(null);
  const [showPaytable, setShowPaytable] = useState<boolean>(false);

  const linesCount = 10;
  const totalBet = freeSpinsLeft > 0 ? 0 : betPerLine * linesCount;

  const getRandomSymbol = () => {
    const rand = Math.random();
    if (rand < 0.05) return 'everest';
    if (rand < 0.12) return 'khukuri';
    if (rand < 0.22) return 'crown';
    if (rand < 0.35) return 'rhododendron';
    if (rand < 0.55) return 'temple';
    if (rand < 0.75) return 'yak';
    return 'coin';
  };

  const handleSpin = () => {
    if (freeSpinsLeft === 0 && balance < totalBet) {
      if (confirm('Insufficient balance. Would you like to deposit funds via eSewa QR?')) {
        onOpenDeposit();
      }
      return;
    }

    if (isSpinning) return;

    if (freeSpinsLeft > 0) {
      setFreeSpinsLeft((prev) => prev - 1);
    } else {
      sound.playChip();
      onBalanceChange(balance - totalBet);
    }

    setIsSpinning(true);
    setLastWin(null);
    setWinMessage(null);

    // Reel spin interval simulation
    let tickCount = 0;
    const interval = setInterval(() => {
      tickCount++;
      sound.playSlotStop();

      setReels([
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
      ]);

      if (tickCount > 10) {
        clearInterval(interval);
        finalizeSpin();
      }
    }, 120);
  };

  const finalizeSpin = () => {
    const finalReels = [
      [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
      [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
      [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
      [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
      [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
    ];

    setReels(finalReels);
    setIsSpinning(false);

    // Evaluate middle payline (center row across 5 reels)
    const centerRow = [finalReels[0][1], finalReels[1][1], finalReels[2][1], finalReels[3][1], finalReels[4][1]];
    const topRow = [finalReels[0][0], finalReels[1][0], finalReels[2][0], finalReels[3][0], finalReels[4][0]];
    const bottomRow = [finalReels[0][2], finalReels[1][2], finalReels[2][2], finalReels[3][2], finalReels[4][2]];

    let payout = 0;
    const hitLines: string[] = [];

    // Check lines helper
    const checkLine = (row: string[], lineName: string) => {
      const first = row[0];
      const matchCount = row.filter((sym) => sym === first || sym === 'khukuri').length;
      if (matchCount >= 3) {
        const symObj = SYMBOLS.find((s) => s.id === first) || SYMBOLS[0];
        const lineWin = betPerLine * symObj.multiplier * (matchCount === 5 ? 3 : matchCount === 4 ? 1.5 : 1);
        payout += lineWin;
        hitLines.push(`${lineName}: ${matchCount}x ${symObj.icon} ${symObj.name}`);
      }
    };

    checkLine(centerRow, 'Center Payline');
    checkLine(topRow, 'Top Payline');
    checkLine(bottomRow, 'Bottom Payline');

    // Scatter Check for Free Spins
    const allSymbols = finalReels.flat();
    const scatterCount = allSymbols.filter((s) => s === 'rhododendron').length;
    if (scatterCount >= 3) {
      setFreeSpinsLeft((prev) => prev + 10);
      hitLines.push(`🌺 10 FREE SPINS TRIGGERED!`);
    }

    setLastWin(payout);

    if (payout > 0) {
      sound.playWin();
      if (payout >= totalBet * 5) {
        sound.playJackpot();
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      }
      onBalanceChange(balance + payout);
      onWin(payout, 'Himalayan Treasures Slot');
      setWinMessage(`Won रू ${payout.toLocaleString('en-IN')}! ${hitLines.join(' · ')}`);
    } else if (scatterCount >= 3) {
      sound.playWin();
      setWinMessage(`Triggered 10 Free Spins!`);
    }
  };

  const getSymObj = (id: string) => SYMBOLS.find((s) => s.id === id) || SYMBOLS[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#171408] via-[#0f1b13] to-[#171408] border border-amber-500/25 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/20">
            🎰
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white font-display">
                Himalayan Treasures Slot
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                5-Reel · 10 Paylines · Free Spins
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Everest Peak Jackpot, Golden Khukuri Wilds, and Lali Gurans Scatters
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowPaytable(!showPaytable)}
          className="px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-xs text-slate-300 flex items-center gap-1.5 transition-colors"
        >
          <Info className="w-3.5 h-3.5 text-amber-400" />
          Paytable & Rules
        </button>
      </div>

      {/* Paytable Modal */}
      {showPaytable && (
        <div className="p-4 rounded-xl bg-[#06140e] border border-amber-500/30 text-xs text-slate-300 space-y-2 animate-fadeIn">
          <h4 className="font-bold text-amber-400">Paytable Multipliers:</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SYMBOLS.map((s) => (
              <div key={s.id} className="p-2 rounded-lg bg-black/40 border border-slate-800 flex items-center gap-2">
                <span className="text-xl">{s.icon}</span>
                <div>
                  <p className="font-bold text-white">{s.name}</p>
                  <p className="text-amber-400 font-mono">{s.multiplier}x line bet</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5-Reel Slot Machine Frame */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#211604] via-[#120d04] to-[#0a0702] border-4 border-[#593d0d] shadow-2xl overflow-hidden">
        
        {/* Jackpot Marquee Top Banner */}
        <div className="mb-6 p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-400/30 to-amber-500/20 border border-amber-400/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <span className="text-xs uppercase font-extrabold tracking-wider text-amber-300">
              ROYAL NEPAL PROGRESSIVE JACKPOT:
            </span>
          </div>
          <span className="text-xl font-black text-amber-300 font-mono-numbers">
            रू 1,485,250.00
          </span>
        </div>

        {/* Free Spins Alert */}
        {freeSpinsLeft > 0 && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/60 text-center animate-bounce">
            <span className="font-bold text-rose-300 text-xs uppercase tracking-wider">
              🔥 Free Spins Active: {freeSpinsLeft} Remaining (Cost रू 0!)
            </span>
          </div>
        )}

        {/* The 5 Reels Display */}
        <div className="grid grid-cols-5 gap-2 sm:gap-3 p-4 rounded-2xl bg-[#050402] border-2 border-amber-500/30 shadow-inner">
          {reels.map((reelColumn, cIdx) => (
            <div key={cIdx} className="space-y-2">
              {reelColumn.map((symId, rIdx) => {
                const s = getSymObj(symId);
                return (
                  <div
                    key={rIdx}
                    className={`aspect-square rounded-xl bg-gradient-to-b from-[#1c1810] to-[#0d0b07] border border-amber-500/20 flex flex-col items-center justify-center p-2 text-center transition-all ${
                      rIdx === 1 ? 'ring-2 ring-amber-400/60 shadow-lg' : ''
                    } ${isSpinning ? 'scale-95 blur-[0.5px]' : 'hover:scale-105'}`}
                  >
                    <span className="text-3xl sm:text-4xl filter drop-shadow-md">{s.icon}</span>
                    <span className="text-[10px] text-amber-300/80 font-semibold truncate max-w-full mt-1">
                      {s.name}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Win Announce */}
        {winMessage && (
          <div className="mt-4 p-3 rounded-xl bg-black/70 border border-amber-400 text-center animate-fadeIn">
            <span className="text-xs uppercase font-bold text-amber-400">WIN ALERT</span>
            <p className="text-base font-bold text-amber-300">{winMessage}</p>
          </div>
        )}

        {/* Spin & Bet Controls */}
        <div className="mt-6 pt-5 border-t border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Bet per line */}
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold text-slate-300">Bet / Line:</span>
            {[10, 20, 50, 100, 250].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => {
                  sound.playChip();
                  setBetPerLine(val);
                }}
                disabled={isSpinning || freeSpinsLeft > 0}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono-numbers transition-colors ${
                  betPerLine === val
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'bg-black/40 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                रू{val}
              </button>
            ))}
          </div>

          {/* Spin Button */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Spin Bet:</span>
              <p className="text-sm font-bold text-amber-400 font-mono-numbers">
                {freeSpinsLeft > 0 ? 'FREE' : `रू ${(betPerLine * linesCount).toLocaleString('en-IN')}`}
              </p>
            </div>

            <button
              type="button"
              onClick={handleSpin}
              disabled={isSpinning}
              className="px-8 py-3.5 rounded-xl font-black text-sm uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 shadow-xl shadow-amber-500/30 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>{isSpinning ? 'Spinning Reels...' : freeSpinsLeft > 0 ? `Free Spin (${freeSpinsLeft})` : 'SPIN REELS'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
