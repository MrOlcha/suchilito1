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

  useEffect(() => {
    if (!isOpen || !mapRef.current) {
      setLoading(true);
      return;
    }

    // Usar un pequeño delay para asegurar que el DOM está listo
    const timer = setTimeout(() => {
      initializeMap();
    }, 100);

    return () => clearTimeout(timer);
  }, [isOpen]);

  const initializeMap = async () => {
    try {
      setMapError(null);
      setLoading(true);

      // Esperar a que Google Maps esté disponible con retry inteligente
      const maxAttempts = 50; // 50 * 200ms = 10 segundos máximo
      let attempts = 0;
      
      while (!window.google?.maps && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 200));
        attempts++;
      }

      if (!window.google?.maps) {
        throw new Error('Google Maps API no pudo cargar. Por favor, verifica tu conexión a internet e intenta de nuevo.');
      }

      if (!mapRef.current) {
        console.error('❌ mapRef.current no disponible');
        setMapError('Error al inicializar el contenedor del mapa');
        setLoading(false);
        return;
      }

      console.log('✅ Google Maps cargado correctamente en intento:', attempts);

      const defaultLocation = { lat: 24.2769, lng: -110.2708 }; // Mazatlán

      // Crear mapa con opciones optimizadas
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

      // Crear marcador
      const marker = new window.google.maps.Marker({
        position: defaultLocation,
        map: map,
        draggable: true,
        title: 'Tu ubicación',
        animation: window.google.maps.Animation.DROP,
      });

      markerRef.current = marker;

      // Geocoder
      const geocoder = new window.google.maps.Geocoder();

      const updateAddress = async (lat: number, lng: number) => {
        try {
          const response = await geocoder.geocode({ location: { lat, lng } });
          if (response.results && response.results[0]) {
            const address = response.results[0].formatted_address;
            setSelectedLocation({ lat, lng, address });
            console.log('📍 Ubicación actualizada:', address);
          } else {
            setSelectedLocation({ lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
          }
        } catch (error) {
          console.error('❌ Error en geocoding:', error);
          setSelectedLocation({ lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
        }
      };

      // Event listeners
      marker.addListener('dragend', () => {
        const pos = marker.getPosition();
        if (pos) {
          updateAddress(pos.lat(), pos.lng());
        }
      });

      map.addListener('click', (event: any) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        marker.setPosition({ lat, lng });
        map.panTo({ lat, lng });
        updateAddress(lat, lng);
      });

      // Obtener dirección inicial
      await updateAddress(defaultLocation.lat, defaultLocation.lng);
      setLoading(false);
    } catch (error) {
      console.error('❌ Error inicializando mapa:', error);
      setMapError(error instanceof Error ? error.message : 'Error al cargar el mapa. Por favor, intenta nuevamente.');
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
              <DialogPanel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 text-white">
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="w-6 h-6" />
                    <h2 className="text-lg font-bold">Selecciona tu ubicación</h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Map Container */}
                <div className="space-y-4 p-6">
                  {loading && (
                    <div className="flex items-center justify-center h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-300">
                      <div className="text-center">
                        <div className="relative w-16 h-16 mx-auto mb-4">
                          <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500 border-r-orange-400 animate-spin"></div>
                        </div>
                        <p className="text-gray-700 font-semibold mb-1">Cargando mapa...</p>
                        <p className="text-sm text-gray-500">Esto puede tomar unos segundos</p>
                      </div>
                    </div>
                  )}
                  
                  {mapError && (
                    <div className="flex items-center justify-center h-96 bg-red-50 rounded-lg border border-red-300">
                      <div className="text-center">
                        <p className="text-red-700 font-semibold mb-2">Error al cargar el mapa</p>
                        <p className="text-sm text-red-600 mb-4">{mapError}</p>
                        <button
                          onClick={() => {
                            setLoading(true);
                            setMapError(null);
                            initializeMap();
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                        >
                          Reintentar
                        </button>
                      </div>
                    </div>
                  )}

                  {!loading && !mapError && (
                    <>
                      <div
                        ref={mapRef}
                        className="w-full h-96 rounded-lg border border-gray-300 shadow-sm"
                      />

                      {/* Selected Address */}
                      {selectedLocation && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-sm text-gray-600 mb-1">Ubicación seleccionada:</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {selectedLocation.address}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Lat: {selectedLocation.lat.toFixed(4)}, Lng: {selectedLocation.lng.toFixed(4)}
                          </p>
                        </div>
                      )}

                      {/* Instructions */}
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-800">
                          💡 <strong>Tip:</strong> Haz clic en el mapa o arrastra el marcador para seleccionar tu ubicación
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Footer */}
                <div className="flex gap-3 border-t border-gray-200 px-6 py-4 bg-gray-50">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={!selectedLocation}
                    className="flex-1 px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
