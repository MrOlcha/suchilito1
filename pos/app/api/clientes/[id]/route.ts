import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'pos.db');

// Obtener un cliente específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = new Database(dbPath);
    
    const cliente = db.prepare(`
      SELECT 
        id, nombre, telefono, correo, fecha_nacimiento, 
        email_verificado, fecha_registro, ultima_orden
      FROM clientes_web
      WHERE id = ?
    `).get(params.id);

    db.close();

    if (!cliente) {
      return NextResponse.json(
        { message: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(cliente);
  } catch (error) {
    console.error('Error obteniendo cliente:', error);
    return NextResponse.json(
      { message: 'Error obteniendo cliente' },
      { status: 500 }
    );
  }
}

// Actualizar un cliente
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { nombre, telefono, correo, fecha_nacimiento } = body;

    const db = new Database(dbPath);

    // Verificar que existe
    const existente = db.prepare('SELECT id FROM clientes_web WHERE id = ?').get(params.id);
    if (!existente) {
      db.close();
      return NextResponse.json(
        { message: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    // Validar que el teléfono no esté duplicado
    if (telefono) {
      const duplicado = db.prepare(
        'SELECT id FROM clientes_web WHERE telefono = ? AND id != ?'
      ).get(telefono, params.id);

      if (duplicado) {
        db.close();
        return NextResponse.json(
          { message: 'El teléfono ya está registrado' },
          { status: 400 }
        );
      }
    }

    // Actualizar
    let query = 'UPDATE clientes_web SET ';
    const updates = [];
    const values = [];

    if (nombre !== undefined) {
      updates.push('nombre = ?');
      values.push(nombre);
    }
    if (telefono !== undefined) {
      updates.push('telefono = ?');
      values.push(telefono);
    }
    if (correo !== undefined) {
      updates.push('correo = ?');
      values.push(correo);
    }
    if (fecha_nacimiento !== undefined) {
      updates.push('fecha_nacimiento = ?');
      values.push(fecha_nacimiento);
    }

    if (updates.length === 0) {
      db.close();
      return NextResponse.json(
        { message: 'No hay datos para actualizar' },
        { status: 400 }
      );
    }

    query += updates.join(', ') + ' WHERE id = ?';
    values.push(params.id);

    db.prepare(query).run(...values);
    db.close();

    return NextResponse.json({
      message: 'Cliente actualizado exitosamente',
      success: true
    });
  } catch (error) {
    console.error('Error actualizando cliente:', error);
    return NextResponse.json(
      { message: 'Error actualizando cliente' },
      { status: 500 }
    );
  }
}

// Eliminar un cliente
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = new Database(dbPath);

    const existente = db.prepare('SELECT id FROM clientes_web WHERE id = ?').get(params.id);
    if (!existente) {
      db.close();
      return NextResponse.json(
        { message: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    db.prepare('DELETE FROM clientes_web WHERE id = ?').run(params.id);
    db.close();

    return NextResponse.json({
      message: 'Cliente eliminado exitosamente',
      success: true
    });
  } catch (error) {
    console.error('Error eliminando cliente:', error);
    return NextResponse.json(
      { message: 'Error eliminando cliente' },
      { status: 500 }
    );
  }
}
