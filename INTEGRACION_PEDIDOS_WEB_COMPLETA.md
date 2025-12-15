# 🌐 Integración de Pedidos Web en Mazuhi

## ✅ Características Implementadas

### 1. **Pedidos Web → Dashboard POS**
Los pedidos completados en `beta.mazuhi.com` aparecen automáticamente en:
- **Dashboard**: `https://beta.mazuhi.com/pos/dashboard/pedidos` (sección "Pedidos desde Sitio Web")
- **Comanda**: `https://beta.mazuhi.com/pos/comanda`

### 2. **Etiqueta Visual "WEB"**
Cada pedido web tiene una etiqueta distintiva:
- **En Comanda**: Mostrada como un badge morado con ícono 🌐
- **En Dashboard**: Filtrable en la sección de "Pedidos desde Sitio Web"

### 3. **Información del Pedido Web**
Cada pedido web contiene:
- ✅ Número de orden único (ej: `MZ1234567890`)
- ✅ Nombre del cliente
- ✅ Teléfono del cliente
- ✅ Tipo de entrega (Pickup / Delivery)
- ✅ Dirección (solo si es delivery)
- ✅ Método de pago (Efectivo / Tarjeta)
- ✅ Listado de productos con cantidad, complementos, soya
- ✅ Total a pagar
- ✅ Notas/observaciones especiales

## 🔄 Flujo de Integración

### Paso 1: Cliente Realiza Pedido en Web
```
1. Cliente visita beta.mazuhi.com
2. Agrega productos al carrito
3. Completa checkout (nombre, teléfono, dirección)
4. Selecciona tipo de entrega (pickup/delivery)
5. Elige método de pago (efectivo/tarjeta)
6. Confirma pedido
```

### Paso 2: Sistema Procesa Pedido
```
1. ✅ Se envía notificación a Telegram
   - Grupo principal de Mazuhi
   - Usuario específico (@frreeemaan)

2. ✅ Se guarda en BD del POS
   - Tabla: pedidos
   - Campo origen: "web"
   - Relación con detalles_pedidos

3. ✅ Aparece en tiempo real en:
   - Dashboard de Pedidos
   - Comanda del POS
```

## 📊 Base de Datos

### Tabla: pedidos
```sql
CREATE TABLE pedidos (
  id INTEGER PRIMARY KEY,
  numero_pedido TEXT,
  cliente_nombre TEXT,
  cliente_telefono TEXT,
  estado TEXT,            -- pendiente, preparando, listo, entregado, cancelado
  total DECIMAL,
  subtotal DECIMAL,
  es_para_llevar INTEGER, -- 1=true, 0=false
  origen TEXT,            -- "web" para pedidos web, NULL para restaurante
  tipo_entrega TEXT,      -- "pickup" o "delivery"
  direccion_entrega TEXT, -- dirección si es delivery
  observaciones TEXT,     -- notas especiales del cliente
  ...
);
```

### Tabla: detalles_pedidos
```sql
CREATE TABLE detalles_pedidos (
  id INTEGER PRIMARY KEY,
  pedido_id INTEGER,      -- FK a pedidos.id
  item_nombre TEXT,
  cantidad INTEGER,
  precio_unitario DECIMAL,
  especificaciones TEXT,  -- complementos y restricciones
  notas TEXT,            -- comentarios del cliente
  ...
);
```

## 🔌 Endpoints API

### GET /api/pedidos
Obtiene todos los pedidos activos (incluye origen):
```json
[
  {
    "id": 123,
    "numero_pedido": "MZ1234567890",
    "mesa_numero": null,
    "es_para_llevar": 0,
    "estado": "pendiente",
    "creado_en": "2025-12-15 14:30:00",
    "total": 250.00,
    "observaciones": "Sin picante, extra soya",
    "origen": "web",      // ← Campo importante
    "mesero_nombre": null,
    "items": [...]
  }
]
```

