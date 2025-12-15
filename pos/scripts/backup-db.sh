#!/bin/bash

# Script de backup automático de la base de datos
# Crear copia de la BD cada día a las 2 AM

DB_SOURCE="/var/www/pos/database/pos.db"
BACKUP_DIR="/var/www/pos/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/pos.db.backup_$TIMESTAMP"

# Crear directorio si no existe
mkdir -p "$BACKUP_DIR"

# Hacer la copia
cp "$DB_SOURCE" "$BACKUP_FILE"

echo "✅ Backup creado: $BACKUP_FILE"

# Limpiar backups más antiguos de 7 días
find "$BACKUP_DIR" -name "pos.db.backup_*" -mtime +7 -delete
echo "🧹 Backups antiguos eliminados (>7 días)"

# Mostrar últimos 5 backups
echo ""
echo "📦 Últimos backups:"
ls -lh "$BACKUP_DIR" | tail -6
