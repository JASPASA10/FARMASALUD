import { z } from 'zod';

export const userSchema = z.object({
  email: z.string().email('El correo electrónico no es válido'),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'La contraseña debe contener al menos una minúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número')
    .regex(/[^A-Za-z0-9]/, 'La contraseña debe contener al menos un carácter especial'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  role: z.enum(['admin', 'user']).default('user'),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type User = z.infer<typeof userSchema>; 