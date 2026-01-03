import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Pocket } from '@/types/database';
import { 
  CreatePocketInput, 
  UpdatePocketInput, 
  MoveToPocketInput,
  MoveFromPocketInput 
} from '@/lib/validations/pocket';
import { supabase } from '../supabase/client';

// ============================================
// QUERY KEYS
// ============================================
export const pocketKeys = {
  all: ['pockets'] as const,
  lists: () => [...pocketKeys.all, 'list'] as const,
  list: (accountId: string) => [...pocketKeys.lists(), accountId] as const,
  details: () => [...pocketKeys.all, 'detail'] as const,
  detail: (id: string) => [...pocketKeys.details(), id] as const,
  interests: (accountId: string) => [...pocketKeys.all, 'interests', accountId] as const,
};

// ============================================
// QUERIES
// ============================================

// Obtener bolsillos de una cuenta
export const usePockets = (accountId: string) => {
  return useQuery({
    queryKey: pocketKeys.list(accountId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pockets')
        .select('*')
        .eq('account_id', accountId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Pocket[];
    },
    enabled: !!accountId,
  });
};

// Obtener intereses acumulados del mes actual (para pago mensual)
export const useMonthlyInterests = (accountId: string) => {
  return useQuery({
    queryKey: pocketKeys.interests(accountId),
    queryFn: async () => {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const { data, error } = await supabase
        .from('interest_accumulations')
        .select(`
          *,
          pockets!inner(account_id)
        `)
        .eq('pockets.account_id', accountId)
        .eq('month', currentMonth)
        .eq('year', currentYear);

      if (error) throw error;

      // Sumar total de intereses del mes
      const total = data.reduce((sum, item) => sum + (item.amount || 0), 0);
      return total;
    },
    enabled: !!accountId,
  });
};

// ============================================
// MUTATIONS
// ============================================

// Crear bolsillo
export const useCreatePocket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePocketInput) => {
      const { data, error } = await supabase
        .from('pockets')
        .insert({
          name: input.name,
          account_id: input.account_id,
          balance: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Pocket;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: pocketKeys.list(variables.account_id) });
      queryClient.invalidateQueries({ queryKey: ['pockets', 'counts'] });
    },
  });
};

// Editar bolsillo (solo nombre)
export const useUpdatePocket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, accountId, updates }: { id: string; accountId: string; updates: UpdatePocketInput }) => {
      const { data, error } = await supabase
        .from('pockets')
        .update({ name: updates.name })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data: data as Pocket, accountId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: pocketKeys.list(result.accountId) });
    },
  });
};

// Eliminar bolsillo (usando función SQL que transfiere balance)
export const useDeletePocket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, accountId }: { id: string; accountId: string }) => {
      // Usar la función SQL que transfiere el balance automáticamente
      const { error } = await supabase.rpc('delete_pocket_with_transfer', {
        pocket_id_param: id,
      });

      if (error) throw error;
      return { accountId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: pocketKeys.list(result.accountId) });
      queryClient.invalidateQueries({ queryKey: ['pockets', 'counts'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });
};

// Mover dinero: Cuenta → Bolsillo
export const useMoveToPocket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: MoveToPocketInput & { accountId: string }) => {
      // Obtener pocket y account
      const { data: pocket, error: pocketError } = await supabase
        .from('pockets')
        .select('account_id, balance')
        .eq('id', input.pocket_id)
        .single();

      if (pocketError) throw pocketError;

      const { data: account, error: accountError } = await supabase
        .from('bank_accounts')
        .select('balance_available')
        .eq('id', pocket.account_id)
        .single();

      if (accountError) throw accountError;

      // Validar que hay suficiente balance suelto
      if (account.balance_available < input.amount) {
        throw new Error('Balance insuficiente en la cuenta');
      }

      // Actualizar balance de cuenta (disminuir suelto)
      const { error: updateAccountError } = await supabase
        .from('bank_accounts')
        .update({ balance_available: account.balance_available - input.amount })
        .eq('id', pocket.account_id);

      if (updateAccountError) throw updateAccountError;

      // Actualizar balance de bolsillo (aumentar)
      const { error: updatePocketError } = await supabase
        .from('pockets')
        .update({ balance: pocket.balance + input.amount })
        .eq('id', input.pocket_id);

      if (updatePocketError) throw updatePocketError;

      return { accountId: input.accountId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: pocketKeys.list(result.accountId) });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });
};

// Sacar dinero: Bolsillo → Cuenta
export const useMoveFromPocket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: MoveFromPocketInput & { accountId: string }) => {
      // Obtener pocket y account
      const { data: pocket, error: pocketError } = await supabase
        .from('pockets')
        .select('account_id, balance')
        .eq('id', input.pocket_id)
        .single();

      if (pocketError) throw pocketError;

      // Validar que hay suficiente balance en el bolsillo
      if (pocket.balance < input.amount) {
        throw new Error('Balance insuficiente en el bolsillo');
      }

      const { data: account, error: accountError } = await supabase
        .from('bank_accounts')
        .select('balance_available')
        .eq('id', pocket.account_id)
        .single();

      if (accountError) throw accountError;

      // Actualizar balance de bolsillo (disminuir)
      const { error: updatePocketError } = await supabase
        .from('pockets')
        .update({ balance: pocket.balance - input.amount })
        .eq('id', input.pocket_id);

      if (updatePocketError) throw updatePocketError;

      // Actualizar balance de cuenta (aumentar suelto)
      const { error: updateAccountError } = await supabase
        .from('bank_accounts')
        .update({ balance_available: account.balance_available + input.amount })
        .eq('id', pocket.account_id);

      if (updateAccountError) throw updateAccountError;

      return { accountId: input.accountId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: pocketKeys.list(result.accountId) });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });
};