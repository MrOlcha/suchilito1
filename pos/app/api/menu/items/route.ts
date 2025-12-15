import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '../../../../lib/auth';
import { invalidateMazuhiWebCache } from '../../../../lib/invalidateCache';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || user.rol !== 'admin') {
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 });
    }

    const formData = await request.formData();
    const nombre = formData.get('nombre') as string;
    const descripcion = formData.get('descripcion') as string;
    const precio = parseFloat(formData.get('precio') as string);
    const categoria = formData.get('categoria') as string;
    const archivo = formData.get('imagen') as File | null;
    
    const vegetariano = formData.get('vegetariano') === 'true';
    const picante = formData.get('picante') === 'true';
    const favorito = formData.get('favorito') === 'true';
    const destacado = formData.get('destacado') === 'true';

    if (!nombre || !descripcion || !precio || !categoria) {
      return NextResponse.json(
        { message: 'Datos incompletos' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Obtener ID de la categoría
    const categoryRow = db.prepare(
      'SELECT id FROM menu_categorias WHERE nombre = ?'
    ).get(categoria) as any;

    if (!categoryRow) {
      return NextResponse.json(
        { message: 'Categoría no encontrada' },
        { status: 400 }
      );
    }

    let imagenLocal = null;

    // Procesar imagen si existe
    if (archivo) {
      try {
        const bytes = await archivo.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Validar tamaño (máximo 10MB después de comprimir)
        if (buffer.length > 10 * 1024 * 1024) {
          return NextResponse.json(
            { message: 'La imagen es demasiado grande (máximo 10MB)' },
            { status: 413 }
          );
        }
        
        // Crear nombre único para la imagen
        const timestamp = Date.now();
        const safeName = nombre.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
        const filename = `item_${timestamp}_${safeName}.jpg`;
        const filepath = `/public/menu-images/${filename}`;
        
        const fs = require('fs').promises;
        const path = require('path');
        
        const fullPath = path.join(process.cwd(), 'public', 'menu-images', filename);
        await fs.writeFile(fullPath, buffer);
        
        imagenLocal = `/menu-images/${filename}`;
      } catch (error) {
        console.error('Error guardando imagen:', error);
        return NextResponse.json(
          { message: 'Error al guardar la imagen' },
          { status: 500 }
        );
      }
    }

    // Insertar item en la BD
    try {
      db.prepare(`
        INSERT INTO menu_items (
          categoria_id, nombre, descripcion, precio, 
          imagen_local, vegetariano, picante, favorito, 
          destacado, activo, ultima_sync, actualizado_en
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))
      `).run(
        categoryRow.id,
        nombre,
        descripcion,
        precio,
        imagenLocal,
        vegetariano ? 1 : 0,
        picante ? 1 : 0,
        favorito ? 1 : 0,
        destacado ? 1 : 0
      );

      // Invalidar cache en mazuhi-web
      await invalidateMazuhiWebCache();

      return NextResponse.json(
        { message: '✅ Item agregado exitosamente', imagenLocal },
        { status: 201 }
      );
    } catch (error: any) {
      console.error('Error insertando item:', error);
      return NextResponse.json(
        { message: 'Error al agregar item: ' + error.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error en POST /api/menu/items:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verificar autenticación
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || user.rol !== 'admin') {
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 });
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { message: 'ID del item requerido' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Obtener el item para eliminar la imagen
    const item = db.prepare(
      'SELECT imagen_local FROM menu_items WHERE id = ?'
    ).get(id) as any;

    if (!item) {
      return NextResponse.json(
        { message: 'Item no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar imagen local si existe
    if (item.imagen_local) {
      try {
        const fs = require('fs').promises;
        const path = require('path');
        
        const filename = item.imagen_local.split('/').pop();
        const fullPath = path.join(process.cwd(), 'public', 'menu-images', filename);
        await fs.unlink(fullPath);
      } catch (error) {
        console.warn('No se pudo eliminar imagen:', error);
      }
    }

    // Eliminar item de la BD
    db.prepare('DELETE FROM menu_items WHERE id = ?').run(id);

    // Invalidar cache en mazuhi-web
    await invalidateMazuhiWebCache();

    return NextResponse.json(
      { message: '✅ Item eliminado exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en DELETE /api/menu/items:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
