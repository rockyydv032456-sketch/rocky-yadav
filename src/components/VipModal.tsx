import React, { useState } from 'react';
import { X, Crown, Sparkles, Check, Gift } from 'lucide-react';
import { UserProfile, Transaction } from '../types';
import { sound } from '../utils/audio';

interface VipModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onClaimCashback: (amount: number, tx: Transaction) => void;
}

export const VipModal: React.FC<VipModalProps> = ({
  isOpen,
  onClose,
  profile,
  onClaimCashback,
}) => {
  const [claimed, setClaimed] = useState<boolean>(false);

  if (!isOpen) return null;

  const dailyCashback = Math.round(profile.vipPoints * 0.15 + 250);

  const handleClaim = () => {
    if (claimed) return;
    sound.playWin();
    setClaimed(true);

    const tx: Transaction = {
      id: `TX-VIP-${Date.now().toString().slice(-8)}`,
      type: 'win',
      amount: dailyCashback,
      status: 'completed',
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      notes: `VIP Loyalty Daily Cashback credited (${profile.vipTier})`,
    };

    onClaimCashback(dailyCashback, tx);
  };

  const tiers = [
    { name: 'Silver VIP', minPoints: '0 pts', cashback: '3% Weekly', perk: 'eSewa Fast Lane' },
    { name: 'Gold VIP', minPoints: '1,000 pts', cashback: '6% Weekly', perk: 'Higher limits + Birthday bonus' },
    { name: 'Everest Platinum', minPoints: '5,000 pts', cashback: '10% Daily', perk: 'Dedicated Nepali VIP Host' },
    { name: 'Royal Gurkha VIP', minPoints: '20,000 pts', cashback: '15% Instant', perk: 'Unlimited Payouts + Luxury gifts' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0a1813] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden my-8 text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#171407] via-[#0d261a] to-[#171407] border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Kathmandu Royale VIP Club
              </h2>
              <p className="text-xs text-slate-400">
                Exclusive tiered benefits, rakeback, and daily cash gifts
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Current Tier Status */}
        <div className="p-6 space-y-6">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 to-yellow-500/10 border border-amber-500/30 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Current Tier
              </span>
              <h3 className="text-xl font-black text-white mt-0.5">{profile.vipTier}</h3>
              <p className="text-xs text-slate-400 font-mono-numbers mt-0.5">
                Loyalty Score: {profile.vipPoints} Points
              </p>
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={handleClaim}
                disabled={claimed}
                className="px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:brightness-110 shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all flex items-center gap-1.5"
              >
                <Gift className="w-4 h-4" />
                <span>{claimed ? 'Claimed Today' : `Claim रू ${dailyCashback}`}</span>
              </button>
            </div>
          </div>

          {/* Tier Grid */}
          <div className="space-y-2.5">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              VIP Tier Benefits (स्तर तथा सुविधाहरू)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tiers.map((t, idx) => {
                const isCurrent = t.name === profile.vipTier;
                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/30'
                        : 'bg-[#06140e] border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-sm text-white">{t.name}</span>
                      <span className="text-[10px] text-amber-400 font-mono">{t.minPoints}</span>
                    </div>
                    <p className="text-xs text-emerald-400 font-semibold">{t.cashback}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{t.perk}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#06120e] border-t border-slate-800 text-right">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
