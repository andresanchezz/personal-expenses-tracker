import { z } from 'zod';

// Schema para crear categoría
export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .trim(),
  
  type: z.enum(['parent', 'child'], {
    message: 'Debes seleccionar un tipo',
  }),
  
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Color inválido (formato: #RRGGBB)')
    .optional(),
  
  parent_id: z
    .string()
    .uuid('ID de padre inválido')
    .nullable()
    .optional(),
});

// Schema para editar categoría
export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .trim()
    .optional(),
  
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Color inválido (formato: #RRGGBB)')
    .optional(),
  
  parent_id: z
    .string()
    .uuid('ID de padre inválido')
    .nullable()
    .optional(),
});

// Tipos inferidos
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

// Validación adicional: color obligatorio según tipo
export const validateCategoryColor = (data: CreateCategoryInput) => {
  // Si es padre: color es obligatorio
  if (data.type === 'parent' && !data.color) {
    return {
      valid: false,
      error: 'El color es obligatorio para categorías padre',
    };
  }
  
  // Si es hija SIN parent_id: color es obligatorio
  if (data.type === 'child' && !data.parent_id && !data.color) {
    return {
      valid: false,
      error: 'El color es obligatorio para categorías sin padre',
    };
  }
  
  // Si es hija CON parent_id: el color es opcional (se heredará del padre)
  // No hay error en este caso
  
  return { valid: true };
};