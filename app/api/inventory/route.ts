import { NextResponse } from 'next/server';
import { inventorySchema } from '@/models/Inventory';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET - Obtener todos los productos
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('farmacia');
    const products = await db.collection('inventory')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error al obtener inventario:', error);
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
    const db = client.db('farmacia');

    // Verificar si el SKU ya existe
    const existingProduct = await db.collection('inventory').findOne({
      sku: validatedData.sku
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: 'El SKU ya está registrado' },
        { status: 400 }
      );
    }

    const newProduct = {
      ...validatedData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('inventory').insertOne(newProduct);

    return NextResponse.json(
      { 
        message: 'Producto creado exitosamente', 
        productId: result.insertedId,
        product: {
          ...newProduct,
          _id: result.insertedId
        }
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error al crear producto:', error);
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
    const db = client.db('farmacia');

    // Verificar si el producto existe
    const existingProduct = await db.collection('inventory').findOne({
      _id: new ObjectId(id)
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si el nuevo SKU ya existe en otro producto
    if (validatedData.sku !== existingProduct.sku) {
      const skuExists = await db.collection('inventory').findOne({
        sku: validatedData.sku,
        _id: { $ne: new ObjectId(id) }
      });

      if (skuExists) {
        return NextResponse.json(
          { error: 'El SKU ya está registrado en otro producto' },
          { status: 400 }
        );
      }
    }

    const updatedProduct = {
      ...validatedData,
      updatedAt: new Date(),
    };

    const result = await db.collection('inventory').updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedProduct }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Producto actualizado exitosamente',
      product: {
        ...updatedProduct,
        _id: id
      }
    });
  } catch (error: any) {
    console.error('Error al actualizar producto:', error);
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
    const db = client.db('farmacia');

    // Verificar si el producto tiene pedidos asociados
    const hasOrders = await db.collection('orders').findOne({
      'items.productId': id
    });

    if (hasOrders) {
      return NextResponse.json(
        { error: 'No se puede eliminar el producto porque tiene pedidos asociados' },
        { status: 400 }
      );
    }

    const result = await db.collection('inventory').deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Producto eliminado exitosamente',
      productId: id
    });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el producto' },
      { status: 500 }
    );
  }
} 