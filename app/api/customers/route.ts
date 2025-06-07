import { NextResponse } from 'next/server';
import { z } from 'zod';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Esquema de validación para el cliente
const customerSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos'),
  address: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
  documentType: z.enum(['dni', 'ruc', 'ce']),
  documentNumber: z.string().min(8, 'El número de documento debe tener al menos 8 dígitos'),
  notes: z.string().optional(),
});

// GET - Obtener todos los clientes
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('farmacia');
    
    const customers = await db.collection('customers')
      .find({})
      .sort({ name: 1 })
      .toArray();

    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
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
    const db = client.db('farmacia');

    // Verificar si el documento ya está registrado
    const existingCustomer = await db.collection('customers').findOne({
      documentNumber: validatedData.documentNumber,
      documentType: validatedData.documentType
    });

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Ya existe un cliente con este documento' },
        { status: 400 }
      );
    }

    // Verificar si el email ya está registrado
    const existingEmail = await db.collection('customers').findOne({
      email: validatedData.email
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Ya existe un cliente con este email' },
        { status: 400 }
      );
    }

    const newCustomer = {
      ...validatedData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('customers').insertOne(newCustomer);

    return NextResponse.json(
      { 
        message: 'Cliente creado exitosamente',
        customerId: result.insertedId,
        customer: {
          ...newCustomer,
          _id: result.insertedId
        }
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error al crear cliente:', error);
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
    const db = client.db('farmacia');

    // Verificar si el cliente existe
    const existingCustomer = await db.collection('customers').findOne({
      _id: new ObjectId(id)
    });

    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si el nuevo documento ya está registrado en otro cliente
    if (validatedData.documentNumber !== existingCustomer.documentNumber ||
        validatedData.documentType !== existingCustomer.documentType) {
      const docExists = await db.collection('customers').findOne({
        documentNumber: validatedData.documentNumber,
        documentType: validatedData.documentType,
        _id: { $ne: new ObjectId(id) }
      });

      if (docExists) {
        return NextResponse.json(
          { error: 'Ya existe otro cliente con este documento' },
          { status: 400 }
        );
      }
    }

    // Verificar si el nuevo email ya está registrado en otro cliente
    if (validatedData.email !== existingCustomer.email) {
      const emailExists = await db.collection('customers').findOne({
        email: validatedData.email,
        _id: { $ne: new ObjectId(id) }
      });

      if (emailExists) {
        return NextResponse.json(
          { error: 'Ya existe otro cliente con este email' },
          { status: 400 }
        );
      }
    }

    const updatedCustomer = {
      ...validatedData,
      updatedAt: new Date(),
    };

    const result = await db.collection('customers').updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedCustomer }
    );

    return NextResponse.json({ 
      message: 'Cliente actualizado exitosamente',
      customer: {
        ...updatedCustomer,
        _id: id
      }
    });
  } catch (error: any) {
    console.error('Error al actualizar cliente:', error);
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
    const db = client.db('farmacia');

    // Verificar si el cliente tiene pedidos asociados
    const hasOrders = await db.collection('orders').findOne({
      customerId: id
    });

    if (hasOrders) {
      return NextResponse.json(
        { error: 'No se puede eliminar el cliente porque tiene pedidos asociados' },
        { status: 400 }
      );
    }

    const result = await db.collection('customers').deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Cliente eliminado exitosamente',
      customerId: id
    });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el cliente' },
      { status: 500 }
    );
  }
} 