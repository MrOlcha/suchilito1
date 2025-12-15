import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      error: 'Este endpoint no existe en el main app',
      message: 'Los reportes están disponibles en: /pos/api/reportes',
      hint: 'Cambia tu URL de /api/reportes a /pos/api/reportes'
    },
    { status: 404 }
  );
}

export async function POST() {
  return NextResponse.json(
    {
      error: 'Este endpoint no existe en el main app',
      message: 'Los reportes están disponibles en: /pos/api/reportes',
      hint: 'Cambia tu URL de /api/reportes a /pos/api/reportes'
    },
    { status: 404 }
  );
}
