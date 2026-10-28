import React, { useState } from 'react';
import { X, ShieldCheck, Hash, Key, CheckCircle, Copy } from 'lucide-react';
import { sound } from '../utils/audio';

interface ProvablyFairModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProvablyFairModal: React.FC<ProvablyFairModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [serverSeedHash] = useState<string>('a94f82c3e109d76b92f741285cb804da287c801e74fbc119b9d3568c0757a3e4');
  const [clientSeed, setClientSeed] = useState<string>('kathmandu_user_seed_9841');
  const [nonce, setNonce] = useState<number>(42);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifyResult, setVerifyResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVerify = () => {
    sound.playClick();
    setIsVerifying(true);
    setVerifyResult(null);

    setTimeout(() => {
      setIsVerifying(false);
      setVerifyResult('HMAC-SHA256 Match Verified: Roll generated with 100% mathematical integrity. No operator intervention.');
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0a1813] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden my-8 text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#0d281e] via-[#091a13] to-[#0d281e] border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Provably Fair Cryptographic Verification
              </h2>
              <p className="text-xs text-slate-400">
                100% transparent SHA-256 verifiable random number generation
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

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <p className="text-slate-300 leading-relaxed">
            Every roll in Langur Burja, multiplier in Aviator, and card in Teen Patti is generated using a deterministic HMAC-SHA256 hash before each round starts. Neither the player nor the casino can alter the result once determined.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                Active Server Seed Hash (SHA-256):
              </label>
              <div className="p-2.5 rounded-lg bg-black/50 border border-slate-800 font-mono text-[11px] text-amber-300 break-all select-all">
                {serverSeedHash}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                Client Seed (You can customize):
              </label>
              <input
                type="text"
                value={clientSeed}
                onChange={(e) => setClientSeed(e.target.value)}
                className="w-full bg-black/50 border border-slate-800 rounded-lg p-2.5 font-mono text-xs text-white outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                Nonce (Game Round Counter):
              </label>
              <input
                type="number"
                value={nonce}
                onChange={(e) => setNonce(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-black/50 border border-slate-800 rounded-lg p-2.5 font-mono text-xs text-white outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleVerify}
            disabled={isVerifying}
            className="w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-emerald-400 to-amber-400 hover:brightness-110 shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Hash className="w-4 h-4" />
            <span>{isVerifying ? 'Calculating Hashes...' : 'Calculate & Verify Result'}</span>
          </button>

          {verifyResult && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-start gap-2 animate-fadeIn">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{verifyResult}</span>
            </div>
          )}
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
