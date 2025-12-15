import { NextResponse } from 'next/server';
import { googleSheetsService } from '@/lib/googleSheets';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// Cache variables
let sucursalesCache: any = null;
let sucursalesCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(request: Request) {
  try {
    console.log('🏪 Sucursales API called');
    
    const { searchParams } = new URL(request.url);
    const ciudad = searchParams.get('ciudad');
    
    console.log('📍 Ciudad filter:', ciudad || 'ninguna');
    
    // Check cache
    const now = Date.now();
    let sucursales;
    
    if (sucursalesCache && (now - sucursalesCacheTime) < CACHE_DURATION) {
      console.log('⚡ Using cached sucursales data');
      sucursales = sucursalesCache;
    } else {
      console.log('🔄 Fetching fresh sucursales data from Google Sheets');
      sucursales = await googleSheetsService.getSucursales();
      sucursalesCache = sucursales;
      sucursalesCacheTime = now;
      console.log('💾 Sucursales data cached');
    }
    
    // Filter by city if requested
    let filteredSucursales = sucursales;
    if (ciudad) {
      filteredSucursales = sucursales.filter((s: any) => 
        s.ciudad.toLowerCase() === ciudad.toLowerCase()
      );
    }
    
    console.log('✅ Sucursales API response:', {
      total: filteredSucursales.length,
      sucursales: filteredSucursales.map((s: any) => ({ nombre: s.nombre, ciudad: s.ciudad, activa: s.activa }))
    });
    
    return NextResponse.json({
      success: true,
      data: filteredSucursales,
      lastUpdated: new Date().toISOString(),
      cached: true
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600'
      }
    });
  } catch (error) {
    console.error('❌ Sucursales API Error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch sucursales data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}