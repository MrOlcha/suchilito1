import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Si es una solicitud al API de menú, asegurar que no haya cache
  if (request.nextUrl.pathname === '/api/menu') {
    const response = NextResponse.next();
    
    // Remover headers de cache que Next.js agrega
    response.headers.delete('Cache-Control');
    
    // Agregar headers explícitos para no cachear
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0, public');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/menu'],
};
