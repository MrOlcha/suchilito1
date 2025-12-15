import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'pos.db');

// Obtener todos los clientes registrados
export async function GET() {
  try {
    const db = new Database(dbPath);
    
    const clientes = db.prepare(`
      SELECT id, nombre, telefono, correo, fecha_nacimiento, email_verificado, fecha_registro, ultima_orden
      FROM clientes_web
      ORDER BY fecha_registro DESC
    `).all();
    
    db.close();
    return NextResponse.json(clientes);
  } catch (error) {
    console.error('Error obteniendo clientes:', error);
    return NextResponse.json(
      { message: 'Error obteniendo clientes' },
      { status: 500 }
    );
  }
}

// Registrar un nuevo cliente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telefono, correo, fecha_nacimiento, nombre, password } = body;

    if (!telefono || !correo || !fecha_nacimiento || !nombre || !password) {
      return NextResponse.json(
        { message: 'Faltan datos requeridos (telefono, correo, fecha_nacimiento, nombre, password)' },
        { status: 400 }
      );
    }

    const db = new Database(dbPath);
    
    // Verificar si el cliente ya existe por teléfono
    const existentePorTelefono = db.prepare('SELECT id FROM clientes_web WHERE telefono = ?').get(telefono);
    
    if (existentePorTelefono) {
      db.close();
      return NextResponse.json(
        { message: 'El teléfono ya está registrado' },
        { status: 400 }
      );
    }

    // Verificar si el correo ya existe
    const existentePorCorreo = db.prepare('SELECT id FROM clientes_web WHERE correo = ?').get(correo);
    
    if (existentePorCorreo) {
      db.close();
      return NextResponse.json(
        { message: 'El correo ya está registrado' },
        { status: 400 }
      );
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar nuevo cliente
    const stmt = db.prepare(`
      INSERT INTO clientes_web (telefono, correo, fecha_nacimiento, nombre, password, fecha_registro)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const result = stmt.run(telefono, correo, fecha_nacimiento, nombre, hashedPassword);

    db.close();

    return NextResponse.json({
      message: 'Cliente registrado exitosamente',
      id: result.lastInsertRowid,
      success: true
    });
  } catch (error) {
    console.error('Error registrando cliente:', error);
    return NextResponse.json(
      { message: 'Error registrando cliente' },
      { status: 500 }
    );
  }
}
