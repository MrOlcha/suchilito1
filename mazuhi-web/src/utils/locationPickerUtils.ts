// Funciones de utilidad para LocationPickerModal
// Esto mantiene la lógica de negocio separada de los componentes

export const SUCURSAL_LOCATION = {
  lat: 20.641542,
  lng: -100.480554,
  name: 'Mazuhi Sushi - Valle de Santiago',
  address: 'Valle Puerta del Sol 597, Valle de Santiago, 76116 Santiago de Querétaro, Qro.',
};

export const COVERAGE_RADIUS_KM = 3;

// Log helper function with timestamp
export const LOG = {
  info: (msg: string, data?: any) => {
    const time = new Date().toLocaleTimeString();
    console.log(`%c📍[${time}] ${msg}`, 'color: #00AA00; font-weight: bold;', data || '');
  },
  error: (msg: string, error?: any) => {
    const time = new Date().toLocaleTimeString();
    console.error(`%c❌[${time}] ${msg}`, 'color: #FF0000; font-weight: bold;', error || '');
  },
  warn: (msg: string, data?: any) => {
    const time = new Date().toLocaleTimeString();
    console.warn(`%c⚠️ [${time}] ${msg}`, 'color: #FF8800; font-weight: bold;', data || '');
  },
  debug: (msg: string, data?: any) => {
    const time = new Date().toLocaleTimeString();
    console.debug(`%c🔍[${time}] ${msg}`, 'color: #0088FF; font-weight: bold;', data || '');
  },
};

// Calcular distancia entre dos coordenadas (Haversine formula)
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

// Verificar si la ubicación está dentro del radio de cobertura
export const isWithinCoverage = (lat: number, lng: number): { within: boolean; distance: number; message: string } => {
  const distance = calculateDistance(SUCURSAL_LOCATION.lat, SUCURSAL_LOCATION.lng, lat, lng);
  const within = distance <= COVERAGE_RADIUS_KM;

  if (within) {
    return {
      within: true,
      distance,
      message: `✅ Ubicación dentro de cobertura (${distance.toFixed(2)} km)`,
    };
  } else {
    return {
      within: false,
      distance,
      message: `❌ Lo sentimos, esta ubicación está fuera de nuestro rango de entrega (${distance.toFixed(2)} km de distancia). Cobertura máxima: ${COVERAGE_RADIUS_KM} km`,
    };
  }
};

// Verificar disponibilidad de API de Google Maps
export const checkGoogleMapsAPI = async (attempt = 1, maxAttempts = 50): Promise<boolean> => {
  LOG.debug(`Checking Google Maps API (attempt ${attempt}/${maxAttempts})`);
  
  if ((window as any).google?.maps) {
    LOG.info(`✅ Google Maps API loaded successfully on attempt ${attempt}`);
    return true;
  }

  if (attempt >= maxAttempts) {
    LOG.error(`❌ Google Maps API not loaded after ${maxAttempts} attempts (${maxAttempts * 200}ms)`);
    return false;
  }

  await new Promise(resolve => setTimeout(resolve, 200));
  return checkGoogleMapsAPI(attempt + 1, maxAttempts);
};
