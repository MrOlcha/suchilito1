import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;
    
    // Validar filename para evitar path traversal
    if (!filename || filename.includes('..') || filename.includes('/')) {
      return NextResponse.json(
        { message: 'Nombre de archivo inválido' },
        { status: 400 }
      );
    }

    const imagePath = path.join(process.cwd(), 'public/menu-images', filename);
    
    // Verificar que el archivo existe
    if (!fs.existsSync(imagePath)) {
      console.warn(`Imagen no encontrada: ${imagePath}`);
      return NextResponse.json(
        { message: 'Imagen no encontrada' },
        { status: 404 }
      );
    }

    // Leer el archivo
    const fileBuffer = fs.readFileSync(imagePath);
    
    // Determinar MIME type basado en extensión
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.webp':
        contentType = 'image/webp';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
    }

    // Retornar imagen con headers de cache
    const response = new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // 1 año
        'Content-Length': fileBuffer.length.toString(),
      },
    });

    return response;
  } catch (error) {
    console.error('Error sirviendo imagen:', error);
    return NextResponse.json(
      { message: 'Error sirviendo imagen' },
      { status: 500 }
    );
  }
}
