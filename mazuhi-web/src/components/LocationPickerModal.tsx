'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Dialog, DialogPanel, Transition } from '@headlessui/react';
import { XMarkIcon, MapPinIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (address: string, lat: number, lng: number) => void;
}

interface PlacePrediction {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
}

declare global {
  interface Window {
    google: any;
  }
}

// Log helper function with timestamp
const LOG = {
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

export default function LocationPickerModal({
  isOpen,
  onClose,
  onSelectLocation
}: LocationPickerModalProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const autocompleteServiceRef = useRef<any>(null);
  const placesServiceRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);

  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [coverageStatus, setCoverageStatus] = useState<{ within: boolean; distance: number; message: string } | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Ubicación de la sucursal
  const SUCURSAL_LOCATION = {
    lat: 20.641542,
    lng: -100.480554,
    name: 'Mazuhi Sushi - Valle de Santiago',
    address: 'Valle Puerta del Sol 597, Valle de Santiago, 76116 Santiago de Querétaro, Qro.',
  };

  // Radio de cobertura en kilómetros
  const COVERAGE_RADIUS_KM = 3;

  // Calcular distancia entre dos coordenadas (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
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
  const isWithinCoverage = (lat: number, lng: number): { within: boolean; distance: number; message: string } => {
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
  const checkGoogleMapsAPI = async (attempt = 1, maxAttempts = 50): Promise<boolean> => {
    LOG.debug(`Checking Google Maps API (attempt ${attempt}/${maxAttempts})`);
    
    if (window.google?.maps) {
      LOG.info(`✅ Google Maps API loaded successfully on attempt ${attempt}`);
      return true;
    }

    if (attempt >= maxAttempts) {
      LOG.error(`❌ Google Maps API not loaded after ${maxAttempts} attempts (${maxAttempts * 200}ms)`);
      const googleKeys = Object.keys(window).filter(k => k.toLowerCase().includes('google'));
      LOG.debug('Google-related keys on window:', googleKeys);
      return false;
    }

    await new Promise(resolve => setTimeout(resolve, 200));
    return checkGoogleMapsAPI(attempt + 1, maxAttempts);
  };

  useEffect(() => {
    if (!isOpen) {
      LOG.debug('Modal is closed');
      setLoading(true);
      return;
    }

    LOG.info('✅ Modal opened, waiting for DOM to be ready...');
    
    let attempts = 0;
    const maxAttempts = 50;
    
    const waitForMapRef = setInterval(() => {
      attempts++;
      
      if (mapRef.current) {
        clearInterval(waitForMapRef);
        LOG.info(`📍 mapRef.current is now available (attempt ${attempts})`);
        LOG.info('⏳ Now initializing map...');
        initializeMap();
      } else if (attempts >= maxAttempts) {
        clearInterval(waitForMapRef);
        LOG.error('❌ mapRef.current never became available');
        setMapError('Error: El contenedor del mapa no se pudo renderizar');
        setLoading(false);
      }
    }, 100);

    return () => {
      clearInterval(waitForMapRef);
      LOG.debug('Cleanup: cleared mapRef interval');
    };
  }, [isOpen]);

  const initializeMap = async () => {
    const startTime = Date.now();
    LOG.info('🚀 Starting map initialization...');
    
    try {
      setMapError(null);
      setLoading(true);

      LOG.info('📍 STEP 1: Verifying mapRef.current...');
      if (!mapRef.current) {
        const errorMsg = 'mapRef.current no disponible - el contenedor del mapa no existe';
        LOG.error(errorMsg);
        setMapError(errorMsg);
        setLoading(false);
        return;
      }
      LOG.info('✅ STEP 1 OK: mapRef.current is available');

      LOG.info('📍 STEP 2: Waiting for Google Maps API to load...');
      const apiLoaded = await checkGoogleMapsAPI();
      
      if (!apiLoaded) {
        const errorMsg = 'Google Maps API no pudo cargar después de 10 segundos. Verifica: (1) Conexión a internet, (2) API Key en .env.local, (3) Permisos en Google Cloud Console';
        LOG.error(errorMsg);
        setMapError(errorMsg);
        setLoading(false);
        return;
      }
      LOG.info('✅ STEP 2 OK: Google Maps API is available');

      LOG.info('📍 STEP 3: Verifying required Google Maps classes...');
      
      if (!window.google.maps.Map) {
        throw new Error('Google Maps Map class not available');
      }
      if (!window.google.maps.Marker) {
        throw new Error('Google Maps Marker class not available');
      }
      if (!window.google.maps.Geocoder) {
        throw new Error('Google Maps Geocoder class not available');
      }
      if (!window.google.maps.places?.AutocompleteService) {
        throw new Error('Google Maps Places Autocomplete class not available');
      }
      
      LOG.info('✅ STEP 3 OK: All required classes available');

      LOG.info('📍 Default location: Sucursal Querétaro');

      LOG.info('📍 STEP 4: Creating map instance...');
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 15,
        center: SUCURSAL_LOCATION,
        streetViewControl: false,
        fullscreenControl: true,
        mapTypeControl: true,
        zoomControl: true,
        minZoom: 10,
        maxZoom: 18,
        mapTypeId: 'roadmap',
      });
      mapInstanceRef.current = map;
      LOG.info('✅ STEP 4 OK: Map instance created successfully');

      LOG.info('📍 STEP 5: Creating marker...');
      const marker = new window.google.maps.Marker({
        position: SUCURSAL_LOCATION,
        map: map,
        draggable: true,
        title: 'Tu ubicación',
        animation: window.google.maps.Animation.DROP,
      });
      markerRef.current = marker;
      LOG.info('✅ STEP 5 OK: Marker created successfully');

      LOG.info('📍 STEP 6: Initializing Geocoder and Places services...');
      const geocoder = new window.google.maps.Geocoder();
      const autocompleteService = new window.google.maps.places.AutocompleteService();
      const placesService = new window.google.maps.places.PlacesService(map);
      
      geocoderRef.current = geocoder;
      autocompleteServiceRef.current = autocompleteService;
      placesServiceRef.current = placesService;
      LOG.info('✅ STEP 6 OK: Services initialized');

      const updateAddress = async (lat: number, lng: number) => {
        LOG.debug(`Updating address for coordinates: (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        
        // Verificar cobertura
        const coverage = isWithinCoverage(lat, lng);
        setCoverageStatus(coverage);
        LOG.info(coverage.message);

        try {
          const response = await geocoder.geocode({ location: { lat, lng } });
          if (response.results && response.results[0]) {
            const address = response.results[0].formatted_address;
            setSelectedLocation({ lat, lng, address });
            LOG.debug('✅ Address retrieved:', address);
          } else {
            const fallbackAddress = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            setSelectedLocation({ lat, lng, address: fallbackAddress });
            LOG.warn('No geocoding results, using coordinates:', fallbackAddress);
          }
        } catch (error) {
          LOG.warn('Geocoding error (using coordinates as fallback):', error);
          setSelectedLocation({ lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
        }
      };

      LOG.info('📍 STEP 7: Setting up event listeners...');
      
      marker.addListener('dragend', () => {
        LOG.debug('Marker dragged');
        const pos = marker.getPosition();
        if (pos) {
          updateAddress(pos.lat(), pos.lng());
        }
      });

      map.addListener('click', (event: any) => {
        LOG.debug('Map clicked');
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        marker.setPosition({ lat, lng });
        map.panTo({ lat, lng });
        updateAddress(lat, lng);
      });
      
      LOG.info('📍 STEP 8 OK: Event listeners setup complete');

      LOG.info('📍 STEP 9: Getting initial address...');
      await updateAddress(SUCURSAL_LOCATION.lat, SUCURSAL_LOCATION.lng);
      LOG.info('✅ STEP 9 OK: Initial address retrieved');

      const totalTime = Date.now() - startTime;
      LOG.info(`🎉 MAP INITIALIZATION COMPLETED SUCCESSFULLY in ${totalTime}ms`);
      setLoading(false);
    } catch (error) {
      const totalTime = Date.now() - startTime;
      LOG.error(`❌ Map initialization failed after ${totalTime}ms`, error);
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar el mapa. Por favor, intenta nuevamente.';
      setMapError(errorMessage);
      setLoading(false);
    }
  };

  // Handle search input with debouncing
  const handleSearchChange = async (value: string) => {
    setSearchInput(value);
    LOG.info(`Search input changed: "${value}"`);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.length < 2) {
      LOG.debug('Input too short, clearing predictions');
      setPredictions([]);
      setShowPredictions(false);
      return;
    }

    // Debounce: wait 300ms before making the request
    setSearchLoading(true);
    
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        LOG.debug(`Fetching predictions for "${value}"...`);
        
        if (!autocompleteServiceRef.current) {
          LOG.error('Autocomplete service not ready');
          setSearchLoading(false);
          return;
        }

        const response = await autocompleteServiceRef.current.getPlacePredictions({
          input: value,
          componentRestrictions: { country: 'mx' }, // Limitar a México
        });

        LOG.info(`API returned ${response.predictions.length} predictions`);

        const formattedPredictions = response.predictions.map((p: any) => ({
          place_id: p.place_id,
          description: p.description,
          main_text: p.structured_formatting?.main_text || p.description,
          secondary_text: p.structured_formatting?.secondary_text || '',
        }));

        LOG.debug('Formatted predictions:', formattedPredictions);
        
        setPredictions(formattedPredictions);
        setShowPredictions(true);
        
        LOG.info(`✅ Showing ${formattedPredictions.length} predictions for "${value}"`);
      } catch (error) {
        LOG.error('Error getting predictions:', error);
        setPredictions([]);
        setShowPredictions(false);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  };

  // Handle selecting a prediction
  const handleSelectPrediction = async (prediction: PlacePrediction) => {
    LOG.info(`Selected prediction: ${prediction.description}`);
    setSearchInput(prediction.description);
    setShowPredictions(false);
    setPredictions([]);

    try {
      if (!placesServiceRef.current) {
        LOG.warn('Places service not ready');
        return;
      }

      LOG.info('📍 Fetching place details...');

      // Get place details
      const response = await new Promise((resolve, reject) => {
        placesServiceRef.current.getDetails(
          { placeId: prediction.place_id, fields: ['geometry', 'formatted_address'] },
          (place: any, status: any) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
              LOG.info('✅ Place details retrieved');
              resolve(place);
            } else {
              LOG.error(`Places service error: ${status}`);
              reject(new Error(`Places service error: ${status}`));
            }
          }
        );
      });

      const place = response as any;
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      LOG.info(`🎯 Moving map to: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);

      // Verificar cobertura ANTES de actualizar
      const coverage = isWithinCoverage(lat, lng);
      setCoverageStatus(coverage);
      LOG.info(coverage.message);

      // Update map and marker
      if (mapInstanceRef.current) {
        mapInstanceRef.current.panTo({ lat, lng });
        mapInstanceRef.current.setZoom(18);
      }

      if (markerRef.current) {
        markerRef.current.setPosition({ lat, lng });
      }

      // Update address
      setSelectedLocation({
        lat,
        lng,
        address: prediction.description,
      });

      LOG.info('✅ Location updated from search');
    } catch (error) {
      LOG.error('Error selecting prediction:', error);
    }
  };

  const handleConfirm = () => {
    if (selectedLocation && coverageStatus?.within) {
      // Desenfoque el input de búsqueda
      if (searchInputRef.current) {
        searchInputRef.current.blur();
        LOG.info('✅ Search input blurred');
      }
      
      // Scroll suave al botón de confirmación
      const confirmButton = document.querySelector('[data-confirm-button]');
      if (confirmButton) {
        confirmButton.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        LOG.info('✅ Scrolled to confirm button');
      }

      // Pequeño delay para que se vea el efecto
      setTimeout(() => {
        onSelectLocation(
          selectedLocation.address,
          selectedLocation.lat,
          selectedLocation.lng
        );
        onClose();
        LOG.info('✅ Location confirmed and modal closed');
      }, 300);
    }
  };

  const handleRetry = () => {
    LOG.info('User clicked retry button');
    initializeMap();
  };

  return (
    <Transition show={isOpen}>
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
                <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-white">
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-6 w-6" />
                    <h2 className="text-xl font-semibold">Selecciona tu ubicación</h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded p-1 hover:bg-orange-700 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Search Input */}
                <div className="border-b border-gray-200 p-4 bg-gray-50 relative z-20">
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <MagnifyingGlassIcon className="h-5 w-5" />
                    </div>
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Busca tu ubicación (ej: Avenida Camarón Sábalo, Mazatlán)..."
                      value={searchInput}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onFocus={() => {
                        if (predictions.length > 0) {
                          setShowPredictions(true);
                        }
                      }}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    {searchLoading && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin h-5 w-5 border-2 border-orange-500 border-t-transparent rounded-full"></div>
                      </div>
                    )}
                  </div>

                  {/* Predictions Dropdown - Mejorado */}
                  {showPredictions && predictions.length > 0 && (
                    <div className="absolute top-full left-4 right-4 mt-1 bg-white border-2 border-orange-300 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                      <div className="p-2">
                        {predictions.map((prediction, index) => (
                          <button
                            key={`${prediction.place_id}-${index}`}
                            onClick={() => {
                              LOG.info(`User clicked on prediction: ${prediction.description}`);
                              handleSelectPrediction(prediction);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-orange-100 rounded-md transition-colors mb-1 last:mb-0"
                          >
                            <div className="font-semibold text-gray-900 text-sm">{prediction.main_text}</div>
                            {prediction.secondary_text && (
                              <div className="text-xs text-gray-600 mt-0.5">{prediction.secondary_text}</div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No results message */}
                  {showPredictions && predictions.length === 0 && !searchLoading && searchInput.length >= 2 && (
                    <div className="absolute top-full left-4 right-4 mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-xl z-50 p-4">
                      <p className="text-center text-gray-500 text-sm">No se encontraron resultados para "{searchInput}"</p>
                    </div>
                  )}
                </div>

                <div className="relative w-full h-96">
                  {/* Loading State */}
                  {loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-10 rounded-b">
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative w-16 h-16">
                          <div className="absolute inset-0 border-4 border-gray-300 rounded-full"></div>
                          <div className="absolute inset-0 border-4 border-transparent border-t-orange-500 rounded-full animate-spin"></div>
                        </div>
                        <p className="text-gray-600 font-medium">Cargando mapa...</p>
                        <p className="text-sm text-gray-500">Esto puede tomar unos segundos</p>
                      </div>
                    </div>
                  )}

                  {/* Error State */}
                  {mapError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 z-10 rounded-b p-6">
                      <div className="text-center">
                        <div className="text-5xl mb-4">⚠️</div>
                        <h3 className="text-lg font-semibold text-red-800 mb-2">Error al cargar el mapa</h3>
                        <p className="text-red-700 mb-4 text-sm">{mapError}</p>
                        <button
                          onClick={handleRetry}
                          className="px-6 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors"
                        >
                          Reintentar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Map Container */}
                  <div ref={mapRef} className="w-full h-full rounded-b" />
                </div>

                {/* Footer - Display selected location and coverage status */}
                <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 space-y-3">
                  {selectedLocation && (
                    <div>
                      <div className="text-sm text-gray-700 mb-2">
                        <span className="font-semibold">📍 Ubicación:</span> {selectedLocation.address}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-semibold">📏 Distancia a sucursal:</span> {coverageStatus?.distance.toFixed(2)} km
                      </div>
                    </div>
                  )}

                  {/* Coverage Status Message */}
                  {coverageStatus && (
                    <div className={`p-3 rounded-lg text-sm font-medium ${coverageStatus.within ? 'bg-green-50 text-green-800 border border-green-300' : 'bg-red-50 text-red-800 border border-red-300'}`}>
                      {coverageStatus.within ? '✅' : '❌'} {coverageStatus.message}
                    </div>
                  )}

                  {/* Info about coverage */}
                  <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-800 border border-blue-300">
                    📍 <span className="font-semibold">Sucursal:</span> {SUCURSAL_LOCATION.address}
                    <br />
                    <span className="font-semibold">Cobertura de entrega:</span> Dentro de {COVERAGE_RADIUS_KM} km
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex gap-4">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    data-confirm-button
                    onClick={handleConfirm}
                    disabled={!selectedLocation || loading || !!mapError || (coverageStatus ? !coverageStatus.within : false)}
                    className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-green-400 to-green-500 text-white font-semibold hover:from-green-500 hover:to-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transform"
                  >
                    {coverageStatus && !coverageStatus.within ? 'Fuera de cobertura' : 'Confirmar Ubicación'}
                  </button>
                </div>
              </DialogPanel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
