import { NextResponse } from 'next/server';
import { z } from 'zod';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Esquema de validación para los items del pedido
const orderItemSchema = z.object({
  productId: z.string().min(1, 'El ID del producto es requerido'),
  quantity: z.number().min(1, 'La cantidad debe ser mayor a 0'),
  price: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
});

// Esquema de validación para el pedido
const orderSchema = z.object({
  customerId: z.string().min(1, 'El ID del cliente es requerido'),
  items: z.array(orderItemSchema).min(1, 'El pedido debe tener al menos un item'),
  total: z.number().min(0, 'El total debe ser mayor o igual a 0'),
  status: z.enum(['pending', 'processing', 'completed', 'cancelled']),
  paymentMethod: z.enum(['cash', 'card', 'transfer']),
  notes: z.string().optional(),
});

// GET - Obtener todos los pedidos
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('farmacia');
    
    const orders = await db.collection('orders')
      .aggregate([
        {
          $lookup: {
            from: 'customers',
            localField: 'customerId',
            foreignField: '_id',
            as: 'customer'
          }
        },
        {
          $unwind: '$customer'
        },
        {
          $lookup: {
            from: 'inventory',
            localField: 'items.productId',
            foreignField: '_id',
            as: 'products'
          }
        },
        {
          $sort: { createdAt: -1 }
        }
      ])
      .toArray();
    
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
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
    console.log('Datos recibidos:', body); // Log para debugging

    // Validar datos de entrada
    const validatedData = orderSchema.parse(body);
    console.log('Datos validados:', validatedData); // Log para debugging

    const client = await clientPromise;
    const db = client.db('farmacia');

    // Verificar que el cliente existe
    const customer = await db.collection('customers').findOne({
      _id: new ObjectId(validatedData.customerId)
    });

    if (!customer) {
      console.log('Cliente no encontrado:', validatedData.customerId); // Log para debugging
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    // Verificar stock de productos
    for (const item of validatedData.items) {
      const product = await db.collection('inventory').findOne({
        _id: new ObjectId(item.productId)
      });

      if (!product) {
        console.log('Producto no encontrado:', item.productId); // Log para debugging
        return NextResponse.json(
          { error: `Producto no encontrado: ${item.productId}` },
          { status: 404 }
        );
      }

      if (product.stock < item.quantity) {
        console.log('Stock insuficiente:', { product, requested: item.quantity }); // Log para debugging
        return NextResponse.json(
          { error: `Stock insuficiente para el producto: ${product.name}` },
          { status: 400 }
        );
      }
    }

    // Crear el pedido
    const newOrder = {
      ...validatedData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('Creando pedido:', newOrder); // Log para debugging

    const result = await db.collection('orders').insertOne(newOrder);

    // Actualizar stock de productos
    for (const item of validatedData.items) {
      await db.collection('inventory').updateOne(
        { _id: new ObjectId(item.productId) },
        { $inc: { stock: -item.quantity } }
      );
    }

    return NextResponse.json(
      { 
        message: 'Pedido creado exitosamente',
        orderId: result.insertedId,
        order: {
          ...newOrder,
          _id: result.insertedId
        }
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error al crear pedido:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos de validación inválidos', details: error.errors },
        { status: 400 }
      );
    }

    if (error.name === 'BSONTypeError') {
      return NextResponse.json(
        { error: 'ID de cliente o producto inválido' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear el pedido', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Actualizar estado del pedido
export async function PUT(req: Request) {
  try {
    const { id, status } = await req.json();

    if (!['pending', 'processing', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { error: 'Estado de pedido inválido' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('farmacia');

    const result = await db.collection('orders').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Estado del pedido actualizado exitosamente',
      orderId: id,
      status
    });
  } catch (error) {
    console.error('Error al actualizar pedido:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el pedido' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar pedido (solo si está pendiente)
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    const client = await clientPromise;
    const db = client.db('farmacia');

    // Verificar que el pedido existe y está pendiente
    const order = await db.collection('orders').findOne({
      _id: new ObjectId(id),
      status: 'pending'
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Pedido no encontrado o no se puede eliminar' },
        { status: 404 }
      );
    }

    // Restaurar stock de productos
    for (const item of order.items) {
      await db.collection('inventory').updateOne(
        { _id: new ObjectId(item.productId) },
        { $inc: { stock: item.quantity } }
      );
    }

    const result = await db.collection('orders').deleteOne({
      _id: new ObjectId(id)
    });

    return NextResponse.json({ 
      message: 'Pedido eliminado exitosamente',
      orderId: id
    });
  } catch (error) {
    console.error('Error al eliminar pedido:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el pedido' },
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