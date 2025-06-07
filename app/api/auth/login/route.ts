import { NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';

// Esquema de validación para el login
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 
      'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial')
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validar datos de entrada
    const validatedData = loginSchema.parse(body);

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET no está configurado');
    }

    const client = await clientPromise;
    const db = client.db('farmacia');

    // Buscar usuario por email
    const user = await db.collection('users').findOne({
      email: validatedData.email.toLowerCase()
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Verificar contraseña
    const isValidPassword = await compare(validatedData.password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // No enviar la contraseña en la respuesta
    const { password, ...userWithoutPassword } = user;

    const token = sign(
      { 
        userId: user._id.toString(),
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return NextResponse.json({
      token,
      user: userWithoutPassword
    });
  } catch (error: any) {
    console.error('Error en login:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos de validación inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );
  }
} 