# 🔄 Sistema de Comanda en Tiempo Real

## Descripción
Se ha implementado un sistema de sincronización en **tiempo real** para la página de comanda. Cuando alguien marca un platillo como completado, **todos los demás usuarios** que estén viendo la comanda verán el cambio **instantáneamente** sin necesidad de refrescar.

## Cómo Funciona

### Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│         Usuario A - Comanda (operacion.mazuhi.com)      │
│                                                         │
│  ✓ Marca "Camarones" como completado                   │
│    ↓                                                    │
│    1. Envía evento: { tipo: 'item_completado', ... }   │
│    ↓                                                    │
│    POST /pos/api/comanda/eventos                       │
└─────────────────────────────────────────────────────────┘
                        ↓
        ┌───────────────────────────────────┐
        │  API Server (SSE Broadcaster)    │
        │  /pos/api/comanda/eventos        │
        │  • Recibe evento POST            │
        │  • Envía a todos los clientes    │
        │    conectados vía SSE            │
        └───────────────────────────────────┘
                        ↓
        ┌─────────────────────────────────────────┐
        │     Transmite evento a todos           │
        │          (SSE - Stream)                 │
        └─────────────────────────────────────────┘
                        ↓
    ┌───────────────────┴───────────────────┐
    ↓                                       ↓
┌────────────────────────┐     ┌────────────────────────┐
│  Usuario B - Comanda   │     │  Usuario C - Comanda   │
│  EventSource recibe    │     │  EventSource recibe    │
│  evento               │     │  evento               │
│  ✓ Ve "Camarones"     │     │  ✓ Ve "Camarones"     │
│    completado         │     │    completado         │
└────────────────────────┘     └────────────────────────┘
```

## Componentes

### 1. **API Endpoint** (`/app/api/comanda/eventos/route.ts`)
- **GET**: Establece conexión SSE y mantiene viva la conexión
- **POST**: Recibe eventos y los retransmite a todos los clientes conectados

### 2. **Hook Custom** (`/lib/hooks/useComandaRealtime.ts`)
- `useComandaRealtime(callback)`: Conecta a SSE y escucha eventos
- `enviarEventoComanda(evento)`: Envía un evento a todos

### 3. **Página de Comanda** (`/app/comanda/page.tsx`)
- Integra el hook realtime
- Actualiza el estado local cuando recibe eventos
- Los cambios se reflejan **instantáneamente**

## Tipos de Eventos

```typescript
interface ComandaEvento {
  tipo: 'item_completado' | 'item_descompletado' | 'estado_cambio';
  pedidoId: number;
  itemIndex?: number;
  estado?: string;
  timestamp: string;
}
```

### Ejemplos

#### Item Completado
```json
{
  "tipo": "item_completado",
  "pedidoId": 42,
  "itemIndex": 1,
  "timestamp": "2025-12-11T15:30:45.123Z"
}
```

#### Item Descompletado
```json
{
  "tipo": "item_descompletado",
  "pedidoId": 42,
  "itemIndex": 1,
  "timestamp": "2025-12-11T15:30:50.456Z"
}
```

#### Cambio de Estado
```json
{
  "tipo": "estado_cambio",
  "pedidoId": 42,
  "estado": "preparando",
  "timestamp": "2025-12-11T15:31:00.789Z"
}
```

## Flujo de Uso

### Escenario: Marcar Item como Completado

1. **Usuario A** ve la comanda
2. **Usuario A** hace clic en "Completar" para un item (ej: "Camarones")
3. **Función `toggleItemCompletado`** se ejecuta:
   ```typescript
   const toggleItemCompletado = async (pedidoId, itemIndex) => {
     // ... lógica local ...
     await enviarEventoComanda({
       tipo: 'item_completado',
       pedidoId,
       itemIndex
     });
   }
   ```
4. **Evento se envía** a `/pos/api/comanda/eventos` (POST)
5. **Server retransmite** a todos los clientes conectados
6. **Usuario B y C** reciben el evento vía SSE
7. **Estado se actualiza** automáticamente en sus pantallas
8. **Camarones aparece como completado** sin refrescar

## Ventajas

✅ **Tiempo Real**: Cambios instantáneos en todas las pantallas  
✅ **Bajo Overhead**: SSE es más eficiente que polling  
✅ **Automático**: No requiere refrescar manualmente  
✅ **Simple**: No requiere WebSocket completo  
✅ **Escalable**: Maneja múltiples usuarios simultáneamente  

## Limitaciones Actuales

⚠️ **Conexión perdida**: Si se cae la conexión SSE, se pierde la sincronización  
⚠️ **Historial**: Los eventos no se almacenan, solo se transmiten en vivo  
⚠️ **Persistencia**: Al refrescar, se reinicia desde la BD  

## Mejoras Futuras

🔄 Reconexión automática con reconnect-backoff  
📝 Historial de eventos en BD  
🔔 Notificaciones sonoras para eventos  
👥 Indicador de usuarios activos  
⏱️ Timeout de SSE configurable  

## Testing

Puedes probar así:

1. Abre la comanda en 2 navegadores
2. En el primero, marca un platillo como completado
3. En el segundo, deberías verlo completado **instantáneamente**
4. Abre la consola de navegador para ver logs de eventos

## Troubleshooting

**Problema**: "Los cambios no se ven en la otra pantalla"
- ✓ Verifica que SSE esté conectado (revisar Network → eventos)
- ✓ Verifica que no haya error 404 en `/api/comanda/eventos`
- ✓ Revisa la consola del navegador para errores

**Problema**: "Error de conexión SSE"
- ✓ El servidor puede haber caído, reinicia con `pm2 restart pos-app`
- ✓ Verifica los logs: `pm2 logs pos-app`
