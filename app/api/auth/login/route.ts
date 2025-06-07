import { NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import clientPromise from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection('users').findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    const isValidPassword = await compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    const token = sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'tu_secreto_jwt',
      { expiresIn: '24h' }
    );

    return NextResponse.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al iniciar sesión' },
      { status: 500 }
    );
  }
} 