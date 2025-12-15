import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '../../../lib/auth';

export async function GET() {
  try {
    const db = getDb();

    // Obtener promociones con sus items
    const promociones = db.prepare(`
      SELECT
        p.id,
        p.nombre,
        p.descripcion,
        p.activa,
        p.fecha_creacion,
        p.items_requeridos,
        p.items_gratis,
        p.aplicar_a_categoria,
        p.dias_aplicables,
        p.hora_inicio,
        p.hora_fin,
        GROUP_CONCAT(pi.menu_item_id) as item_ids,
        COUNT(pi.menu_item_id) as total_items
      FROM promociones p
      LEFT JOIN promocion_items pi ON p.id = pi.promocion_id
      GROUP BY p.id
      ORDER BY p.fecha_creacion DESC
    `).all();

    // Para cada promoción, obtener los detalles de los items
    const promocionesConItems = promociones.map(promocion => {
      let items = [];
      if (promocion.item_ids) {
        const itemIds = promocion.item_ids.split(',');
        items = db.prepare(`
          SELECT mi.id, mi.nombre, mi.precio, mc.nombre as categoria
          FROM menu_items mi
          JOIN menu_categorias mc ON mi.categoria_id = mc.id
          WHERE mi.id IN (${itemIds.map(() => '?').join(',')})
          ORDER BY mi.precio ASC
        `).all(itemIds);
      }

      return {
        ...promocion,
        items,
        itemsRequeridos: promocion.items_requeridos,
        itemsGratis: promocion.items_gratis,
        aplicarACategoria: promocion.aplicar_a_categoria,
        diasAplicables: promocion.dias_aplicables,
        horaInicio: promocion.hora_inicio,
        horaFin: promocion.hora_fin,
        item_ids: undefined, // remover del response
        items_requeridos: undefined,
        items_gratis: undefined,
        aplicar_a_categoria: undefined,
        dias_aplicables: undefined,
        hora_inicio: undefined,
        hora_fin: undefined
      };
    });

    return NextResponse.json(promocionesConItems);
  } catch (error) {
    console.error('Error fetching promociones:', error);
    return NextResponse.json(
      { message: 'Error al obtener promociones' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const { nombre, descripcion, itemIds, itemsRequeridos, itemsGratis, aplicarACategoria, diasAplicables, horaInicio, horaFin } = await request.json();

    if (!nombre || !itemIds || !Array.isArray(itemIds) || itemIds.length < 2) {
      return NextResponse.json(
        { message: 'Nombre y al menos 2 items son requeridos' },
        { status: 400 }
      );
    }

    if (!itemsRequeridos || itemsRequeridos < 2) {
      return NextResponse.json(
        { message: 'Se requieren mínimo 2 items para la promoción' },
        { status: 400 }
      );
    }

    if (!itemsGratis || itemsGratis < 1) {
      return NextResponse.json(
        { message: 'Se requiere mínimo 1 item gratis' },
        { status: 400 }
      );
    }

    const db = getDb();

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

    // Crear la promoción
    const result = db.prepare(
      'INSERT INTO promociones (nombre, descripcion, activa, items_requeridos, items_gratis, aplicar_a_categoria, dias_aplicables, hora_inicio, hora_fin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(
      nombre.trim(),
      descripcion?.trim() || '',
      1,
      itemsRequeridos,
      itemsGratis,
      aplicarACategoria || null,
      diasAplicables || null,
      horaInicio || null,
      horaFin || null
    );

    const promocionId = result.lastInsertRowid;

    // Agregar los items a la promoción
    const insertItem = db.prepare(
      'INSERT INTO promocion_items (promocion_id, menu_item_id) VALUES (?, ?)'
    );

    for (const itemId of itemIds) {
      insertItem.run(promocionId, itemId);
    }

    return NextResponse.json(
      {
        message: 'Promoción creada exitosamente',
        id: promocionId,
        nombre,
        descripcion,
        itemIds,
        itemsRequeridos,
        itemsGratis,
        aplicarACategoria
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating promocion:', error);
    return NextResponse.json(
      { message: 'Error al crear promoción' },
      { status: 500 }
    );
  }
}