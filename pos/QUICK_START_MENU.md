# 🚀 Guía Rápida: Sistema de Menú Local

## ✅ Estado Actual
El menú está **100% migrado a base de datos local** (SQLite). No depende de Google Sheets.

## 📊 Datos Disponibles
- **49 items** de menú
- **9 categorías** activas
- **662 imágenes** descargadas
- **Respuesta API**: < 50ms

## 🔍 Ver el Menú

### Desde el navegador
```
http://localhost:3000/pos/atiendemesero
```

### Desde la terminal (JSON)
```bash
curl -s http://localhost:3000/pos/api/menu | jq '.[0]'
```

## 📝 Modificar el Menú

### Agregar un nuevo item (requiere ser admin)
```bash
curl -X POST http://localhost:3000/pos/api/menu \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "categoryName": "Arroces",
    "item": {
      "nombre": "Mi Nuevo Plato",
      "descripcion": "Descripción del plato",
      "precio": 150
    }
  }'
```

### Sincronizar desde Google Sheets (manual, opcional)
```bash
curl -X POST http://localhost:3000/pos/api/menu/sync \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

## 🔧 Scripts Útiles

### Verificar integridad del menú
```bash
cd /var/www/pos
./scripts/final-menu-migration.sh
```

**Output esperado:**
```
✓ Items activos en DB: 49
✓ Categorías activas en DB: 9
✓ Items con imagen local: 48
✓ Archivos de imagen descargados: 662
```

### Ejecutar tests
```bash
./scripts/test-menu-migration.sh
```

**Output esperado:**
```
✅ TODOS LOS TESTS COMPLETADOS EXITOSAMENTE
  • Menú: MIGRADO A BASE DE DATOS LOCAL ✓
  • Items: 49 disponibles
  • Categorías: 9 activas
  • Imágenes locales: 662 descargadas
```

## 💾 Ubicación de Archivos

```
Base de datos del menú:
/var/www/pos/database/pos.db

Imágenes del menú:
/var/www/pos/public/menu-images/
  ├── 1_Agua_Mineral.jpg
  ├── 1_Agua_Natural.jpg
  ├── 10_Apolo.jpg
  └── ... (662 imágenes)
```

## 📋 Estructura de la API

### GET /pos/api/menu
Obtiene el menú completo con todas las categorías e items.

**Response:**
```json
[
  {
    "nombre": "Arroces",
    "items": [
      {
        "id": 361,
        "nombre": "Gohan Especial",
        "descripcion": "...",
        "precio": 127,
        "imagen_url": "/pos/menu-images/71_Gohan_Especial.jpg",
        "nuevo": false,
        "vegetariano": false,
        "picante": false,
        "favorito": false,
        "destacado": true,
        "promomiercoles": false
      }
    ]
  }
]
```

### POST /pos/api/menu (solo admin)
Agrega un nuevo item al menú.

**Request body:**
```json
{
  "categoryName": "Arroces",
  "item": {
    "nombre": "Nuevo Arroz",
    "descripcion": "Descripción",
    "precio": 150
  }
}
```

### POST /pos/api/menu/sync (solo admin)
Sincroniza el menú desde Google Sheets (opcional).

## 🆘 Solución de Problemas

### El menú no aparece
```bash
# Verificar que la BD tiene datos
sqlite3 /var/www/pos/database/pos.db "SELECT COUNT(*) FROM menu_items;"
# Debe devolver: 49

# Verificar que el servicio está activo
pm2 list | grep pos-app
# Debe mostrar: online
```

### Las imágenes no cargan
```bash
# Verificar que las imágenes existen
ls /var/www/pos/public/menu-images/ | wc -l
# Debe devolver: 662 (aproximadamente)

# Verificar permisos
chmod -R 755 /var/www/pos/public/menu-images/
```

### Rendimiento lento
```bash
# El API debería responder en < 50ms
curl -w "@-" <<< 'time_total: %{time_total}' http://localhost:3000/pos/api/menu >/dev/null
```

## 📚 Documentación Completa

Para información detallada, consulta:
- [`MIGRACION_MENU_COMPLETADA.md`](./MIGRACION_MENU_COMPLETADA.md) - Resumen técnico
- [`MENU_MIGRATION_COMPLETE.md`](./MENU_MIGRATION_COMPLETE.md) - Detalles de implementación
- [`README.md`](./README.md) - Información general del proyecto

## 🎯 Checklist de Verificación

Antes de usar el menú en producción:

- [ ] Verificar que el servicio está activo: `pm2 list`
- [ ] Probar el endpoint: `curl http://localhost:3000/pos/api/menu`
- [ ] Ejecutar tests: `./scripts/test-menu-migration.sh`
- [ ] Verificar imágenes: `ls /var/www/pos/public/menu-images/`
- [ ] Verificar BD: `./scripts/final-menu-migration.sh`

## ✨ Ventajas del Sistema Actual

✅ **Rápido**: Respuestas < 50ms (sin latencia de API remota)  
✅ **Seguro**: Datos locales bajo control total  
✅ **Confiable**: No depende de Google Sheets  
✅ **Económico**: Sin costos de API  
✅ **Escalable**: Preparado para más items  
✅ **Offline**: Funciona sin conexión remota  

---

**Status**: 🟢 Operativo  
**Última actualización**: 2024  
**Sistema**: SQLite + Next.js + Local Storage
