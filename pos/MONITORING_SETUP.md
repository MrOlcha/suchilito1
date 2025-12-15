# 🔍 Datadog Personalizado - Sistema de Monitoreo Completo

Tu nuevo sistema de monitoreo personalizado está **100% implementado** en tu aplicación POS. Es como tener tu propio Datadog pero totalmente gratis, personalizado y controlado por ti.

## 📊 ¿Qué incluye?

### 1. **Base de Datos de Monitoreo** ✅
- **9 tablas principales** para almacenar:
  - Logs de eventos
  - Métricas de performance
  - Errores y excepciones
  - Alertas
  - Salud del servidor
  - Transacciones

### 2. **Monitoreo de Servidor en Tiempo Real** ✅
- **CPU**: Porcentaje de uso
- **Memoria**: Uso y disponible
- **Uptime**: Tiempo de actividad
- **Carga del sistema**: Promedio 1, 5 y 15 minutos
- **Estado general**: Sano, Advertencia, Crítico
- **Alertas automáticas** cuando CPU o memoria son críticos

### 3. **Logging Centralizado** ✅
- Todos los endpoints API registran automáticamente:
  - IP del cliente
  - User agent
  - Método HTTP
  - Código de estado
  - Tiempo de respuesta
  - Usuario asociado
  - Detalles personalizados

### 4. **Seguimiento de Errores** ✅
- Captura automática de:
  - Stack trace completo
  - Tipo de error
  - Mensaje
  - URL y endpoint
  - Datos del request
  - Marcas para resolver manualmente

### 5. **Sistema de Alertas** ✅
- Alertas automáticas para:
  - APIs muy lentas (>5seg)
  - Errores 5xx
  - CPU crítica (>90%)
  - Memoria crítica (>90%)
  - Excepciones no capturadas
- Severidad: Baja, Media, Alta, Crítica
- Estados: Activa, Acusada, Resuelta

### 6. **Dashboard en Tiempo Real** ✅
Acceder en: `https://operacion.mazuhi.com/pos/monitoring`

**Características:**
- KPIs: Total logs, errores, alertas, transacciones
- Estado del servidor: CPU, memoria, uptime
- Alertas activas con color por severidad
- Histórico de logs últimas 24h
- Gráficos de tiempo de respuesta
- Auto-actualización cada 30 segundos

### 7. **API REST para Monitoreo** ✅
Endpoint: `/api/monitoring`

**GET - Consultar datos:**
```bash
# Ver resumen completo
GET /api/monitoring?tipo=resumen&horas=24

# Ver logs
GET /api/monitoring?tipo=logs&limite=100&nivel=error

# Ver errores
GET /api/monitoring?tipo=errores

# Ver alertas
GET /api/monitoring?tipo=alertas

# Ver métricas
GET /api/monitoring?tipo=metricas&nombre=api_response_time&horas=24

# Ver estadísticas
GET /api/monitoring?tipo=estadisticas&horas=24

# Ver salud del servidor
GET /api/monitoring?tipo=salud
```

**POST - Registrar datos:**
```bash
# Registrar un log
POST /api/monitoring
{
  "accion": "log",
  "nivel": "info",
  "tipo": "api_call",
  "modulo": "pedidos",
  "mensaje": "Pedido creado exitosamente"
}

# Registrar un error
POST /api/monitoring
{
  "accion": "error",
  "tipo_error": "ValidationError",
  "mensaje": "Datos inválidos",
  "endpoint": "/api/pedidos"
}

# Crear una alerta
POST /api/monitoring
{
  "accion": "alerta",
  "tipo_alerta": "memory_high",
  "severidad": "media",
  "titulo": "Memoria alta",
  "descripcion": "Uso de memoria: 85%"
}

# Marcar error como resuelto
POST /api/monitoring
{
  "accion": "resolver_error",
  "error_id": 123,
  "notas": "Corregido en versión 2.1"
}

# Acusar alerta (reconocer el problema)
POST /api/monitoring
{
  "accion": "acusar_alerta",
  "alerta_id": 456
}

# Marcar alerta como resuelta
POST /api/monitoring
{
  "accion": "resolver_alerta",
  "alerta_id": 456,
  "usuario_id": 1,
  "notas": "Optimizado el cache"
}
```

