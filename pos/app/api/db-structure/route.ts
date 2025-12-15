import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'ESTRUCTURA_BASE_DATOS.txt');
    const content = fs.readFileSync(filePath, 'utf-8');
    
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': 'inline',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'No se pudo leer el archivo' },
      { status: 500 }
    );
  }
}
