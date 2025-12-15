import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'pos.db');
const imagesDir = path.join(process.cwd(), 'public/menu-images');

export async function GET() {
  try {
    const db = new Database(dbPath);

    // Check for phantom items
    const phantomItems = db.prepare(`
      SELECT id, nombre FROM menu_items WHERE id IN (403) OR nombre IN ('xd')
    `).all();

    // Check for corrupted image references
    const corruptedImages = db.prepare(`
      SELECT COUNT(*) as count FROM menu_items 
      WHERE imagen_local LIKE '%71_%' OR imagen_local LIKE '%item_%'
    `).get() as any;

    // Count total items
    const totalItems = db.prepare(`
      SELECT COUNT(*) as count FROM menu_items WHERE activo = 1
    `).get() as any;

    // Check filesystem for corrupted files
    const filesWithBadPrefix = fs.readdirSync(imagesDir).filter(f => 
      f.startsWith('71_') || f.startsWith('item_')
    );

    db.close();

    const isHealthy = 
      phantomItems.length === 0 &&
      corruptedImages.count === 0 &&
      filesWithBadPrefix.length === 0;

    return NextResponse.json({
      healthy: isHealthy,
      status: isHealthy ? 'OK' : 'CORRUPTED_DATA_DETECTED',
      timestamp: new Date().toISOString(),
      details: {
        phantomItems: {
          found: phantomItems.length > 0,
          count: phantomItems.length,
          items: phantomItems,
          expected: []
        },
        databaseImagePaths: {
          corrupted: {
            count: corruptedImages.count,
            found: corruptedImages.count > 0
          },
          expected: 'Paths like /menu-images/61_*, /menu-images/62_*, etc.'
        },
        fileSystem: {
          corrupted: {
            count: filesWithBadPrefix.length,
            found: filesWithBadPrefix.length > 0,
            files: filesWithBadPrefix
          },
          expected: 'No files with 71_ or item_ prefix'
        },
        items: {
          total: totalItems.count,
          expected: 50
        }
      },
      recommendation: isHealthy 
        ? 'Sistema limpio. Si ves imágenes viejas en el navegador, limpia el caché.'
        : 'Hay datos corruptos en el servidor. Contacta al administrador.'
    });
  } catch (error) {
    return NextResponse.json(
      { 
        healthy: false,
        status: 'ERROR',
        error: String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
