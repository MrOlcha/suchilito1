import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../../../lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '../../../../../lib/auth';

// GET - Obtener todas las categorías
export async function GET() {
  try {
    const db = getDb();
    const categorias = db.prepare(
      'SELECT id, nombre, orden, activo FROM menu_categorias ORDER BY orden, nombre'
    ).all();
    return NextResponse.json(categorias);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { message: 'Error al obtener categorías' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva categoría
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

    const { nombre, orden } = await request.json();

    if (!nombre || nombre.trim() === '') {
      return NextResponse.json(
        { message: 'El nombre de la categoría es requerido' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Verificar que no exista la categoría
    const exists = db.prepare(
      'SELECT id FROM menu_categorias WHERE nombre = ?'
    ).get(nombre);

    if (exists) {
      return NextResponse.json(
        { message: 'La categoría ya existe' },
        { status: 400 }
      );
    }

    // Obtener el siguiente orden si no se proporciona
    let ordenFinal = orden;
    if (!ordenFinal) {
      const lastOrder = db.prepare(
        'SELECT MAX(orden) as max_orden FROM menu_categorias'
      ).get() as any;
      ordenFinal = (lastOrder?.max_orden || 0) + 1;
    }

    const result = db.prepare(
      'INSERT INTO menu_categorias (nombre, orden, activo) VALUES (?, ?, ?)'
    ).run(nombre.trim(), ordenFinal, 1);

    return NextResponse.json(
      { 
        message: 'Categoría creada exitosamente',
        id: result.lastInsertRowid,
        nombre,
        orden: ordenFinal
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { message: 'Error al crear categoría' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar categoría
export async function PUT(request: NextRequest) {
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

    const { id, nombre, orden, activo } = await request.json();

    if (!id) {
      return NextResponse.json(
        { message: 'ID de categoría es requerido' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Verificar que existe
    const exists = db.prepare('SELECT id FROM menu_categorias WHERE id = ?').get(id);
    if (!exists) {
      return NextResponse.json(
        { message: 'Categoría no encontrada' },
        { status: 404 }
      );
    }

    // Actualizar
    db.prepare(
      'UPDATE menu_categorias SET nombre = ?, orden = ?, activo = ? WHERE id = ?'
    ).run(nombre.trim(), orden, activo ? 1 : 0, id);

    return NextResponse.json({
      message: 'Categoría actualizada exitosamente',
      id,
      nombre,
      orden
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { message: 'Error al actualizar categoría' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar categoría
export async function DELETE(request: NextRequest) {
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

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { message: 'ID de categoría es requerido' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Verificar que existe
    const categoria = db.prepare('SELECT id FROM menu_categorias WHERE id = ?').get(id);
    if (!categoria) {
      return NextResponse.json(
        { message: 'Categoría no encontrada' },
        { status: 404 }
      );
    }

    // Verificar que no tiene items asociados
    const itemsCount = db.prepare(
      'SELECT COUNT(*) as count FROM menu_items WHERE categoria_id = ?'
    ).get(id) as any;

    if (itemsCount.count > 0) {
      return NextResponse.json(
        { message: `No se puede eliminar la categoría. Tiene ${itemsCount.count} item(s) asociado(s)` },
        { status: 400 }
      );
    }

    // Eliminar
    db.prepare('DELETE FROM menu_categorias WHERE id = ?').run(id);

    return NextResponse.json({
      message: 'Categoría eliminada exitosamente',
      id
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { message: 'Error al eliminar categoría' },
      { status: 500 }
    );
  }
}
