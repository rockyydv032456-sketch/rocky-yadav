import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, RotateCcw, Volume2, Info, Flame, Trophy } from 'lucide-react';
import { LangurBurjaSymbol } from '../../types';
import { sound } from '../../utils/audio';

interface LangurBurjaProps {
  balance: number;
  onBalanceChange: (newBalance: number) => void;
  onWin: (amount: number, game: string) => void;
  onOpenDeposit: () => void;
}

const SYMBOLS: LangurBurjaSymbol[] = [
  { id: 'jhanda', nameNepali: 'झण्डा', nameEnglish: 'Flag', icon: '🚩', color: 'from-blue-600 to-indigo-700' },
  { id: 'burja', nameNepali: 'बुर्जा', nameEnglish: 'Crown', icon: '👑', color: 'from-amber-500 to-yellow-600' },
  { id: 'itta', nameNepali: 'ईट्टा', nameEnglish: 'Diamond', icon: '♦️', color: 'from-rose-600 to-red-700' },
  { id: 'paan', nameNepali: 'पान', nameEnglish: 'Heart', icon: '♥️', color: 'from-red-600 to-pink-700' },
  { id: 'chiri', nameNepali: 'चिडी', nameEnglish: 'Club', icon: '♣️', color: 'from-emerald-600 to-teal-700' },
  { id: 'hukum', nameNepali: 'हुकुम', nameEnglish: 'Spade', icon: '♠️', color: 'from-slate-700 to-slate-900' },
];

const CHIP_VALUES = [50, 100, 250, 500, 1000, 5000];

