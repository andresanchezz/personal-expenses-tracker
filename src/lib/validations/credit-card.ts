import { z } from 'zod';

// Schema para crear tarjeta
export const createCreditCardSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .trim(),
  
  credit_limit: z
    .number()
    .positive('El cupo debe ser mayor a 0')
    .max(999999999999, 'Cupo demasiado grande'),
  
  cashback_percentage: z
    .number()
    .min(0, 'El cashback no puede ser negativo')
    .max(100, 'El cashback no puede exceder 100%'),
  
  cashback_destination_account_id: z
    .string()
    .uuid('ID de cuenta inválido')
    .nullable()
    .optional(),
});

// Schema para editar tarjeta
export const updateCreditCardSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .trim()
    .optional(),
  
  credit_limit: z
    .number()
    .positive('El cupo debe ser mayor a 0')
    .max(999999999999, 'Cupo demasiado grande')
    .optional(),
  
  cashback_percentage: z
    .number()
    .min(0, 'El cashback no puede ser negativo')
    .max(100, 'El cashback no puede exceder 100%')
    .optional(),
  
  cashback_destination_account_id: z
    .string()
    .uuid('ID de cuenta inválido')
    .nullable()
    .optional(),
});

// Schema para pagar tarjeta
export const payCardSchema = z.object({
  card_id: z
    .string()
    .uuid('ID de tarjeta inválido'),
  
  account_id: z
    .string()
    .uuid('ID de cuenta inválido'),
  
  amount: z
    .number()
    .positive('El monto debe ser mayor a 0')
    .max(999999999999, 'Monto demasiado grande'),
});

// Schema para transferir cashback
export const transferCashbackSchema = z.object({
  card_id: z
    .string()
    .uuid('ID de tarjeta inválido'),
  
  account_id: z
    .string()
    .uuid('ID de cuenta inválido'),
});

// Tipos inferidos
export type CreateCreditCardInput = z.infer<typeof createCreditCardSchema>;
export type UpdateCreditCardInput = z.infer<typeof updateCreditCardSchema>;
export type PayCardInput = z.infer<typeof payCardSchema>;
export type TransferCashbackInput = z.infer<typeof transferCashbackSchema>;