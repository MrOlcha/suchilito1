'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Dialog, DialogPanel, Transition } from '@headlessui/react';
import { XMarkIcon, MapPinIcon } from '@heroicons/react/24/outline';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (address: string, lat: number, lng: number) => void;
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
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  // Verificar disponibilidad de API de Google Maps
  const checkGoogleMapsAPI = async (attempt = 1, maxAttempts = 50): Promise<boolean> => {
    LOG.debug(`Checking Google Maps API (attempt ${attempt}/${maxAttempts})`);
    
    // Verificar si está disponible
    if (window.google?.maps) {
      LOG.info(`✅ Google Maps API loaded successfully on attempt ${attempt}`);
      return true;
    }

    // Si alcanzamos el máximo de intentos
    if (attempt >= maxAttempts) {
      LOG.error(`❌ Google Maps API not loaded after ${maxAttempts} attempts (${maxAttempts * 200}ms)`);
      
      // Debug: ver qué hay en window
      const googleKeys = Object.keys(window).filter(k => k.toLowerCase().includes('google'));
      LOG.debug('Google-related keys on window:', googleKeys);
      
      // Verificar si hay un error en la consola del navegador
      LOG.warn('Posibles razones:');
      LOG.warn('1. API Key inválida o no autorizada');
      LOG.warn('2. Restricciones de dominio en Google Cloud Console');
      LOG.warn('3. Problema de conexión a internet');
      LOG.warn('4. Google Maps API deshabilitada en el proyecto de Google Cloud');
      
      return false;
    }

    // Esperar y reintentar
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
    
    // Esperar a que mapRef.current esté disponible (máximo 5 segundos)
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

      // ==================== STEP 1: Verificar mapRef ====================
      LOG.info('📍 STEP 1: Verifying mapRef.current...');
      if (!mapRef.current) {
        const errorMsg = 'mapRef.current no disponible - el contenedor del mapa no existe';
        LOG.error(errorMsg);
        setMapError(errorMsg);
        setLoading(false);
        return;
      }
      LOG.info('✅ STEP 1 OK: mapRef.current is available');

      // ==================== STEP 2: Esperar Google Maps API ====================
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

      // ==================== STEP 3: Verificar clases necesarias ====================
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
      if (!window.google.maps.Animation) {
        throw new Error('Google Maps Animation class not available');
      }
      
      LOG.info('✅ STEP 3 OK: All required classes available');

      const defaultLocation = { lat: 24.2769, lng: -110.2708 }; // Mazatlán
      LOG.info('📍 Default location:', defaultLocation);

      // ==================== STEP 4: Crear instancia del mapa ====================
      LOG.info('📍 STEP 4: Creating map instance...');
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 15,
        center: defaultLocation,
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

      // ==================== STEP 5: Crear marcador ====================
      LOG.info('📍 STEP 5: Creating marker...');
      const marker = new window.google.maps.Marker({
        position: defaultLocation,
        map: map,
        draggable: true,
        title: 'Tu ubicación',
        animation: window.google.maps.Animation.DROP,
      });
      markerRef.current = marker;
      LOG.info('✅ STEP 5 OK: Marker created successfully');

      // ==================== STEP 6: Inicializar Geocoder ====================
      LOG.info('📍 STEP 6: Initializing Geocoder...');
      const geocoder = new window.google.maps.Geocoder();
      LOG.info('✅ STEP 6 OK: Geocoder initialized');

      // ==================== STEP 7: Función para actualizar dirección ====================
      const updateAddress = async (lat: number, lng: number) => {
        LOG.debug(`Updating address for coordinates: (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
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

      // ==================== STEP 8: Configurar event listeners ====================
      LOG.info('📍 STEP 8: Setting up event listeners...');
      
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
      
      LOG.info('✅ STEP 8 OK: Event listeners setup complete');

      // ==================== STEP 9: Obtener dirección inicial ====================
      LOG.info('📍 STEP 9: Getting initial address...');
      await updateAddress(defaultLocation.lat, defaultLocation.lng);
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

  const handleConfirm = () => {
    if (selectedLocation) {
      onSelectLocation(
        selectedLocation.address,
        selectedLocation.lat,
        selectedLocation.lng
      );
      onClose();
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

                {/* Footer */}
                <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex gap-4">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={!selectedLocation || loading || mapError !== null}
                    className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-green-400 to-green-500 text-white font-semibold hover:from-green-500 hover:to-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirmar Ubicación
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
