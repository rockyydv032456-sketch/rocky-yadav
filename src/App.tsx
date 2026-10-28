import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  TrendingUp,
  CreditCard,
  QrCode,
  Flame,
  Award,
  ChevronRight,
  ArrowDownToLine,
  PhoneCall,
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { LiveWinnersTicker } from './components/LiveWinnersTicker';
import { DepositModal } from './components/DepositModal';
import { WithdrawModal } from './components/WithdrawModal';
import { TransactionsModal } from './components/TransactionsModal';
import { VipModal } from './components/VipModal';
import { ProvablyFairModal } from './components/ProvablyFairModal';
import { SupportChatModal } from './components/SupportChatModal';
import { LangurBurja } from './components/games/LangurBurja';
import { AviatorGame } from './components/games/AviatorGame';
import { TeenPatti } from './components/games/TeenPatti';
import { RouletteGame } from './components/games/RouletteGame';
import { SlotMachine } from './components/games/SlotMachine';
import { sound } from './utils/audio';
import { GameType, Transaction, UserProfile } from './types';

// High-fidelity generated image paths
const HERO_BANNER_IMG = '/src/assets/images/hero_casino_banner_1793208919414.jpg';
const LANGUR_BURJA_IMG = '/src/assets/images/game_langur_burja_1793208919968.jpg';
const AVIATOR_IMG = '/src/assets/images/game_aviator_himalaya_1793208921832.jpg';
const TEEN_PATTI_IMG = '/src/assets/images/game_teen_patti_1793208921189.jpg';
const ESEWA_QR_IMG = '/assets/aistudio/E5HBILWmumE_a0e62fd6.jpeg';

