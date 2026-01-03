import { z } from 'zod';

// Schema para crear bolsillo
export const createPocketSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .trim(),
  
  account_id: z
    .string()
    .uuid('ID de cuenta inválido'),
});

// Schema para editar bolsillo (solo nombre)
export const updatePocketSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .trim(),
});

// Schema para mover dinero a bolsillo (cuenta → bolsillo)
export const moveToPocketSchema = z.object({
  pocket_id: z
    .string()
    .uuid('ID de bolsillo inválido'),
  
  amount: z
    .number()
    .positive('El monto debe ser mayor a 0')
    .max(999999999999, 'Monto demasiado grande'),
});

// Schema para sacar dinero de bolsillo (bolsillo → cuenta)
export const moveFromPocketSchema = z.object({
  pocket_id: z
    .string()
    .uuid('ID de bolsillo inválido'),
  
  amount: z
    .number()
    .positive('El monto debe ser mayor a 0')
    .max(999999999999, 'Monto demasiado grande'),
});

// Tipos inferidos
export type CreatePocketInput = z.infer<typeof createPocketSchema>;
export type UpdatePocketInput = z.infer<typeof updatePocketSchema>;
export type MoveToPocketInput = z.infer<typeof moveToPocketSchema>;
export type MoveFromPocketInput = z.infer<typeof moveFromPocketSchema>;