# Jhaycorp Logs - Sistema de Monitoreo y Reportes 👁️

## 🎯 Visión General

**Jhaycorp Logs** es un sistema avanzado y elegante de monitoreo, análisis y reportes para tu POS. Diseñado con una interfaz blanca y negra premium, proporciona visibilidad total sobre operaciones, rendimiento y problemas del sistema.

## 📊 Características Principales

### 1. **Dashboard Centralizado** (`/jhaycorp`)
Página principal con KPIs en tiempo real:
- **Total de Logs**: Eventos registrados en el sistema
- **Errores**: Tasas de error y errores activos
- **Alertas Activas**: Problemas que requieren atención
- **Transacciones**: Compras exitosas y fallidas

### 2. **Monitoreo en Vivo** (`/monitoring`)
Panel de control con 5 pestañas:

#### 📊 Resumen
- KPIs principales (logs, errores, alertas, transacciones)
- Salud del servidor (CPU, memoria, uptime)
- Alertas activas sin resolver
- Estado general del sistema

#### 📝 Logs
- Tabla de logs recientes con filtros
- Columnas: Timestamp, Nivel, Tipo, Endpoint, Mensaje, Duración
- Scroll automático y paginación
- Color-coding por nivel (error, warning, info)

#### 🔔 Alertas
- Todas las alertas activas
- Clasificación por severidad (crítica, alta, media, baja)
- Detalles y timestamps
- Estados: Activa, Resuelta, Acusada

#### ⚠️ Errores
- Errores sin resolver
- Stack traces completos
- Información de contexto
- Timestamp de ocurrencia

#### 📈 Métricas
- Gráficos de rendimiento
- Tiempo de respuesta de APIs
- Tendencias temporales
- Estadísticas en tiempo real

### 3. **Reportes Avanzados** (`/reports`)
Sistema completo de análisis con 5 pestañas:

#### 📊 Resumen
- KPIs principales (pedidos, ventas, promedio, uptime)
- Gráficos de tendencias del período
- Área de visualización con gradientes
- Comparativas período a período

#### 📈 Estadísticas
- Endpoints más utilizados (gráfico de barras)
- Transacciones por tipo (gráfico de pastel)
- Análisis de patrones de uso
- Top funcionalidades

#### ⚡ Rendimiento
- Rendimiento por hora (gráfico de líneas)
- Error rate
- API performance (ms promedio)
- Usuarios activos

#### ⚠️ Errores
- Errores más frecuentes
- Gráficos horizontales
- Transacciones exitosas vs fallidas
- Análisis de patrones de errores

#### 💾 Descargas
- Botones para descargar en PDF
- Botones para descargar en Excel
- Exportación de datos completos
- Formatos profesionales y listos para compartir

### 4. **Estadísticas y Datos**
Acceso programático a través de APIs REST:

#### GET `/api/monitoring`
Parámetros:
- `tipo`: 'resumen' | 'logs' | 'errores' | 'alertas' | 'metricas'
- `horas`: Número de horas a recuperar (default: 24)
- `limite`: Cantidad de registros (default: 50)

Respuesta: JSON con datos estructurados

#### GET `/api/reports`
Parámetros:
- `tipo`: 'diario' | 'semanal' | 'mensual'

Respuesta: Datos de reportes con gráficos

#### POST `/api/reports/export`
Parámetros:
- `tipo`: 'pdf' | 'excel'
- `periodo`: 'diario' | 'semanal' | 'mensual'
- `datos`: Objeto de datos del reporte

Respuesta: Archivo descargable

## 🎨 Diseño Visual

