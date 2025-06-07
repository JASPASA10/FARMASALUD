import { z } from 'zod';

export const inventorySchema = z.object({
  name: z.string().min(2, 'El nombre del producto debe tener al menos 2 caracteres'),
  description: z.string().optional(),
  price: z.number().positive('El precio debe ser un número positivo'),
  stock: z.number().int().min(0, 'El stock no puede ser negativo'),
  category: z.string(),
  sku: z.string().min(3, 'El SKU debe tener al menos 3 caracteres'),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type Inventory = z.infer<typeof inventorySchema>; 