### POST /api/pedidos-web
Recibe nuevos pedidos desde mazuhi-web:
```json
{
  "orderNumber": "MZ1234567890",
  "clientName": "Juan García",
  "clientPhone": "+525512345678",
  "deliveryType": "delivery",
  "address": "Calle Principal 123, Apto 456",
  "paymentMethod": "cash",
  "items": [
    {
      "nombre": "Rollo California",
      "cantidad": 2,
      "precio": 120.00,
      "subtotal": 240.00,
      "complementos": ["Queso Philadelphia"],
      "soya": "Con soya",
      "comentarios": "Sin picante"
    }
  ],
  "total": 240.00,
  "notes": "Entrega después de las 6pm"
}
```

## 🎨 Visualización en Comanda

### Antes
```
[LLEVAR] #Pedido 028
Mesero: Admin
```

### Después (Pedido Web)
```
[🌐 WEB] [DELIVERY] #MZ1234567890
Mesero: (vacío - es web)
Dirección: Calle Principal 123
```

## 📍 Ubicación de Archivos Clave

```
/var/www/
├── mazuhi-web/                    # Frontend de cliente web
│   ├── src/app/api/telegram/route.ts    # Envía pedidos a POS
│   ├── src/components/CartSidebar.tsx   # Maneja confirmación
│   └── src/components/CheckoutModal.tsx # Formulario de checkout
│
└── pos/                           # Backend POS
    ├── app/api/pedidos/route.ts        # GET: obtiene pedidos
    ├── app/api/pedidos-web/route.ts    # POST: recibe pedidos web
    ├── components/comanda/PedidoHeader.tsx  # Muestra etiqueta WEB
    ├── components/comanda/ComandaColumn.tsx # Renderiza columna
    └── app/dashboard/pedidos/
        ├── page.tsx                 # Dashboard principal
        └── pedidos-web.tsx         # Sección de pedidos web
```

## 🚀 Cómo Funcionan los Pedidos Web

### 1. Cliente Confirma en Web
→ Se ejecuta `handleComplete()` en CartSidebar.tsx
→ Llama a `sendOrderToTelegram()`

### 2. Envío a Telegram y BD
→ POST a `/api/telegram` en mazuhi-web
→ Genera mensaje con detalles del pedido
→ Envía a Telegram
→ **Llama a `/api/pedidos-web` en POS** ← Aquí se guarda

### 3. POS Recibe Pedido Web
→ POST `/api/pedidos-web` en POS
→ Inserta en tabla `pedidos` con `origen = 'web'`
→ Inserta items en tabla `detalles_pedidos`
→ Retorna: `{ success: true, orderNumber: "MZ..." }`

### 4. Aparece en Comanda
→ GET `/api/pedidos` obtiene todos (incluye `origen`)
→ Comanda renderiza con etiqueta WEB si `origen === 'web'`
→ Personal ve: 🌐 WEB [DELIVERY] #MZ1234567890

## 📋 Flujo Completo

```
Cliente Web                    →  Telegram  →  POS BD  →  Comanda/Dashboard
────────────────────────────────────────────────────────────────────────────
1. Completa pedido            
2. Confirma en checkout       
3. Envía datos                →  Notif     →  Guarda  →  Aparece en tiempo real
4. Recibe número de orden     ←──────────────────────← Respuesta exitosa
5. Ve confirmación            
```

## ✨ Características Futuras

- [ ] Seguimiento en tiempo real para cliente web
- [ ] Estados automáticos por cliente (SMS/WhatsApp)
- [ ] Rating del pedido al completar
- [ ] Historial de pedidos web en perfil del cliente
- [ ] Integración con sistema de entregas
- [ ] Notificación cuando el pedido está listo

## 🐛 Troubleshooting

### Pedido no aparece en dashboard
1. Verificar que `origen` sea "web" en la BD
2. Revisar logs en `/api/pedidos-web` POST response
3. Confirmar que la tabla `pedidos` tiene el campo `origen`

### Etiqueta WEB no muestra
1. Asegurar que `origen` se incluye en SELECT de `/api/pedidos` GET
2. Verificar que `PedidoHeader` recibe prop `origen`
3. Revisar que ComandaColumn pasa el origen al header

### Pedido no se guarda
1. Verificar estructura del request en `savePedidoToDatabase()`
2. Revisar campo `deliveryType` vs `tipo_entrega`
3. Confirmar que la request llega a `/api/pedidos-web` en POS

---

**Última actualización**: 15 de Diciembre, 2025
**Responsable**: Sistema Automatizado
**Estado**: ✅ Funcional
