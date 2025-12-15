import { NextRequest, NextResponse } from 'next/server';

const CAJA_PIN = '7933';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pin } = body;

    if (!pin) {
      return NextResponse.json(
        { error: 'PIN requerido' },
        { status: 400 }
      );
    }

    if (pin === CAJA_PIN) {
      // Crear respuesta con cookie
      const response = NextResponse.json(
        { success: true, message: 'PIN correcto' },
        { status: 200 }
      );

      // Establecer cookie de autenticación de caja (válida por 2 horas)
      response.cookies.set('caja_auth', CAJA_PIN, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 2 * 60 * 60, // 2 horas
        path: '/caja',
      });

      return response;
    } else {
      return NextResponse.json(
        { error: 'PIN incorrecto' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('[Caja Login API] Error:', error);
    return NextResponse.json(
      { error: 'Error al validar PIN' },
      { status: 500 }
    );
  }
}
