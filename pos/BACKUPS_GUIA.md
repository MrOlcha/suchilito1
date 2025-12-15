# 💾 GUÍA DE BACKUPS Y RECUPERACIÓN

## Backups Disponibles

### Backup Completo Actual (RECOMENDADO)
```
📁 Ubicación: /var/www/pos/backups/
📄 Archivo: pos_backup_completo_20251211_185200.db
📦 Tamaño: 244 KB
✅ Estado: Verificado (50 items, 9 categorías, 3 áreas)
📅 Fecha: 11 Diciembre 2025 18:52
```

**Contiene:**
- 50 items de menú activos
- 9 categorías (IDs 61-69)
- 3 áreas de preparación (Cocina, Barra Sushi, Bebidas)
- Todos los usuarios, mesas, pedidos y registros del sistema
- 100% de los datos del sistema

### Backup Antiguo (Respaldo adicional)
```
📄 Archivo: pos.db.backup_20251206_061836
📅 Fecha: 6 Diciembre 2025
⚠️  Más antiguo - usar solo si el backup actual falla
```

---

## Cómo Restaurar desde un Backup

### ⚠️ IMPORTANTE: Parar el servidor primero
```bash
pm2 stop pos
```

### Opción 1: Restaurar el Backup Completo (Recomendado)
```bash
cd /var/www/pos
cp backups/pos_backup_completo_20251211_185200.db pos.db
pm2 start pos
sleep 3
curl http://localhost:3000/pos/api/health
```

### Opción 2: Restaurar el Backup Antiguo (Si falla el primero)
```bash
cd /var/www/pos
cp backups/pos.db.backup_20251206_061836 pos.db
pm2 start pos
sleep 3
curl http://localhost:3000/pos/api/health
```

### Verificar que la Restauración Fue Exitosa
```bash
# Verificar contenido
sqlite3 /var/www/pos/pos.db "SELECT COUNT(*) FROM menu_items WHERE activo=1;"
# Debe mostrar: 50

# Verificar API
curl http://localhost:3000/pos/api/health
# Debe mostrar: {"healthy":true,...}
```

---

## Crear un Nuevo Backup Manual

Si necesitas crear un backup manual en cualquier momento:

```bash
cd /var/www/pos
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
cp pos.db "backups/pos_backup_manual_${TIMESTAMP}.db"
```

---

## Política de Backups

- ✅ **Automático:** Se crea backup después de cada actualización importante
- ✅ **Ubicación:** `/var/www/pos/backups/`
- ✅ **Retención:** Se mantienen los 3 más recientes automáticamente
- ✅ **Verificación:** Todo backup es verificado antes de guardarse

---

## En Caso de Emergencia

Si algo sale mal y no puedes acceder al dashboard:

1. **Parar el servidor:**
   ```bash
   pm2 stop pos
   ```

2. **Restaurar el backup más reciente:**
   ```bash
   cp backups/pos_backup_completo_20251211_185200.db pos.db
   ```

3. **Iniciar el servidor:**
   ```bash
   pm2 start pos
   ```

4. **Verificar que funciona:**
   ```bash
   curl http://localhost:3000/pos/api/health
   ```

5. **Acceder al dashboard:**
   - https://operacion.mazuhi.com/pos/dashboard/menu

---

**Última actualización:** 11 Dic 2025 18:52 UTC  
**Estado:** ✅ Backups verificados y operativos
