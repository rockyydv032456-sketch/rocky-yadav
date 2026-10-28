import React, { useState } from 'react';
import { X, Send, Bot, User, Check, MessageSquare } from 'lucide-react';
import { sound } from '../utils/audio';

interface SupportChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDeposit: () => void;
}

interface Message {
  id: string;
  sender: 'agent' | 'user';
  text: string;
  time: string;
}

export const SupportChatModal: React.FC<SupportChatModalProps> = ({
  isOpen,
  onClose,
  onOpenDeposit,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'agent',
      text: 'नमस्ते! Kathmandu Royale Live Support मा स्वागत छ। How can we help you today with deposits or withdrawals?',
      time: 'Just now',
    },
  ]);
  const [input, setInput] = useState<string>('');

  if (!isOpen) return null;

  const quickQuestions = [
    'How do I deposit via eSewa QR?',
    'What is the minimum withdrawal amount?',
    'How long does a payout take to eSewa?',
    'Is Langur Burja provably fair?',
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    sound.playClick();
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Simulated Smart Support Agent Response
    setTimeout(() => {
      sound.playWin();
      let reply = 'Thank you for contacting Kathmandu Royale 24/7 Support. Our finance team operates around the clock for all Nepal payment gateways.';
      const lower = text.toLowerCase();

      if (lower.includes('esewa') || lower.includes('deposit') || lower.includes('qr')) {
        reply = 'To deposit via eSewa: 1. Click the golden "Deposit eSewa" button at the top. 2. Scan the official eSewa QR code with your mobile app. 3. Enter the Transaction Code from your eSewa receipt and your phone number. Your balance will be credited instantly!';
      } else if (lower.includes('withdraw') || lower.includes('payout') || lower.includes('minimum')) {
        reply = 'Minimum withdrawal is रू 500. Payouts to eSewa or Khalti are credited within 5 to 15 minutes. Bank wire transfers (Nabil, NIC Asia, Global IME) are cleared via ConnectIPS directly to your account.';
      } else if (lower.includes('langur burja') || lower.includes('fair') || lower.includes('rules')) {
        reply = 'Our Langur Burja game follows traditional Nepali festival rules with 6 dice. If 2 or more dice match your chosen symbol, you win 2x, 3x, 4x, 5x, or 6x your bet. All rolls are provably fair using HMAC-SHA256.';
      }

      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, agentMsg]);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0a1813] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden my-8 text-slate-100 flex flex-col h-[520px]">
        
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#0d281e] via-[#091a13] to-[#0d281e] border-b border-amber-500/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">Royale Concierge (नमस्ते)</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[11px] text-slate-400">24/7 Live Support · English & नेपाली</p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-amber-400 text-slate-950 font-medium rounded-br-none'
                    : 'bg-[#06140e] border border-slate-800 text-slate-200 rounded-bl-none'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 px-1 font-mono">{m.time}</span>
            </div>
          ))}
        </div>

        {/* Quick suggestions */}
        <div className="px-3 py-2 bg-[#06120e] border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-amber-400 whitespace-nowrap shrink-0 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input bar */}
        <div className="p-3 bg-[#081710] border-t border-slate-800 flex items-center gap-2 shrink-0">
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-[#05110c] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400"
          />
          <button
            onClick={() => handleSend()}
            className="p-2 rounded-xl bg-amber-400 text-slate-950 font-bold hover:brightness-110 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
