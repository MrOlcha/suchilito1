import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'pos.db');

// GET - Obtener área específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = new Database(dbPath);
    
    const area = db.prepare('SELECT * FROM areas WHERE id = ?').get(params.id);

    db.close();

    if (!area) {
      return NextResponse.json(
        { error: 'Área no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(area);
  } catch (error) {
    console.error('[Areas API] Error GET:', error);
    return NextResponse.json(
      { error: 'Error al obtener área' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar área
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { nombre, descripcion, color, icono, activo, orden } = body;

    const db = new Database(dbPath);

    db.prepare(`
      UPDATE areas 
      SET nombre = COALESCE(?, nombre),
          descripcion = COALESCE(?, descripcion),
          color = COALESCE(?, color),
          icono = COALESCE(?, icono),
          activo = COALESCE(?, activo),
          orden = COALESCE(?, orden),
          actualizado_en = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      nombre,
      descripcion,
      color,
      icono,
      activo !== undefined ? activo : null,
      orden,
      params.id
    );

    const area = db.prepare('SELECT * FROM areas WHERE id = ?').get(params.id);
    db.close();

    if (!area) {
      return NextResponse.json(
        { error: 'Área no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(area);
  } catch (error) {
    console.error('[Areas API] Error PUT:', error);
    return NextResponse.json(
      { error: 'Error al actualizar área' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar área
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = new Database(dbPath);

    // Verificar si el área existe
    const area = db.prepare('SELECT * FROM areas WHERE id = ?').get(params.id);
    if (!area) {
      return NextResponse.json(
        { error: 'Área no encontrada' },
        { status: 404 }
      );
    }

    // Eliminar
    db.prepare('DELETE FROM areas WHERE id = ?').run(params.id);
    db.close();

    return NextResponse.json({ success: true, message: 'Área eliminada' });
  } catch (error) {
    console.error('[Areas API] Error DELETE:', error);
    return NextResponse.json(
      { error: 'Error al eliminar área' },
      { status: 500 }
    );
  }
}
