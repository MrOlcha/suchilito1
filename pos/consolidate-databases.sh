#!/bin/bash

###############################################################################
# SCRIPT DE CONSOLIDACIÓN DE BASES DE DATOS
# 
# Propósito: Eliminar BBD duplicadas/obsoletas y mantener SOLO pos.db
# Ubicación oficial: /var/www/pos/pos.db
#
# IMPORTANTE: Este script NO puede ejecutarse mientras el servidor está corriendo
###############################################################################

set -e

cd /var/www/pos

echo "🔒 CONSOLIDACIÓN DE BASES DE DATOS"
echo "===================================="
echo ""
echo "⚠️  ADVERTENCIA: Asegúrate de que:"
echo "   1. El servidor NO está corriendo (pm2 stop pos)"
echo "   2. Tienes un backup de pos.db"
echo "   3. Nadie está usando la aplicación"
echo ""
read -p "¿Continuar? (s/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "❌ Operación cancelada"
    exit 1
fi

echo ""
echo "📋 Paso 1: Verificar integridad de pos.db..."
if sqlite3 pos.db "SELECT COUNT(*) FROM menu_items WHERE activo=1;" > /dev/null 2>&1; then
    ITEMS=$(sqlite3 pos.db "SELECT COUNT(*) FROM menu_items WHERE activo=1;")
    echo "✅ pos.db OK - $ITEMS items activos"
else
    echo "❌ pos.db corrupto o inaccesible"
    exit 1
fi

echo ""
echo "📋 Paso 2: Crear backup de seguridad..."
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
cp pos.db "pos.db.backup_consolidacion_${TIMESTAMP}"
echo "✅ Backup creado: pos.db.backup_consolidacion_${TIMESTAMP}"

echo ""
echo "📋 Paso 3: Eliminar BBD obsoletas..."

# Eliminar archivos individuales
for file in database.db db.sqlite menu_db.db pos_db.db; do
    if [ -f "$file" ]; then
        rm -f "$file"*  # También elimina .shm, .wal
        echo "  ✅ Eliminado: $file"
    fi
done

# Eliminar directorio /data (contiene BD vieja)
if [ -d "data" ]; then
    rm -rf data
    echo "  ✅ Eliminado: directorio data/"
fi

# Eliminar directorio /database (contiene BD antigua 44M)
if [ -d "database" ]; then
    rm -rf database
    echo "  ✅ Eliminado: directorio database/"
fi

echo ""
echo "📋 Paso 4: Limpiar archivos temporales de SQLite..."
# Archivos WAL/SHM son temporales, pueden eliminarse cuando la BD no está en uso
rm -f *.sqlite-shm *.sqlite-wal *.db-shm *.db-wal 2>/dev/null
echo "✅ Archivos temporales limpiados"

echo ""
echo "📋 Paso 5: Verificar integridad final..."
if sqlite3 pos.db "SELECT COUNT(*) FROM menu_items WHERE activo=1;" > /dev/null 2>&1; then
    FINAL_ITEMS=$(sqlite3 pos.db "SELECT COUNT(*) FROM menu_items WHERE activo=1;")
    echo "✅ pos.db intacta - $FINAL_ITEMS items activos"
else
    echo "❌ ERROR: pos.db está dañada después de limpieza"
    echo "Restaurando desde backup..."
    rm -f pos.db
    cp "pos.db.backup_consolidacion_${TIMESTAMP}" pos.db
    exit 1
fi

echo ""
echo "📋 Paso 6: Espacio en disco liberado..."
du -sh . | awk '{print "Total proyecto: " $1}'
echo ""

echo "✅ ============================================"
echo "✅ CONSOLIDACIÓN COMPLETADA CON ÉXITO"
echo "✅ ============================================"
echo ""
echo "📊 Estado final:"
echo "   - BBD oficial: /var/www/pos/pos.db"
echo "   - Items activos: $FINAL_ITEMS"
echo "   - BBD obsoletas: ELIMINADAS"
echo ""
echo "🔧 Próximos pasos:"
echo "   1. Iniciar servidor: pm2 start pos"
echo "   2. Verificar: curl http://localhost:3000/pos/api/menu-admin"
echo "   3. Acceder a: https://operacion.mazuhi.com/pos/dashboard/menu"
echo ""
