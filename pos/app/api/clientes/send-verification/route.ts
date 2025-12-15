import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import nodemailer from 'nodemailer';
import path from 'path';

const dbPath = path.join(process.cwd(), 'pos.db');

// Configurar transporte SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true, // SSL
  auth: {
    user: 'verificacion@mazuhi.com',
    pass: 'MrOlcha12#01'
  }
});

// Generar código de verificación aleatorio
function generarCodigoVerificacion(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { correo, nombre } = body;

    if (!correo || !nombre) {
      return NextResponse.json(
        { message: 'Correo y nombre son requeridos' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      return NextResponse.json(
        { message: 'Correo inválido' },
        { status: 400 }
      );
    }

    // Generar código
    const codigo = generarCodigoVerificacion();

    // Guardar código en BD con expiración de 10 minutos
    const db = new Database(dbPath);
    
    db.prepare(`
      UPDATE clientes_web 
      SET codigo_verificacion = ?, fecha_verificacion = datetime('now', '+10 minutes')
      WHERE correo = ?
    `).run(codigo, correo);

    db.close();

    // Enviar email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #ff6b35;">¡Verifica tu correo en Mazuhi Sushi!</h2>
        <p>Hola <strong>${nombre}</strong>,</p>
        <p>Gracias por registrarte en Mazuhi Sushi. Para completar tu registro, por favor ingresa el siguiente código de verificación:</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <h1 style="color: #ff6b35; letter-spacing: 3px; margin: 0;">${codigo}</h1>
          <p style="color: #666; margin-top: 10px; font-size: 12px;">Este código expira en 10 minutos</p>
        </div>
        
        <p>Si no solicitaste este registro, puedes ignorar este correo.</p>
        
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          Mazuhi Sushi - Fusión Sinaloense-Oriental<br>
          © 2025 Todos los derechos reservados
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: 'verificacion@mazuhi.com',
      to: correo,
      subject: 'Verifica tu correo - Mazuhi Sushi',
      html: htmlContent
    });

    return NextResponse.json({
      message: 'Código de verificación enviado a tu correo',
      success: true
    });
  } catch (error) {
    console.error('Error al enviar verificación:', error);
    return NextResponse.json(
      { 
        message: error instanceof Error ? error.message : 'Error al enviar verificación',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