## 🚀 Cómo Usarlo

### 1. **Ver el Dashboard**
Simplemente accede a:
```
https://operacion.mazuhi.com/pos/monitoring
```

### 2. **En el Código - Registrar Logs**

```typescript
import { getMonitoringService } from '@/lib/monitoring';

const monitoring = getMonitoringService();

// Registrar un log
monitoring.registrarLog({
  nivel: 'info',
  tipo: 'api_call',
  modulo: 'pedidos',
  endpoint: '/api/pedidos',
  mensaje: 'Pedido creado',
  detalles: { pedido_id: 123 }
});
```

### 3. **En el Código - Registrar Errores**

```typescript
monitoring.registrarError({
  tipo_error: 'DatabaseError',
  mensaje: 'Error al actualizar cuenta',
  stack_trace: error.stack,
  endpoint: '/api/cuentas/[id]',
  url: req.url
});
```

### 4. **En el Código - Crear Alertas**

```typescript
if (responsTime > 10000) {
  monitoring.crearAlerta({
    tipo_alerta: 'slow_endpoint',
    severidad: 'alta',
    titulo: 'Endpoint muy lento',
    descripcion: `${method} ${endpoint} tardó ${responseTime}ms`,
    valor_actual: responseTime
  });
}
```

### 5. **Registrar Transacciones (Pagos, etc)**

```typescript
import { registrarTransaccion } from '@/lib/api-monitoring';

registrarTransaccion('pago', 250.50, 'exitoso', {
  pedido_id: 123,
  usuario_id: 5,
  metodo_pago: 'tarjeta',
  duracion_ms: 2500
});
```

### 6. **Instrumentar Endpoints Automáticamente**

```typescript
import { withMonitoringHandler } from '@/lib/api-monitoring';

export const POST = withMonitoringHandler(
  async (req: NextRequest) => {
    // Tu código aquí
    return NextResponse.json({ success: true });
  },
  {
    tipo: 'api_call',
    modulo: 'pedidos',
    criticidad: 'alta'
  }
);
```

## 📈 Métricas Disponibles

### Tipos de Métricas
- `api_response_time` - Tiempo de respuesta de APIs (en ms)
- `transaccion` - Monto de transacciones
- `error_count` - Contador de errores
- `cpu_uso` - Porcentaje de CPU
- `memoria_uso` - Porcentaje de memoria

### Tags Comunes
```typescript
{
  estado: 'exitoso' | 'fallido',
  metodo_pago: 'efectivo' | 'tarjeta',
  pedido_id: number,
  usuario_id: number,
  // ... otros tags personalizados
}
```

## 🔔 Sistema de Alertas Automáticas

El sistema crea alertas automáticamente para:

1. **API Lenta** (>5 segundos)
   - Severidad: Media
   - Se crea alerta "slow_api"

2. **API muy Lenta** (>10 segundos)
   - Severidad: Alta
   - Se crea alerta "slow_api"

3. **Error 5xx**
   - Severidad: Alta
   - Se crea alerta "api_error_5xx"

4. **CPU Crítica** (>90%)
   - Severidad: Crítica
   - Se crea alerta "cpu_critica"

5. **Memoria Crítica** (>90%)
   - Severidad: Crítica
   - Se crea alerta "memoria_critica"

6. **Excepción no capturada**
   - Severidad: Crítica
   - Se crea alerta "api_exception"

## 🛠️ Gestionar Alertas

### Desde la API
```bash
# Acusar una alerta (marcar como vista)
POST /api/monitoring
{
  "accion": "acusar_alerta",
  "alerta_id": 456
}

# Resolver una alerta
POST /api/monitoring
{
  "accion": "resolver_alerta",
  "alerta_id": 456,
  "usuario_id": 1,
  "notas": "Optimizado el query de la BD"
}
```

## 📊 Consultas SQL Útiles

