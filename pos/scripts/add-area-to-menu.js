import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'pos.db');
const db = new Database(dbPath);

try {
  // Verificar si la columna ya existe
  const columns = db.prepare("PRAGMA table_info(menu_items);").all();
  const hasAreaId = columns.some(col => col.name === 'area_id');

  if (!hasAreaId) {
    // Agregar columna area_id con relación a areas
    db.exec(`
      ALTER TABLE menu_items ADD COLUMN area_id INTEGER REFERENCES areas(id);
    `);
    console.log('✅ Columna area_id agregada a menu_items');
  } else {
    console.log('ℹ️  Columna area_id ya existe');
  }
} catch (error) {
  console.error('❌ Error:', error);
}

db.close();
