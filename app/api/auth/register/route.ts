import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { userSchema } from '@/models/User';
import clientPromise from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = userSchema.parse(body);

    const client = await clientPromise;
    const db = client.db();

    // Verificar si el usuario ya existe
    const existingUser = await db.collection('users').findOne({ email: validatedData.email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'El correo electrónico ya está registrado' },
        { status: 400 }
      );
    }

    // Encriptar la contraseña
    const hashedPassword = await hash(validatedData.password, 12);

    // Crear el usuario
    const result = await db.collection('users').insertOne({
      ...validatedData,
      password: hashedPassword,
    });

    return NextResponse.json(
      { message: 'Usuario registrado exitosamente', userId: result.insertedId },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos de validación inválidos', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Error al registrar el usuario' },
      { status: 500 }
    );
  }
} 