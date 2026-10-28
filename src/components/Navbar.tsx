import React from 'react';
import { Volume2, VolumeX, ShieldCheck, History, ArrowDownToLine, PlusCircle } from 'lucide-react';
import { sound } from '../utils/audio';

interface NavbarProps {
  balance: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenTransactions: () => void;
  onOpenVip: () => void;
  onOpenProvablyFair: () => void;
  onOpenSupport: () => void;
  onSelectNav: (nav: string) => void;
  activeNav: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  balance,
  isMuted,
  onToggleMute,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenTransactions,
  onOpenVip,
  onOpenProvablyFair,
  onOpenSupport,
  onSelectNav,
  activeNav,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#06140e]/95 backdrop-blur-md border-b border-amber-500/20 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-8">
      {/* Zone 1: Single text element wordmark */}
      <div
        onClick={() => {
          sound.playClick();
          onSelectNav('lobby');
        }}
        className="cursor-pointer flex items-center gap-2.5 whitespace-nowrap shrink-0 select-none"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
          👑
        </div>
        <span className="font-display font-black text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-100 to-amber-400">
          KATHMANDU ROYALE
        </span>
      </div>

      {/* Zone 2: 4–5 clean single-line text navigation links */}
      <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold uppercase tracking-wider text-slate-300">
        <button
          onClick={() => {
            sound.playClick();
            onSelectNav('lobby');
          }}
          className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 ${
            activeNav === 'lobby' ? 'text-amber-400 underline underline-offset-8 decoration-2' : ''
          }`}
        >
          Games Lobby
        </button>
        <button
          onClick={() => {
            sound.playClick();
            onOpenVip();
          }}
          className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0"
        >
          VIP Lounge
        </button>
        <button
          onClick={() => {
            sound.playClick();
            onOpenProvablyFair();
          }}
          className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0"
        >
          Provably Fair
        </button>
        <button
          onClick={() => {
            sound.playClick();
            onOpenTransactions();
          }}
          className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0"
        >
          Transactions
        </button>
        <button
          onClick={() => {
            sound.playClick();
            onOpenSupport();
          }}
          className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0"
        >
          24/7 Support
        </button>
      </nav>

      {/* Zone 3: 1 primary action cluster (Balance + Deposit eSewa CTA) */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Sound Toggle */}
        <button
          type="button"
          onClick={onToggleMute}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        {/* Real Balance Box */}
        <div
          onClick={() => {
            sound.playClick();
            onOpenTransactions();
          }}
          className="cursor-pointer px-3.5 py-1.5 rounded-xl bg-[#091f16] border border-amber-500/30 hover:border-amber-400/60 transition-all flex items-center gap-2 select-none"
        >
          <div className="text-right">
            <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">
              Real Balance
            </span>
            <span className="font-mono-numbers font-black text-sm text-amber-300">
              रू {balance.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Cashout / Withdraw Button */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onOpenWithdraw();
          }}
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 border border-slate-700 hover:border-emerald-500/50 rounded-xl transition-all whitespace-nowrap shrink-0"
        >
          <ArrowDownToLine className="w-3.5 h-3.5 text-emerald-400" />
          <span>Withdraw</span>
        </button>

        {/* Primary Deposit Button (eSewa Featured) */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onOpenDeposit();
          }}
          className="px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 shadow-lg shadow-amber-500/25 transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 transform active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Deposit (eSewa QR)</span>
        </button>
      </div>
    </header>
  );
};