```sql
-- Top 10 endpoints más lentos
SELECT endpoint, AVG(duracion_ms) as promedio_ms, COUNT(*) as llamadas
FROM monitoring_logs
WHERE timestamp >= datetime('now', '-24 hours')
GROUP BY endpoint
ORDER BY promedio_ms DESC
LIMIT 10;

-- Errores en las últimas 24 horas
SELECT tipo_error, COUNT(*) as total, MAX(timestamp) as ultimo
FROM monitoring_errores
WHERE timestamp >= datetime('now', '-24 hours')
  AND resolved = 0
GROUP BY tipo_error
ORDER BY total DESC;

-- Alertas activas por severidad
SELECT severidad, COUNT(*) as total
FROM monitoring_alertas
WHERE estado IN ('activa', 'acusada')
GROUP BY severidad;

-- Estado del servidor (últimas 10 registros)
SELECT 
  timestamp,
  ROUND(cpu_uso, 2) as cpu,
  ROUND(memoria_uso, 2) as memoria,
  estado_general
FROM monitoring_salud_servidor
ORDER BY timestamp DESC
LIMIT 10;
```

## 🧹 Mantenimiento

### Limpiar logs antiguos
```bash
# Eliminar logs con más de 30 días
DELETE /api/monitoring?accion=limpiar_logs&dias=30
```

### Ver espacio en BD
```bash
sqlite3 database/pos.db
SELECT name, SUM(pgsize) as size FROM dbstat
GROUP BY name
ORDER BY size DESC;
```

## 🔄 Monitoreo Automático

El sistema monitorea automáticamente cada:
- **60 segundos**: Salud del servidor (CPU, memoria, uptime)
- **Cada request**: Logs de API
- **Cada error**: Captura de excepciones
- **Cada 30 segundos**: Dashboard se auto-actualiza

## 📁 Archivos Creados

```
lib/
├── monitoring.ts              # Servicio principal
├── api-monitoring.ts          # Wrappers y utilidades
├── server-health.ts           # Monitor de salud del servidor
├── monitoring-middleware.ts   # Middleware de instrumentación
├── init-monitoring.ts         # Inicializador
└── ticket-images.ts          # (Existente)

app/
├── api/monitoring/route.ts    # API REST
└── monitoring/page.tsx        # Dashboard web

components/
└── MonitoringDashboard.tsx    # Interfaz del dashboard

database/
└── monitoring-schema.sql      # Schema de tablas
```

## 🎯 Ventajas vs Datadog Pago

| Característica | Datadog Pago | Tu Sistema |
|---|---|---|
| Costo | $15-50+ por mes | $0 (tu infraestructura) |
| Logs | Sí | ✅ Sí |
| Alertas | Sí | ✅ Sí |
| Métricas | Sí | ✅ Sí |
| Dashboard | Sí | ✅ Sí |
| Control total | No | ✅ Sí |
| Retención | Limitada | ✅ Control total |
| Personalización | Limitada | ✅ Código abierto |
| Integración | Limitada | ✅ Tu código |

## 🚨 Próximas Mejoras (Opcionales)

1. **Notificaciones**
   - Email cuando alerta crítica
   - Webhook a Telegram/Slack

2. **Reportes**
   - Reporte diario por email
   - Exportar a PDF/Excel

3. **Dashboards Avanzados**
   - Gráficos más complejos
   - Predicción de tendencias

4. **Análisis**
   - Correlación de eventos
   - Detección de anomalías

## 📞 Soporte

Si necesitas ayuda:
1. Revisa los logs en `/api/monitoring?tipo=logs`
2. Chequea alertas activas en `/api/monitoring?tipo=alertas`
3. Ve el dashboard: `https://operacion.mazuhi.com/pos/monitoring`

---

**¡Tu sistema de monitoreo está listo! 🎉**

Ahora tienes total visibilidad sobre:
- ✅ Performance de tu servidor
- ✅ Errores en tiempo real
- ✅ Alertas automáticas
- ✅ Histórico completo de logs
- ✅ Métricas de transacciones
- ✅ Estado de la aplicación

¡Accede al dashboard y comienza a monitorear! 🚀
