import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '../../../../lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || user.rol !== 'admin') {
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 });
    }

    const promocionId = parseInt(params.id);
    if (isNaN(promocionId)) {
      return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
    }

    const { nombre, descripcion, activa, itemIds, itemsRequeridos, itemsGratis, aplicarACategoria, diasAplicables, horaInicio, horaFin } = await request.json();

    if (!nombre) {
      return NextResponse.json(
        { message: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    if (itemsRequeridos && itemsRequeridos < 2) {
      return NextResponse.json(
        { message: 'Se requieren mínimo 2 items para la promoción' },
        { status: 400 }
      );
    }

    if (itemsGratis && itemsGratis < 1) {
      return NextResponse.json(
        { message: 'Se requiere mínimo 1 item gratis' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Verificar que la promoción existe
    const existing = db.prepare('SELECT id FROM promociones WHERE id = ?').get(promocionId);
    if (!existing) {
      return NextResponse.json({ message: 'Promoción no encontrada' }, { status: 404 });
    }

    // Actualizar la promoción
    db.prepare(
      'UPDATE promociones SET nombre = ?, descripcion = ?, activa = ?, items_requeridos = ?, items_gratis = ?, aplicar_a_categoria = ?, dias_aplicables = ?, hora_inicio = ?, hora_fin = ? WHERE id = ?'
    ).run(
      nombre.trim(),
      descripcion?.trim() || '',
      activa ? 1 : 0,
      itemsRequeridos || 2,
      itemsGratis || 1,
      aplicarACategoria || null,
      diasAplicables || null,
      horaInicio || null,
      horaFin || null,
      promocionId
    );

    // Si se proporcionaron itemIds, actualizar los items
    if (itemIds && Array.isArray(itemIds) && itemIds.length >= 2) {
      // Verificar que todos los items existen
      const placeholders = itemIds.map(() => '?').join(',');
      const existingItems = db.prepare(
        `SELECT id FROM menu_items WHERE id IN (${placeholders})`
      ).all(itemIds);

      if (existingItems.length !== itemIds.length) {
        return NextResponse.json(
          { message: 'Uno o más items no existen' },
          { status: 400 }
        );
      }

      // Eliminar items actuales
      db.prepare('DELETE FROM promocion_items WHERE promocion_id = ?').run(promocionId);

      // Agregar los nuevos items
      const insertItem = db.prepare(
        'INSERT INTO promocion_items (promocion_id, menu_item_id) VALUES (?, ?)'
      );

      for (const itemId of itemIds) {
        insertItem.run(promocionId, itemId);
      }
    }

    return NextResponse.json({ message: 'Promoción actualizada exitosamente' });
  } catch (error) {
    console.error('Error updating promocion:', error);
    return NextResponse.json(
      { message: 'Error al actualizar promoción' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || user.rol !== 'admin') {
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 });
    }

    const promocionId = parseInt(params.id);
    if (isNaN(promocionId)) {
      return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
    }

    const db = getDb();

    // Verificar que la promoción existe
    const existing = db.prepare('SELECT id FROM promociones WHERE id = ?').get(promocionId);
    if (!existing) {
      return NextResponse.json({ message: 'Promoción no encontrada' }, { status: 404 });
    }

    // Eliminar la promoción (los items se eliminan automáticamente por CASCADE)
    db.prepare('DELETE FROM promociones WHERE id = ?').run(promocionId);

    return NextResponse.json({ message: 'Promoción eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting promocion:', error);
    return NextResponse.json(
      { message: 'Error al eliminar promoción' },
      { status: 500 }
    );
  }
}