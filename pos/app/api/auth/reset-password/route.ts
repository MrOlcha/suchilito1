import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'pos.db');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { correo, codigo, newPassword } = body;

    if (!correo || !codigo || !newPassword) {
      return NextResponse.json(
        { message: 'Faltan datos requeridos (correo, codigo, newPassword)' },
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
    
    // Buscar cliente con el código
    const cliente = db.prepare(`
      SELECT id, codigo_verificacion, fecha_verificacion 
      FROM clientes_web 
      WHERE correo = ?
    `).get(correo) as any;

    if (!cliente) {
      db.close();
      console.log(`❌ Cliente no encontrado: ${correo}`);
      return NextResponse.json(
        { message: 'Correo no encontrado' },
        { status: 404 }
      );
    }

    if (!cliente.codigo_verificacion) {
      db.close();
      console.log(`❌ No hay código para: ${correo}`);
      return NextResponse.json(
        { message: 'No se ha solicitado un cambio de contraseña' },
        { status: 400 }
      );
    }

    // Verificar que el código sea correcto
    if (cliente.codigo_verificacion !== codigo.toUpperCase()) {
      db.close();
      console.log(`❌ Código incorrecto para ${correo}. Esperado: ${cliente.codigo_verificacion}, Recibido: ${codigo.toUpperCase()}`);
      return NextResponse.json(
        { message: 'Código de verificación incorrecto. Por favor, revisa tu correo e intenta de nuevo.' },
        { status: 400 }
      );
    }

    // Verificar que no haya expirado (10 minutos)
    const expirationDate = new Date(cliente.fecha_verificacion);
    const now = new Date();
    
    if (now > expirationDate) {
      db.close();
      console.log(`❌ Código expirado para ${correo}`);
      return NextResponse.json(
        { message: 'El código ha expirado. Por favor, solicita uno nuevo.' },
        { status: 400 }
      );
    }

    console.log(`✅ Código válido para ${correo}, actualizando PIN...`);

    // Validar que el nuevo PIN sea de 4 dígitos
    if (!/^\d{4}$/.test(newPassword)) {
      db.close();
      return NextResponse.json(
        { message: 'El PIN debe ser de exactamente 4 dígitos' },
        { status: 400 }
      );
    }

    // Almacenar nuevo PIN directamente (sin hash)

    // Actualizar PIN y limpiar código
    db.prepare(`
      UPDATE clientes_web 
      SET password = ?, 
          codigo_verificacion = NULL, 
          fecha_verificacion = NULL 
      WHERE correo = ?
    `).run(newPassword, correo);

    db.close();

    console.log(`✅ Contraseña actualizada para ${correo}`);

    return NextResponse.json({
      message: 'PIN actualizado exitosamente',
      success: true
    });

  } catch (error) {
    console.error('❌ Error en reset-password:', error);
    return NextResponse.json(
      { message: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
