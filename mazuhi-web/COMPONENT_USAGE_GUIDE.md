# 📚 Guía de Uso de Componentes Modulares

## Estructura de Carpetas

```
src/
├── components/
│   ├── CartSidebar.tsx                    ← Main component (410 líneas)
│   ├── LocationPickerModal.tsx
│   ├── SuccessOrderModal.tsx
│   └── checkout/                          ← Componentes modulares
│       ├── CartItems.tsx
│       ├── CartSummary.tsx
│       ├── CartViewFooter.tsx
│       ├── CheckoutHeader.tsx
│       ├── CheckoutContact.tsx
│       ├── CheckoutDelivery.tsx
│       ├── CheckoutPayment.tsx
│       ├── CheckoutReview.tsx
│       ├── CheckoutNavigation.tsx
│       └── README.md
```

## Cómo Importar

### Opción 1: Desde CartSidebar.tsx
```tsx
import CartItems from '@/components/checkout/CartItems';
import CartSummary from '@/components/checkout/CartSummary';
import CheckoutHeader from '@/components/checkout/CheckoutHeader';
// ... etc
```

### Opción 2: Desde otros archivos
```tsx
// En un archivo de tests o utilities
import CartItems from '@/components/checkout/CartItems';
import { CartItem } from '@/types/cart';

// Usar directamente
const mockItems: CartItem[] = [...];
<CartItems 
  items={mockItems}
  onUpdateQuantity={handleUpdate}
  onRemoveItem={handleRemove}
  onClearCart={handleClear}
/>
```

## Flujo de Componentes

### 1. Vista de Carrito

```
CartSidebar (view: 'cart')
├── Header
│   ├── Logo: ShoppingBagIcon
│   ├── Texto: "Mi Carrito (5)"
│   └── Botón: Cerrar
│
├── CartItems
│   ├── Item 1
│   │   ├── Imagen
│   │   ├── Nombre + Precio
│   │   ├── Opciones (complementos, soya, etc)
│   │   ├── Cantidad +-
│   │   ├── Subtotal
│   │   └── Botón Eliminar
│   ├── Item 2
│   ├── Item 3
│   └── Botón: Vaciar Carrito
│
└── CartViewFooter
    ├── Total: $45.99
    ├── Botón: 🚚 Finalizar Pedido
    └── Botón: Continuar Comprando
```

### 2. Vista de Checkout - Paso 0 (Contacto)

```
CartSidebar (view: 'checkout', step: 0)
├── CheckoutHeader
│   ├── Título: "Finalizar Pedido"
│   ├── Subtítulo: "Información de Contacto"
│   └── Barra de Progreso: [●] 2 3 4
│
├── CheckoutContact
│   ├── Icono Usuario
│   ├── Input: "Nombre Completo"
│   ├── Input: "Número de Teléfono"
│   └── Mensajes de Error
│
└── CheckoutNavigation
    ├── Botón: Anterior (deshabilitado)
    └── Botón: Continuar →
```

### 3. Vista de Checkout - Paso 1 (Entrega)

```
CartSidebar (view: 'checkout', step: 1)
├── CheckoutHeader
│   └── Barra de Progreso: ✓ [●] 3 4
│
├── CheckoutDelivery
│   ├── CartSummary
│   │   ├── Título: "Resumen de tu Pedido"
│   │   ├── Items
│   │   │   ├── Nombre + cantidad [x2]
│   │   │   └── Subtotal
│   │   └── Totales
│   │
│   ├── Pregunta: "¿Cómo prefieres recibir?"
│   ├── Botón: [🏢 Recoger en Sucursal] [~30 min]
│   ├── Botón: [🚚 Delivery a Domicilio] [~45 min]
│   │
│   └── (Si Delivery seleccionado)
│       ├── Botón: 📍 Seleccionar en Mapa
│       ├── Alert: ✓ Ubicación seleccionada
│       └── Textarea: Dirección manual
│
└── CheckoutNavigation
    ├── Botón: ← Anterior
    └── Botón: Continuar →
```

### 4. Vista de Checkout - Paso 2 (Pago)

```
CartSidebar (view: 'checkout', step: 2)
├── CheckoutHeader
│   └── Barra de Progreso: ✓ ✓ [●] 4
│
├── CheckoutPayment
│   ├── Pregunta: "¿Cómo vas a pagar?"
│   ├── Subtexto: "Total: $45.99 + $30 (envío)"
│   │
│   ├── Botón: [💵 Efectivo]
│   ├── Botón: [💳 Tarjeta]
│   │
│   └── (Si Efectivo seleccionado)
│       ├── Checkbox: "Pago con cambio exacto"
│       │
│       └── Grid de Billetes
│           ├── [$100] Cambio: $24.01
│           ├── [$200] Cambio: $124.01
│           └── [$500] Cambio: $424.01
│
└── CheckoutNavigation
    ├── Botón: ← Anterior
    └── Botón: Continuar →
```

### 5. Vista de Checkout - Paso 3 (Revisión)

