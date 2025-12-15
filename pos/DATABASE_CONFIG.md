# 🗄️ CONFIGURACIÓN OFICIAL DE BASE DE DATOS

## BBD OFICIAL DEL SISTEMA

**Ubicación única y definitiva:**
```
/var/www/pos/pos.db
```

**Tamaño:** ~250 KB (eficiente y limpia)

**Contenido:** 
- 50 items de menú activos
- 9 categorías (IDs 61-69)
- 3 áreas de preparación
- Sistema completo de pedidos, usuarios, mesas, etc.

---

## REFERENCIAS EN EL CÓDIGO

Todos los archivos de backend usan la misma ruta:

### Backend (Next.js API Routes)
```typescript
const dbPath = path.join(process.cwd(), 'pos.db');
```

**Archivos que usan pos.db:**
- ✅ `app/api/menu-admin/route.ts`
- ✅ `app/api/menu-admin/[id]/route.ts`
- ✅ `app/api/areas/route.ts`
- ✅ `app/api/areas/[id]/route.ts`
- ✅ `app/api/health/route.ts`
- ✅ Todos los demás endpoints

### Frontend (React Components)
- Utiliza fetch() a los endpoints API
- NO accede directamente a la BD
- Los datos son obtenidos vía HTTP

---

## ARCHIVOS A IGNORAR (Git)

En `.gitignore` se específica que deben ignorarse:
```
# Database - SOLO USAR pos.db COMO BBD OFICIAL
database/
data/
*.db        # <- Excepto pos.db
*.sqlite
*.sqlite3
```

Con esto:
- ✅ `pos.db` SÍ es versionado en Git
- ❌ Cualquier otra BD es automáticamente ignorada
- ❌ Directorios antiguos (data/, database/) no se rastrean

---

## BACKUPS

Cuando se hace consolidación, se crea automáticamente:
```
pos.db.backup_consolidacion_20251211_184817
```

**Ubicación:** `/var/www/pos/` (misma carpeta que pos.db)

**Para restaurar (si es necesario):**
```bash
cp pos.db.backup_consolidacion_FECHA pos.db
pm2 restart pos
```

---

## VERIFICACIÓN DE INTEGRIDAD

### Verificar que solo existe pos.db:
```bash
find /var/www/pos -name "*.db" -o -name "*.sqlite*" | grep -v node_modules
# Resultado esperado: /var/www/pos/pos.db
```

### Verificar contenido:
```bash
sqlite3 /var/www/pos/pos.db "SELECT COUNT(*) FROM menu_items WHERE activo=1;"
# Resultado esperado: 50
```

### Verificar API:
```bash
curl http://localhost:3000/pos/api/menu-admin | head
# Debe devolver array JSON con items limpios
```

### Verificar health:
```bash
curl http://localhost:3000/pos/api/health
# Status debe ser "OK"
```

---

## MIGRACIONES A FUTURO

Si alguna vez necesitas:

1. **Agregar columnas a menu_items:**
   - Modificar en pos.db
   - El código ya está listo para usar nuevos campos

2. **Agregar nuevas tablas:**
   - Se crean directamente en pos.db
   - Actualizar código que las use

3. **Backups periódicos:**
   ```bash
   cp pos.db pos.db.backup_$(date +%Y%m%d_%H%M%S)
   ```

4. **Exportar datos:**
   ```bash
   sqlite3 pos.db ".dump" > dump.sql
   ```

---

## ⚠️ IMPORTANTE

- **NUNCA** uses `database/pos.db` ni ningún otro archivo `.db`
- **NUNCA** copies/pastes datos entre BBD diferentes
- **SIEMPRE** usa `/var/www/pos/pos.db` como única fuente de verdad
- En caso de duda: `echo $PWD && sqlite3 pos.db ".tables"`

---

**Última actualización:** 11 Dic 2025
**Estado:** ✅ CONSOLIDACIÓN COMPLETADA
