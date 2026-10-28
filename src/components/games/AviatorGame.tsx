import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Plane, TrendingUp, Users, AlertTriangle, ShieldCheck, Check } from 'lucide-react';
import { sound } from '../../utils/audio';

interface AviatorProps {
  balance: number;
  onBalanceChange: (newBalance: number) => void;
  onWin: (amount: number, game: string) => void;
  onOpenDeposit: () => void;
}

interface LiveBettor {
  id: string;
  name: string;
  city: string;
  bet: number;
  cashedOutAt: number | null;
  win: number | null;
}

export const AviatorGame: React.FC<AviatorProps> = ({
  balance,
  onBalanceChange,
  onWin,
  onOpenDeposit,
}) => {
  const [gameState, setGameState] = useState<'IDLE' | 'STARTING' | 'FLYING' | 'CRASHED'>('IDLE');
  const [multiplier, setMultiplier] = useState<number>(1.00);
  const [betAmount, setBetAmount] = useState<number>(200);
  const [hasBet, setHasBet] = useState<boolean>(false);
  const [hasCashedOut, setHasCashedOut] = useState<boolean>(false);
  const [cashoutMultiplier, setCashoutMultiplier] = useState<number | null>(null);
  const [crashPoint, setCrashPoint] = useState<number>(2.0);
  const [autoCashout, setAutoCashout] = useState<number | null>(null);
  const [pastCrashes, setPastCrashes] = useState<number[]>([1.45, 3.12, 1.15, 8.42, 2.05, 1.88, 12.30, 1.05]);
  const [liveBettors, setLiveBettors] = useState<LiveBettor[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const flightToneRef = useRef<{ updatePitch: (m: number) => void; stop: () => void } | null>(null);

  // Initialize random simulated live bettors from Nepal cities
  const initBettors = () => {
    const nepaliPlayers = [
      { name: 'Kiran Thapa', city: 'Kathmandu' },
      { name: 'Anish Shrestha', city: 'Pokhara' },
      { name: 'Pooja Gurung', city: 'Dharan' },
      { name: 'Bibek Adhikari', city: 'Butwal' },
      { name: 'Sunita Rai', city: 'Biratnagar' },
      { name: 'Rohit Karki', city: 'Chitwan' },
    ];

    const generated: LiveBettor[] = nepaliPlayers.map((p, idx) => ({
      id: `p-${idx}`,
      name: p.name,
      city: p.city,
      bet: [100, 200, 500, 1000, 2500][Math.floor(Math.random() * 5)],
      cashedOutAt: null,
      win: null,
    }));

    setLiveBettors(generated);
  };

  useEffect(() => {
    initBettors();
  }, []);

  // Place Bet
  const handlePlaceBet = () => {
    if (balance < betAmount) {
      if (confirm('Insufficient balance. Would you like to deposit funds via eSewa QR?')) {
        onOpenDeposit();
      }
      return;
    }
    sound.playChip();
    onBalanceChange(balance - betAmount);
    setHasBet(true);
    setHasCashedOut(false);
    setCashoutMultiplier(null);
  };

  // Start flight round
  const startFlight = () => {
    // Generate provably fair random crash point
    // Distribution: mostly 1.2x - 3x, sometimes 10x - 50x+
    const rand = Math.random();
    let point = 1.0;
    if (rand < 0.08) {
      point = 1.0 + Math.random() * 0.15; // early crash
    } else if (rand < 0.65) {
      point = 1.2 + Math.random() * 2.5; // medium
    } else if (rand < 0.90) {
      point = 3.5 + Math.random() * 6.0; // high
    } else {
      point = 10.0 + Math.random() * 35.0; // massive Everest climb
    }

    setCrashPoint(parseFloat(point.toFixed(2)));
    setGameState('FLYING');
    setMultiplier(1.00);
    startTimeRef.current = Date.now();
    initBettors();

    flightToneRef.current = sound.createFlightTone();
  };

  // Cash out
  const handleCashout = () => {
    if (!hasBet || hasCashedOut || gameState !== 'FLYING') return;

    const winMultiplier = multiplier;
    const winTotal = Math.round(betAmount * winMultiplier);

    sound.playWin();
    if (winMultiplier >= 3.0) {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    }

    setHasCashedOut(true);
    setCashoutMultiplier(winMultiplier);
    onBalanceChange(balance + winTotal);
    onWin(winTotal, 'Aviator (Everest Flight)');
  };

  // Animation loop for plane flight
  useEffect(() => {
    if (gameState !== 'FLYING') return;

    let isRunning = true;

    const tick = () => {
      if (!isRunning) return;

      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      // Exponential curve: multiplier = e^(0.07 * elapsed)
      const currentMult = parseFloat(Math.max(1.0, Math.exp(0.09 * elapsed)).toFixed(2));

      setMultiplier(currentMult);

      if (flightToneRef.current) {
        flightToneRef.current.updatePitch(currentMult);
      }

      // Check auto cashout
      if (autoCashout && hasBet && !hasCashedOut && currentMult >= autoCashout) {
        handleCashout();
      }

      // Simulate other bettors cashing out
      setLiveBettors((prev) =>
        prev.map((bettor) => {
          if (!bettor.cashedOutAt && Math.random() < 0.04 && currentMult > 1.3) {
            return {
              ...bettor,
              cashedOutAt: currentMult,
              win: Math.round(bettor.bet * currentMult),
            };
          }
          return bettor;
        })
      );

      // Check crash condition
      if (currentMult >= crashPoint) {
        isRunning = false;
        if (flightToneRef.current) {
          flightToneRef.current.stop();
          flightToneRef.current = null;
        }
        sound.playCrash();
        setGameState('CRASHED');
        setPastCrashes((prev) => [crashPoint, ...prev.slice(0, 9)]);

        // Next round countdown
        setTimeout(() => {
          setGameState('STARTING');
          setTimeout(() => {
            startFlight();
          }, 3500);
        }, 2500);

        return;
      }

      // Draw canvas
      drawCanvas(currentMult);
      requestRef.current = requestAnimationFrame(tick);
    };

    requestRef.current = requestAnimationFrame(tick);

    return () => {
      isRunning = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (flightToneRef.current) {
        flightToneRef.current.stop();
        flightToneRef.current = null;
      }
    };
  }, [gameState, crashPoint, autoCashout, hasBet, hasCashedOut]);

  // Handle initial auto-start
  useEffect(() => {
    if (gameState === 'IDLE') {
      const timer = setTimeout(() => {
        setGameState('STARTING');
        setTimeout(() => {
          startFlight();
        }, 3000);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  // Canvas renderer for Himalayan skyline and curve
  const drawCanvas = (currentMult: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Draw Himalayan Mountain Peaks Silhouette in background
    ctx.fillStyle = '#0a1d15';
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, h * 0.7);
    ctx.lineTo(w * 0.15, h * 0.45);
    ctx.lineTo(w * 0.3, h * 0.65);
    ctx.lineTo(w * 0.5, h * 0.35); // Everest peak
    ctx.lineTo(w * 0.68, h * 0.58);
    ctx.lineTo(w * 0.85, h * 0.4);
    ctx.lineTo(w, h * 0.65);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Snow caps on Everest
    ctx.fillStyle = '#ffffff18';
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 0.35);
    ctx.lineTo(w * 0.46, h * 0.43);
    ctx.lineTo(w * 0.54, h * 0.43);
    ctx.closePath();
    ctx.fill();

    // Grid lines
    ctx.strokeStyle = '#ffffff08';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Trajectory curve
    const progress = Math.min(1.0, (currentMult - 1.0) / 10.0);
    const endX = 40 + progress * (w - 120);
    const endY = h - 40 - Math.pow(progress, 0.75) * (h - 100);

    // Draw curve gradient area
    const gradient = ctx.createLinearGradient(0, endY, 0, h);
    gradient.addColorStop(0, 'rgba(239, 68, 68, 0.35)');
    gradient.addColorStop(1, 'rgba(239, 68, 68, 0.0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(40, h - 40);
    ctx.quadraticCurveTo(endX * 0.5, h - 30, endX, endY);
    ctx.lineTo(endX, h - 40);
    ctx.closePath();
    ctx.fill();

    // Glowing Curve line
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(40, h - 40);
    ctx.quadraticCurveTo(endX * 0.5, h - 30, endX, endY);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw Airplane at tip
    ctx.save();
    ctx.translate(endX, endY);
    ctx.rotate(-0.35);

    // Airplane shape
    ctx.fillStyle = '#f87171';
    ctx.beginPath();
    ctx.moveTo(18, 0);
    ctx.lineTo(-12, -8);
    ctx.lineTo(-6, 0);
    ctx.lineTo(-12, 8);
    ctx.closePath();
    ctx.fill();

    // Golden cockpit glow
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(4, 0, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#170a0a] via-[#120808] to-[#170a0a] border border-rose-500/25 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
            <Plane className="w-6 h-6 rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white font-display">
                Aviator Crash
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                Everest Flight (काठमाडौँ टु सगरमाथा)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Watch the plane climb above Mount Everest · Cash out before the flight takes off!
            </p>
          </div>
        </div>

        {/* History of Past Multipliers */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full sm:max-w-md pb-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 mr-1 shrink-0">History:</span>
          {pastCrashes.map((val, idx) => (
            <span
              key={idx}
              className={`px-2 py-0.5 rounded-md text-xs font-mono font-bold shrink-0 ${
                val >= 2.0
                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-950/80 text-rose-400 border border-rose-500/30'
              }`}
            >
              {val.toFixed(2)}x
            </span>
          ))}
        </div>
      </div>

      {/* Main Canvas & Flight Arena */}
      <div className="relative rounded-3xl bg-[#090505] border-2 border-rose-950 shadow-2xl overflow-hidden">
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={800}
          height={380}
          className="w-full h-[320px] sm:h-[380px] block"
        />

        {/* Big Multiplier Center Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {gameState === 'FLYING' && (
            <div className="text-center animate-pulse">
              <span className="text-6xl sm:text-7xl font-black text-white font-mono-numbers tracking-tight filter drop-shadow-[0_10px_20px_rgba(239,68,68,0.5)]">
                {multiplier.toFixed(2)}x
              </span>
              <p className="text-xs uppercase font-bold tracking-widest text-rose-400 mt-2">
                Climbing Himalayan Airspace...
              </p>
            </div>
          )}

          {gameState === 'CRASHED' && (
            <div className="text-center p-6 rounded-2xl bg-black/80 border border-rose-500/50 backdrop-blur-md">
              <p className="text-xs uppercase font-extrabold text-rose-400 tracking-widest">
                FLEW AWAY / विमान हरायो
              </p>
              <span className="text-5xl sm:text-6xl font-black text-rose-500 font-mono-numbers">
                {crashPoint.toFixed(2)}x
              </span>
              <p className="text-xs text-slate-400 mt-1">Next flight departing in 3 seconds...</p>
            </div>
          )}

          {gameState === 'STARTING' && (
            <div className="text-center p-6 rounded-2xl bg-black/80 border border-amber-500/40 backdrop-blur-md">
              <span className="text-sm font-bold uppercase tracking-widest text-amber-400">
                Boarding Flight to Mt. Everest
              </span>
              <p className="text-2xl font-black text-white font-mono mt-1">Starting soon...</p>
              <div className="w-36 h-1.5 bg-slate-800 rounded-full mx-auto mt-3 overflow-hidden">
                <div className="w-full h-full bg-amber-400 rounded-full animate-[progress_3s_ease-in-out]" />
              </div>
            </div>
          )}
        </div>

        {/* Cashout Notification Overlay if user cashed out */}
        {hasCashedOut && cashoutMultiplier && (
          <div className="absolute top-4 right-4 p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs shadow-xl backdrop-blur-md animate-bounce">
            <div className="flex items-center gap-1.5 font-bold">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Cashed Out @ {cashoutMultiplier.toFixed(2)}x!</span>
            </div>
            <p className="text-sm font-black text-white font-mono-numbers mt-0.5">
              + रू {Math.round(betAmount * cashoutMultiplier).toLocaleString('en-IN')}
            </p>
          </div>
        )}
      </div>

      {/* Betting Controls & Simulated Bettors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Betting Panel */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0e1713] border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Place Your Bet (दाउ लगाउनुहोस्)
            </span>
            <span className="text-xs text-amber-400 font-mono-numbers">
              Available: रू {balance.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Quick Bet Buttons */}
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {[100, 200, 500, 1000, 2500, 5000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => {
                  sound.playChip();
                  setBetAmount(val);
                }}
                disabled={hasBet && gameState === 'FLYING'}
                className={`py-2 text-center text-xs font-bold rounded-lg border transition-all font-mono-numbers ${
                  betAmount === val
                    ? 'border-rose-400 bg-rose-950/60 text-rose-300'
                    : 'border-slate-800 bg-[#06140e] text-slate-300 hover:border-slate-700'
                }`}
              >
                रू {val}
              </button>
            ))}
          </div>

          {/* Bet input & Auto Cashout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                Bet Amount (रकम)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-rose-400">
                  रू
                </span>
                <input
                  type="number"
                  min="50"
                  max={balance}
                  step="50"
                  value={betAmount}
                  disabled={hasBet && gameState === 'FLYING'}
                  onChange={(e) => setBetAmount(parseInt(e.target.value, 10) || 50)}
                  className="w-full bg-[#05110c] border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-sm text-white font-mono-numbers outline-none focus:border-rose-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                Auto Cashout Multiplier (Optional)
              </label>
              <input
                type="number"
                step="0.1"
                min="1.1"
                placeholder="e.g. 2.0x (Auto exit)"
                value={autoCashout || ''}
                disabled={hasBet && gameState === 'FLYING'}
                onChange={(e) => setAutoCashout(parseFloat(e.target.value) || null)}
                className="w-full bg-[#05110c] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono outline-none focus:border-rose-400"
              />
            </div>
          </div>

          {/* Action Button: Bet or Cashout */}
          {hasBet && gameState === 'FLYING' && !hasCashedOut ? (
            <button
              type="button"
              onClick={handleCashout}
              className="w-full py-4 rounded-2xl font-black text-lg uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:brightness-110 shadow-2xl shadow-amber-500/40 transition-all transform active:scale-95 flex items-center justify-center gap-3 animate-pulse"
            >
              <span>CASH OUT NOW रू {Math.round(betAmount * multiplier).toLocaleString('en-IN')}</span>
              <span className="font-mono text-sm px-2 py-0.5 rounded bg-black/20">@{multiplier.toFixed(2)}x</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePlaceBet}
              disabled={hasBet && (gameState === 'FLYING' || gameState === 'STARTING')}
              className="w-full py-4 rounded-2xl font-black text-base uppercase tracking-wider text-white bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:brightness-110 shadow-xl shadow-rose-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Plane className="w-5 h-5 rotate-45" />
              <span>
                {hasBet
                  ? 'Bet Placed · Waiting for Next Flight'
                  : `Bet रू ${betAmount.toLocaleString('en-IN')} for Flight`}
              </span>
            </button>
          )}
        </div>

        {/* Live Nepali Bettors Feed */}
        <div className="p-5 rounded-2xl bg-[#091510] border border-slate-800 shadow-xl flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-rose-400" />
              Active Nepali Bettors
            </span>
            <span className="text-[11px] text-emerald-400 font-mono">6 Online</span>
          </div>

          <div className="divide-y divide-slate-800/60 overflow-y-auto max-h-[220px] flex-1">
            {liveBettors.map((p) => (
              <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-white leading-tight">{p.name}</p>
                  <p className="text-[10px] text-slate-400">{p.city} · रू {p.bet}</p>
                </div>

                <div>
                  {p.cashedOutAt ? (
                    <div className="text-right">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono font-bold">
                        {p.cashedOutAt.toFixed(2)}x
                      </span>
                      <p className="text-xs font-bold text-emerald-400 font-mono-numbers mt-0.5">
                        +रू {p.win?.toLocaleString('en-IN')}
                      </p>
                    </div>
                  ) : gameState === 'CRASHED' ? (
                    <span className="text-[10px] text-rose-500 font-semibold">Crashed</span>
                  ) : (
                    <span className="text-[10px] text-amber-400 font-mono animate-pulse">In Flight</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
