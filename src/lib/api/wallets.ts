import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { BankAccount, Pocket } from '@/types/database';
import { CreateWalletInput, UpdateWalletInput } from '@/lib/validations/wallet';
import { supabase } from '../supabase/client';

// ============================================
// QUERY KEYS
// ============================================
export const walletKeys = {
  all: ['wallets'] as const,
  lists: () => [...walletKeys.all, 'list'] as const,
  list: (filters?: string) => [...walletKeys.lists(), { filters }] as const,
  details: () => [...walletKeys.all, 'detail'] as const,
  detail: (id: string) => [...walletKeys.details(), id] as const,
};

// ============================================
// QUERIES
// ============================================

// Obtener todas las billeteras del usuario
export const useWallets = () => {
  return useQuery({
    queryKey: walletKeys.lists(),
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BankAccount[];
    },
  });
};

// Obtener cantidad de bolsillos por billetera
export const usePocketsCounts = () => {
  return useQuery({
    queryKey: ['pockets', 'counts'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      // Primero obtenemos los IDs de las cuentas del usuario
      const { data: accounts, error: accountsError } = await supabase
        .from('bank_accounts')
        .select('id')
        .eq('user_id', user.id);

      if (accountsError) throw accountsError;

      const accountIds = accounts.map(a => a.id);

      // Luego obtenemos los bolsillos de esas cuentas
      const { data, error } = await supabase
        .from('pockets')
        .select('account_id')
        .in('account_id', accountIds);

      if (error) throw error;

      // Contar bolsillos por account_id
      const counts: Record<string, number> = {};
      data.forEach((pocket: { account_id: string }) => {
        counts[pocket.account_id] = (counts[pocket.account_id] || 0) + 1;
      });

      return counts;
    },
  });
};

// ============================================
// MUTATIONS
// ============================================

// Crear billetera
export const useCreateWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateWalletInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      const { data, error } = await supabase
        .from('bank_accounts')
        .insert({
          user_id: user.id,
          name: input.name,
          balance_available: input.balance_available,
          balance_total: input.balance_available, // Total inicial = disponible (sin bolsillos aún)
          interest_rate: input.interest_rate,
          interest_payment_frequency: input.interest_payment_frequency,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data as BankAccount;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.lists() });
    },
  });
};

// Actualizar billetera
export const useUpdateWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateWalletInput }) => {
      const { data, error } = await supabase
        .from('bank_accounts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as BankAccount;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.lists() });
    },
  });
};

// Eliminar billetera
export const useDeleteWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Verificar que el balance esté en 0
      const { data: wallet } = await supabase
        .from('bank_accounts')
        .select('balance_total')
        .eq('id', id)
        .single();

      if (wallet && wallet.balance_total > 0) {
        throw new Error('No puedes eliminar una billetera con saldo. Debe estar en $0');
      }

      const { error } = await supabase
        .from('bank_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['pockets', 'counts'] });
    },
  });
};