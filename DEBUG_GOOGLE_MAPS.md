# 🗺️ Debugging Google Maps - Guía Completa

## ✅ Cambios Realizados

He añadido **logging robustos y detallados** a `LocationPickerModal.tsx` para identificar exactamente dónde falla la carga del mapa.

### Nuevas Características:
1. **Logs con timestamps** en consola del navegador
2. **9 pasos de verificación** durante la inicialización
3. **Manejo de errores mejorado** con mensajes descriptivos
4. **Botón de reintentar** cuando hay error
5. **Script de prueba** para verificar la API Key

---

## 🔍 Cómo Debuggear

### Paso 1: Abre la Consola del Navegador
- **Chrome**: `F12` → pestaña "Console"
- **Firefox**: `F12` → pestaña "Console"
- **Safari**: `Cmd+Option+I` → pestaña "Console"

### Paso 2: Abre el Modal de Ubicación
- Ve a la página de checkout o registro
- Haz clic en "Selecciona tu ubicación"

### Paso 3: Revisa los Logs en la Consola
Deberías ver uno de estos dos escenarios:

#### ✅ ESCENARIO 1: TODO OK (Mapa carga correctamente)
```
📍[12:34:56] ✅ Modal opened, scheduling map initialization...
📍[12:34:56] ⏳ Now initializing map...
📍[12:34:56] 🚀 Starting map initialization...
📍[12:34:56] 📍 STEP 1: Verifying mapRef.current...
📍[12:34:56] ✅ STEP 1 OK: mapRef.current is available
📍[12:34:56] 📍 STEP 2: Waiting for Google Maps API to load...
📍[12:34:57] ✅ Google Maps API loaded successfully on attempt 5
📍[12:34:57] ✅ STEP 2 OK: Google Maps API is available
📍[12:34:57] 📍 STEP 3: Verifying required Google Maps classes...
📍[12:34:57] ✅ STEP 3 OK: All required classes available
...
🎉 MAP INITIALIZATION COMPLETED SUCCESSFULLY in 1245ms
```

#### ❌ ESCENARIO 2: Google Maps API No Carga (Error)
```
📍[12:34:56] ⏳ Now initializing map...
📍[12:34:56] 🚀 Starting map initialization...
📍[12:35:06] ❌ Google Maps API not loaded after 50 attempts (10000ms)
⚠️ [12:35:06] Posibles razones:
⚠️ [12:35:06] 1. API Key inválida o no autorizada
⚠️ [12:35:06] 2. Restricciones de dominio en Google Cloud Console
⚠️ [12:35:06] 3. Problema de conexión a internet
⚠️ [12:35:06] 4. Google Maps API deshabilitada en el proyecto de Google Cloud
```

---

## 🧪 Test Rápido de API Key

Copia y pega esto en la consola del navegador:

```javascript
fetch('https://maps.googleapis.com/maps/api/js?key=AIzaSyDbC_692poesqARH9s05BSwnShVTeWmFIk&libraries=places,geometry')
  .then(r => {
    console.log('✅ API Key es válido, status:', r.status);
    return r.text();
  })
  .catch(e => console.error('❌ Error con API Key:', e));
```

### Resultados esperados:
- ✅ Status 200 = API Key válido
- ❌ Status 403 = API Key no autorizado
- ❌ CORS error = Problema de dominio

---

## 🔧 Soluciones Comunes

### Problema 1: "Google Maps no pudo cargar después de 10 segundos"
**Causas posibles:**
1. **API Key inválida** → Verifica en Google Cloud Console
2. **Dominio no está en whitelist** → Añade tu dominio en Google Cloud Console
3. **APIs deshabilitadas** → Habilita "Maps JavaScript API" en Google Cloud
4. **Conexión lenta** → Prueba en otra red/WiFi

**Solución:**
```bash
# Verifica que el .env.local tiene la API Key
cat /var/www/mazuhi-web/.env.local | grep GOOGLE_MAPS_API_KEY
```

### Problema 2: "mapRef.current no disponible"
**Causa:** El contenedor del mapa no existe en el DOM

**Solución:**
- Asegúrate que el modal está siendo renderizado
- Verifica que `<div ref={mapRef}>` existe en LocationPickerModal.tsx

### Problema 3: "Google Maps Map class not available"
**Causa:** El script se cargó pero no las clases específicas

**Solución:**
- Verifica que en layout.tsx la URL de Google Maps incluye `&libraries=places,geometry`

---

## 📊 Información de Configuración

**Archivo:** `/var/www/mazuhi-web/.env.local`
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIzaSyDbC_692poesqARH9s05BSwnShVTeWmFIk"
```

**Script en layout.tsx:**
```tsx
<Script
  src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`}
  strategy="afterInteractive"
/>
```

**Componente:** `/var/www/mazuhi-web/src/components/LocationPickerModal.tsx`

---

## 📋 Checklist de Verificación

- [ ] La consola NO muestra errores de CORS
- [ ] Los logs muestran "✅ Google Maps API loaded successfully"
- [ ] El mapa aparece dentro de 5-10 segundos
- [ ] Puedes arrastar el marcador
- [ ] Puedes hacer clic en el mapa para cambiar ubicación
- [ ] La dirección se actualiza correctamente

---

## ⚡ Próximos Pasos

1. **Abre el modal y revisa los logs** en la consola
2. **Comparte lo que ves en la consola** si sigue sin funcionar
3. Si es un error de API Key, deberemos:
   - Generar una nueva API Key en Google Cloud
   - Verificar restricciones de dominio/HTTP referrers
   - Habilitar las APIs necesarias

---

**Si tienes dudas o ves un error específico, copia los logs de la consola y comparte conmigo. Con los logs robustos que agregué, puedo identificar exactamente qué está fallando! 🎯**
