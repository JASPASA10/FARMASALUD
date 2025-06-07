import { NextResponse } from 'next/server';
import { orderSchema } from '@/models/Order';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET - Obtener todos los pedidos
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const orders = await db.collection('orders')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener los pedidos' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo pedido
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = orderSchema.parse(body);

    const client = await clientPromise;
    const db = client.db();

    // Verificar stock disponible
    for (const item of validatedData.items) {
      const product = await db.collection('inventory').findOne({
        _id: new ObjectId(item.productId)
      });

      if (!product) {
        return NextResponse.json(
          { error: `Producto no encontrado: ${item.productId}` },
          { status: 404 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuficiente para el producto: ${product.name}` },
          { status: 400 }
        );
      }

      // Actualizar stock
      await db.collection('inventory').updateOne(
        { _id: new ObjectId(item.productId) },
        { $inc: { stock: -item.quantity } }
      );
    }

    const result = await db.collection('orders').insertOne({
      ...validatedData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      { message: 'Pedido creado exitosamente', orderId: result.insertedId },
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
      { error: 'Error al crear el pedido' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar estado del pedido
export async function PUT(req: Request) {
  try {
    const { id, status } = await req.json();

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('orders').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Estado del pedido actualizado exitosamente' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al actualizar el pedido' },
      { status: 500 }
    );
  }
}

// GET - Obtener pedidos por usuario
export async function GET_USER_ORDERS(req: Request) {
  try {
    const { userId } = await req.json();

    const client = await clientPromise;
    const db = client.db();
    const orders = await db.collection('orders')
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
    
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener los pedidos del usuario' },
      { status: 500 }
    );
  }
} 