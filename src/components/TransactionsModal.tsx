import React, { useState } from 'react';
import { X, ArrowDownLeft, ArrowUpRight, Trophy, History, Check, Clock } from 'lucide-react';
import { Transaction } from '../types';
import { sound } from '../utils/audio';

interface TransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
}

export const TransactionsModal: React.FC<TransactionsModalProps> = ({
  isOpen,
  onClose,
  transactions,
}) => {
  const [filter, setFilter] = useState<'all' | 'deposit' | 'withdrawal' | 'win'>('all');

  if (!isOpen) return null;

  const filtered = transactions.filter((t) => {
    if (filter === 'all') return true;
    return t.type === filter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0a1813] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden my-8 text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#0d281e] via-[#091a13] to-[#0d281e] border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Transaction History <span className="text-xs font-normal text-amber-400 font-mono">कारोबार इतिहास</span>
              </h2>
              <p className="text-xs text-slate-400">
                Audited deposits, real-money withdrawals, and game winnings
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter controls */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            {(['all', 'deposit', 'withdrawal', 'win'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  sound.playClick();
                  setFilter(tab);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  filter === tab
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {tab === 'win' ? 'Game Winnings' : tab}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No transactions recorded in this category yet.
              </div>
            ) : (
              filtered.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-xl bg-[#06140e] border border-slate-800/80 hover:border-slate-700 flex items-center justify-between gap-4 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        tx.type === 'deposit'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : tx.type === 'withdrawal'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      }`}
                    >
                      {tx.type === 'deposit' ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : tx.type === 'withdrawal' ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : (
                        <Trophy className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white capitalize">
                          {tx.type} {tx.paymentMethod ? `via ${tx.paymentMethod.toUpperCase()}` : ''}
                        </span>
                        {tx.status === 'completed' ? (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                            <Check className="w-3 h-3" /> Completed
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] text-amber-400 font-medium">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {tx.notes || (tx.referenceId ? `Ref: ${tx.referenceId}` : tx.date)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p
                      className={`font-mono-numbers font-bold text-sm ${
                        tx.type === 'deposit' || tx.type === 'win'
                          ? 'text-emerald-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {tx.type === 'withdrawal' ? '-' : '+'} रू {tx.amount.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{tx.date}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#06120e] border-t border-slate-800 text-right">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
