import { NextRequest, NextResponse } from 'next/server';
import { invalidateCache } from '../cache-state';

export async function POST(request: NextRequest) {
  try {
    // Obtener el token de invalidación del header (para seguridad básica)
    const token = request.headers.get('x-cache-token');
    
    // Token simple para evitar que cualquiera invalide el cache
    // En producción, usar algo más robusto
    const VALID_TOKEN = process.env.CACHE_INVALIDATION_TOKEN || 'secret-cache-key-2024';
    
    if (token !== VALID_TOKEN) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Invalidar cache
    invalidateCache();
    
    console.log('🔄 Cache invalidado desde webhook');
    
    return NextResponse.json({
      success: true,
      message: 'Cache invalidado correctamente',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error invalidando cache:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Error al invalidar cache',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
