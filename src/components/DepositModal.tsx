import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck, Download, Copy, AlertCircle, Sparkles, UploadCloud, ArrowRight } from 'lucide-react';
import { sound } from '../utils/audio';
import { Transaction, PaymentMethod } from '../types';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDepositSuccess: (amount: number, tx: Transaction) => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  onDepositSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('esewa');
  const [amount, setAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [senderPhone, setSenderPhone] = useState<string>('');
  const [transactionCode, setTransactionCode] = useState<string>('');
  const [uploadedReceiptName, setUploadedReceiptName] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationStep, setVerificationStep] = useState<string>('');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [recentTx, setRecentTx] = useState<Transaction | null>(null);

  if (!isOpen) return null;

  const quickAmounts = [500, 1000, 2500, 5000, 10000, 25000];

  const handleSelectAmount = (val: number) => {
    sound.playClick();
    setAmount(val);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      setAmount(num);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    sound.playClick();
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedReceiptName(e.target.files[0].name);
      sound.playClick();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount < 100) {
      alert('Minimum deposit amount is रू 100.');
      return;
    }
    if (selectedMethod === 'esewa') {
      if (!senderPhone || senderPhone.length < 10) {
        alert('Please enter a valid 10-digit eSewa mobile number (e.g., 98xxxxxxxx).');
        return;
      }
      if (!transactionCode || transactionCode.trim().length < 6) {
        alert('Please enter the 6+ digit Transaction Code / Reference ID from your eSewa receipt.');
        return;
      }
    }

    setIsVerifying(true);
    setVerificationStep('Connecting to eSewa payment gateway...');
    sound.playClick();

    setTimeout(() => {
      setVerificationStep(`Verifying Transaction Ref: ${transactionCode || 'ESEWA-' + Date.now().toString().slice(-6)}...`);
    }, 900);

    setTimeout(() => {
      setVerificationStep('Matching transaction amount रू ' + amount.toLocaleString('en-IN') + '...');
    }, 1800);

    setTimeout(() => {
      setIsVerifying(false);
      const newTx: Transaction = {
        id: `TX-DEP-${Date.now().toString().slice(-8)}`,
        type: 'deposit',
        amount: amount,
        paymentMethod: selectedMethod,
        referenceId: transactionCode || `ESW${Math.floor(10000000 + Math.random() * 90000000)}`,
        accountNumber: senderPhone || '9841000000',
        status: 'completed',
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
        notes: `eSewa Direct Deposit Verified (Bonus +10% रू ${(amount * 0.1).toFixed(0)})`,
      };

      setRecentTx(newTx);
      setShowSuccessModal(true);
      sound.playWin();
      onDepositSuccess(amount, newTx);
    }, 2800);
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    onClose();
    // reset form
    setSenderPhone('');
    setTransactionCode('');
    setUploadedReceiptName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#091a13] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden my-8 text-slate-100">
        
        {/* Modal Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-[#0d281e] via-[#091a13] to-[#0d281e] border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              रू
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Deposit Funds <span className="text-xs font-normal text-amber-400 font-mono">रकम जम्मा गर्नुहोस्</span>
              </h2>
              <p className="text-xs text-slate-400">
                Official Real-Money Gateway · Instant eSewa Auto-Verification
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Close deposit modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bonus Promo Banner */}
        <div className="mx-6 mt-4 p-3 rounded-xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-amber-500/15 border border-amber-500/30 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-300 font-medium">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
            <span>Dashain & Tihar Special: +10% Instant Cash Bonus on all eSewa Deposits!</span>
          </div>
          <span className="text-amber-400 font-bold whitespace-nowrap">Instant Credit</span>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          
          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Deposit Gateway (भुक्तानी माध्यम)
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setSelectedMethod('esewa');
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                  selectedMethod === 'esewa'
                    ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 ring-2 ring-emerald-500/30'
                    : 'border-slate-800 bg-[#0d221a]/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  eSewa QR Pay
                </div>
                <span className="text-[11px] text-emerald-400/90 mt-0.5">Recommended (0% Fee)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setSelectedMethod('khalti');
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                  selectedMethod === 'khalti'
                    ? 'border-purple-500 bg-purple-950/40 text-purple-300 ring-2 ring-purple-500/30'
                    : 'border-slate-800 bg-[#0d221a]/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                  Khalti Wallet
                </div>
                <span className="text-[11px] text-slate-400 mt-0.5">Instant Mobile Pay</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setSelectedMethod('bank_transfer');
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                  selectedMethod === 'bank_transfer'
                    ? 'border-amber-500 bg-amber-950/40 text-amber-300 ring-2 ring-amber-500/30'
                    : 'border-slate-800 bg-[#0d221a]/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  Nepal Bank Wire
                </div>
                <span className="text-[11px] text-slate-400 mt-0.5">Nabil / NIC Asia</span>
              </button>
            </div>
          </div>

          {/* Quick Amount Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Select Amount (रकम छान्नुहोस्)
              </label>
              <span className="text-xs text-amber-400">Min: रू 100 · Max: रू 1,00,000</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {quickAmounts.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleSelectAmount(val)}
                  className={`py-2 px-1 text-center font-bold text-sm rounded-lg border transition-all font-mono-numbers ${
                    amount === val && !customAmount
                      ? 'border-amber-400 bg-gradient-to-b from-amber-500/20 to-amber-600/30 text-amber-300 shadow-sm'
                      : 'border-slate-800 bg-[#0d241c]/50 text-slate-300 hover:border-amber-500/40'
                  }`}
                >
                  रू {val.toLocaleString('en-IN')}
                </button>
              ))}
            </div>

            {/* Custom Amount input */}
            <div className="mt-3 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-amber-400 font-mono-numbers">
                रू
              </span>
              <input
                type="number"
                min="100"
                max="100000"
                step="50"
                placeholder="Or enter custom amount in रू (e.g. 3500)"
                value={customAmount}
                onChange={handleCustomAmountChange}
                className="w-full bg-[#05110c] border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none font-mono-numbers transition-colors"
              />
            </div>
          </div>

          {/* eSewa QR Code Showcase Section (Primary Requested Feature) */}
          {selectedMethod === 'esewa' && (
            <div className="p-4 rounded-2xl bg-[#06140e] border border-emerald-500/30">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                
                {/* Official eSewa QR Code Image */}
                <div className="relative group shrink-0 flex flex-col items-center">
                  <div className="p-2.5 bg-white rounded-2xl shadow-xl shadow-emerald-950/80 border-2 border-emerald-500/50">
                    <img
                      src="/assets/aistudio/E5HBILWmumE_a0e62fd6.jpeg"
                      alt="Official eSewa Scan & Pay QR Code"
                      className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-xl"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <a
                      href="/assets/aistudio/E5HBILWmumE_a0e62fd6.jpeg"
                      download="eSewa_Deposit_QR.jpeg"
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Save QR Image
                    </a>
                    <span className="text-slate-600">·</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('Kathmandu Royale Casino Official', 'merchant')}
                      className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copiedText === 'merchant' ? 'Copied!' : 'Merchant Info'}
                    </button>
                  </div>
                </div>

                {/* Step Instructions in Nepali & English */}
                <div className="space-y-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/20 text-emerald-300">
                    <p className="font-semibold text-sm text-emerald-200 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      eSewa Scan & Pay Instructions:
                    </p>
                    <p className="text-[11px] text-emerald-300/80 mt-0.5">
                      तल दिएको eSewa QR कोड स्क्यान गरी रकम भुक्तानी गर्नुहोस्।
                    </p>
                  </div>

                  <ol className="space-y-2 text-slate-300 pl-1">
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                        1
                      </span>
                      <span>
                        Open your <strong>eSewa app</strong> on your phone and tap <strong>Scan & Pay</strong>.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                        2
                      </span>
                      <span>
                        Scan the QR code shown here and pay exactly <strong>रू {amount.toLocaleString('en-IN')}</strong>.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                        3
                      </span>
                      <span>
                        Copy the <strong>Transaction Code / Reference ID</strong> from the eSewa completed receipt.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                        4
                      </span>
                      <span>
                        Enter your eSewa phone number and Transaction code below for instant automated credit!
                      </span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* Khalti Details View */}
          {selectedMethod === 'khalti' && (
            <div className="p-4 rounded-2xl bg-[#110d1f] border border-purple-500/30 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-purple-300">Khalti Direct Merchant Deposit</h4>
                  <p className="text-slate-400">Khalti ID: 9801234567 (Royale Entertainment Nepal)</p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard('9801234567', 'khalti')}
                  className="px-2.5 py-1 rounded bg-purple-900/60 border border-purple-500/40 text-purple-300 text-[11px] flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  {copiedText === 'khalti' ? 'Copied' : 'Copy ID'}
                </button>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Send रू {amount.toLocaleString('en-IN')} directly via Khalti to ID <code className="text-purple-300 font-mono">9801234567</code>. Mention your username in the remarks and enter the Khalti Tx ID below.
              </p>
            </div>
          )}

          {/* Bank Transfer View */}
          {selectedMethod === 'bank_transfer' && (
            <div className="p-4 rounded-2xl bg-[#1c1809] border border-amber-500/30 text-xs space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-black/40 border border-amber-500/20">
                  <span className="text-[10px] text-amber-400 uppercase font-semibold">Option A · Nabil Bank</span>
                  <p className="font-bold text-slate-200 mt-1">A/C: 01901017500982</p>
                  <p className="text-slate-400 text-[11px]">Kathmandu Royale Hospitality Ltd.</p>
                  <p className="text-slate-400 text-[11px]">Branch: Teendhara, Kathmandu</p>
                </div>
                <div className="p-3 rounded-lg bg-black/40 border border-amber-500/20">
                  <span className="text-[10px] text-amber-400 uppercase font-semibold">Option B · NIC Asia Bank</span>
                  <p className="font-bold text-slate-200 mt-1">A/C: 24405910245012</p>
                  <p className="text-slate-400 text-[11px]">Kathmandu Royale Gaming Pvt Ltd</p>
                  <p className="text-slate-400 text-[11px]">Branch: New Road, Kathmandu</p>
                </div>
              </div>
              <p className="text-slate-400 text-[11px]">
                IPS / ConnectIPS transfers are verified within 1–3 minutes. Please enter the voucher/Tx reference below.
              </p>
            </div>
          )}

          {/* Submission Form: Sender details & Proof */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Sender eSewa Mobile Number (तपाईंको eSewa नम्बर) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9841234567"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  className="w-full bg-[#05110c] border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none font-mono-numbers transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Transaction Code / Ref ID (रसिद कोड) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 0A7B92CD or 9823419"
                  value={transactionCode}
                  onChange={(e) => setTransactionCode(e.target.value.toUpperCase())}
                  className="w-full bg-[#05110c] border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none font-mono transition-colors"
                />
              </div>
            </div>

            {/* Optional Screenshot Receipt Attachment */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Payment Screenshot Proof (रसिदको फोटो - Optional for Faster Approval)
              </label>
              <label className="flex items-center justify-between p-3 rounded-xl border border-dashed border-slate-700 hover:border-amber-500/50 bg-[#06140e] cursor-pointer transition-colors">
                <div className="flex items-center gap-2.5 text-xs text-slate-400">
                  <UploadCloud className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="truncate max-w-xs">
                    {uploadedReceiptName ? uploadedReceiptName : 'Click to attach payment screenshot (.jpg, .png)'}
                  </span>
                </div>
                <span className="text-[11px] font-medium text-amber-400 hover:underline">
                  {uploadedReceiptName ? 'Change File' : 'Browse'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Verification State Banner */}
            {isVerifying && (
              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin shrink-0" />
                <div className="text-xs">
                  <p className="font-semibold text-amber-300">{verificationStep}</p>
                  <p className="text-amber-400/80 text-[11px]">Connecting directly to Nepal clearing switch...</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                disabled={isVerifying}
                className="px-4 py-2.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-colors"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={isVerifying}
                className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <span>Verify & Add रू {amount.toLocaleString('en-IN')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>

        </div>

      </div>

      {/* Success Modal Overlay */}
      {showSuccessModal && recentTx && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#091f16] border border-emerald-500/40 rounded-2xl p-6 text-center shadow-2xl relative">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-500/20">
              <CheckCircle className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-bold text-white mb-1">
              Deposit Successful!
            </h3>
            <p className="text-xs text-emerald-400 font-medium mb-4">
              रकम सफलतापूर्वक तपाईंको खातामा जम्मा भयो।
            </p>

            <div className="p-4 rounded-xl bg-black/40 border border-emerald-500/20 text-left text-xs space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-slate-400">Credited Amount:</span>
                <span className="font-bold text-white font-mono-numbers text-sm">रू {recentTx.amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Dashain +10% Bonus:</span>
                <span className="font-bold text-amber-400 font-mono-numbers">+रू {(recentTx.amount * 0.1).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Transaction Ref:</span>
                <span className="font-mono text-emerald-300">{recentTx.referenceId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Gateway:</span>
                <span className="font-semibold text-emerald-400 uppercase">{recentTx.paymentMethod} QR</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-semibold text-emerald-400">Verified & Available Now</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSuccessClose}
              className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider text-slate-950 bg-gradient-to-r from-emerald-400 to-amber-400 hover:brightness-110 shadow-lg shadow-emerald-500/20 transition-all"
            >
              Start Playing Games Now
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
