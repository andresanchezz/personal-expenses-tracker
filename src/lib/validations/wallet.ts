import { z } from 'zod';

// Schema para crear billetera
// Schema para crear billetera
export const createWalletSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .trim(),
  
  balance_available: z
    .number()
    .min(0, 'El balance no puede ser negativo'),
  
  interest_rate: z
    .number()
    .min(0, 'La tasa de interés no puede ser negativa')
    .max(100, 'La tasa de interés no puede exceder 100%'),
  
  interest_payment_frequency: z
    .enum(['daily', 'monthly'])
    .nullable(),
});

// Schema para editar billetera
export const updateWalletSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .trim()
    .optional(),

  interest_rate: z
    .number()
    .min(0, 'La tasa de interés no puede ser negativa')
    .max(100, 'La tasa de interés no puede exceder 100%')
    .optional(),

  interest_payment_frequency: z
    .enum(['daily', 'monthly'])
    .nullable()
    .optional(),

  balance_available: z
    .number()
    .min(0, 'El balance inicial no puede ser negativo')
    .optional()
});

// Tipos inferidos de los schemas
export type CreateWalletInput = z.infer<typeof createWalletSchema>;
export type UpdateWalletInput = z.infer<typeof updateWalletSchema>;

// Validación adicional: si interest_rate > 0, frequency debe estar definida
export const validateWalletInterest = (data: CreateWalletInput | UpdateWalletInput) => {
  const rate = 'interest_rate' in data ? data.interest_rate : 0;
  const frequency = 'interest_payment_frequency' in data ? data.interest_payment_frequency : null;

  if (rate && rate > 0 && !frequency) {
    return {
      valid: false,
      error: 'Debes seleccionar la periodicidad de pago de intereses',
    };
  }

  return { valid: true };
};