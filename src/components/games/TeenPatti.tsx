import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Eye, EyeOff, ShieldCheck, Trophy, Sparkles, RefreshCw } from 'lucide-react';
import { sound } from '../../utils/audio';

interface TeenPattiProps {
  balance: number;
  onBalanceChange: (newBalance: number) => void;
  onWin: (amount: number, game: string) => void;
  onOpenDeposit: () => void;
}

interface Card {
  suit: '♠' | '♥' | '♦' | '♣';
  value: number; // 2 to 14 (14 is Ace)
  label: string;
}

const SUITS: ('♠' | '♥' | '♦' | '♣')[] = ['♠', '♥', '♦', '♣'];
const LABELS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export const TeenPatti: React.FC<TeenPattiProps> = ({
  balance,
  onBalanceChange,
  onWin,
  onOpenDeposit,
}) => {
  const [bootAmount, setBootAmount] = useState<number>(100);
  const [pot, setPot] = useState<number>(0);
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [dealerCards, setDealerCards] = useState<Card[]>([]);
  const [hasSeenCards, setHasSeenCards] = useState<boolean>(false);
  const [gamePhase, setGamePhase] = useState<'BETTING' | 'IN_PLAY' | 'SHOWDOWN'>('BETTING');
  const [currentChaal, setCurrentChaal] = useState<number>(100);
  const [winnerMessage, setWinnerMessage] = useState<string | null>(null);

  // Generate Deck
  const generateDeck = (): Card[] => {
    const deck: Card[] = [];
    SUITS.forEach((suit) => {
      LABELS.forEach((label, idx) => {
        deck.push({
          suit,
          label,
          value: idx + 2,
        });
      });
    });
    // Shuffle
    return deck.sort(() => Math.random() - 0.5);
  };

  // Evaluate Hand Rank
  // 6: Trail, 5: Pure Sequence, 4: Sequence, 3: Color, 2: Pair, 1: High Card
  const evaluateHand = (cards: Card[]): { score: number; rankTitle: string; highCard: number } => {
    if (cards.length < 3) return { score: 0, rankTitle: '', highCard: 0 };

    const sorted = [...cards].sort((a, b) => b.value - a.value);
    const isFlush = sorted[0].suit === sorted[1].suit && sorted[1].suit === sorted[2].suit;
    
    // Check straight
    let isStraight = false;
    if (sorted[0].value - sorted[1].value === 1 && sorted[1].value - sorted[2].value === 1) {
      isStraight = true;
    }
    // A-2-3 straight check
    if (sorted[0].value === 14 && sorted[1].value === 3 && sorted[2].value === 2) {
      isStraight = true;
    }

    // Trio / Trail
    if (sorted[0].value === sorted[1].value && sorted[1].value === sorted[2].value) {
      return { score: 6, rankTitle: `Trail of ${sorted[0].label}'s (Trio)`, highCard: sorted[0].value };
    }

    // Pure Sequence (Straight Flush)
    if (isStraight && isFlush) {
      return { score: 5, rankTitle: `Pure Sequence (${sorted[0].label} high)`, highCard: sorted[0].value };
    }

    // Normal Sequence (Straight)
    if (isStraight) {
      return { score: 4, rankTitle: `Sequence (${sorted[0].label} high)`, highCard: sorted[0].value };
    }

    // Color (Flush)
    if (isFlush) {
      return { score: 3, rankTitle: `Color / Flush (${sorted[0].suit})`, highCard: sorted[0].value };
    }

    // Pair
    if (sorted[0].value === sorted[1].value || sorted[1].value === sorted[2].value || sorted[0].value === sorted[2].value) {
      const pairVal = sorted[0].value === sorted[1].value ? sorted[0].label : sorted[2].label;
      return { score: 2, rankTitle: `Pair of ${pairVal}'s`, highCard: sorted[0].value };
    }

    // High Card
    return { score: 1, rankTitle: `High Card (${sorted[0].label})`, highCard: sorted[0].value };
  };

  // Start new game
  const handleDealHand = () => {
    if (balance < bootAmount) {
      if (confirm('Insufficient balance. Would you like to deposit funds via eSewa QR?')) {
        onOpenDeposit();
      }
      return;
    }

    sound.playChip();
    sound.playCardDeal();

    const deck = generateDeck();
    const pCards = [deck[0], deck[1], deck[2]];
    const dCards = [deck[3], deck[4], deck[5]];

    onBalanceChange(balance - bootAmount);
    setPot(bootAmount * 2); // Player + Dealer boot
    setPlayerCards(pCards);
    setDealerCards(dCards);
    setHasSeenCards(false);
    setCurrentChaal(bootAmount);
    setWinnerMessage(null);
    setGamePhase('IN_PLAY');
  };

  // See cards (Player flips cards)
  const handleSeeCards = () => {
    sound.playCardDeal();
    setHasSeenCards(true);
    // When seen, chaal is 2x of blind
    setCurrentChaal(bootAmount * 2);
  };

  // Play Chaal (Call / Raise bet)
  const handleChaal = () => {
    const betCost = currentChaal;
    if (balance < betCost) {
      alert('Insufficient balance to match Chaal.');
      return;
    }

    sound.playChip();
    onBalanceChange(balance - betCost);
    // Dealer automatically matches chaal
    setPot((prev) => prev + betCost * 2);
  };

  // Pack (Fold)
  const handlePack = () => {
    sound.playClick();
    setGamePhase('SHOWDOWN');
    setWinnerMessage('You packed (Folded). Dealer wins the pot.');
  };

  // Show (Final Showdown comparison)
  const handleShow = () => {
    const showCost = currentChaal;
    if (balance < showCost) {
      alert('Insufficient balance for Showdown.');
      return;
    }

    sound.playChip();
    onBalanceChange(balance - showCost);
    setPot((prev) => prev + showCost * 2);
    setHasSeenCards(true);
    setGamePhase('SHOWDOWN');

    const pEval = evaluateHand(playerCards);
    const dEval = evaluateHand(dealerCards);

    let playerWon = false;
    if (pEval.score > dEval.score) {
      playerWon = true;
    } else if (pEval.score === dEval.score) {
      playerWon = pEval.highCard >= dEval.highCard;
    }

    const totalPot = pot + showCost * 2;

    if (playerWon) {
      sound.playWin();
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      onBalanceChange(balance + totalPot);
      onWin(totalPot, 'Teen Patti Royale');
      setWinnerMessage(`🎉 You Won रू ${totalPot.toLocaleString('en-IN')} with ${pEval.rankTitle}!`);
    } else {
      setWinnerMessage(`Dealer won with ${dEval.rankTitle}.`);
    }
  };

  const renderCard = (card: Card, faceUp: boolean) => {
    const isRed = card.suit === '♥' || card.suit === '♦';
    if (!faceUp) {
      return (
        <div className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl bg-gradient-to-br from-amber-700 via-amber-900 to-slate-950 border-2 border-amber-400/80 shadow-xl flex items-center justify-center p-2 text-amber-300">
          <div className="w-full h-full rounded-lg border border-dashed border-amber-400/40 flex items-center justify-center font-display font-black text-xs">
            ROYAL
          </div>
        </div>
      );
    }

    return (
      <div className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl bg-white border-2 border-slate-300 shadow-2xl flex flex-col justify-between p-2 select-none transform transition-transform hover:-translate-y-1">
        <div className={`text-xs font-black leading-none ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
          {card.label}
          <div className="text-sm">{card.suit}</div>
        </div>
        <div className={`text-2xl self-center ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
          {card.suit}
        </div>
        <div className={`text-xs font-black leading-none self-end rotate-180 ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
          {card.label}
          <div className="text-sm">{card.suit}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#0d261a] via-[#091a13] to-[#0d261a] border border-amber-500/25 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-amber-500/20">
            3♠
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white font-display">
                Teen Patti Royale
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                तीन पत्ती (Flush 3 Cards)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Classic Nepali 3-Card Poker · Pure Sequence, Trail & Color Payouts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Table Pot:</span>
            <p className="text-lg font-black text-amber-400 font-mono-numbers">
              रू {pot.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Table Felt */}
      <div className="relative p-8 rounded-3xl bg-gradient-to-b from-[#0f4d32] via-[#0b3824] to-[#072417] border-4 border-[#04140d] shadow-2xl overflow-hidden min-h-[460px] flex flex-col justify-between">
        
        {/* Felt Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <span className="text-9xl font-display font-black text-white">ROYAL NEPAL</span>
        </div>

        {/* Dealer Zone (Top) */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-amber-500/30 border border-amber-400/50 flex items-center justify-center text-xs">
              👑
            </div>
            <span className="text-xs font-bold text-amber-200">
              Live Dealer (काठमाडौँ रोयल डिलर)
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {dealerCards.length > 0 ? (
              dealerCards.map((c, i) => (
                <div key={i}>{renderCard(c, gamePhase === 'SHOWDOWN')}</div>
              ))
            ) : (
              <div className="h-24 sm:h-28 flex items-center justify-center text-xs text-white/40 border border-dashed border-white/20 rounded-xl px-8">
                Waiting for deal...
              </div>
            )}
          </div>
          {gamePhase === 'SHOWDOWN' && dealerCards.length > 0 && (
            <span className="text-xs text-amber-300 font-semibold mt-2">
              {evaluateHand(dealerCards).rankTitle}
            </span>
          )}
        </div>

        {/* Table Pot Center */}
        <div className="relative z-10 my-4 flex flex-col items-center justify-center">
          <div className="px-6 py-2 rounded-full bg-black/60 border border-amber-400/40 backdrop-blur-md shadow-xl flex items-center gap-3">
            <span className="text-xs uppercase font-extrabold text-amber-400 tracking-wider">
              Pot (जम्मा रकम):
            </span>
            <span className="text-xl font-black text-white font-mono-numbers">
              रू {pot.toLocaleString('en-IN')}
            </span>
          </div>

          {winnerMessage && (
            <div className="mt-3 px-5 py-2 rounded-xl bg-black/80 border border-amber-400 text-center animate-fadeIn">
              <p className="text-sm font-bold text-amber-300">{winnerMessage}</p>
            </div>
          )}
        </div>

        {/* Player Zone (Bottom) */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="flex items-center gap-2 sm:gap-3">
            {playerCards.length > 0 ? (
              playerCards.map((c, i) => (
                <div key={i}>{renderCard(c, hasSeenCards)}</div>
              ))
            ) : (
              <div className="h-24 sm:h-28 flex items-center justify-center text-xs text-white/40 border border-dashed border-white/20 rounded-xl px-8">
                Click Deal to Start
              </div>
            )}
          </div>

          {hasSeenCards && playerCards.length > 0 && (
            <span className="text-xs text-emerald-300 font-semibold mt-2 bg-black/40 px-3 py-1 rounded-full border border-emerald-500/30">
              Your Hand: {evaluateHand(playerCards).rankTitle}
            </span>
          )}

          {/* Action buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {gamePhase === 'BETTING' || gamePhase === 'SHOWDOWN' ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-black/60 px-3 py-1.5 rounded-xl border border-slate-700">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Boot Bet:</span>
                  {[50, 100, 250, 500].map((val) => (
                    <button
                      key={val}
                      onClick={() => {
                        sound.playChip();
                        setBootAmount(val);
                      }}
                      className={`px-2 py-0.5 rounded text-xs font-bold font-mono-numbers transition-colors ${
                        bootAmount === val ? 'bg-amber-400 text-slate-950' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      रू{val}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleDealHand}
                  className="px-8 py-3 rounded-xl font-black text-sm uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:brightness-110 shadow-xl shadow-amber-500/30 transition-all flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Deal Cards (रू {bootAmount})</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {!hasSeenCards && (
                  <button
                    type="button"
                    onClick={handleSeeCards}
                    className="px-4 py-2.5 rounded-xl border border-amber-400/60 bg-amber-950/60 text-amber-300 hover:bg-amber-900/60 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>See Cards (पत्ता हेर्नुहोस्)</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleChaal}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-emerald-400 to-amber-400 hover:brightness-110 shadow-lg shadow-emerald-500/20 transition-all"
                >
                  Chaal (रू {currentChaal})
                </button>

                <button
                  type="button"
                  onClick={handleShow}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 shadow-lg shadow-blue-500/20 transition-all"
                >
                  Showdown (रू {currentChaal})
                </button>

                <button
                  type="button"
                  onClick={handlePack}
                  className="px-4 py-2.5 rounded-xl border border-red-500/40 bg-red-950/60 text-red-300 hover:bg-red-900/60 text-xs font-bold transition-colors"
                >
                  Pack (Fold)
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
