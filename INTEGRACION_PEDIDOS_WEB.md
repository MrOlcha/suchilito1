# 🎉 Integración de Pedidos Web → POS

## ✅ Cambios Realizados

### 1. **Base de Datos - Nuevas Columnas en `pedidos`**
- `origen` (TEXT): 'web' o 'mostrador'
- `tipo_entrega` (TEXT): 'pickup', 'delivery' o 'mostrador'
- `cliente_nombre` (TEXT): Nombre del cliente de web
- `cliente_telefono` (TEXT): Teléfono del cliente
- `direccion_entrega` (TEXT): Dirección de entrega

### 2. **API en POS: `/api/pedidos-web`**
**Endpoint**: `POST http://localhost:3000/api/pedidos-web`

**Recibe un pedido de web y lo guarda con:**
- Número de orden
- Datos del cliente
- Tipo de entrega
- Dirección (si es delivery)
- Items del pedido
- Notas

**Retorna:**
```json
{
  "success": true,
  "message": "Pedido guardado exitosamente",
  "pedidoId": 123,
  "orderNumber": "MZ123456789"
}
```

### 3. **Flow Completo**

```
CLIENTE EN WEB
    ↓
Realiza Pedido
    ↓
Checkout Completado
    ↓
API `/pos/api/telegram` recibe datos
    ↓
├─ Envía a Telegram (notificación)
│
└─ Llama a `/api/pedidos-web` (guarda en BD)
    ↓
PEDIDO GUARDADO EN POS
    ↓
Aparece en Dashboard: /pos/dashboard/pedidos
    ↓
Se muestra en Comanda: /pos/comanda
```

### 4. **Etiquetas en Dashboard/Comanda**
Los pedidos ahora tienen estas etiquetas:

| Origen | Tipo Entrega | Ejemplo |
|--------|-------------|---------|
| 🌐 WEB | 🚚 DELIVERY | Juan (Web) - Delivery - Calle 5 #123 |
| 🌐 WEB | 📦 PICKUP | Maria (Web) - Pickup |
| 🏪 MOSTRADOR | 🏪 MOSTRADOR | Mesa 5 |

## 🚀 Cómo Funciona

### Paso 1: Cliente Hace Pedido en Web
1. User visita `/menu`
2. Agrega productos
3. Procede a checkout
4. Completa datos: Nombre, Teléfono, Dirección
5. Selecciona: Pickup o Delivery
6. Paga (efectivo/tarjeta)
7. Confirma

### Paso 2: Sistema Procesa Pedido
1. ✅ Se envía notificación a Telegram (grupo + usuario)
2. ✅ Se guarda en BD del POS
3. ✅ Aparece en `/pos/dashboard/pedidos`
4. ✅ Se muestra en `/pos/comanda`

### Paso 3: Personal del POS Lo Ve
1. **Dashboard Pedidos**: Ve lista con filtros por origen
2. **Comanda**: Ve el pedido en tiempo real con:
   - Nombre del cliente
   - Teléfono de contacto
   - Tipo de entrega
   - Items del pedido
   - Dirección (si es delivery)

## 📊 Estructura de Datos Guardados

```typescript
Pedido Web:
{
  numero_pedido: "MZ123456789",
  cliente_nombre: "Juan García",
  cliente_telefono: "6641234567",
  origen: "web",
  tipo_entrega: "delivery",
  direccion_entrega: "Calle 5 #123, Apt 4",
  estado: "pendiente",
  total: 450.00,
  items: [
    {
      nombre: "Roll California",
      cantidad: 2,
      precio: 95,
      complementos: "Wasabi, Jengibre",
      soya: "Regular"
    }
  ]
}
```

## 🔧 Próximos Pasos

Para que se muestre completamente en Dashboard/Comanda necesitamos:

1. **Actualizar componentes del Dashboard** para mostrar:
   - Badge de "WEB" vs "Mostrador"
   - Badge de "DELIVERY" vs "PICKUP"
   - Datos del cliente
   - Dirección de entrega

2. **Actualizar Comanda** para mostrar:
   - Origen del pedido
   - Tipo de entrega
   - Botón de contacto del cliente
   - Mapa con dirección (si es delivery)

3. **Agregar filtros** en Dashboard por:
   - Origen (Web/Mostrador)
   - Tipo de entrega
   - Estado

¿Quieres que implemente estos cambios visuales ahora?
