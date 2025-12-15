import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';
import { cookies } from 'next/headers';
import { verifyToken } from '../../../lib/auth';
import fs from 'fs';
import { writeFile } from 'fs/promises';
import { invalidateMazuhiWebCache } from '../../../lib/invalidateCache';

const dbPath = path.join(process.cwd(), 'pos.db');
const imagesDir = path.join(process.cwd(), 'public/menu-images');

export async function GET() {
  try {
    const db = new Database(dbPath);
    
    const items = db.prepare(`
      SELECT 
        mi.id,
        mi.nombre,
        mi.descripcion,
        mi.precio,
        mi.imagen_url,
        mi.imagen_local,
        mi.vegetariano,
        mi.picante,
        mi.favorito,
        mi.destacado,
        mi.area_id,
        mi.categoria_id,
        mc.nombre as categoria
      FROM menu_items mi
      LEFT JOIN menu_categorias mc ON mi.categoria_id = mc.id
      WHERE mi.activo = 1
      ORDER BY mi.nombre
    `).all() as any[];
    
    const processedItems = items.map(item => {
      let imageUrl = item.imagen_local || item.imagen_url;
      if (imageUrl) {
        // Si es ruta de API, devolverla tal cual
        if (imageUrl.startsWith('/api/menu-images/')) {
          return {
            ...item,
            imagen_url: `/pos${imageUrl}`,
          };
        }
        // Si es ruta de menu-images, convertir a API
        if (imageUrl.startsWith('/menu-images')) {
          const filename = imageUrl.split('/').pop();
          return {
            ...item,
            imagen_url: `/pos/api/menu-images/${filename}`,
          };
        }
        // Si ya tiene basePath, devolverla tal cual
        if (imageUrl.startsWith('/pos')) {
          return {
            ...item,
            imagen_url: imageUrl,
          };
        }
      }
      
      return {
        ...item,
        imagen_url: imageUrl,
      };
    });
    
    db.close();
    return NextResponse.json(processedItems);
  } catch (error) {
    console.error('Error getting menu items:', error);
    return NextResponse.json(
      { message: 'Error obteniendo items del menú' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Permitir llamadas internas (desde el backend) sin verificación de token
    const internalToken = request.headers.get('x-internal-api-key');
    const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || 'internal-key-2024';
    
    const isInternalCall = internalToken === INTERNAL_API_KEY;
    
    // Si no es una llamada interna, verificar autenticación normal
    if (!isInternalCall) {
      const cookieStore = cookies();
      const token = cookieStore.get('token')?.value;

      if (!token) {
        return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
      }

      const user = verifyToken(token);
      if (!user || user.rol !== 'admin') {
        return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 });
      }
    }

    const { id, nombre, precio, descripcion, imagen_url, vegetariano, picante, favorito, destacado } = await request.json();

    if (!id) {
      return NextResponse.json(
        { message: 'ID del item es requerido' },
        { status: 400 }
      );
    }

    const db = new Database(dbPath);
    
    db.prepare(
      `UPDATE menu_items 
       SET nombre = ?, precio = ?, descripcion = ?, imagen_url = ?, 
           vegetariano = ?, picante = ?, favorito = ?, destacado = ?,
           actualizado_en = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).run(nombre || null, precio || null, descripcion || null, imagen_url || null, 
       vegetariano ? 1 : 0, picante ? 1 : 0, favorito ? 1 : 0, destacado ? 1 : 0, id);

    db.close();
    
    // Invalidar cache en mazuhi-web
    await invalidateMazuhiWebCache();
    
    return NextResponse.json({ message: 'Item actualizado exitosamente' });
  } catch (error) {
    console.error('Error updating menu item:', error);
    return NextResponse.json(
      { message: 'Error actualizando item' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Permitir llamadas internas (desde el backend) sin verificación de token
    const internalToken = request.headers.get('x-internal-api-key');
    const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || 'internal-key-2024';
    
    const isInternalCall = internalToken === INTERNAL_API_KEY;
    
    // Si no es una llamada interna, verificar autenticación normal
    if (!isInternalCall) {
      const cookieStore = cookies();
      const token = cookieStore.get('token')?.value;

      if (!token) {
        return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
      }

      const user = verifyToken(token);
      if (!user || user.rol !== 'admin') {
        return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 });
      }
    }

    const formData = await request.formData();
    const nombre = formData.get('nombre')?.toString();
    const descripcion = formData.get('descripcion')?.toString();
    const precio = formData.get('precio')?.toString();
    const categoria_id = formData.get('categoria_id')?.toString();
    const area_id = formData.get('area_id')?.toString();
    const vegetariano = formData.get('vegetariano') === 'true' ? 1 : 0;
    const picante = formData.get('picante') === 'true' ? 1 : 0;
    const favorito = formData.get('favorito') === 'true' ? 1 : 0;
    const destacado = formData.get('destacado') === 'true' ? 1 : 0;
    const imagen = formData.get('imagen') as File | null;

    if (!categoria_id || !nombre || !precio) {
      return NextResponse.json(
        { message: 'Datos incompletos' },
        { status: 400 }
      );
    }

    const db = new Database(dbPath);
    
    let imagen_local = null;

    // Procesar imagen si se envió
    if (imagen) {
      try {
        const bytes = await imagen.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Crear nombre único para la imagen
        const timestamp = Date.now();
        const filename = `item_${timestamp}_${nombre.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
        const filepath = path.join(imagesDir, filename);

        // Asegurar que el directorio existe
        if (!fs.existsSync(imagesDir)) {
          fs.mkdirSync(imagesDir, { recursive: true });
        }

        // Guardar archivo
        await writeFile(filepath, buffer);
        // Usar ruta de API en lugar de ruta estática
        imagen_local = `/pos/api/menu-images/${filename}`;
      } catch (err) {
        console.error('Error procesando imagen:', err);
      }
    }
    
    const result = db.prepare(
      `INSERT INTO menu_items 
       (categoria_id, nombre, descripcion, precio, imagen_local, area_id, vegetariano, picante, favorito, destacado, activo, creado_en, actualizado_en)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
    ).run(
      categoria_id, 
      nombre, 
      descripcion || null, 
      parseFloat(precio), 
      imagen_local,
      area_id || null,
      vegetariano,
      picante,
      favorito,
      destacado
    );

    db.close();
    
    // Invalidar cache en mazuhi-web
    await invalidateMazuhiWebCache();
    
    return NextResponse.json({ 
      message: 'Item creado exitosamente',
      id: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json(
      { message: 'Error creando item' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Permitir llamadas internas (desde el backend) sin verificación de token
    const internalToken = request.headers.get('x-internal-api-key');
    const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || 'internal-key-2024';
    
    const isInternalCall = internalToken === INTERNAL_API_KEY;
    
    // Si no es una llamada interna, verificar autenticación normal
    if (!isInternalCall) {
      const cookieStore = cookies();
      const token = cookieStore.get('token')?.value;

      if (!token) {
        return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
      }

      const user = verifyToken(token);
      if (!user || user.rol !== 'admin') {
        return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 });
      }
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { message: 'ID del item es requerido' },
        { status: 400 }
      );
    }

    const db = new Database(dbPath);
    
    db.prepare(
      `UPDATE menu_items SET activo = 0, actualizado_en = CURRENT_TIMESTAMP WHERE id = ?`
    ).run(id);

    db.close();
    
    // Invalidar cache en mazuhi-web
    await invalidateMazuhiWebCache();
    
    return NextResponse.json({ message: 'Item eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json(
      { message: 'Error eliminando item' },
      { status: 500 }
    );
  }
}