### Paleta de Colores
- **Fondo Principal**: Negro puro (#000000)
- **Texto Principal**: Blanco (#FFFFFF)
- **Bordes**: Gris oscuro (#333333)
- **Acentos**: Gris claro (#999999)
- **Iconos**: Ojo blanco sobre fondo negro

### Componentes
- **Cards**: Bordes gris oscuro, hover efecto
- **Botones**: Blanco sobre negro con hover gris
- **Tablas**: Bordes horizontales sutiles
- **Gráficos**: Líneas blancas, fondos oscuros
- **Icons**: Emojis intuitivos + Lucide React

### Tipografía
- **Títulos**: Font-bold, 3xl
- **Subtítulos**: Font-semibold, 2xl
- **Etiquetas**: Font-semibold, sm
- **Cuerpo**: Normal, base
- **Código**: Monoespaciado, gray

## 🔧 Arquitectura Técnica

### Base de Datos
9 tablas SQLite para almacenamiento completo:
```
- monitoring_logs
- monitoring_errores
- monitoring_alertas
- monitoring_metricas
- monitoring_salud_servidor
- monitoring_transacciones
- monitoring_snapshots
```

### Componentes React
1. **JhaycorpLogs.tsx** - Dashboard principal
2. **MonitoringDashboard.tsx** - Panel de monitoreo
3. **ReportesAvanzados.tsx** - Sistema de reportes

### Servicios Backend
1. **lib/monitoring.ts** - MonitoringService (477 líneas)
2. **lib/server-health.ts** - Monitoreo de salud
3. **lib/monitoring-middleware.ts** - Instrumentación
4. **lib/api-monitoring.ts** - Wrappers y utilidades

### APIs REST
1. **app/api/monitoring/route.ts** - Endpoint de monitoreo
2. **app/api/reports/route.ts** - Endpoint de reportes
3. **app/api/reports/export/route.ts** - Descarga de archivos

### Páginas
1. **/app/jhaycorp/page.tsx** - Dashboard principal
2. **/app/monitoring/page.tsx** - Monitoreo
3. **/app/reports/page.tsx** - Reportes

## 🚀 Cómo Usar

### Acceso Principal
```
URL: https://operacion.mazuhi.com/pos/jhaycorp
Icono: 👁️ Blanco sobre fondo blanco
```

### Seleccionar Período
En todos los reportes, elige:
- **Últimas 24h** - Datos del día actual
- **Última semana** - Últimos 7 días
- **Último mes** - Últimos 30 días

### Actualizar Datos
- **Auto-actualizar**: Checkbox para refresh cada 30 segundos
- **Actualizar Manual**: Botón de refresh manual
- **Exportar**: PDF o Excel con datos completos

### Interpretar Gráficos
- **Líneas**: Tendencias temporales
- **Barras**: Comparativas entre categorías
- **Pastel**: Distribución de tipos
- **Área**: Volumen con tendencia

## 📈 Métricas Clave

### Operacionales
- **Total Pedidos**: Cantidad de órdenes procesadas
- **Ventas Totales**: Monto en dinero ($)
- **Promedio por Venta**: Ticket promedio
- **Usuarios Activos**: Conectados en el momento

### Técnicas
- **Uptime**: % disponibilidad del sistema
- **Error Rate**: % de errores en API
- **API Performance**: Tiempo de respuesta (ms)
- **CPU/Memoria**: Uso de recursos

### De Negocio
- **Transacciones Exitosas**: Completadas sin errores
- **Transacciones Fallidas**: Con problemas
- **Endpoints Top**: Funcionalidades más usadas
- **Errores Frecuentes**: Problemas recurrentes

## 🔔 Sistema de Alertas

### Severidades
- **Crítica** 🔴 - Requiere acción inmediata
- **Alta** 🟠 - Importante, resolver pronto
- **Media** 🟡 - Monitorear, resolver
- **Baja** 🟢 - Informativa, sin urgencia

### Triggers Automáticos
- CPU > 75% ⚠️
- Memoria > 75% ⚠️
- Error rate > 5% ⚠️
- API response > 1000ms ⚠️
- Uptime < 99% ⚠️

## 💾 Exportación de Datos

### PDF
- Formato profesional
- Gráficos incluidos
- Headers y footers
- Ready para imprimir

### Excel
- Múltiples hojas
- Datos estructurados
- Formatos de celda
- Listo para análisis

## 🔐 Seguridad

- Datos sensibles en SQLite local
- Acceso controlado por middleware
- Logs de todas las acciones
- Timestamps en UTC
- Sin exposición externa

## 📱 Responsive Design

- ✅ Desktop (1920px+)
- ✅ Laptop (1440px+)
- ✅ Tablet (768px+)
- ✅ Móvil (320px+)

Los gráficos se adaptan automáticamente.

## 🎯 Próximas Mejoras

- [ ] Alertas por email/SMS
- [ ] Historial completode alertas
- [ ] Comparativas entre períodos
- [ ] Predicciones de errores
- [ ] Dashboards personalizables
- [ ] Webhooks para integraciones
- [ ] Multi-tenant support

## 🆘 Troubleshooting

### No veo datos
- Verifica que hay logs en la BD
- Revisa el período seleccionado
- Comprueba la conexión a BD

### Gráficos vacíos
- Espera 5 minutos para cargar datos
- Actualiza manualmente la página
- Verifica que hay datos en el período

### Exportación fallida
- Comprueba la BD no está corrompida
- Verifica espacio en disco
- Intenta con otro formato

## 📞 Soporte

Para problemas, revisa:
1. Los logs en `/api/monitoring?tipo=logs`
2. Las alertas activas en `/monitoring`
3. El rendimiento en `/reports`

---

**Jhaycorp Logs** - Tu visión total del negocio. 👁️

Última actualización: 2024-12-06
