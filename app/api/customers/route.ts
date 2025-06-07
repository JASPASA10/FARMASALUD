import { NextResponse } from 'next/server';
import { customerSchema } from '@/models/Customer';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET - Obtener todos los clientes
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const customers = await db.collection('customers')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    return NextResponse.json(customers);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener los clientes' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo cliente
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = customerSchema.parse(body);

    const client = await clientPromise;
    const db = client.db();

    // Verificar si el cliente ya existe
    const existingCustomer = await db.collection('customers').findOne({
      email: validatedData.email
    });

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'El correo electrónico ya está registrado' },
        { status: 400 }
      );
    }

    const result = await db.collection('customers').insertOne({
      ...validatedData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      { message: 'Cliente creado exitosamente', customerId: result.insertedId },
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
      { error: 'Error al crear el cliente' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar cliente
export async function PUT(req: Request) {
  try {
    const { id, ...updateData } = await req.json();
    const validatedData = customerSchema.parse(updateData);

    const client = await clientPromise;
    const db = client.db();

    // Verificar si el nuevo email ya existe en otro cliente
    if (validatedData.email) {
      const existingCustomer = await db.collection('customers').findOne({
        email: validatedData.email,
        _id: { $ne: new ObjectId(id) }
      });

      if (existingCustomer) {
        return NextResponse.json(
          { error: 'El correo electrónico ya está registrado por otro cliente' },
          { status: 400 }
        );
      }
    }

    const result = await db.collection('customers').updateOne(
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
        { error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Cliente actualizado exitosamente' });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos de validación inválidos', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Error al actualizar el cliente' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar cliente
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    const client = await clientPromise;
    const db = client.db();

    // Verificar si el cliente tiene pedidos
    const hasOrders = await db.collection('orders').findOne({
      userId: id
    });

    if (hasOrders) {
      return NextResponse.json(
        { error: 'No se puede eliminar el cliente porque tiene pedidos asociados' },
        { status: 400 }
      );
    }

    const result = await db.collection('customers').deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Cliente eliminado exitosamente' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al eliminar el cliente' },
      { status: 500 }
    );
  }
} 