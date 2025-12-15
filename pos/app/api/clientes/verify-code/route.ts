import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'pos.db');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { correo, codigo } = body;

    if (!correo || !codigo) {
      return NextResponse.json(
        { message: 'Correo y código son requeridos' },
        { status: 400 }
      );
    }

    const db = new Database(dbPath);

    // Verificar el código
    const cliente = db.prepare(`
      SELECT 
        id,
        codigo_verificacion,
        fecha_verificacion,
        datetime('now') as ahora
      FROM clientes_web
      WHERE correo = ?
    `).get(correo) as any;

    if (!cliente) {
      db.close();
      return NextResponse.json(
        { message: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el código coincida
    if (cliente.codigo_verificacion !== codigo) {
      db.close();
      return NextResponse.json(
        { message: 'Código de verificación inválido' },
        { status: 400 }
      );
    }

    // Verificar que no haya expirado
    const ahora = new Date(cliente.ahora);
    const expiracion = new Date(cliente.fecha_verificacion);

    if (ahora > expiracion) {
      db.close();
      return NextResponse.json(
        { message: 'El código de verificación ha expirado' },
        { status: 400 }
      );
    }

    // Marcar como verificado
    db.prepare(`
      UPDATE clientes_web
      SET 
        email_verificado = 1,
        codigo_verificacion = NULL,
        fecha_verificacion = CURRENT_TIMESTAMP
      WHERE correo = ?
    `).run(correo);

    db.close();

    return NextResponse.json({
      message: 'Email verificado exitosamente',
      success: true,
      cliente_id: cliente.id
    });
  } catch (error) {
    console.error('Error al verificar código:', error);
    return NextResponse.json(
      { message: 'Error al verificar código' },
      { status: 500 }
    );
  }
}
