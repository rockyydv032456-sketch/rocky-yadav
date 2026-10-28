import React, { useState } from 'react';
import { X, CheckCircle, ArrowDownToLine, AlertCircle, Building2, Smartphone } from 'lucide-react';
import { sound } from '../utils/audio';
import { Transaction, PaymentMethod } from '../types';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  onWithdrawSuccess: (amount: number, tx: Transaction) => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  balance,
  onWithdrawSuccess,
}) => {
  const [method, setMethod] = useState<PaymentMethod>('esewa');
  const [amount, setAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [accountName, setAccountName] = useState<string>('');
  const [bankName, setBankName] = useState<string>('Nabil Bank');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successTx, setSuccessTx] = useState<Transaction | null>(null);

  if (!isOpen) return null;

  const quickPercentages = [
    { label: 'रू 500', value: 500 },
    { label: 'रू 2,000', value: 2000 },
    { label: 'रू 5,000', value: 5000 },
    { label: '50% Balance', value: Math.floor(balance * 0.5) },
    { label: '100% All Out', value: balance },
  ];

  const handleSelectAmount = (val: number) => {
    sound.playClick();
    setAmount(Math.min(balance, Math.max(0, val)));
    setCustomAmount('');
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      setAmount(num);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < 500) {
      alert('Minimum withdrawal amount is रू 500.');
      return;
    }
    if (amount > balance) {
      alert(`Insufficient balance. Your current withdrawable balance is रू ${balance.toLocaleString('en-IN')}.`);
      return;
    }
    if (!accountNumber || accountNumber.trim().length < 8) {
      alert('Please enter a valid Account Number or Wallet ID.');
      return;
    }
    if (!accountName || accountName.trim().length < 3) {
      alert('Please enter your full registered Account Holder Name.');
      return;
    }

    setIsProcessing(true);
    sound.playClick();

    setTimeout(() => {
      setIsProcessing(false);
      const tx: Transaction = {
        id: `TX-WTH-${Date.now().toString().slice(-8)}`,
        type: 'withdrawal',
        amount: amount,
        paymentMethod: method,
        accountNumber: accountNumber,
        accountName: accountName,
        referenceId: `OUT-${Math.floor(1000000 + Math.random() * 9000000)}`,
        status: 'completed',
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
        notes: `Payout to ${method.toUpperCase()} (${accountName}) - Transferred`,
      };

      setSuccessTx(tx);
      sound.playWin();
      onWithdrawSuccess(amount, tx);
    }, 2000);
  };

  const handleSuccessClose = () => {
    setSuccessTx(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0a1813] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden my-8 text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#0d281e] via-[#091a13] to-[#0d281e] border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <ArrowDownToLine className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Withdraw Winnings <span className="text-xs font-normal text-emerald-400 font-mono">रकम निकाल्नुहोस्</span>
              </h2>
              <p className="text-xs text-slate-400">
                Direct Nepal Real-Money Payouts · Instant eSewa / Bank Transfer
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

        {/* Balance Card */}
        <div className="p-6 space-y-6">
          <div className="p-4 rounded-xl bg-[#06140e] border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold">Available Withdrawable Balance</span>
              <p className="text-2xl font-bold text-amber-400 font-mono-numbers mt-0.5">
                रू {balance.toLocaleString('en-IN')}
              </p>
            </div>
            <span className="text-[11px] text-emerald-400 font-medium bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
              Instant Payout (5–15 mins)
            </span>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Payout Method (निकासी माध्यम)
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setMethod('esewa');
                }}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                  method === 'esewa'
                    ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 ring-2 ring-emerald-500/20'
                    : 'border-slate-800 bg-[#0d221a]/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-xs">eSewa Wallet</span>
                <span className="text-[10px] text-slate-400">Instant</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setMethod('khalti');
                }}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                  method === 'khalti'
                    ? 'border-purple-500 bg-purple-950/40 text-purple-300 ring-2 ring-purple-500/20'
                    : 'border-slate-800 bg-[#0d221a]/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Smartphone className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-xs">Khalti Wallet</span>
                <span className="text-[10px] text-slate-400">Instant</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setMethod('bank_transfer');
                }}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                  method === 'bank_transfer'
                    ? 'border-amber-500 bg-amber-950/40 text-amber-300 ring-2 ring-amber-500/20'
                    : 'border-slate-800 bg-[#0d221a]/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Building2 className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-xs">Bank Transfer</span>
                <span className="text-[10px] text-slate-400">ConnectIPS</span>
              </button>
            </div>
          </div>

          {/* Quick Amounts */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Withdraw Amount (निकाल्ने रकम)
              </label>
              <span className="text-xs text-amber-400">Min: रू 500</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {quickPercentages.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectAmount(item.value)}
                  className={`py-2 px-2 text-center text-xs font-bold rounded-lg border transition-all font-mono-numbers ${
                    amount === item.value && !customAmount
                      ? 'border-emerald-400 bg-emerald-950/60 text-emerald-300 shadow-sm'
                      : 'border-slate-800 bg-[#0d241c]/50 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="mt-3 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-emerald-400 font-mono-numbers">
                रू
              </span>
              <input
                type="number"
                min="500"
                max={balance}
                step="50"
                placeholder="Enter exact cashout amount"
                value={customAmount}
                onChange={handleCustomChange}
                className="w-full bg-[#05110c] border border-slate-700 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none font-mono-numbers transition-colors"
              />
            </div>
          </div>

          {/* Withdrawal Details Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {method === 'bank_transfer' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Select Nepali Bank
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-[#05110c] border border-slate-700 focus:border-emerald-400 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                >
                  <option value="Nabil Bank">Nabil Bank Limited</option>
                  <option value="NIC Asia Bank">NIC Asia Bank Limited</option>
                  <option value="Global IME Bank">Global IME Bank Limited</option>
                  <option value="Prabhu Bank">Prabhu Bank Limited</option>
                  <option value="Rastriya Banijya Bank">Rastriya Banijya Bank (RBB)</option>
                  <option value="Nepal Investment Mega Bank">Nepal Investment Mega Bank (NIMB)</option>
                  <option value="Sanima Bank">Sanima Bank Limited</option>
                  <option value="Siddhartha Bank">Siddhartha Bank Limited</option>
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {method === 'esewa' ? 'eSewa ID / Phone Number' : method === 'khalti' ? 'Khalti Mobile ID' : 'Bank Account Number'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={method === 'bank_transfer' ? 'e.g. 01901017500123' : 'e.g. 9841xxxxxx'}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full bg-[#05110c] border border-slate-700 focus:border-emerald-400 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none font-mono-numbers"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Account Holder Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar Shrestha"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full bg-[#05110c] border border-slate-700 focus:border-emerald-400 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none"
                />
              </div>
            </div>

            {/* Terms note */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Withdrawals are processed directly through eSewa API / Nepal Clearing House. Winnings will reflect in your account within 5 to 15 minutes. No tax deductions on standard winnings.
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                disabled={isProcessing}
                className="px-4 py-2.5 text-xs font-medium text-slate-400 hover:text-white rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing || amount > balance || amount < 500}
                className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-emerald-400 to-amber-400 hover:brightness-110 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                    <span>Processing Payout...</span>
                  </>
                ) : (
                  <span>Withdraw रू {amount.toLocaleString('en-IN')} Now</span>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* Success Modal */}
      {successTx && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#091f16] border border-emerald-500/40 rounded-2xl p-6 text-center shadow-2xl relative">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-500/20">
              <CheckCircle className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-bold text-white mb-1">
              Withdrawal Initiated!
            </h3>
            <p className="text-xs text-emerald-400 font-medium mb-4">
              रकम तपाईंको खातामा पठाउने कार्य सुरु भयो।
            </p>

            <div className="p-4 rounded-xl bg-black/40 border border-emerald-500/20 text-left text-xs space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-slate-400">Withdrawal Amount:</span>
                <span className="font-bold text-white font-mono-numbers text-sm">रू {successTx.amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Recipient Account:</span>
                <span className="font-mono text-emerald-300">{successTx.accountNumber} ({successTx.accountName})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Gateway:</span>
                <span className="font-semibold text-emerald-400 uppercase">{successTx.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Reference Code:</span>
                <span className="font-mono text-slate-300">{successTx.referenceId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">ETA:</span>
                <span className="font-semibold text-emerald-400">5 – 15 Minutes</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSuccessClose}
              className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider text-slate-950 bg-gradient-to-r from-emerald-400 to-amber-400 hover:brightness-110 shadow-lg shadow-emerald-500/20 transition-all"
            >
              Done & Return to Casino
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
