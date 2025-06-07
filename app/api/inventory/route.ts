import { NextResponse } from 'next/server';
import { inventorySchema } from '@/models/Inventory';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET - Obtener todos los productos
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const products = await db.collection('inventory').find({}).toArray();
    
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener el inventario' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo producto
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = inventorySchema.parse(body);

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('inventory').insertOne({
      ...validatedData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      { message: 'Producto creado exitosamente', productId: result.insertedId },
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
      { error: 'Error al crear el producto' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar producto
export async function PUT(req: Request) {
  try {
    const { id, ...updateData } = await req.json();
    const validatedData = inventorySchema.parse(updateData);

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('inventory').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...validatedData,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Producto actualizado exitosamente' });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos de validación inválidos', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Error al actualizar el producto' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar producto
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('inventory').deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al eliminar el producto' },
      { status: 500 }
    );
  }
} 