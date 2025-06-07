import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';

// Esquema de validación para el usuario administrador
const setupSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 
      'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial'),
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres')
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = setupSchema.parse(body);

    const client = await clientPromise;
    const db = client.db('farmacia');

    // Verificar si ya existe un usuario administrador
    const existingAdmin = await db.collection('users').findOne({
      role: 'admin'
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Ya existe un usuario administrador' },
        { status: 400 }
      );
    }

    // Verificar si el email ya está registrado
    const existingUser = await db.collection('users').findOne({
      email: validatedData.email.toLowerCase()
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400 }
      );
    }

    // Crear el usuario administrador
    const hashedPassword = await hash(validatedData.password, 12);
    const newUser = {
      ...validatedData,
      email: validatedData.email.toLowerCase(),
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('users').insertOne(newUser);

    // No enviar la contraseña en la respuesta
    const { password, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      message: 'Usuario administrador creado exitosamente',
      user: {
        ...userWithoutPassword,
        _id: result.insertedId
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error al crear usuario administrador:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos de validación inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear el usuario administrador' },
      { status: 500 }
    );
  }
} 