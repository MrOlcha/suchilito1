# 🛠️ GUÍA DE MANTENIMIENTO DEL SISTEMA

## 📋 Checklist de Operaciones Diarias

### ✅ Verificación de Salud del Sistema

```bash
# 1. Base de datos accesible
curl -s http://localhost:3000/pos/api/menu | jq '.menu | length'
# Debe retornar: un número > 0

# 2. Imágenes cargando correctamente
curl -s http://localhost:3000/pos/api/menu | jq '.menu[0].imagen_local' | head -c 50
# Debe retornar algo como: "/pos/api/menu-images/..."

# 3. Server respondiendo
curl -s -I http://localhost:3000/pos/atiendemesero | head -1
# Debe retornar: HTTP/1.1 200 OK
```

---

## 🖼️ Gestión de Imágenes

### ¿Dónde se guardan las imágenes?
```
📁 /var/www/pos/public/menu-images/
├── item_1765478075108_xd.jpg (item creado 09-feb-2025)
├── item_1765476905197_test.jpg
├── 1_burgers.jpg (sincrón Google Sheets)
└── 2_beverages.png
```

### ¿Cómo se sirven las imágenes?
```
1. Request: GET /pos/api/menu-images/item_1765478075108_xd.jpg
2. Endpoint: app/api/menu-images/[filename]/route.ts
3. Lee desde: public/menu-images/item_1765478075108_xd.jpg
4. Retorna: image/jpeg + cache headers
5. Cache: 1 año en navegador del cliente
```

### Cuando eliminar una imagen

```bash
# Si item es eliminado:
rm /var/www/pos/public/menu-images/item_TIMESTAMP_name.jpg

# Si se recrea item con nueva imagen:
# - Se guarda nuevo archivo automaticamente
# - Viejo archivo permanece en disco (no afecta)
# - OPCIONAL: limpiar archivos viejos:

find /var/www/pos/public/menu-images -type f -mtime +30 -delete
# Elimina archivos más viejos de 30 días
```

---

## 🗄️ Gestión de Base de Datos

### Backup Regular

```bash
# Backup manual
cp /var/www/pos/pos.db /var/www/pos/backups/pos.db.backup_$(date +%Y%m%d_%H%M%S)

# Backup automático (cron)
# Agregar a crontab:
0 2 * * * cp /var/www/pos/pos.db /var/www/pos/backups/pos.db.backup_$(date +\%Y\%m\%d)
# Ejecuta cada día a las 2 AM
```

### Ver estructura de datos

```bash
# Items en menú
sqlite3 /var/www/pos/pos.db "SELECT COUNT(*) as total_items FROM menu_items;"

# Items con imagen
sqlite3 /var/www/pos/pos.db "SELECT COUNT(*) as items_con_imagen FROM menu_items WHERE imagen_local IS NOT NULL AND imagen_local != '';"

# Rutas de imagen
sqlite3 /var/www/pos/pos.db "SELECT nombre, imagen_local FROM menu_items LIMIT 3;"
```

---

## 🚀 Deployment

### Después de hacer cambios en código

```bash
cd /var/www/pos

# 1. Rebuildar (si cambios en código, no en imágenes)
rm -rf .next
npm run build

# 2. Reiniciar servidor
npm run start

# 3. Verificar que inicia
sleep 2
curl -s http://localhost:3000/pos/api/menu | jq '.menu | length'
```

### Si solo cambios en imágenes

```bash
# NO necesita rebuild - imágenes se sirven dinámicamente
# Solo asegurarse que servidor sigue corriendo

# Si server bajó:
npm run start
```

---

## 🐛 Troubleshooting

### HTTP 404 en imagen
```
Causa: Archivo no existe en /public/menu-images/

Solucionar:
1. Verificar nombre archivo: ls /var/www/pos/public/menu-images/ | grep item_timestamp
2. Verificar DB: sqlite3 pos.db "SELECT imagen_local FROM menu_items WHERE id=XXX;"
3. Si URL es /menu-images/... (antiguo), helper debe convertir a /api/menu-images/...
4. Si URL es /api/menu-images/... pero no existe: recrear imagen manualmente
```

### HTTP 500 en /api/menu
```
Causa: DATABASE_URL no configurado O base de datos corrupta

Solucionar:
1. Verificar .env.local: grep DATABASE_URL /var/www/pos/.env.local
   Debe tener: DATABASE_URL=./pos.db
2. Si falta, agregar y reiniciar servidor
3. Verificar DB integridad: sqlite3 pos.db "PRAGMA integrity_check;"
4. Si corrupto, restaurar desde backup
```

### Imagen guardada pero no aparece en API
```
Causa: Ruta guardada en DB no es correcta

Solucionar:
1. Ver en DB: sqlite3 pos.db "SELECT imagen_local FROM menu_items WHERE id=XXX;"
2. Debe ser: /api/menu-images/... o /pos/api/menu-images/...
3. Si es /menu-images/... (antiguo), getMenuImageUrl() convertirá automáticamente
4. Si es NULL o vacío, recrear item con imagen
```

