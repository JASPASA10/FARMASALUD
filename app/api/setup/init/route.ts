import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db('farmacia');

    // Crear colección de usuarios y sus índices
    await db.createCollection('users');
    await db.collection('users').createIndex({ email: 1 }, { unique: true });

    // Crear colección de inventario y sus índices
    await db.createCollection('inventory');
    await db.collection('inventory').createIndex({ sku: 1 }, { unique: true });
    await db.collection('inventory').createIndex({ name: 1 });
    await db.collection('inventory').createIndex({ category: 1 });

    // Crear colección de clientes y sus índices
    await db.createCollection('customers');
    await db.collection('customers').createIndex({ email: 1 }, { unique: true });
    await db.collection('customers').createIndex({ documentNumber: 1, documentType: 1 }, { unique: true });
    await db.collection('customers').createIndex({ name: 1 });

    // Crear colección de pedidos y sus índices
    await db.createCollection('orders');
    await db.collection('orders').createIndex({ customerId: 1 });
    await db.collection('orders').createIndex({ status: 1 });
    await db.collection('orders').createIndex({ createdAt: -1 });

    return NextResponse.json({
      message: 'Base de datos inicializada correctamente',
      collections: ['users', 'inventory', 'customers', 'orders']
    });
  } catch (error: any) {
    console.error('Error al inicializar la base de datos:', error);
    
    // Si la colección ya existe, no es un error
    if (error.code === 48) {
      return NextResponse.json({
        message: 'Las colecciones ya existen',
        collections: ['users', 'inventory', 'customers', 'orders']
      });
    }

    return NextResponse.json(
      { error: 'Error al inicializar la base de datos' },
      { status: 500 }
    );
  }
} 