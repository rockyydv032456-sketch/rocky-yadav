export type GameType = 'langur-burja' | 'aviator' | 'teen-patti' | 'roulette' | 'slots';

export type PaymentMethod = 'esewa' | 'khalti' | 'bank_transfer' | 'ime_pay';

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'win' | 'bet';
  amount: number;
  paymentMethod?: PaymentMethod;
  referenceId?: string;
  accountNumber?: string;
  accountName?: string;
  status: 'completed' | 'pending' | 'rejected';
  date: string;
  game?: string;
  notes?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  balance: number;
  bonusBalance: number;
  vipTier: 'Silver' | 'Gold' | 'Everest Platinum' | 'Royal Gurkha VIP';
  vipPoints: number;
  totalWon: number;
  totalDeposited: number;
  totalWithdrawn: number;
}

export interface LiveWinner {
  id: string;
  name: string;
  city: string;
  game: string;
  amount: number;
  timeAgo: string;
}

export interface LangurBurjaSymbol {
  id: 'jhanda' | 'burja' | 'itta' | 'paan' | 'chiri' | 'hukum';
  nameNepali: string;
  nameEnglish: string;
  icon: string;
  color: string;
}
