import { NextRequest, NextResponse } from 'next/server';
import { googleSheetsService } from '@/lib/googleSheets';
// Simple in-memory cache (10 min)
let cachedPlatillos: any = null;
let cachedPlatillosTimestamp: number = 0;
const TEN_MINUTES = 10 * 60 * 1000;

export async function GET(request: NextRequest) {
  try {
    const now = Date.now();
    if (cachedPlatillos && now - cachedPlatillosTimestamp < TEN_MINUTES) {
      console.log('🟢 Returning cached platillos destacados');
      return NextResponse.json(cachedPlatillos);
    }
    console.log('⭐ Platillos destacados API called');
    const platillosDestacados = await googleSheetsService.getPlatillosDestacados();
    cachedPlatillos = platillosDestacados;
    cachedPlatillosTimestamp = now;
    return NextResponse.json(platillosDestacados);
  } catch (error) {
    console.error('❌ Platillos destacados API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch platillos destacados',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}