### Servidor no inicia
```
Solucionar:
1. Ver error: npm run start 2>&1 | tail -20
2. Validar TypeScript: npm run build
3. Limpiar caché: rm -rf .next node_modules && npm install
4. Reintentar: npm run start
```

---

## 📊 Monitoreo

### Logs útiles

```bash
# Últimos errores del servidor
pm2 logs (si usa PM2)

# Accesos a endpoint de imágenes
# (agregar logging si necesario en route.ts)

# Errores de BD
sqlite3 /var/www/pos/pos.db "PRAGMA integrity_check;"
```

### Métricas a monitorear

| Métrica | Normal | Alarma |
|---------|--------|--------|
| API /menu response | < 100ms | > 500ms |
| Items en DB | > 50 | < 50 |
| Espacio disco /public/menu-images | < 500MB | > 1GB |
| Archivos imágenes | matches DB | orphan files |

---

## 🔒 Seguridad

### Validaciones que ya están en lugar

✅ **Path Traversal Prevention**
- Endpoint rechaza: `../../../etc/passwd`
- Solo acepta: `item_1765478075108_xd.jpg`

✅ **MIME Type Validation**
- Solo soporta: .jpg, .png, .webp, .gif
- Rechaza: .exe, .php, .sh

✅ **Database Injection**
- Usa prepared statements (better-sqlite3)
- Parámetros no interpolados

### Mantener seguro

1. **Actualizar dependencias regularmente**
   ```bash
   npm outdated
   npm update
   npm audit fix
   ```

2. **Backups encriptados**
   ```bash
   gpg --symmetric /var/www/pos/backups/pos.db.backup_20250209
   ```

3. **Monitorear permisos**
   ```bash
   ls -la /var/www/pos/pos.db
   # Debe ser: -rw-r--r-- (no 777)
   ```

---

## 🔄 Sincronización Google Sheets

### Cuando falla sincronización

```bash
# Ver logs
tail -100 logs/sync.log

# Forzar resync
curl -X POST http://localhost:3000/pos/api/menu-sync \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Verificar credenciales Google
grep GOOGLE_SERVICE /var/www/pos/.env.local
```

### Items duplicados después de sync

```bash
# Ver items
sqlite3 /var/www/pos/pos.db "SELECT nombre, COUNT(*) FROM menu_items GROUP BY nombre HAVING COUNT(*) > 1;"

# Si hay duplicados, reportar y crear issue
```

---

## 📦 Dependencias Críticas

### Si alguna falla, qué hacer

| Dependencia | Si falla | Solucionar |
|-------------|----------|-----------|
| **next** | 500 errors en todo | `npm install && npm run build` |
| **better-sqlite3** | BD no abre | `npm rebuild better-sqlite3` |
| **typescript** | Build falla | `npm install typescript@latest` |
| **pm2** (si existe) | Server no inicia | `pm2 start npm -- run start` |

---

## 🎯 Checklist Pre-Producción

Antes de llevar a producción, verificar:

```bash
# ✅ Base de datos tiene datos
sqlite3 pos.db "SELECT COUNT(*) FROM menu_items;"

# ✅ Imágenes de categorías existen
ls public/menu-images/ | wc -l

# ✅ Build completa sin errores
npm run build 2>&1 | grep -i error

# ✅ Server inicia sin warnings críticos
npm run start & sleep 3 && curl -s http://localhost:3000/pos/api/menu | jq . > /dev/null && echo "✅ OK" || echo "❌ FAIL"

# ✅ Credenciales configuradas
grep -E "DATABASE_URL|JWT_SECRET|GOOGLE_SERVICE" .env.local | wc -l
# Debe retornar 3

# ✅ Permisos correctos
ls -l pos.db public/menu-images/
```

---

## 📞 Soporte Rápido

### Problema más común: "Las imágenes nuevas no aparecen"

**Paso a paso**:
1. Crear item con imagen (AddItemModal)
2. Verificar archivo existe:
   ```bash
   ls -lh /var/www/pos/public/menu-images/item_*
   ```
3. Verificar endpoint:
   ```bash
   curl -s -I http://localhost:3000/pos/api/menu-images/item_TIMESTAMP_name.jpg | head -1
   # Debe ser: HTTP/1.1 200 OK
   ```
4. Si 404: Verificar que servidor está corriendo (`npm run start`)
5. Si 500: Verificar que `DATABASE_URL` está en `.env.local`

### Si nada funciona:

```bash
# 1. Stop server
pkill -f "npm run start"

# 2. Clean & rebuild
rm -rf .next
npm run build

# 3. Restart
npm run start

# 4. Test
curl -s http://localhost:3000/pos/api/menu | jq '.menu | length'
```

---

**Última actualización**: 2025-02-09  
**Estado del sistema**: ✅ ESTABLE Y FUNCIONAL  
**Next review**: 2025-02-23