export default function App() {
  // User Account State
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: 'USR-NP-9841',
    name: 'Bikash Adhikari',
    phone: '9841******',
    balance: 5000, // Initial demo/starter real-money balance
    bonusBalance: 500,
    vipTier: 'Gold',
    vipPoints: 1420,
    totalWon: 18500,
    totalDeposited: 10000,
    totalWithdrawn: 13500,
  });

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'TX-DEP-982141',
      type: 'deposit',
      amount: 5000,
      paymentMethod: 'esewa',
      referenceId: 'ESW9842109',
      status: 'completed',
      date: 'Today, 10:15 AM',
      notes: 'eSewa QR Direct Instant Deposit (+10% Bonus)',
    },
    {
      id: 'TX-WIN-87421',
      type: 'win',
      amount: 7500,
      status: 'completed',
      date: 'Today, 09:40 AM',
      notes: 'Langur Burja 3x Crown Match Win',
    },
  ]);

  // UI Navigation & Modals
  const [activeGame, setActiveGame] = useState<GameType | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'nepali' | 'crash' | 'table' | 'slots'>('all');
  const [activeNav, setActiveNav] = useState<string>('lobby');

  // Modals
  const [isDepositOpen, setIsDepositOpen] = useState<boolean>(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState<boolean>(false);
  const [isTxOpen, setIsTxOpen] = useState<boolean>(false);
  const [isVipOpen, setIsVipOpen] = useState<boolean>(false);
  const [isFairOpen, setIsFairOpen] = useState<boolean>(false);
  const [isSupportOpen, setIsSupportOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Toggle Mute
  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.isMuted = next;
  };

  // Balance Update
  const handleBalanceChange = (newBalance: number) => {
    setUserProfile((prev) => ({
      ...prev,
      balance: Math.max(0, newBalance),
    }));
  };

  // Win Handler
  const handleWin = (winAmount: number, gameTitle: string) => {
    const newTx: Transaction = {
      id: `TX-WIN-${Date.now().toString().slice(-8)}`,
      type: 'win',
      amount: winAmount,
      status: 'completed',
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      notes: `${gameTitle} Payout Won`,
    };

    setTransactions((prev) => [newTx, ...prev]);
    setUserProfile((prev) => ({
      ...prev,
      totalWon: prev.totalWon + winAmount,
      vipPoints: prev.vipPoints + Math.floor(winAmount / 50),
    }));
  };

  // Deposit Success
  const handleDepositSuccess = (amount: number, tx: Transaction) => {
    const bonus = Math.round(amount * 0.1);
    const totalCredit = amount + bonus;

    setTransactions((prev) => [tx, ...prev]);
    setUserProfile((prev) => ({
      ...prev,
      balance: prev.balance + totalCredit,
      totalDeposited: prev.totalDeposited + amount,
      vipPoints: prev.vipPoints + Math.floor(amount / 20),
    }));
  };

  // Withdraw Success
  const handleWithdrawSuccess = (amount: number, tx: Transaction) => {
    setTransactions((prev) => [tx, ...prev]);
    setUserProfile((prev) => ({
      ...prev,
      balance: Math.max(0, prev.balance - amount),
      totalWithdrawn: prev.totalWithdrawn + amount,
    }));
  };

  // Claim VIP Cashback
  const handleClaimCashback = (amount: number, tx: Transaction) => {
    setTransactions((prev) => [tx, ...prev]);
    setUserProfile((prev) => ({
      ...prev,
      balance: prev.balance + amount,
    }));
  };

  // Game Cards Configuration
  const gamesList = [
    {
      id: 'langur-burja' as GameType,
      title: 'Langur Burja (झण्डा बुर्जा)',
      subtitle: 'Traditional Festival 6-Dice Game',
      category: 'nepali',
      badge: 'Nepal #1 Favorite',
      image: LANGUR_BURJA_IMG,
      minBet: 'रू 50',
      maxPayout: '6x Multiplier',
      rtp: '98.2%',
    },
    {
      id: 'aviator' as GameType,
      title: 'Aviator Crash (Everest Flight)',
      subtitle: 'Climb Mt. Everest & Cash Out Real Money',
      category: 'crash',
      badge: 'Hot & Trending',
      image: AVIATOR_IMG,
      minBet: 'रू 50',
      maxPayout: '100x+ Jackpot',
      rtp: '97.5%',
    },
    {
      id: 'teen-patti' as GameType,
      title: 'Teen Patti Royale (तीन पत्ती)',
      subtitle: 'Classic South Asian 3-Card Poker',
      category: 'table',
      badge: 'Live Tables',
      image: TEEN_PATTI_IMG,
      minBet: 'रू 50',
      maxPayout: 'Trail of Aces',
      rtp: '96.8%',
    },
    {
      id: 'roulette' as GameType,
      title: 'Royal European Roulette',
      subtitle: '37-Number Wheel with Single Zero',
      category: 'table',
      badge: 'VIP Stakes',
      image: HERO_BANNER_IMG,
      minBet: 'रू 50',
      maxPayout: '36x Straight Up',
      rtp: '97.3%',
    },
    {
      id: 'slots' as GameType,
      title: 'Himalayan Treasures 5-Reel Slot',
      subtitle: 'Golden Khukuri Wilds & 10 Free Spins',
      category: 'slots',
      badge: 'रू 1.4M Jackpot',
      image: HERO_BANNER_IMG,
      minBet: 'रू 20',
      maxPayout: '50x Everest Wild',
      rtp: '96.5%',
    },
  ];

  const filteredGames = gamesList.filter((g) => {
    if (activeFilter === 'all') return true;
    return g.category === activeFilter;
  });

  return (
    <div className="min-h-screen bg-[#06120e] text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      
      {/* 3-Zone Clean Header */}
      <Navbar
        balance={userProfile.balance}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenDeposit={() => setIsDepositOpen(true)}
        onOpenWithdraw={() => setIsWithdrawOpen(true)}
        onOpenTransactions={() => setIsTxOpen(true)}
        onOpenVip={() => setIsVipOpen(true)}
        onOpenProvablyFair={() => setIsFairOpen(true)}
        onOpenSupport={() => setIsSupportOpen(true)}
        onSelectNav={(nav) => {
          setActiveNav(nav);
          if (nav === 'lobby') setActiveGame(null);
        }}
        activeNav={activeNav}
      />

      {/* Real-Time Live Winners Ticker across Nepal */}
      <LiveWinnersTicker />

      {/* Main View: Either Active Game View OR Full Casino Lobby */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {activeGame ? (
          /* Active Playing Game Table */
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setActiveGame(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400/50 text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                ← Back to Casino Lobby
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDepositOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 shadow-md flex items-center gap-1.5"
                >
                  <span>Quick Deposit (eSewa QR)</span>
                </button>
              </div>
            </div>

            {/* Render Specific Selected Game */}
            {activeGame === 'langur-burja' && (
              <LangurBurja
                balance={userProfile.balance}
                onBalanceChange={handleBalanceChange}
                onWin={handleWin}
                onOpenDeposit={() => setIsDepositOpen(true)}
              />
            )}

            {activeGame === 'aviator' && (
              <AviatorGame
                balance={userProfile.balance}
                onBalanceChange={handleBalanceChange}
                onWin={handleWin}
                onOpenDeposit={() => setIsDepositOpen(true)}
              />
            )}

            {activeGame === 'teen-patti' && (
              <TeenPatti
                balance={userProfile.balance}
                onBalanceChange={handleBalanceChange}
                onWin={handleWin}
                onOpenDeposit={() => setIsDepositOpen(true)}
              />
            )}

            {activeGame === 'roulette' && (
              <RouletteGame
                balance={userProfile.balance}
                onBalanceChange={handleBalanceChange}
                onWin={handleWin}
                onOpenDeposit={() => setIsDepositOpen(true)}
              />
            )}

            {activeGame === 'slots' && (
              <SlotMachine
                balance={userProfile.balance}
                onBalanceChange={handleBalanceChange}
                onWin={handleWin}
                onOpenDeposit={() => setIsDepositOpen(true)}
              />
            )}
          </div>
        ) : (
          /* Casino Lobby Home View */
          <div className="space-y-10">
            
            {/* Hero Banner Section */}
            <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl bg-[#091a13]">
              <div className="relative min-h-[380px] sm:min-h-[440px] flex items-center">
                {/* Hero Background Image */}
                <img
                  src={HERO_BANNER_IMG}
                  alt="Kathmandu Royale Luxury Casino"
                  className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.38]"
                  referrerPolicy="no-referrer"
                />

                {/* Scrim Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#06140e] via-[#06140e]/90 to-transparent" />

                {/* Hero Content */}
                <div className="relative z-10 p-6 sm:p-12 max-w-2xl space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Nepal's Premier Real-Money Online Casino</span>
                  </div>

                  <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white leading-tight">
                    Play & Win Real Money in Nepal
                  </h1>

                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                    Instant deposits via <strong>eSewa Scan & Pay QR</strong>. Play authentic Nepali Langur Burja, Everest Aviator Crash, Teen Patti, and Roulette with zero latency payouts directly to your eSewa, Khalti, or Bank.
                  </p>

                  {/* Primary CTA Row */}
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setIsDepositOpen(true);
                      }}
                      className="px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 shadow-xl shadow-amber-500/30 transition-all flex items-center gap-2 transform active:scale-95"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Deposit via eSewa QR (+10% Bonus)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setActiveGame('langur-burja');
                      }}
                      className="px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-slate-900/80 hover:bg-slate-800 border border-amber-400/30 hover:border-amber-400 transition-all flex items-center gap-2"
                    >
                      <span>Play Langur Burja</span>
                      <ArrowRight className="w-4 h-4 text-amber-400" />
                    </button>
                  </div>

                  {/* Trust markers (Adjacency to claim) */}
                  <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Instant eSewa Clearance</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>5–15 Min Payouts</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-blue-400" />
                      <span>Provably Fair SHA-256</span>
                    </div>
                  </div>
                </div>

                {/* Right Side Highlight: User's Official eSewa QR Code Showcase */}
                <div className="hidden xl:block absolute right-12 top-1/2 -translate-y-1/2 z-10">
                  <div
                    onClick={() => {
                      sound.playClick();
                      setIsDepositOpen(true);
                    }}
                    className="p-4 rounded-3xl bg-black/70 border-2 border-amber-400/40 backdrop-blur-md shadow-2xl hover:border-amber-400 transition-all cursor-pointer group text-center"
                  >
                    <div className="p-2 bg-white rounded-2xl shadow-lg">
                      <img
                        src={ESEWA_QR_IMG}
                        alt="Deposit eSewa QR Code"
                        className="w-44 h-44 object-contain rounded-xl group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="mt-3">
                      <span className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1">
                        <QrCode className="w-3.5 h-3.5" />
                        Click to Scan & Deposit
                      </span>
                      <span className="text-[10px] text-slate-400">0% Commission · Instant Credit</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Quick Action Deposit & Withdraw Banner Strip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Box 1: eSewa QR Quick Deposit */}
              <div
                onClick={() => {
                  sound.playClick();
                  setIsDepositOpen(true);
                }}
                className="p-5 rounded-2xl bg-[#091f16] border border-emerald-500/30 hover:border-emerald-400 transition-all cursor-pointer group flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1">
                      eSewa QR Deposit <span className="text-emerald-400">→</span>
                    </h3>
                    <p className="text-xs text-slate-400">Scan QR to add real NPR funds</p>
                  </div>
                </div>
                <span className="text-xs font-bold font-mono text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-lg">
                  Instant
                </span>
              </div>

              {/* Box 2: Quick Withdraw Winnings */}
              <div
                onClick={() => {
                  sound.playClick();
                  setIsWithdrawOpen(true);
                }}
                className="p-5 rounded-2xl bg-[#141d09] border border-amber-500/30 hover:border-amber-400 transition-all cursor-pointer group flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                    <ArrowDownToLine className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1">
                      Withdraw Real Cash <span className="text-amber-400">→</span>
                    </h3>
                    <p className="text-xs text-slate-400">To eSewa, Khalti, or Nabil Bank</p>
                  </div>
                </div>
                <span className="text-xs font-bold font-mono text-amber-400 bg-amber-950 px-2.5 py-1 rounded-lg">
                  5–15m
                </span>
              </div>

              {/* Box 3: VIP Loyalty Cashback */}
              <div
                onClick={() => {
                  sound.playClick();
                  setIsVipOpen(true);
                }}
                className="p-5 rounded-2xl bg-[#170e1d] border border-purple-500/30 hover:border-purple-400 transition-all cursor-pointer group flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1">
                      VIP Lounge & Cashback <span className="text-purple-400">→</span>
                    </h3>
                    <p className="text-xs text-slate-400">{userProfile.vipTier} Member · Claim Rewards</p>
                  </div>
                </div>
                <span className="text-xs font-bold font-mono text-purple-400 bg-purple-950 px-2.5 py-1 rounded-lg">
                  Active
                </span>
              </div>
            </div>

            {/* Game Navigation & Category Filter */}
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold font-display text-white tracking-tight">
                    Casino Games Catalog
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select any game to place real NPR bets and withdraw instant cash
                  </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 p-1 bg-[#091a13] border border-slate-800 rounded-xl overflow-x-auto max-w-full">
                  {[
                    { id: 'all', label: 'All Games' },
                    { id: 'nepali', label: '🇳🇵 Traditional' },
                    { id: 'crash', label: 'Aviator Crash' },
                    { id: 'table', label: 'Cards & Table' },
                    { id: 'slots', label: 'Slots' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        sound.playClick();
                        setActiveFilter(tab.id as typeof activeFilter);
                      }}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
                        activeFilter === tab.id
                          ? 'bg-amber-400 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Games Grid Showcase */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGames.map((game) => (
                  <div
                    key={game.id}
                    onClick={() => {
                      sound.playClick();
                      setActiveGame(game.id);
                    }}
                    className="group relative rounded-3xl overflow-hidden bg-[#0a1813] border border-slate-800 hover:border-amber-400/60 shadow-xl transition-all duration-300 cursor-pointer flex flex-col hover:-translate-y-1.5"
                  >
                    {/* Game Artwork */}
                    <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-900">
                      <img
                        src={game.image}
                        alt={game.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a1813] via-transparent to-black/30" />

                      {/* Badge Top Left */}
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 border border-amber-400/40 text-[11px] font-bold text-amber-300 backdrop-blur-md">
                        {game.badge}
                      </div>

                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                        <span className="px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                          Play Game Now
                        </span>
                      </div>
                    </div>

                    {/* Game Info Details */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                          {game.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                          {game.subtitle}
                        </p>
                      </div>

                      {/* Specs */}
                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                        <div>
                          <span className="block text-[10px] uppercase font-bold text-slate-500">Min Bet</span>
                          <span className="font-mono-numbers font-bold text-slate-200">{game.minBet}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] uppercase font-bold text-slate-500">Max Win</span>
                          <span className="font-bold text-amber-400">{game.maxPayout}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] uppercase font-bold text-slate-500">Certified RTP</span>
                          <span className="font-mono text-emerald-400 font-bold">{game.rtp}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step-by-Step "How Real Money Deposits Work in Nepal" Guide */}
            <div className="p-8 rounded-3xl bg-gradient-to-r from-[#0d2218] via-[#091a13] to-[#0d2218] border border-amber-500/20 space-y-6">
              <div>
                <h3 className="text-2xl font-bold font-display text-white">
                  How Real Investment & eSewa Deposits Work
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  100% Secure, Automated, and Verified for Nepali players
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-black/40 border border-slate-800">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 font-black text-sm flex items-center justify-center mb-3">
                    1
                  </div>
                  <h4 className="font-bold text-sm text-white">Scan eSewa QR</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Open eSewa app on your phone and scan our verified QR code directly from the deposit popup.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-slate-800">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 font-black text-sm flex items-center justify-center mb-3">
                    2
                  </div>
                  <h4 className="font-bold text-sm text-white">Instant Credit</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Enter your Transaction ID. Funds + 10% cash bonus are credited to your casino balance automatically.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-slate-800">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 font-black text-sm flex items-center justify-center mb-3">
                    3
                  </div>
                  <h4 className="font-bold text-sm text-white">Play & Win Real NPR</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Bet on Langur Burja, Aviator Crash, Roulette, or Teen Patti with provably fair RNG algorithms.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-slate-800">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 font-black text-sm flex items-center justify-center mb-3">
                    4
                  </div>
                  <h4 className="font-bold text-sm text-white">Cashout in 5 Mins</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Request payout to your eSewa, Khalti, or Nabil/NIC Asia Bank account with 0% fee.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-16 bg-[#040e0a] border-t border-slate-800/80 py-10 px-4 sm:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="font-display font-black text-base text-amber-300">
                KATHMANDU ROYALE CASINO
              </span>
              <span className="text-[10px] text-slate-400">काठमाडौँ, नेपाल</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Licensed Real-Money Entertainment Platform · Supporting eSewa, Khalti & ConnectIPS
            </p>
          </div>

          <div className="flex items-center gap-6 text-slate-400">
            <button
              onClick={() => setIsFairOpen(true)}
              className="hover:text-amber-400 transition-colors"
            >
              Provably Fair
            </button>
            <button
              onClick={() => setIsVipOpen(true)}
              className="hover:text-amber-400 transition-colors"
            >
              VIP Terms
            </button>
            <button
              onClick={() => setIsSupportOpen(true)}
              className="hover:text-amber-400 transition-colors"
            >
              24/7 Live Support
            </button>
          </div>

          <div className="text-center md:text-right text-[11px] text-slate-500">
            <span>Responsible Gaming 18+ · Helpline: 01-4422000</span>
            <p>© {new Date().getFullYear()} Kathmandu Royale Gaming Nepal. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Floating 24/7 Support Trigger Button */}
      <button
        type="button"
        onClick={() => {
          sound.playClick();
          setIsSupportOpen(true);
        }}
        className="fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-2xl shadow-emerald-950/80 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border border-emerald-400/40"
        title="24/7 Live Support"
      >
        <PhoneCall className="w-5 h-5" />
        <span className="hidden sm:inline text-xs font-bold">24/7 Live Support</span>
      </button>

      {/* Modals */}
      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        onDepositSuccess={handleDepositSuccess}
      />

      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        balance={userProfile.balance}
        onWithdrawSuccess={handleWithdrawSuccess}
      />

      <TransactionsModal
        isOpen={isTxOpen}
        onClose={() => setIsTxOpen(false)}
        transactions={transactions}
      />

      <VipModal
        isOpen={isVipOpen}
        onClose={() => setIsVipOpen(false)}
        profile={userProfile}
        onClaimCashback={handleClaimCashback}
      />

      <ProvablyFairModal
        isOpen={isFairOpen}
        onClose={() => setIsFairOpen(false)}
      />

      <SupportChatModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        onOpenDeposit={() => {
          setIsSupportOpen(false);
          setIsDepositOpen(true);
        }}
      />

    </div>
  );
}
