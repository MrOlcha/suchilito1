# 💾 Sistema de Backup y Restauración

## 📦 Backup Actual

**Ubicación**: `/var/www/pos/backups/`
**Último backup**: `pos.db.backup_20251206_061836`
**Tamaño**: 232 KB

## 🔄 Backups Automáticos

Se han configurado backups automáticos diarios a las **2:00 AM** (servidor local).

**Script**: `/var/www/pos/scripts/backup-db.sh`

### ¿Qué pasa automáticamente?
- ✅ Cada día a las 2 AM: Se crea copia de la BD
- ✅ Se guarda con timestamp: `pos.db.backup_YYYYMMDD_HHMMSS`
- ✅ Los backups >7 días se eliminan automáticamente
- ✅ Se guarda un log en `backups/backup.log`

## 🛠️ Hacer un Backup Manual

```bash
cd /var/www/pos
bash scripts/backup-db.sh
```

## 📋 Ver Todos los Backups

```bash
ls -lh /var/www/pos/backups/
```

## 🔙 Restaurar desde un Backup

### Opción 1: Restaurar el último backup
```bash
# Ver backups disponibles
ls -lh /var/www/pos/backups/

# Restaurar uno específico
cp /var/www/pos/backups/pos.db.backup_20251206_061836 /var/www/pos/database/pos.db

# Reiniciar la app
pm2 restart pos-app
```

### Opción 2: Restaurar con verificación
```bash
# 1. Hacer backup del actual (por si acaso)
cp /var/www/pos/database/pos.db /var/www/pos/backups/pos.db.actual_$(date +%s)

# 2. Restaurar el backup deseado
cp /var/www/pos/backups/pos.db.backup_20251206_061836 /var/www/pos/database/pos.db

# 3. Verificar que la BD está bien
sqlite3 /var/www/pos/database/pos.db ".tables"

# 4. Reiniciar
pm2 restart pos-app
```

## 🚨 En caso de Emergencia

Si algo sale mal:

```bash
# 1. Ver logs de errores
pm2 logs pos-app

# 2. Detener la app
pm2 stop pos-app

# 3. Restaurar el último backup
cp /var/www/pos/backups/pos.db.backup_20251206_061836 /var/www/pos/database/pos.db

# 4. Verificar BD
sqlite3 /var/www/pos/database/pos.db "SELECT COUNT(*) FROM pedidos;"

# 5. Reiniciar
pm2 start pos-app

# 6. Verificar status
pm2 status
```

## 📊 Verificar integridad de la BD

```bash
# Verificar que la BD está bien
sqlite3 /var/www/pos/database/pos.db ".check"

# Ver tamaño actual
du -h /var/www/pos/database/pos.db

# Contar registros en tablas principales
sqlite3 /var/www/pos/database/pos.db << EOF
SELECT 'Usuarios:' as tabla, COUNT(*) as cantidad FROM usuarios
UNION ALL
SELECT 'Pedidos:', COUNT(*) FROM pedidos
UNION ALL
SELECT 'Cuentas:', COUNT(*) FROM cuentas
UNION ALL
SELECT 'Logs Monitoreo:', COUNT(*) FROM monitoring_logs;
EOF
```

## 🗄️ Almacenamiento en la Nube (Opcional)

Si quieres backups en la nube:

```bash
# Opción 1: Google Drive (requiere gdrive instalado)
gdrive upload /var/www/pos/backups/pos.db.backup_*

# Opción 2: AWS S3
aws s3 cp /var/www/pos/backups/pos.db.backup_* s3://tu-bucket/backups/

# Opción 3: Dropbox
dropbox_uploader.sh upload /var/www/pos/backups/pos.db.backup_* /backups/
```

## 📝 Checklist de Seguridad

- ✅ Backup actual creado
- ✅ Script de backup automático configurado
- ✅ Cron job programado para 2:00 AM diarios
- ✅ Limpieza automática de backups >7 días
- ✅ Documentación de restauración disponible

## 🔐 Recomendaciones

1. **Mantener backups en 2 lugares** (local + nube)
2. **Probar restauración regularmente** (una vez al mes)
3. **Mantener log de cambios importantes** en archivo
4. **Hacer backup antes de cambios grandes** (migraciones, etc)
5. **Monitorear espacio en disco** para backups

## 📞 Necesito Restaurar Rápido

1. Abre terminal
2. `cd /var/www/pos`
3. `ls -lh backups/ | tail -5` (ver últimos backups)
4. `cp backups/pos.db.backup_XXXXXX database/pos.db` (reemplaza XXXXXX)
5. `pm2 restart pos-app`
6. ✅ Listo!

---

**Última actualización:** 2025-12-06 06:18:36
**Backup actual:** pos.db.backup_20251206_061836 (232 KB)
