import { z } from 'zod';

export const orderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive('La cantidad debe ser un número positivo'),
  price: z.number().positive('El precio debe ser un número positivo'),
});

export const orderSchema = z.object({
  userId: z.string(),
  items: z.array(orderItemSchema),
  total: z.number().positive('El total debe ser un número positivo'),
  status: z.enum(['pending', 'processing', 'completed', 'cancelled']).default('pending'),
  shippingAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
  }),
  paymentMethod: z.string(),
  paymentStatus: z.enum(['pending', 'paid', 'failed']).default('pending'),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type Order = z.infer<typeof orderSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>; 