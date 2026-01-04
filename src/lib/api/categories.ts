import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Category } from '@/types/database';
import { CreateCategoryInput, UpdateCategoryInput } from '@/lib/validations/category';
import { supabase } from '../supabase/client';

// ============================================
// QUERY KEYS
// ============================================
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

// ============================================
// QUERIES
// ============================================

// Obtener todas las categorías del usuario
export const useCategories = () => {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Category[];
    },
  });
};

// ============================================
// MUTATIONS
// ============================================

// Crear categoría
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCategoryInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      // Si es hija con padre, obtener el color del padre
      let finalColor = input.color;
      if (input.type === 'child' && input.parent_id) {
        const { data: parent } = await supabase
          .from('categories')
          .select('color')
          .eq('id', input.parent_id)
          .single();
        
        finalColor = parent?.color;
      }

      const { data, error } = await supabase
        .from('categories')
        .insert({
          user_id: user.id,
          name: input.name,
          type: input.type,
          color: finalColor!,
          parent_id: input.parent_id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
};

// Editar categoría
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateCategoryInput }) => {
      // Si se cambia el parent_id a un padre, heredar su color
      let finalUpdates = { ...updates };
      
      if (updates.parent_id) {
        const { data: parent } = await supabase
          .from('categories')
          .select('color')
          .eq('id', updates.parent_id)
          .single();
        
        if (parent) {
          finalUpdates.color = parent.color;
        }
      }

      const { data, error } = await supabase
        .from('categories')
        .update(finalUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Si cambió el color de un padre, actualizar hijos
      if (updates.color) {
        await supabase
          .from('categories')
          .update({ color: updates.color })
          .eq('parent_id', id);
      }

      return data as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
};

// Eliminar categoría
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Verificar si tiene transacciones asociadas
      const { count: transactionsCount } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', id);

      if (transactionsCount && transactionsCount > 0) {
        throw new Error(`No se puede eliminar. ${transactionsCount} transacciones la usan.`);
      }

      // Verificar si es padre con hijos
      const { data: children } = await supabase
        .from('categories')
        .select('id')
        .eq('parent_id', id);

      if (children && children.length > 0) {
        // Verificar si algún hijo tiene transacciones
        for (const child of children) {
          const { count } = await supabase
            .from('transactions')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', child.id);

          if (count && count > 0) {
            throw new Error(`No se puede eliminar. Una subcategoría tiene ${count} transacciones.`);
          }
        }

        // Eliminar hijos en cascada
        const { error: childrenError } = await supabase
          .from('categories')
          .delete()
          .eq('parent_id', id);

        if (childrenError) throw childrenError;
      }

      // Eliminar la categoría
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
};