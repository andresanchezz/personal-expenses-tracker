import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { CreditCard } from '@/types/database';
import { 
  CreateCreditCardInput, 
  UpdateCreditCardInput,
  PayCardInput,
  TransferCashbackInput
} from '@/lib/validations/credit-card';
import { supabase } from '../supabase/client';

// ============================================
// QUERY KEYS
// ============================================
export const creditCardKeys = {
  all: ['credit-cards'] as const,
  lists: () => [...creditCardKeys.all, 'list'] as const,
  details: () => [...creditCardKeys.all, 'detail'] as const,
  detail: (id: string) => [...creditCardKeys.details(), id] as const,
};

// ============================================
// QUERIES
// ============================================

// Obtener todas las tarjetas del usuario
export const useCreditCards = () => {
  return useQuery({
    queryKey: creditCardKeys.lists(),
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      const { data, error } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CreditCard[];
    },
  });
};

// ============================================
// MUTATIONS
// ============================================

// Crear tarjeta
export const useCreateCreditCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCreditCardInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      const { data, error } = await supabase
        .from('credit_cards')
        .insert({
          user_id: user.id,
          name: input.name,
          credit_limit: input.credit_limit,
          current_debt: 0,
          cashback_percentage: input.cashback_percentage,
          pending_cashback: 0,
          total_cashback_generated: 0,
          cashback_destination_account_id: input.cashback_destination_account_id || null,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data as CreditCard;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creditCardKeys.lists() });
    },
  });
};

// Actualizar tarjeta
export const useUpdateCreditCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateCreditCardInput }) => {
      // Validar que el nuevo cupo no sea menor que la deuda actual
      if (updates.credit_limit !== undefined) {
        const { data: card } = await supabase
          .from('credit_cards')
          .select('current_debt')
          .eq('id', id)
          .single();

        if (card && updates.credit_limit < card.current_debt) {
          throw new Error('El cupo no puede ser menor que la deuda actual');
        }
      }

      const { data, error } = await supabase
        .from('credit_cards')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as CreditCard;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creditCardKeys.lists() });
    },
  });
};

// Eliminar tarjeta
export const useDeleteCreditCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Verificar que no tenga deuda ni cashback pendiente
      const { data: card } = await supabase
        .from('credit_cards')
        .select('current_debt, pending_cashback')
        .eq('id', id)
        .single();

      if (card) {
        if (card.current_debt > 0) {
          throw new Error('No puedes eliminar una tarjeta con deuda. Debe estar en $0');
        }
        if (card.pending_cashback > 0) {
          throw new Error('Transfiere el cashback pendiente antes de eliminar');
        }
      }

      const { error } = await supabase
        .from('credit_cards')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creditCardKeys.lists() });
    },
  });
};

// Pagar tarjeta
export const usePayCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: PayCardInput) => {
      // Obtener datos de cuenta y tarjeta
      const { data: account, error: accountError } = await supabase
        .from('bank_accounts')
        .select('balance_available')
        .eq('id', input.account_id)
        .single();

      if (accountError) throw accountError;

      const { data: card, error: cardError } = await supabase
        .from('credit_cards')
        .select('current_debt')
        .eq('id', input.card_id)
        .single();

      if (cardError) throw cardError;

      // Validaciones
      if (account.balance_available < input.amount) {
        throw new Error('Balance insuficiente en la cuenta');
      }

      if (input.amount > card.current_debt) {
        throw new Error('El monto no puede ser mayor que la deuda actual');
      }

      // Disminuir balance de cuenta
      const { error: updateAccountError } = await supabase
        .from('bank_accounts')
        .update({ balance_available: account.balance_available - input.amount })
        .eq('id', input.account_id);

      if (updateAccountError) throw updateAccountError;

      // Disminuir deuda de tarjeta
      const { error: updateCardError } = await supabase
        .from('credit_cards')
        .update({ current_debt: card.current_debt - input.amount })
        .eq('id', input.card_id);

      if (updateCardError) throw updateCardError;

      return { account_id: input.account_id, card_id: input.card_id };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: creditCardKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });
};

// Transferir cashback
export const useTransferCashback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TransferCashbackInput) => {
      // Obtener cashback pendiente
      const { data: card, error: cardError } = await supabase
        .from('credit_cards')
        .select('pending_cashback')
        .eq('id', input.card_id)
        .single();

      if (cardError) throw cardError;

      if (!card.pending_cashback || card.pending_cashback <= 0) {
        throw new Error('No hay cashback pendiente para transferir');
      }

      const { data: account, error: accountError } = await supabase
        .from('bank_accounts')
        .select('balance_available')
        .eq('id', input.account_id)
        .single();

      if (accountError) throw accountError;

      // Aumentar balance de cuenta
      const { error: updateAccountError } = await supabase
        .from('bank_accounts')
        .update({ balance_available: account.balance_available + card.pending_cashback })
        .eq('id', input.account_id);

      if (updateAccountError) throw updateAccountError;

      // Resetear cashback pendiente
      const { error: updateCardError } = await supabase
        .from('credit_cards')
        .update({ pending_cashback: 0 })
        .eq('id', input.card_id);

      if (updateCardError) throw updateCardError;

      return { 
        account_id: input.account_id, 
        card_id: input.card_id,
        amount: card.pending_cashback 
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: creditCardKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });
};