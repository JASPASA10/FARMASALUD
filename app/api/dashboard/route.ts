import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();

    // Obtener métricas en tiempo real
    const [
      totalProducts,
      lowStockProducts,
      totalOrders,
      totalCustomers,
      recentOrders,
      totalRevenue
    ] = await Promise.all([
      // Total de productos
      db.collection('inventory').countDocuments(),
      
      // Productos con stock bajo (menos de 10 unidades)
      db.collection('inventory').countDocuments({ stock: { $lt: 10 } }),
      
      // Total de pedidos
      db.collection('orders').countDocuments(),
      
      // Total de clientes
      db.collection('customers').countDocuments(),
      
      // Pedidos recientes (últimos 5)
      db.collection('orders')
        .find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray(),
      
      // Ingresos totales
      db.collection('orders').aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]).toArray()
    ]);

    // Calcular estadísticas adicionales
    const ordersByStatus = await db.collection('orders').aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    const topProducts = await db.collection('orders').aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          totalSold: { $sum: '$items.quantity' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]).toArray();

    // Obtener detalles de los productos más vendidos
    const topProductsDetails = await Promise.all(
      topProducts.map(async (product) => {
        const productDetails = await db.collection('inventory').findOne({
          _id: product._id
        });
        return {
          ...product,
          productDetails
        };
      })
    );

    return NextResponse.json({
      metrics: {
        totalProducts,
        lowStockProducts,
        totalOrders,
        totalCustomers,
        totalRevenue: totalRevenue[0]?.total || 0,
        ordersByStatus: ordersByStatus.reduce((acc, curr) => ({
          ...acc,
          [curr._id]: curr.count
        }), {}),
        topProducts: topProductsDetails
      },
      recentOrders
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener las métricas del dashboard' },
      { status: 500 }
    );
  }
} 