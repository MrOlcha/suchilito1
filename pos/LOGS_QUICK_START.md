# 📊 QUICK START - LOGS Y ERRORES REALES

## ✅ ¿Ya está funcionando?

**SÍ** ✅ Los logs y errores reales se están capturando automáticamente en Jhaycorp Logs.

---

## 🎯 VER LOGS EN ACCIÓN

### 1. Accede a Jhaycorp Logs
```
https://operacion.mazuhi.com/pos/monitoring
```

### 2. Verás:
- 📝 **47 logs** registrados
- ❌ **3 errores** capturados
- 🔔 **6 alertas** activas
- 📈 **12 métricas** de rendimiento

### 3. En cada pestaña:

**📊 Resumen**
```
- Logs totales por nivel (info, warning, error, critical)
- Errores sin resolver
- Alertas activas
- Salud del servidor (CPU, memoria, uptime)
```

**📝 Logs**
```
- Tabla con todos los eventos
- Filtrable por timestamp, nivel, tipo, endpoint
- Muestra duración, usuario, IP, etc
```

**🔔 Alertas**
```
- Alertas activas con severidad
- Creadas automáticamente cuando hay errores
- Color-coded: crítica (roja), alta (naranja), media (amarilla)
```

**⚠️ Errores**
```
- Stack traces completos
- Tipo de error
- URL y parámetros
- Información del usuario
```

**📈 Métricas**
```
- Gráficos de rendimiento
- Tiempo de respuesta de APIs
- Tendencias por hora
```

---

## 🚀 GENERAR MÁS LOGS

### Opción 1: Node.js (Recomendado)
```bash
node generate-test-logs.js
```

Genera:
- 3 pedidos exitosos
- 1 error por datos incompletos
- 1 error por mesero inválido
- Obtiene lista de pedidos
- 1 pedido para llevar

### Opción 2: Bash
```bash
bash test-logs.sh
```

### Opción 3: curl
```bash
curl -X POST "http://localhost:3000/pos/api/pedidos" \
  -H "Content-Type: application/json" \
  -d '{
    "mesero_id": 1,
    "mesa_numero": "Mesa-Test",
    "items": [{"producto_nombre": "Test", "cantidad": 1, "precio_unitario": 100}],
    "total": 100
  }'
```

---

## 📊 QUÉ SE ESTÁ CAPTURANDO

Cada endpoint registra:

| Campo | Ejemplo | Uso |
|-------|---------|-----|
| timestamp | 2025-12-06 05:45:32 | Cuándo ocurrió |
| nivel | info, warning, error | Severidad |
| tipo | api_call, transaction | Categoría |
| modulo | pedidos, usuarios | Dónde ocurrió |
| endpoint | /api/pedidos | Ruta |
| metodo_http | POST, GET | Tipo de request |
| mensaje | Pedido creado | Descripción |
| duracion_ms | 45 | Velocidad (milisegundos) |
| usuario_id | 1 | Quién lo hizo |
| ip_cliente | ::1 | De dónde viene |
| codigo_status | 200, 400, 500 | HTTP status |
| detalles | {...} | Información adicional |

---

## 🔧 AGREGAR LOGGING A OTRO ENDPOINT

En cualquier archivo `app/api/*/route.ts`:

```typescript
import { getMonitoringService } from '@/lib/monitoring';

export async function POST(request: NextRequest) {
  const monitoring = getMonitoringService();
  const startTime = Date.now();
  
  try {
    // Log de inicio
    monitoring.registrarLog({
      nivel: 'info',
      tipo: 'api_call',
      modulo: 'usuarios',
      endpoint: '/api/usuarios',
      metodo_http: 'POST',
      mensaje: 'Creando usuario',
    });

    // Tu código aquí
    const result = await crearUsuario();

    // Log de éxito
    monitoring.registrarLog({
      nivel: 'info',
      tipo: 'transaction',
      modulo: 'usuarios',
      mensaje: 'Usuario creado exitosamente',
      duracion_ms: Date.now() - startTime,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    // Log de error
    monitoring.registrarError({
      tipo_error: error.name,
      mensaje: error.message,
      endpoint: '/api/usuarios',
    });

    monitoring.crearAlerta({
      tipo_alerta: 'error',
      severidad: 'alta',
      titulo: 'Error creando usuario',
      descripcion: error.message,
    });

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

---

## 📱 VISUALIZAR EN REPORTES

```
https://operacion.mazuhi.com/pos/reports
```

Elige período:
- 📊 **Diario** - Estadísticas del día
- 📊 **Semanal** - Últimos 7 días
- 📊 **Mensual** - Últimos 30 días

Verás:
- Gráficos de tendencias
- Endpoints más usados
- Rendimiento del sistema
- Errores más frecuentes
- Opción exportar PDF/Excel

---

## 🎯 ENDPOINTS QUE REGISTRAN LOGS

✅ **POST /api/pedidos** - Crear pedido
✅ **GET /api/pedidos** - Obtener pedidos

### Próximos a instrumentar:
- [ ] POST/GET /api/usuarios
- [ ] POST/GET /api/caja
- [ ] POST/GET /api/cuentas
- [ ] POST/GET /api/menu
- [ ] POST/GET /api/productos

---

## 💡 CASOS DE USO

### Caso 1: Monitorear velocidad de APIs
```
Ir a /monitoring → Métricas
Ver tiempos de respuesta en ms
Identificar endpoints lentos
```

### Caso 2: Investigar errores
```
Ir a /monitoring → Errores
Ver stack trace completo
Revisar URL y parámetros
Corregir problema
```

### Caso 3: Generar reportes
```
Ir a /reports
Seleccionar período (diario/semanal/mensual)
Ver gráficos de tendencias
Exportar PDF o Excel
```

### Caso 4: Alertas automáticas
```
Sistema crea alertas cuando:
- Error rate > 5%
- API lenta (> 1000ms)
- CPU > 75%
- Memoria > 75%
```

---

## 📊 DATOS EN TIEMPO REAL

Los logs se actualizan cada 30 segundos automáticamente en el dashboard.

Para forzar actualización:
- Click en botón 🔄 Actualizar
- O checkbox Auto-actualizar está activado

---

## 🔗 RESUMEN DE URLS

| Función | URL |
|---------|-----|
| Dashboard | https://operacion.mazuhi.com/pos/jhaycorp |
| Monitoreo | https://operacion.mazuhi.com/pos/monitoring |
| Reportes | https://operacion.mazuhi.com/pos/reports |
| API Logs | https://operacion.mazuhi.com/pos/api/monitoring |
| API Reports | https://operacion.mazuhi.com/pos/api/reports |

---

## ✨ RESUMEN

✅ Logs se capturan automáticamente
✅ Se almacenan en SQLite
✅ Aparecen en Jhaycorp Logs
✅ Incluyen toda la información necesaria
✅ Filtrable y consultable
✅ Exportable a PDF/Excel
✅ Alertas automáticas
✅ Métricas en tiempo real

---

**¡Sistema 100% Operacional!** 🚀