export const LangurBurja: React.FC<LangurBurjaProps> = ({
  balance,
  onBalanceChange,
  onWin,
  onOpenDeposit,
}) => {
  const [bets, setBets] = useState<Record<string, number>>({
    jhanda: 0,
    burja: 0,
    itta: 0,
    paan: 0,
    chiri: 0,
    hukum: 0,
  });
  const [selectedChip, setSelectedChip] = useState<number>(100);
  const [diceResults, setDiceResults] = useState<string[]>(['jhanda', 'burja', 'itta', 'paan', 'chiri', 'hukum']);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [lastWinSummary, setLastWinSummary] = useState<{ winAmount: number; breakdown: string[] } | null>(null);
  const [rollHistory, setRollHistory] = useState<string[][]>([]);
  const [showRules, setShowRules] = useState<boolean>(false);

  const totalBet = Object.values(bets).reduce((a, b) => a + b, 0);

  const handlePlaceBet = (symbolId: string) => {
    if (balance < selectedChip) {
      sound.playClick();
      if (confirm('Insufficient balance. Would you like to deposit funds via eSewa QR?')) {
        onOpenDeposit();
      }
      return;
    }
    sound.playChip();
    setBets((prev) => ({
      ...prev,
      [symbolId]: prev[symbolId] + selectedChip,
    }));
    onBalanceChange(balance - selectedChip);
  };

  const handleClearBets = () => {
    if (totalBet > 0 && !isRolling) {
      sound.playClick();
      onBalanceChange(balance + totalBet);
      setBets({
        jhanda: 0,
        burja: 0,
        itta: 0,
        paan: 0,
        chiri: 0,
        hukum: 0,
      });
    }
  };

  const handleRollDice = () => {
    if (totalBet === 0) {
      alert('Please place a bet on at least one symbol before rolling.');
      return;
    }
    if (isRolling) return;

    setIsRolling(true);
    setLastWinSummary(null);
    sound.playDiceRoll();

    // Roll animation interval
    let rollTicks = 0;
    const interval = setInterval(() => {
      rollTicks++;
      const randomDice = Array.from({ length: 6 }, () => {
        const idx = Math.floor(Math.random() * SYMBOLS.length);
        return SYMBOLS[idx].id;
      });
      setDiceResults(randomDice);

      if (rollTicks > 12) {
        clearInterval(interval);
        // Determine final outcome
        const finalDice = Array.from({ length: 6 }, () => {
          const idx = Math.floor(Math.random() * SYMBOLS.length);
          return SYMBOLS[idx].id;
        });
        setDiceResults(finalDice);
        evaluateRoll(finalDice);
        setIsRolling(false);
      }
    }, 100);
  };

  const evaluateRoll = (rolledDice: string[]) => {
    // Count occurrences of each symbol
    const counts: Record<string, number> = {};
    rolledDice.forEach((sym) => {
      counts[sym] = (counts[sym] || 0) + 1;
    });

    let totalPayout = 0;
    const breakdown: string[] = [];

    Object.entries(bets).forEach(([symId, betAmount]) => {
      if (betAmount > 0) {
        const count = counts[symId] || 0;
        const sym = SYMBOLS.find((s) => s.id === symId)!;
        if (count >= 2) {
          // Traditional rule: 2 dice = 2x bet + original bet; 3 dice = 3x bet + original bet, etc.
          const payout = betAmount * (count + 1);
          totalPayout += payout;
          breakdown.push(`${count}x ${sym.icon} ${sym.nameNepali} → Won रू ${payout.toLocaleString('en-IN')}`);
        } else if (count === 1) {
          breakdown.push(`1x ${sym.icon} ${sym.nameNepali} (No win, min 2 needed)`);
        } else {
          breakdown.push(`0x ${sym.icon} ${sym.nameNepali} (Lost)`);
        }
      }
    });

    setRollHistory((prev) => [rolledDice, ...prev.slice(0, 7)]);

    if (totalPayout > 0) {
      sound.playWin();
      if (totalPayout >= totalBet * 3) {
        sound.playJackpot();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
      onBalanceChange(balance + totalPayout);
      onWin(totalPayout, 'Langur Burja (Jhandi Munda)');
    }

    setLastWinSummary({
      winAmount: totalPayout,
      breakdown,
    });

    // Reset current bets for next round
    setBets({
      jhanda: 0,
      burja: 0,
      itta: 0,
      paan: 0,
      chiri: 0,
      hukum: 0,
    });
  };

  const getSymbol = (id: string) => SYMBOLS.find((s) => s.id === id) || SYMBOLS[0];

  return (
    <div className="space-y-6">
      {/* Game Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#0c241a] via-[#091a13] to-[#0c241a] border border-amber-500/25 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/20">
            🎲
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white font-display">
                Langur Burja
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                झण्डा बुर्जा (Jhandi Munda)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Nepal's historic festival 6-dice game · 2+ matching symbols win up to 6x payout!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRules(!showRules)}
            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-xs text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <Info className="w-3.5 h-3.5 text-amber-400" />
            Rules & Payouts
          </button>
        </div>
      </div>

      {/* Rules Explainer Dropdown */}
      {showRules && (
        <div className="p-4 rounded-xl bg-[#06140e] border border-amber-500/30 text-xs space-y-2 text-slate-300 animate-fadeIn">
          <h4 className="font-bold text-amber-300">How to Play Langur Burja (खेलका नियमहरू):</h4>
          <p>
            1. Place your bet chips on any of the 6 symbols (Flag, Crown, Diamond, Heart, Club, Spade).
          </p>
          <p>
            2. Six 6-sided dice with these symbols are rolled inside the wooden bowl.
          </p>
          <p>
            3. Payout Calculation:
            <br />
            • <strong>2 Dice Match</strong>: 2x your bet + return original bet (3x total)
            <br />
            • <strong>3 Dice Match</strong>: 3x your bet + return original bet (4x total)
            <br />
            • <strong>4 Dice Match</strong>: 4x your bet + return original bet (5x total)
            <br />
            • <strong>5 Dice Match</strong>: 5x your bet + return original bet (6x total)
            <br />
            • <strong>6 Dice Match (Everest Jackpot)</strong>: 6x your bet + return original bet!
          </p>
        </div>
      )}

      {/* Main Table Arena */}
      <div className="relative p-6 rounded-3xl bg-gradient-to-b from-[#851616] via-[#651010] to-[#480a0a] border-4 border-[#2b0505] shadow-2xl overflow-hidden">
        {/* Felt Texture Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        {/* Dice Rolling Arena */}
        <div className="relative z-10 mb-8 p-6 rounded-2xl bg-black/40 border border-amber-500/30 backdrop-blur-md">
          <div className="text-center mb-4">
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
              {isRolling ? 'पासा घुम्दै छ... Rolling 6 Sacred Dice' : 'Current Roll Outcome (परिणाम)'}
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 max-w-xl mx-auto">
            {diceResults.map((dieId, index) => {
              const sym = getSymbol(dieId);
              return (
                <div
                  key={index}
                  className={`aspect-square rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-400 shadow-xl flex flex-col items-center justify-center p-2 text-slate-900 transition-all transform ${
                    isRolling ? 'rotate-12 scale-95 animate-bounce' : 'hover:scale-105'
                  }`}
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <span className="text-3xl sm:text-4xl filter drop-shadow-sm">{sym.icon}</span>
                  <span className="text-[10px] font-extrabold tracking-tight mt-1 text-slate-800">
                    {sym.nameNepali}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Win Announcement */}
          {lastWinSummary && (
            <div className="mt-4 p-3 rounded-xl bg-black/60 border border-amber-400/40 text-center animate-fadeIn">
              {lastWinSummary.winAmount > 0 ? (
                <div>
                  <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">
                    🎉 बधाई छ! Total Won
                  </span>
                  <p className="text-2xl font-black text-amber-300 font-mono-numbers">
                    + रू {lastWinSummary.winAmount.toLocaleString('en-IN')}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-1 text-[11px] text-emerald-400">
                    {lastWinSummary.breakdown.filter((b) => b.includes('Won')).map((b, i) => (
                      <span key={i} className="bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-rose-300">
                  Better luck next roll! Min 2 matching symbols needed to win.
                </p>
              )}
            </div>
          )}
        </div>

        {/* 6 Betting Spots (The Traditional Langur Burja Grid) */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 gap-4">
          {SYMBOLS.map((sym) => {
            const betAmount = bets[sym.id] || 0;
            return (
              <div
                key={sym.id}
                onClick={() => handlePlaceBet(sym.id)}
                className={`group relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 select-none ${
                  betAmount > 0
                    ? 'border-amber-400 bg-black/70 shadow-lg shadow-amber-500/20'
                    : 'border-white/20 bg-black/40 hover:border-amber-400/60 hover:bg-black/50'
                }`}
              >
                {/* Chip Badge if bet placed */}
                {betAmount > 0 && (
                  <div className="absolute -top-3 -right-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-black text-xs font-mono-numbers shadow-lg border border-amber-300 flex items-center gap-1">
                    <span>रू {betAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${sym.color} flex items-center justify-center text-3xl shadow-md border border-white/20 shrink-0 group-hover:scale-105 transition-transform`}>
                    {sym.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight leading-tight">
                      {sym.nameEnglish}
                    </h3>
                    <p className="text-xs font-semibold text-amber-300">
                      {sym.nameNepali}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Click to add रू {selectedChip}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Chip Controls & Action Buttons */}
        <div className="relative z-10 mt-8 pt-6 border-t border-white/15 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Chip Value Selectors */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1">
            <span className="text-xs uppercase font-bold text-amber-300 shrink-0 mr-1">Chip:</span>
            {CHIP_VALUES.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => {
                  sound.playChip();
                  setSelectedChip(val);
                }}
                className={`w-12 h-12 rounded-full font-black text-xs shrink-0 flex items-center justify-center border-2 transition-all font-mono-numbers shadow-lg ${
                  selectedChip === val
                    ? 'border-white bg-amber-400 text-slate-950 scale-110 ring-4 ring-amber-500/40'
                    : 'border-amber-400/50 bg-[#1a0808] text-amber-300 hover:scale-105'
                }`}
              >
                {val >= 1000 ? `${val / 1000}K` : val}
              </button>
            ))}
          </div>

          {/* Action Buttons: Clear Bets & Roll */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={handleClearBets}
              disabled={totalBet === 0 || isRolling}
              className="px-4 py-3 rounded-xl border border-white/20 bg-black/40 hover:bg-black/60 text-xs font-bold text-slate-300 hover:text-white transition-colors disabled:opacity-40 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear Bets
            </button>

            <button
              type="button"
              onClick={handleRollDice}
              disabled={isRolling || totalBet === 0}
              className="px-8 py-3.5 rounded-xl font-black text-sm uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 shadow-xl shadow-amber-500/30 transition-all disabled:opacity-40 flex items-center gap-2 transform active:scale-95"
            >
              <span>{isRolling ? 'पासा घुम्दैछ...' : `पासा फ्याँक्नुहोस् (Roll 6 Dice · रू ${totalBet})`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* History & Hot Stats */}
      {rollHistory.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#091a13] border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400" />
              Recent Rounds History (अघिल्ला नतिजाहरू)
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {rollHistory.map((round, idx) => (
              <div key={idx} className="p-2 rounded-xl bg-black/40 border border-slate-800/80 flex gap-1 shrink-0">
                {round.map((symId, sIdx) => (
                  <span key={sIdx} className="text-lg">
                    {getSymbol(symId).icon}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
