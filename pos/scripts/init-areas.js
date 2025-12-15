import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'pos.db');
const db = new Database(dbPath);

// Crear tabla de áreas
db.exec(`
  CREATE TABLE IF NOT EXISTS areas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE,
    descripcion TEXT,
    color TEXT DEFAULT '#3b82f6',
    icono TEXT DEFAULT 'ChefHat',
    activo BOOLEAN DEFAULT 1,
    orden INTEGER DEFAULT 0,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Insertar áreas por defecto
  INSERT OR IGNORE INTO areas (nombre, descripcion, color, icono, orden) VALUES
  ('Cocina', 'Área de preparación de alimentos', '#ef4444', 'ChefHat', 1),
  ('Barra de Sushi', 'Área de preparación de sushi', '#06b6d4', 'Utensils', 2),
  ('Bebidas', 'Área de bebidas y tragos', '#8b5cf6', 'Wine', 3),
  ('Caja', 'Punto de venta y caja', '#10b981', 'DollarSign', 4);
`);

console.log('✅ Tabla de áreas creada exitosamente');
db.close();
