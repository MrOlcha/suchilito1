# 📋 Guía de Componentes Refactorizados

## Checkout Modal

### Estructura
El `CheckoutModal.tsx` original ha sido dividido en 6 componentes especializados:

```
CheckoutModal.tsx (277 líneas - Componente principal)
├── CheckoutHeaderComponent.tsx (65 líneas)
├── CheckoutContactStep.tsx (82 líneas)
├── CheckoutDeliveryStep.tsx (118 líneas)
├── CheckoutPaymentStep.tsx (144 líneas)
├── CheckoutReviewStep.tsx (164 líneas)
└── CheckoutFooter.tsx (75 líneas)
```

### Uso
```tsx
import CheckoutModal from '@/components/CheckoutModal';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>Abrir Checkout</button>
      <CheckoutModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onComplete={(data) => console.log('Pedido completado:', data)}
      />
    </>
  );
}
```

### Componentes Individuales

#### CheckoutHeaderComponent
Muestra el encabezado con barra de progreso.

```tsx
<CheckoutHeaderComponent
  currentStep={0}
  steps={displaySteps}
  title="Información de Contacto"
  onClose={() => {}}
/>
```

#### CheckoutContactStep
Formulario para nombre y teléfono.

```tsx
<CheckoutContactStep
  data={checkoutData}
  errors={errors}
  onDataChange={(updates) => setCheckoutData(prev => ({...prev, ...updates}))}
/>
```

#### CheckoutDeliveryStep
Selección entre recoger o delivery.

```tsx
<CheckoutDeliveryStep
  data={checkoutData}
  errors={errors}
  onDataChange={updateCheckoutData}
  contentRef={contentRef}  // Para auto-scroll en mobile
/>
```

#### CheckoutPaymentStep
Selección de método de pago y monto.

```tsx
<CheckoutPaymentStep
  data={checkoutData}
  errors={errors}
  cartTotal={100}
  shippingCost={30}
  onDataChange={updateCheckoutData}
/>
```

#### CheckoutReviewStep
Revisión final del pedido.

```tsx
<CheckoutReviewStep
  data={checkoutData}
  cartTotal={100}
  shippingCost={30}
  onNotesChange={(notes) => updateCheckoutData({notes})}
/>
```

#### CheckoutFooter
Botones de navegación.

```tsx
<CheckoutFooter
  currentStep={0}
  totalSteps={4}
  isSubmitting={false}
  onPrev={() => {}}
  onNext={() => {}}
  onComplete={() => {}}
/>
```

---

## Location Picker Modal

### Estructura
El `LocationPickerModal.tsx` ha sido dividido en componentes y un custom hook:

```
LocationPickerModal.tsx (226 líneas - Componente principal)
├── LocationSearch.tsx (91 líneas)
├── LocationMap.tsx (55 líneas)
├── LocationFooter.tsx (43 líneas)
└── useLocationPicker.ts (181 líneas - Custom hook)
└── locationPickerUtils.ts (83 líneas - Utilidades)
```

### Uso
```tsx
import LocationPickerModal from '@/components/LocationPickerModal';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>Seleccionar Ubicación</button>
      <LocationPickerModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSelectLocation={(address, lat, lng) => {
          console.log(`Ubicación: ${address} (${lat}, ${lng})`);
        }}
      />
    </>
  );
}
```

### Componentes Individuales

#### LocationSearch
Búsqueda con autocomplete de Google Places.

```tsx
<LocationSearch
  value={searchInput}
  onChange={(value) => setSearchInput(value)}
  onPredictionSelect={(prediction) => {}}
  predictions={predictions}
  searchLoading={false}
  showPredictions={true}
  onPredictionsVisibilityChange={(visible) => {}}
/>
```

#### LocationMap
Contenedor del mapa de Google Maps.

```tsx
<LocationMap
  mapRef={mapRef}
  loading={false}
  mapError={null}
  onRetry={() => {}}
/>
```

#### LocationFooter
Información de cobertura y ubicación seleccionada.

```tsx
<LocationFooter
  selectedLocation={{ lat: 20.64, lng: -100.48, address: 'Calle X' }}
  coverageStatus={{ within: true, distance: 2.5, message: 'Dentro de cobertura' }}
/>
```

