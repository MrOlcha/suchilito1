import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'pos.db');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { correo, password } = body;

    if (!correo || !password) {
      return NextResponse.json(
        { message: 'Faltan datos requeridos (correo, password)' },
        { status: 400 }
      );
    }

    const db = new Database(dbPath);
    
    // Buscar cliente por correo
    const cliente = db.prepare(`
      SELECT id, nombre, telefono, correo, fecha_nacimiento, password, email_verificado
      FROM clientes_web 
      WHERE correo = ?
    `).get(correo) as any;
    
    db.close();

    if (!cliente) {
      return NextResponse.json(
        { message: 'Correo o contraseña incorrectos' },
        { status: 401 }
      );
    }

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, cliente.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { message: 'Correo o contraseña incorrectos' },
        { status: 401 }
      );
    }

    // Verificar que el email esté verificado
    if (!cliente.email_verificado) {
      return NextResponse.json(
        { message: 'Debes verificar tu correo electrónico primero' },
        { status: 403 }
      );
    }

    // Login exitoso - retornar datos del usuario (sin contraseña)
    const { password: _, ...userWithoutPassword } = cliente;

    return NextResponse.json({
      message: 'Login exitoso',
      user: userWithoutPassword,
      success: true
    });

  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { message: 'Error en el servidor' },
      { status: 500 }
    );
  }
}
