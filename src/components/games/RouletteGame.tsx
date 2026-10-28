import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { RotateCw, ShieldCheck, Flame, Info } from 'lucide-react';
import { sound } from '../../utils/audio';

interface RouletteProps {
  balance: number;
  onBalanceChange: (newBalance: number) => void;
  onWin: (amount: number, game: string) => void;
  onOpenDeposit: () => void;
}

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

export const RouletteGame: React.FC<RouletteProps> = ({
  balance,
  onBalanceChange,
  onWin,
  onOpenDeposit,
}) => {
  const [selectedChip, setSelectedChip] = useState<number>(100);
  const [bets, setBets] = useState<Record<string, number>>({});
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [wheelRotation, setWheelRotation] = useState<number>(0);
  const [ballRotation, setBallRotation] = useState<number>(0);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([14, 28, 7, 32, 0, 19]);

  const totalBet = Object.values(bets).reduce((a, b) => a + b, 0);

  const isRed = (num: number) => RED_NUMBERS.includes(num);

  const handlePlaceBet = (key: string) => {
    if (balance < selectedChip) {
      if (confirm('Insufficient balance. Would you like to deposit funds via eSewa QR?')) {
        onOpenDeposit();
      }
      return;
    }
    sound.playChip();
    setBets((prev) => ({
      ...prev,
      [key]: (prev[key] || 0) + selectedChip,
    }));
    onBalanceChange(balance - selectedChip);
  };

  const handleClearBets = () => {
    if (totalBet > 0 && !isSpinning) {
      sound.playClick();
      onBalanceChange(balance + totalBet);
      setBets({});
    }
  };

  const handleSpin = () => {
    if (totalBet === 0) {
      alert('Please place a bet on the board first.');
      return;
    }
    if (isSpinning) return;

    setIsSpinning(true);
    setLastWin(null);

    // Audio clicks
    const tickInterval = setInterval(() => {
      sound.playRouletteTick();
    }, 180);

    // Random winner (0 to 36)
    const result = Math.floor(Math.random() * 37);

    // Animation degrees
    const extraWheelSpins = 4 * 360 + Math.random() * 360;
    const extraBallSpins = 7 * 360 + Math.random() * 360;

    setWheelRotation((prev) => prev + extraWheelSpins);
    setBallRotation((prev) => prev - extraBallSpins);

    setTimeout(() => {
      clearInterval(tickInterval);
      setWinningNumber(result);
      setIsSpinning(false);
      setHistory((prev) => [result, ...prev.slice(0, 7)]);
      evaluatePayout(result);
    }, 3800);
  };

  const evaluatePayout = (num: number) => {
    let payout = 0;
    const isNumRed = isRed(num);

    // 1. Straight Up (35:1 + bet)
    if (bets[`num_${num}`]) {
      payout += bets[`num_${num}`] * 36;
    }

    // 2. Color (Red / Black) (1:1 + bet)
    if (num !== 0) {
      if (isNumRed && bets['red']) {
        payout += bets['red'] * 2;
      } else if (!isNumRed && bets['black']) {
        payout += bets['black'] * 2;
      }
    }

    // 3. Even / Odd (1:1 + bet)
    if (num !== 0) {
      if (num % 2 === 0 && bets['even']) {
        payout += bets['even'] * 2;
      } else if (num % 2 !== 0 && bets['odd']) {
        payout += bets['odd'] * 2;
      }
    }

    // 4. Low (1-18) / High (19-36) (1:1 + bet)
    if (num >= 1 && num <= 18 && bets['low']) {
      payout += bets['low'] * 2;
    } else if (num >= 19 && num <= 36 && bets['high']) {
      payout += bets['high'] * 2;
    }

    // 5. Dozens (2:1 + bet)
    if (num >= 1 && num <= 12 && bets['doz_1']) payout += bets['doz_1'] * 3;
    if (num >= 13 && num <= 24 && bets['doz_2']) payout += bets['doz_2'] * 3;
    if (num >= 25 && num <= 36 && bets['doz_3']) payout += bets['doz_3'] * 3;

    setLastWin(payout);
    if (payout > 0) {
      sound.playWin();
      if (payout >= totalBet * 3) {
        sound.playJackpot();
        confetti({ particleCount: 75, spread: 75, origin: { y: 0.6 } });
      }
      onBalanceChange(balance + payout);
      onWin(payout, `Kathmandu Roulette (#${num})`);
    }

    setBets({});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#0d261a] via-[#091a13] to-[#0d261a] border border-amber-500/25 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20">
            🎯
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white font-display">
                Royal Kathmandu European Roulette
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Single Zero (0) · 97.3% RTP
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Classic 37-number European wheel · Up to 36x payout on straight bets
            </p>
          </div>
        </div>

        {/* History */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 mr-1 shrink-0">Recent:</span>
          {history.map((n, i) => (
            <span
              key={i}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono shrink-0 shadow-sm ${
                n === 0
                  ? 'bg-emerald-600 text-white'
                  : isRed(n)
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-900 text-white border border-slate-700'
              }`}
            >
              {n}
            </span>
          ))}
        </div>
      </div>

      {/* Roulette Wheel & Layout Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Animated 3D Roulette Wheel */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-3xl bg-[#091812] border-2 border-amber-500/30 shadow-2xl relative overflow-hidden">
          <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full border-8 border-[#3d260f] bg-[#1a0e05] shadow-[0_0_40px_rgba(217,119,6,0.3)] flex items-center justify-center">
            
            {/* Spinning Outer Ring */}
            <div
              className="absolute inset-2 rounded-full border-4 border-amber-500/60 transition-transform duration-[3800ms] ease-[cubic-bezier(0.15,0.9,0.25,1)]"
              style={{ transform: `rotate(${wheelRotation}deg)` }}
            >
              {Array.from({ length: 37 }).map((_, idx) => (
                <div
                  key={idx}
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-3 origin-bottom"
                  style={{ transform: `rotate(${idx * (360 / 37)}deg)`, transformOrigin: 'bottom center', height: '110px' }}
                >
                  <div className={`w-3.5 h-3.5 -ml-1.5 rounded-sm flex items-center justify-center text-[8px] font-bold text-white ${
                    idx === 0 ? 'bg-emerald-600' : isRed(idx) ? 'bg-red-600' : 'bg-slate-900'
                  }`}>
                    {idx}
                  </div>
                </div>
              ))}
            </div>

            {/* Inner Center Hub */}
            <div className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 border-4 border-amber-200 shadow-2xl flex flex-col items-center justify-center text-slate-950 font-black">
              {winningNumber !== null ? (
                <>
                  <span className="text-[10px] uppercase font-bold tracking-tight">LANDED</span>
                  <span className={`text-2xl font-black font-mono-numbers ${
                    winningNumber === 0 ? 'text-emerald-950' : isRed(winningNumber) ? 'text-red-950' : 'text-slate-950'
                  }`}>
                    {winningNumber}
                  </span>
                </>
              ) : (
                <span className="text-xs uppercase font-extrabold tracking-widest">ROYAL</span>
              )}
            </div>

            {/* Spinning Ball */}
            <div
              className="absolute inset-6 rounded-full pointer-events-none transition-transform duration-[3800ms] ease-[cubic-bezier(0.1,0.85,0.25,1)]"
              style={{ transform: `rotate(${ballRotation}deg)` }}
            >
              <div className="w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_8px_#ffffff] -translate-y-1.5 mx-auto" />
            </div>
          </div>

          {/* Win summary banner */}
          {lastWin !== null && (
            <div className="mt-4 p-2.5 rounded-xl bg-black/60 border border-amber-400 text-center w-full animate-fadeIn">
              {lastWin > 0 ? (
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-amber-400 font-bold">You Won</span>
                  <p className="text-xl font-bold text-amber-300 font-mono-numbers">
                    + रू {lastWin.toLocaleString('en-IN')}
                  </p>
                </div>
              ) : (
                <span className="text-xs text-slate-400">No win on this round.</span>
              )}
            </div>
          )}
        </div>

        {/* Roulette Betting Layout (Right) */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-[#082216] border-2 border-emerald-900 shadow-2xl space-y-4">
          
          {/* Numbers Grid (0 to 36) */}
          <div className="grid grid-cols-13 gap-1 text-center font-bold text-xs select-none">
            {/* Zero */}
            <div
              onClick={() => handlePlaceBet('num_0')}
              className={`row-span-3 col-span-1 rounded-lg border flex flex-col items-center justify-center cursor-pointer transition-colors ${
                bets['num_0'] ? 'bg-amber-400 text-slate-950 border-white' : 'bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-500'
              }`}
            >
              <span>0</span>
              {bets['num_0'] && <span className="text-[9px] font-mono mt-1">रू{bets['num_0']}</span>}
            </div>

            {/* 1 to 36 columns */}
            {Array.from({ length: 36 }).map((_, idx) => {
              const num = idx + 1;
              const red = isRed(num);
              const betVal = bets[`num_${num}`];
              return (
                <div
                  key={num}
                  onClick={() => handlePlaceBet(`num_${num}`)}
                  className={`p-2 rounded-lg border flex flex-col items-center justify-center cursor-pointer transition-transform active:scale-95 ${
                    betVal
                      ? 'bg-amber-400 text-slate-950 border-white shadow-md'
                      : red
                      ? 'bg-red-700 hover:bg-red-600 text-white border-red-500/40'
                      : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-700'
                  }`}
                >
                  <span>{num}</span>
                  {betVal && <span className="text-[8px] font-mono font-bold mt-0.5">रू{betVal}</span>}
                </div>
              );
            })}
          </div>

          {/* Dozens */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
            {[
              { key: 'doz_1', label: '1st 12 (1 to 12)' },
              { key: 'doz_2', label: '2nd 12 (13 to 24)' },
              { key: 'doz_3', label: '3rd 12 (25 to 36)' },
            ].map((d) => (
              <div
                key={d.key}
                onClick={() => handlePlaceBet(d.key)}
                className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                  bets[d.key]
                    ? 'bg-amber-400 text-slate-950 border-white'
                    : 'bg-black/40 hover:bg-black/60 text-slate-200 border-white/20'
                }`}
              >
                <span>{d.label}</span>
                {bets[d.key] && <span className="block text-[10px] font-mono mt-0.5 font-bold">रू{bets[d.key]}</span>}
              </div>
            ))}
          </div>

          {/* Outside Bets (1-18, Even, Red, Black, Odd, 19-36) */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs font-bold">
            <div
              onClick={() => handlePlaceBet('low')}
              className={`p-2 rounded-lg border cursor-pointer ${
                bets['low'] ? 'bg-amber-400 text-slate-950' : 'bg-black/40 text-slate-200 border-white/20'
              }`}
            >
              1 to 18 {bets['low'] && `(रू${bets['low']})`}
            </div>

            <div
              onClick={() => handlePlaceBet('even')}
              className={`p-2 rounded-lg border cursor-pointer ${
                bets['even'] ? 'bg-amber-400 text-slate-950' : 'bg-black/40 text-slate-200 border-white/20'
              }`}
            >
              EVEN {bets['even'] && `(रू${bets['even']})`}
            </div>

            <div
              onClick={() => handlePlaceBet('red')}
              className={`p-2 rounded-lg border cursor-pointer ${
                bets['red'] ? 'bg-amber-400 text-slate-950' : 'bg-red-700 text-white border-red-500'
              }`}
            >
              RED {bets['red'] && `(रू${bets['red']})`}
            </div>

            <div
              onClick={() => handlePlaceBet('black')}
              className={`p-2 rounded-lg border cursor-pointer ${
                bets['black'] ? 'bg-amber-400 text-slate-950' : 'bg-slate-900 text-white border-slate-700'
              }`}
            >
              BLACK {bets['black'] && `(रू${bets['black']})`}
            </div>

            <div
              onClick={() => handlePlaceBet('odd')}
              className={`p-2 rounded-lg border cursor-pointer ${
                bets['odd'] ? 'bg-amber-400 text-slate-950' : 'bg-black/40 text-slate-200 border-white/20'
              }`}
            >
              ODD {bets['odd'] && `(रू${bets['odd']})`}
            </div>

            <div
              onClick={() => handlePlaceBet('high')}
              className={`p-2 rounded-lg border cursor-pointer ${
                bets['high'] ? 'bg-amber-400 text-slate-950' : 'bg-black/40 text-slate-200 border-white/20'
              }`}
            >
              19 to 36 {bets['high'] && `(रू${bets['high']})`}
            </div>
          </div>

          {/* Chips & Spin Controls */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              <span className="text-xs uppercase font-bold text-amber-300">Chip:</span>
              {[50, 100, 250, 500, 1000].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    sound.playChip();
                    setSelectedChip(c);
                  }}
                  className={`w-10 h-10 rounded-full font-bold text-xs font-mono-numbers border transition-all ${
                    selectedChip === c
                      ? 'bg-amber-400 text-slate-950 border-white scale-110 ring-2 ring-amber-400/50'
                      : 'bg-black/50 text-amber-300 border-amber-500/40'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleClearBets}
                disabled={totalBet === 0 || isSpinning}
                className="px-4 py-2.5 rounded-xl border border-white/20 bg-black/40 text-xs font-semibold text-slate-300 hover:text-white transition-colors disabled:opacity-40"
              >
                Clear (रू{totalBet})
              </button>

              <button
                type="button"
                onClick={handleSpin}
                disabled={isSpinning || totalBet === 0}
                className="px-7 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 shadow-lg shadow-amber-500/30 transition-all disabled:opacity-40 flex items-center gap-2"
              >
                <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
                <span>{isSpinning ? 'Spinning Wheel...' : `SPIN (दाउ रू ${totalBet})`}</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
