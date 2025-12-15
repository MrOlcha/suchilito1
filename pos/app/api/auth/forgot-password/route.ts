import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import nodemailer from 'nodemailer';
import path from 'path';

const dbPath = path.join(process.cwd(), 'pos.db');

// Generar código de 6 caracteres aleatorio
function generateResetCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { correo } = body;

    if (!correo) {
      return NextResponse.json(
        { message: 'El correo es requerido' },
        { status: 400 }
      );
    }

    const db = new Database(dbPath);
    
    // Buscar cliente por correo
    const cliente = db.prepare(`
      SELECT id, nombre, correo 
      FROM clientes_web 
      WHERE correo = ?
    `).get(correo) as any;

    if (!cliente) {
      db.close();
      console.log(`❌ Cliente no encontrado con correo: ${correo}`);
      return NextResponse.json(
        { message: 'No existe una cuenta con ese correo' },
        { status: 404 }
      );
    }

    console.log(`✅ Cliente encontrado: ${cliente.nombre} (${correo})`);

    // Generar código de recuperación
    const resetCode = generateResetCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    // Guardar código en la base de datos
    try {
      db.prepare(`
        UPDATE clientes_web 
        SET codigo_verificacion = ?, 
            fecha_verificacion = ? 
        WHERE id = ?
      `).run(resetCode, expiresAt.toISOString(), cliente.id);
      
      console.log(`✅ Código generado: ${resetCode} para ${correo}`);
    } catch (dbError) {
      console.error('Error actualizando BD:', dbError);
      db.close();
      throw dbError;
    }

    // Configurar transporte de email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.hostinger.com',
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: true,
      auth: {
        user: process.env.SMTP_USER || 'verificacion@mazuhi.com',
        pass: process.env.SMTP_PASS || 'MrOlcha12#01'
      }
    });

    console.log('📧 Intentando enviar email a:', correo);

    // Enviar email con código de recuperación
    const mailResult = await transporter.sendMail({
      from: '"Mazuhi Sushi 🍱" <verificacion@mazuhi.com>',
      to: correo,
      subject: '🔐 Recuperación de PIN - Mazuhi',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #E09E7D 0%, #B85C38 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .code-box { background: white; border: 3px dashed #E09E7D; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
            .code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #B85C38; font-family: monospace; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Recuperación de PIN</h1>
            </div>
            <div class="content">
              <p>Hola <strong>${cliente.nombre}</strong>,</p>
              <p>Recibimos una solicitud para restablecer tu PIN de acceso. Usa el siguiente código para cambiarlo:</p>
              
              <div class="code-box">
                <div class="code">${resetCode}</div>
              </div>

              <div class="warning">
                <strong>⚠️ Importante:</strong> Este código expira en <strong>10 minutos</strong>.
              </div>

              <p>Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
              
              <p style="margin-top: 30px;">
                Saludos,<br>
                <strong>Equipo Mazuhi 🍱</strong>
              </p>
            </div>
            <div class="footer">
              <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    db.close();
    
    console.log(`✅ Email enviado exitosamente a ${correo}`);

    return NextResponse.json({
      message: 'Código de recuperación enviado a tu correo',
      success: true
    });

  } catch (error) {
    console.error('❌ Error en forgot-password:', error);
    return NextResponse.json(
      { message: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
