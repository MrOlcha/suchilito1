import { NextResponse } from 'next/server';

// Forzar que esta ruta sea siempre dinámica (sin cache de Next.js)
export const dynamic = 'force-dynamic';
export const revalidate = 0; // Sin cache

// URL del API del sistema POS
const POS_API_URL = 'http://localhost:3000/pos/api/menu';

export async function GET() {
  try {
    console.log('🔄 Fetching menu data from POS API (sin cache)...');
    
    // Llamar al API del sistema POS sin cache
    const response = await fetch(POS_API_URL, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // No usar cache
    });
    
    if (!response.ok) {
      throw new Error(`POS API responded with status: ${response.status}`);
    }
    
    const menuData = await response.json();
    
    // Transformar las URLs de las imágenes para que apunten al dominio correcto
    // y agregar el campo 'id' basado en el nombre para compatibilidad
    const transformedMenu = menuData.map((category: any) => ({
      ...category,
      id: category.nombre.toLowerCase().replace(/\s+/g, '-'),
      items: category.items.map((item: any) => {
        let imagenUrl = item.imagen_url;
        
        // Transformar rutas relativas a URLs absolutas
        if (imagenUrl && !imagenUrl.startsWith('http')) {
          if (imagenUrl.startsWith('/pos/')) {
            imagenUrl = `https://beta.mazuhi.com${imagenUrl}`;
          } else {
            imagenUrl = `https://beta.mazuhi.com/pos${imagenUrl}`;
          }
        }
        
        return {
          ...item,
          imagen_url: imagenUrl,
        };
      }),
    }));
    
    console.log('✅ Menu data fetched from POS successfully');
    
    return NextResponse.json({
      success: true,
      data: transformedMenu,
      lastUpdated: new Date().toISOString(),
      cached: false,
      source: 'pos-database',
      stats: {
        categories: transformedMenu.length,
        totalItems: transformedMenu.reduce((acc: any, cat: any) => acc + cat.items.length, 0)
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('❌ Menu API Error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch menu data from POS',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}