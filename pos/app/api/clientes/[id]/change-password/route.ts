import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'pos.db');

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { newPassword } = body;
    const clienteId = params.id;

    if (!newPassword) {
      return NextResponse.json(
        { message: 'La nueva contraseña es requerida' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    const db = new Database(dbPath);

    // Verificar que el cliente existe
    const cliente = db.prepare('SELECT id FROM clientes_web WHERE id = ?').get(clienteId);

    if (!cliente) {
      db.close();
      return NextResponse.json(
        { message: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    db.prepare(`
      UPDATE clientes_web 
      SET password = ? 
      WHERE id = ?
    `).run(hashedPassword, clienteId);

    db.close();

    return NextResponse.json({
      message: 'Contraseña actualizada exitosamente',
      success: true
    });

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    return NextResponse.json(
      { message: 'Error al cambiar contraseña' },
      { status: 500 }
    );
  }
}
