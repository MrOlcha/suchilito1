import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'pos.db');

interface WebOrderItem {
  nombre: string;
  cantidad: number;
  precio: number;
  subtotal: number;
  complementos?: string[];
  soya?: string;
  comentarios?: string;
}

interface WebOrderData {
  orderNumber: string;
  clientName: string;
  clientPhone: string;
  deliveryType: 'pickup' | 'delivery';
  address?: string;
  paymentMethod: 'cash' | 'card';
  items: WebOrderItem[];
  total: number;
  notes?: string;
}

export async function POST(request: NextRequest) {
  try {
    const orderData: WebOrderData = await request.json();

    if (!orderData.orderNumber || !orderData.clientName || !orderData.items?.length) {
      return NextResponse.json(
        { success: false, message: 'Datos incompletos' },
        { status: 400 }
      );
    }

    const db = new Database(dbPath);

    // Generar número de pedido único (si no se proporciona)
    const numeroPedido = orderData.orderNumber || `WEB-${Date.now()}`;

    // Iniciar transacción
    const insertPedido = db.prepare(`
      INSERT INTO pedidos (
        numero_pedido,
        cliente_nombre,
        cliente_telefono,
        estado,
        total,
        subtotal,
        es_para_llevar,
        origen,
        tipo_entrega,
        direccion_entrega,
        observaciones,
        creado_en,
        actualizado_en
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);

    const esParaLlevar = orderData.deliveryType === 'pickup' ? 1 : 0;
    const tipoEntrega = orderData.deliveryType === 'pickup' ? 'pickup' : 'delivery';

    const result = insertPedido.run(
      numeroPedido,
      orderData.clientName,
      orderData.clientPhone,
      'pendiente',
      orderData.total,
      orderData.total,
      esParaLlevar,
      'web',  // origen
      tipoEntrega,
      orderData.address || null,
      orderData.notes || null
    );

    const pedidoId = result.lastInsertRowid;

    // Insertar detalles del pedido
    const insertDetalle = db.prepare(`
      INSERT INTO detalles_pedidos (
        pedido_id,
        item_nombre,
        cantidad,
        precio_unitario,
        especificaciones,
        notas
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const item of orderData.items) {
      const especificaciones = [
        ...(item.complementos || []),
        item.soya ? `Soya: ${item.soya}` : null
      ].filter(Boolean).join(' | ');

      insertDetalle.run(
        pedidoId,
        item.nombre,
        item.cantidad,
        item.precio,
        especificaciones || null,
        item.comentarios || null
      );
    }

    db.close();

    console.log(`✅ Pedido web creado: ${numeroPedido} desde ${orderData.clientName}`);

    return NextResponse.json({
      success: true,
      message: 'Pedido guardado exitosamente',
      pedidoId,
      orderNumber: numeroPedido
    });

  } catch (error) {
    console.error('Error guardando pedido web:', error);
    return NextResponse.json(
      { success: false, message: 'Error al guardar el pedido' },
      { status: 500 }
    );
  }
}
