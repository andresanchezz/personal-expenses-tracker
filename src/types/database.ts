export interface BankAccount {
  id: string;
  user_id: string;
  name: string;
  balance_available: number;
  balance_total: number;
  interest_rate: number;
  interest_payment_frequency: 'daily' | 'monthly' | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Pocket {
  id: string;
  account_id: string;
  name: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface CreditCard {
  id: string;
  user_id: string;
  name: string;
  credit_limit: number;
  current_debt: number;
  available_credit: number;
  cashback_percentage: number;
  pending_cashback: number;
  total_cashback_generated: number;
  cashback_destination_account_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  type: 'parent' | 'child';
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'income' | 'expense' | 'transfer' | 'card_payment';
  amount: number;
  name: string;
  category_id: string | null;
  transaction_date: string;
  notes: string | null;
  source_account_id: string | null;
  source_card_id: string | null;
  destination_account_id: string | null;
  destination_card_id: string | null;
  cashback_generated: number;
  cashback_transferred: boolean;
  created_at: string;
  updated_at: string;
}

// DTOs (Data Transfer Objects) para crear/actualizar
export interface CreateBankAccountDTO {
  name: string;
  interest_rate: number;
  interest_payment_frequency: 'daily' | 'monthly' | null;
}

export interface UpdateBankAccountDTO {
  name?: string;
  interest_rate?: number;
  interest_payment_frequency?: 'daily' | 'monthly' | null;
}

export interface CreateCreditCardDTO {
  name: string;
  credit_limit: number;
  cashback_percentage: number;
  cashback_destination_account_id?: string | null;
}

export interface UpdateCreditCardDTO {
  name?: string;
  credit_limit?: number;
  cashback_percentage?: number;
  cashback_destination_account_id?: string | null;
}