```
CartSidebar (view: 'checkout', step: 3)
├── CheckoutHeader
│   └── Barra de Progreso: ✓ ✓ ✓ [●]
│
├── CheckoutReview
│   ├── Ícono: ✓ Verde
│   ├── Título: "Revisa tu Pedido"
│   │
│   ├── Resumen
│   │   ├── 👤 Juan Pérez
│   │   ├── 📞 555-1234-5678
│   │   ├── 🏢 Recoger en Sucursal
│   │   ├── 🕐 Tiempo: 30 min
│   │   ├── 💵 Efectivo
│   │   └── Cambio: $24.01
│   │
│   ├── Totales
│   │   ├── Subtotal: $45.99
│   │   ├── Envío: $0.00
│   │   └── Total: $45.99
│   │
│   └── Textarea: "Notas Adicionales (opcional)"
│
└── CheckoutNavigation
    ├── Botón: ← Anterior
    └── Botón: ✓ Confirmar Pedido (con spinner)
```

## Pasos de Validación

### Paso 0: Contacto
```tsx
if (!user) {
  - Nombre no vacío
  - Teléfono no vacío
  - Teléfono debe ser 10 dígitos
}
```

### Paso 1: Entrega
```tsx
if (delivery.type === 'delivery') {
  - Dirección no vacía
}
```

### Paso 2: Pago
```tsx
if (payment.method === 'cash') {
  - Seleccionar denominación O marcar pago exacto
}
```

## Estados del Componente

### CartSidebar State
```tsx
{
  currentView: 'cart' | 'checkout' | 'success'
  currentStep: 0 | 1 | 2 | 3          // Solo en checkout
  checkoutData: {
    contact: { name, phone, email }
    delivery: { type, address, coordinates }
    payment: { method, cashAmount, exactChange }
    notes: string
  }
  errors: { contact?, delivery?, payment? }
  isSubmitting: boolean
  orderNumber: string
  showLocationPicker: boolean
}
```

## Ejemplos de Uso

### Ejemplo 1: Actualizar Cantidad
```tsx
// En CartSidebar
const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
  updateQuantity(itemId, newQuantity);
};

// Pasar a CartItems
<CartItems
  items={cart.items}
  onUpdateQuantity={handleUpdateQuantity}
  // ...
/>
```

### Ejemplo 2: Validar y Avanzar Paso
```tsx
// En CartSidebar
const nextStep = () => {
  if (validateStep(currentStep)) {
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  }
};

// Pasar a CheckoutNavigation
<CheckoutNavigation
  currentStep={currentStep}
  onNextStep={nextStep}
  // ...
/>
```

### Ejemplo 3: Reutilizar CartSummary
```tsx
// En CheckoutDelivery.tsx
import CartSummary from './CartSummary';

<CartSummary
  items={cart.items}
  total={cart.total}
  itemCount={cart.itemCount}
/>
```

## Testing

### Ejemplo: Test de CartItems
```tsx
import { render, screen } from '@testing-library/react';
import CartItems from '@/components/checkout/CartItems';

describe('CartItems', () => {
  it('debería mostrar la lista de items', () => {
    const mockItems = [
      { 
        id: '1',
        menuItem: { nombre: 'Sushi', precio: 20 },
        quantity: 2,
        subtotal: 40,
        options: { complementos: [], soya: null, cubiertos: null }
      }
    ];

    render(
      <CartItems
        items={mockItems}
        onUpdateQuantity={jest.fn()}
        onRemoveItem={jest.fn()}
        onClearCart={jest.fn()}
      />
    );

    expect(screen.getByText('Sushi')).toBeInTheDocument();
    expect(screen.getByText('x2')).toBeInTheDocument();
  });
});
```

## Tipos TypeScript

```tsx
// Tipos clave
import { CartItem } from '@/types/cart';
import { CheckoutData, ValidationErrors } from '@/types/checkout';

// Props de componentes
interface CartItemsProps {
  items: CartItem[]
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemoveItem: (id: string) => void
  onClearCart: () => void
}

interface CheckoutContactProps {
  name: string
  phone: string
  onNameChange: (name: string) => void
  onPhoneChange: (phone: string) => void
  errors?: ValidationErrors
}
```

## Buenas Prácticas

✅ **DO's**
- Mantener componentes pequeños y enfocados
- Pasar datos vía props
- Usar callbacks para acciones
- Reutilizar CartSummary donde sea posible
- Validar en CartSidebar antes de pasar a componentes

❌ **DON'Ts**
- No agregar lógica de estado en componentes child
- No pasar toda la data al contexto
- No modificar directamente el estado
- No crear componentes gigantes (max 200 líneas)

## Performance Tips

1. **Memoization**
   ```tsx
   const CartItems = React.memo(({ items, ...props }) => {
     return <div>{/* ... */}</div>
   });
   ```

2. **useCallback para handlers**
   ```tsx
   const handleUpdate = useCallback((id, qty) => {
     updateQuantity(id, qty);
   }, [updateQuantity]);
   ```

3. **Evitar re-renders innecesarios**
   - Props bien definidas
   - Callbacks estables
   - Keys en listas

---

**Última actualización:** 14 de Diciembre, 2025
**Versión:** 1.0 (Refactorización completada)
