// Script para testear la API Key de Google Maps
console.log('%c=== GOOGLE MAPS API KEY TEST ===', 'font-size: 16px; font-weight: bold; color: #0066cc;');

// 1. Verificar si el script está cargado
console.log('%c1. Checking if Google Maps script is loaded...', 'color: #0088FF; font-weight: bold;');
if (window.google?.maps) {
  console.log('%c✅ Google Maps is available!', 'color: #00AA00; font-weight: bold;');
  console.log('Available classes:', {
    Map: !!window.google.maps.Map,
    Marker: !!window.google.maps.Marker,
    Geocoder: !!window.google.maps.Geocoder,
    Animation: !!window.google.maps.Animation,
  });
} else {
  console.log('%c❌ Google Maps is NOT available!', 'color: #FF0000; font-weight: bold;');
}

// 2. Verificar scripts en el documento
console.log('%c2. Checking loaded scripts...', 'color: #0088FF; font-weight: bold;');
const scripts = Array.from(document.querySelectorAll('script'));
const googleScript = scripts.find(s => s.src && s.src.includes('maps.googleapis.com'));
if (googleScript) {
  console.log('%c✅ Found Google Maps script:', 'color: #00AA00; font-weight: bold;');
  console.log('URL:', googleScript.src);
} else {
  console.log('%c❌ Google Maps script NOT found in DOM!', 'color: #FF0000; font-weight: bold;');
}

// 3. Verificar variables de entorno
console.log('%c3. Checking environment variables...', 'color: #0088FF; font-weight: bold;');
console.log('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY available:', !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);

// 4. Intentar crear un pequeño mapa de prueba
console.log('%c4. Attempting to create a test map...', 'color: #0088FF; font-weight: bold;');
try {
  if (window.google?.maps) {
    const testContainer = document.createElement('div');
    testContainer.id = 'test-map-container';
    testContainer.style.width = '200px';
    testContainer.style.height = '200px';
    testContainer.style.position = 'fixed';
    testContainer.style.bottom = '10px';
    testContainer.style.right = '10px';
    testContainer.style.zIndex = '9999';
    testContainer.style.border = '2px solid #0088FF';
    testContainer.style.borderRadius = '8px';
    document.body.appendChild(testContainer);

    const testMap = new window.google.maps.Map(testContainer, {
      zoom: 15,
      center: { lat: 24.2769, lng: -110.2708 },
    });

    console.log('%c✅ Test map created successfully!', 'color: #00AA00; font-weight: bold;');
    
    setTimeout(() => {
      testContainer.remove();
      console.log('%c✅ Test map removed', 'color: #00AA00; font-weight: bold;');
    }, 5000);
  }
} catch (error) {
  console.error('%c❌ Failed to create test map:', 'color: #FF0000; font-weight: bold;', error);
}

console.log('%c=== END OF TEST ===', 'font-size: 16px; font-weight: bold; color: #0066cc;');
