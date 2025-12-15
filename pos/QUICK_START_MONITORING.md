# 🚀 Guía Rápida - Datadog Personalizado

## En 2 minutos: Acceso completo

### 1️⃣ Ver el Dashboard
```
https://operacion.mazuhi.com/pos/monitoring
```

### 2️⃣ ¿Qué ves?
- **Resumen**: KPIs, estado del servidor, alertas activas
- **Logs**: Todos los eventos de tu aplicación
- **Alertas**: Problemas detectados automáticamente
- **Errores**: Stack traces cuando algo falla
- **Métricas**: Gráficos de performance

### 3️⃣ Test Rápido
Crea un pedido y verás automáticamente:
- ✅ Log del request
- ✅ Tiempo de respuesta
- ✅ Métrica de API
- ✅ Todo en el dashboard

## Comandos Útiles

### Ver logs en tiempo real
```bash
# Últimos 100 logs
curl https://operacion.mazuhi.com/pos/api/monitoring?tipo=logs&limite=100

# Solo errores
curl https://operacion.mazuhi.com/pos/api/monitoring?tipo=logs&nivel=error

# Últimas 24 horas
curl "https://operacion.mazuhi.com/pos/api/monitoring?tipo=estadisticas&horas=24"
```

### Registrar evento personalizado
```bash
curl -X POST https://operacion.mazuhi.com/pos/api/monitoring \
  -H "Content-Type: application/json" \
  -d '{
    "accion": "log",
    "nivel": "info",
    "tipo": "api_call",
    "modulo": "mi_modulo",
    "mensaje": "Mi evento personalizado"
  }'
```

### Crear alerta
```bash
curl -X POST https://operacion.mazuhi.com/pos/api/monitoring \
  -H "Content-Type: application/json" \
  -d '{
    "accion": "alerta",
    "tipo_alerta": "prueba",
    "severidad": "media",
    "titulo": "Mi alerta",
    "descripcion": "Descripción de la alerta"
  }'
```

## ¿Qué se monitorea automáticamente?

✅ **Cada request HTTP**
- Endpoint
- Método (GET, POST, etc)
- Tiempo de respuesta
- IP del cliente
- User agent
- Código de estado

✅ **Cada error**
- Stack trace
- Tipo de error
- Archivo y línea
- Request que causó el error

✅ **Cada 60 segundos**
- CPU del servidor
- Memoria disponible
- Uptime
- Carga del sistema

✅ **Alertas automáticas para:**
- APIs que tardan >5 segundos
- Errores HTTP 500
- CPU >90%
- Memoria >90%

## En el Código

### Registrar manualmente un evento
```typescript
import { getMonitoringService } from '@/lib/monitoring';

const monitoring = getMonitoringService();

// Registrar un log
monitoring.registrarLog({
  nivel: 'info',
  tipo: 'api_call',
  modulo: 'pedidos',
  endpoint: '/api/pedidos',
  mensaje: 'Pedido creado exitosamente',
  detalles: { pedido_id: 123 }
});
```

### Capturar errores
```typescript
try {
  // Tu código
} catch (error: any) {
  monitoring.registrarError({
    tipo_error: error.name,
    mensaje: error.message,
    stack_trace: error.stack,
    endpoint: '/api/mi-endpoint'
  });
}
```

### Crear alertas
```typescript
if (tiempo_respuesta > 10000) {
  monitoring.crearAlerta({
    tipo_alerta: 'slow_api',
    severidad: 'alta',
    titulo: 'API muy lenta',
    descripcion: `Tardó ${tiempo_respuesta}ms`,
    valor_actual: tiempo_respuesta
  });
}
```

## Consultas SQL Útiles

### Endpoints más lentos
```sql
SELECT endpoint, AVG(duracion_ms) avg, COUNT(*) calls
FROM monitoring_logs
WHERE timestamp >= datetime('now', '-24 hours')
GROUP BY endpoint
ORDER BY avg DESC
LIMIT 10;
```

### Errores activos
```sql
SELECT tipo_error, COUNT(*) total, MAX(timestamp) ultimo
FROM monitoring_errores
WHERE resolved = 0
GROUP BY tipo_error;
```

### Estado actual del servidor
```sql
SELECT 
  ROUND(cpu_uso, 1) cpu,
  ROUND(memoria_uso, 1) mem,
  estado_general
FROM monitoring_salud_servidor
ORDER BY timestamp DESC
LIMIT 1;
```

## Solución de Problemas

### "El dashboard no carga"
1. Verifica: `pm2 status` - ¿pos-app está online?
2. Intenta: https://operacion.mazuhi.com/pos/api/monitoring?tipo=resumen
3. Revisa logs: `pm2 logs pos-app`

### "No veo datos en el dashboard"
1. Crea un pedido para generar eventos
2. Espera 30 segundos (auto-actualización)
3. Refresca: F5
4. Verifica BD: `sqlite3 database/pos.db "SELECT COUNT(*) FROM monitoring_logs;"`

### "¿Dónde están los logs?"
- Base de datos: `/var/www/pos/database/pos.db`
- Tabla: `monitoring_logs`
- Consulta: `SELECT * FROM monitoring_logs LIMIT 10;`

## Mantenimiento

### Ver tamaño de BD
```bash
ls -lh /var/www/pos/database/pos.db
```

### Limpiar logs antiguos (>30 días)
```bash
curl -X DELETE "https://operacion.mazuhi.com/pos/api/monitoring?accion=limpiar_logs&dias=30"
```

### Marcar alerta como resuelta
```bash
curl -X POST https://operacion.mazuhi.com/pos/api/monitoring \
  -H "Content-Type: application/json" \
  -d '{
    "accion": "resolver_alerta",
    "alerta_id": 123,
    "usuario_id": 1,
    "notas": "Problema resuelto"
  }'
```

## Stats Actuales

- **Servidor**: ✅ Online
- **Tablas**: ✅ 9 tablas de monitoreo
- **API**: ✅ Funcionando
- **Dashboard**: ✅ Accesible
- **Monitoreo**: ✅ Activo
- **Build**: ✅ Exitoso (551MB)

## Siguientes Pasos

1. ✅ Accede a `https://operacion.mazuhi.com/pos/monitoring`
2. ✅ Crea un pedido desde `/pos/caja`
3. ✅ Observa los logs en el dashboard
4. ✅ Explora las métricas
5. ✅ Lee `MONITORING_SETUP.md` para más detalles

---

**¡Tu sistema de monitoreo está 100% operacional! 🎉**

Preguntas frecuentes en el archivo `MONITORING_SETUP.md`
