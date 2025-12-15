import { getDb } from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const data = await request.json();

    const updatedData: any = {};
    if (data.cantidad !== undefined) updatedData.cantidad = data.cantidad;
    if (data.precio_unitario !== undefined) updatedData.precio_unitario = data.precio_unitario;
    if (data.especificaciones !== undefined) updatedData.especificaciones = data.especificaciones;
    if (data.notas !== undefined) updatedData.notas = data.notas;

    // Calcular subtotal
    const item = db.prepare('SELECT cantidad, precio_unitario FROM detalle_pedidos WHERE id = ?').get(parseInt(params.id)) as any;
    if (!item) {
      return Response.json({ error: 'Item no encontrado' }, { status: 404 });
    }

    const newCantidad = updatedData.cantidad ?? item.cantidad;
    const newPrecio = updatedData.precio_unitario ?? item.precio_unitario;
    updatedData.subtotal = newCantidad * newPrecio;

    const setClauses = Object.keys(updatedData)
      .map((key) => `${key} = ?`)
      .join(', ');
    const values = Object.values(updatedData);

    db.prepare(`UPDATE detalle_pedidos SET ${setClauses} WHERE id = ?`).run(
      ...values,
      parseInt(params.id)
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();

    const item = db.prepare('SELECT pedido_id FROM detalle_pedidos WHERE id = ?').get(parseInt(params.id)) as any;
    if (!item) {
      return Response.json({ error: 'Item no encontrado' }, { status: 404 });
    }

    db.prepare('DELETE FROM detalle_pedidos WHERE id = ?').run(parseInt(params.id));

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