### Custom Hook: useLocationPicker

```tsx
const { mapRef, initializeMap, handleSearch, handleSelectPrediction } = useLocationPicker();

// En un useEffect
useEffect(() => {
  initializeMap(
    (location) => {}, // onLocationUpdate
    (coverage) => {}, // onCoverageUpdate
    (error) => {},    // onError
    (loading) => {}   // onLoadingChange
  );
}, []);

// Buscar lugares
handleSearch('Avenida X', (predictions) => {});

// Seleccionar un resultado
handleSelectPrediction(prediction, onLocationUpdate, onCoverageUpdate);
```

### Funciones Utilitarias (locationPickerUtils.ts)

```tsx
import {
  SUCURSAL_LOCATION,      // { lat, lng, name, address }
  COVERAGE_RADIUS_KM,     // 3
  LOG,                    // { info, error, warn, debug }
  calculateDistance,      // (lat1, lon1, lat2, lon2) => distance
  isWithinCoverage,       // (lat, lng) => { within, distance, message }
  checkGoogleMapsAPI      // async () => boolean
} from '@/utils/locationPickerUtils';

// Ejemplos
const distance = calculateDistance(20.64, -100.48, 20.70, -100.50);
const coverage = isWithinCoverage(20.65, -100.49);
```

---

## Ventajas de esta Estructura

### ✅ Debugging
Si hay un error, sabes exactamente en qué componente está:
- Error en la búsqueda? → `LocationSearch.tsx`
- Error en el mapa? → Revisa `useLocationPicker.ts` o `LocationMap.tsx`

### ✅ Testing
Cada componente es más fácil de testear:
```tsx
describe('CheckoutPaymentStep', () => {
  it('should display cash and card options', () => {
    render(<CheckoutPaymentStep {...props} />);
    expect(screen.getByText('Efectivo')).toBeInTheDocument();
  });
});
```

### ✅ Reutilización
Puedes usar componentes individuales en diferentes contextos:
```tsx
// En un modal diferente
<CheckoutDeliveryStep 
  data={data}
  errors={errors}
  onDataChange={updateData}
/>
```

### ✅ Mantenimiento
Cambios seguros sin afectar todo el modal:
```tsx
// Antes: Editar 782 líneas = riesgo de romper algo
// Ahora: Editar CheckoutPaymentStep.tsx = más seguro
```

---

## Cómo Agregar una Nueva Funcionalidad

### Ejemplo: Agregar cupones de descuento al pago

1. **Crear nuevo componente**:
   ```tsx
   // src/components/checkout/CheckoutDiscountStep.tsx
   export default function CheckoutDiscountStep({ data, onDataChange }) {
     return (
       <input 
         placeholder="Código de cupón"
         onChange={(e) => onDataChange({ discountCode: e.target.value })}
       />
     );
   }
   ```

2. **Agregar paso en CheckoutModal.tsx**:
   ```tsx
   import CheckoutDiscountStep from './checkout/CheckoutDiscountStep';
   
   // En la lista de steps
   const steps = [
     // ... otros pasos
     {
       id: 'discount',
       title: 'Cupones',
       description: 'Aplicar descuento',
       isActive: currentStep === 3
     }
   ];
   
   // En el render
   {currentStep === 3 && (
     <CheckoutDiscountStep data={checkoutData} onDataChange={updateCheckoutData} />
   )}
   ```

3. **¡Listo!** El nuevo paso se integra automáticamente.

---

## Solución de Problemas

### El mapa no aparece
1. Revisa que Google Maps API key esté en `.env.local`
2. Verifica logs en browser console (búsqueda "API loaded")
3. Asegúrate que `mapRef.current` no sea null

### Búsqueda no funciona
1. Verifica que Google Places API esté habilitada
2. Revisa los logs en console
3. Confirma que la ubicación es en México (componentRestrictions)

### Componentes no se renderizan
1. Verifica que los imports estén correctos (carpeta `checkout/` o `location/`)
2. Revisa TypeScript errors en build
3. Asegúrate que las props sean del tipo correcto

