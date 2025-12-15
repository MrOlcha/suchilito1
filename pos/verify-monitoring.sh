#!/bin/bash

# Script de verificación rápida del sistema de monitoreo
# Ejecutar con: bash verify-monitoring.sh

echo "🔍 Verificando sistema de monitoreo..."
echo ""

cd /var/www/pos

# 1. Verificar que el servidor está corriendo
echo "1️⃣ Estado del servidor:"
pm2 status | grep pos-app
echo ""

# 2. Verificar que las tablas existen
echo "2️⃣ Verificando tablas de monitoreo..."
sqlite3 database/pos.db ".tables" | grep monitoring
if [ $? -eq 0 ]; then
  echo "✅ Tablas de monitoreo encontradas"
else
  echo "❌ Tablas no encontradas"
fi
echo ""

# 3. Contar registros en cada tabla
echo "3️⃣ Registros en bases de datos:"
echo "Logs:" $(sqlite3 database/pos.db "SELECT COUNT(*) FROM monitoring_logs;")
echo "Errores:" $(sqlite3 database/pos.db "SELECT COUNT(*) FROM monitoring_errores;")
echo "Alertas:" $(sqlite3 database/pos.db "SELECT COUNT(*) FROM monitoring_alertas;")
echo "Métricas:" $(sqlite3 database/pos.db "SELECT COUNT(*) FROM monitoring_metricas;")
echo "Salud Servidor:" $(sqlite3 database/pos.db "SELECT COUNT(*) FROM monitoring_salud_servidor;")
echo ""

# 4. Verificar archivos necesarios
echo "4️⃣ Verificando archivos..."
files=(
  "lib/monitoring.ts"
  "lib/api-monitoring.ts"
  "lib/server-health.ts"
  "app/api/monitoring/route.ts"
  "components/MonitoringDashboard.tsx"
  "app/monitoring/page.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ $file NO ENCONTRADO"
  fi
done
echo ""

# 5. Verificar que el build fue exitoso
echo "5️⃣ Última compilación:"
if [ -d ".next" ]; then
  echo "✅ Build exitoso (.next existe)"
  echo "Tamaño: $(du -sh .next | cut -f1)"
else
  echo "❌ Build no encontrado"
fi
echo ""

# 6. Verificar memoria del servidor
echo "6️⃣ Uso de recursos:"
ps aux | grep "node" | grep -v grep | head -1 | awk '{printf "Memoria: %.1f MB, CPU: %s%%\n", $6/1024, $3}'
echo ""

echo "✅ Verificación completada!"
echo ""
echo "📊 Próximos pasos:"
echo "1. Accede al dashboard: https://operacion.mazuhi.com/pos/monitoring"
echo "2. Crea una orden para generar logs"
echo "3. Observa los logs en el dashboard"
echo ""
