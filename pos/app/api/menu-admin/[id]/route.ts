import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';
import { cookies } from 'next/headers';
import { verifyToken } from '../../../../lib/auth';
import fs from 'fs';
import { writeFile } from 'fs/promises';

const dbPath = path.join(process.cwd(), 'pos.db');
const imagesDir = path.join(process.cwd(), 'public/menu-images');

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    if (!nombre || !descripcion || !precio || !categoria_id) {
      return NextResponse.json(
        { message: 'Datos incompletos' },
        { status: 400 }
      );
    }

    const db = new Database(dbPath);

    // Obtener el item actual
    const currentItem = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(params.id) as any;
    if (!currentItem) {
      db.close();
      return NextResponse.json(
        { message: 'Item no encontrado' },
        { status: 404 }
      );
    }

    // Validar que categoria_id existe
    const cat = db.prepare('SELECT id FROM menu_categorias WHERE id = ?').get(categoria_id) as any;
    if (!cat) {
      db.close();
      return NextResponse.json(
        { message: 'Categoría no encontrada' },
        { status: 400 }
      );
    }

    let imagen_local = currentItem.imagen_local;

    // Procesar imagen si se envió
    if (imagen) {
      try {
        const bytes = await imagen.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Crear nombre único para la imagen
        const timestamp = Date.now();
        const filename = `${params.id}_${timestamp}.jpg`;
        const filepath = path.join(imagesDir, filename);

        // Asegurar que el directorio existe
        if (!fs.existsSync(imagesDir)) {
          fs.mkdirSync(imagesDir, { recursive: true });
        }

        // Guardar archivo
        await writeFile(filepath, buffer);

        // Eliminar imagen anterior si existe
        if (currentItem.imagen_local) {
          const oldPath = path.join(process.cwd(), 'public', currentItem.imagen_local.replace(/^\//, ''));
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }

        imagen_local = `/menu-images/${filename}`;
      } catch (err) {
        console.error('Error procesando imagen:', err);
      }
    }

    // Actualizar el item
    db.prepare(`
      UPDATE menu_items 
      SET nombre = ?, 
          descripcion = ?, 
          precio = ?, 
          categoria_id = ?, 
          area_id = ?,
          imagen_local = ?,
          vegetariano = ?,
          picante = ?,
          favorito = ?,
          destacado = ?,
          actualizado_en = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      nombre,
      descripcion,
      parseFloat(precio),
      categoria_id,
      area_id || null,
      imagen_local,
      vegetariano,
      picante,
      favorito,
      destacado,
      params.id
    );

    db.close();

    return NextResponse.json({
      message: 'Item actualizado exitosamente',
      id: params.id,
    });
  } catch (error) {
    console.error('Error updating menu item:', error);
    return NextResponse.json(
      { message: 'Error actualizando item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || user.rol !== 'admin') {
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 });
    }

    const db = new Database(dbPath);

    // Obtener item antes de eliminarlo
    const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(params.id) as any;
    if (!item) {
      db.close();
      return NextResponse.json(
        { message: 'Item no encontrado' },
        { status: 404 }
      );
    }

    // Soft delete
    db.prepare(`
      UPDATE menu_items 
      SET activo = 0, actualizado_en = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(params.id);

    // Opcionalmente eliminar imagen
    if (item.imagen_local) {
      try {
        const imagePath = path.join(process.cwd(), 'public', item.imagen_local.replace(/^\//, ''));
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      } catch (err) {
        console.error('Error eliminando imagen:', err);
      }
    }

    db.close();

    return NextResponse.json({
      message: 'Item eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json(
      { message: 'Error eliminando item' },
      { status: 500 }
    );
  }
}
