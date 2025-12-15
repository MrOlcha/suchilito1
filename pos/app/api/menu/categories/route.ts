import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';

export async function GET() {
  try {
    const db = getDb();
    
    const categorias = db.prepare(`
      SELECT id, nombre, orden, activo
      FROM menu_categorias
      WHERE activo = 1
      ORDER BY orden, nombre
    `).all();

    return NextResponse.json(categorias, { status: 200 });
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    return NextResponse.json(
      { message: 'Error obteniendo categorías' },
      { status: 500 }
    );
  }
}
