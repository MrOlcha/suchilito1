import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'pos.db');

// GET - Obtener todas las áreas
export async function GET(request: NextRequest) {
  try {
    const db = new Database(dbPath);
    
    const areas = db.prepare(`
      SELECT * FROM areas ORDER BY orden ASC
    `).all();

    db.close();
    return NextResponse.json(areas);
  } catch (error) {
    console.error('[Areas API] Error GET:', error);
    return NextResponse.json(
      { error: 'Error al obtener áreas' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva área
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, descripcion, color, icono, orden } = body;

    if (!nombre || nombre.trim() === '') {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    const db = new Database(dbPath);

    const result = db.prepare(`
      INSERT INTO areas (nombre, descripcion, color, icono, orden)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      nombre,
      descripcion || null,
      color || '#3b82f6',
      icono || 'ChefHat',
      orden || 0
    );

    const area = db.prepare('SELECT * FROM areas WHERE id = ?').get(result.lastInsertRowid);
    db.close();

    return NextResponse.json(area, { status: 201 });
  } catch (error: any) {
    console.error('[Areas API] Error POST:', error);
    
    if (error.message?.includes('UNIQUE')) {
      return NextResponse.json(
        { error: 'El nombre del área ya existe' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear área' },
      { status: 500 }
    );
  }
}
