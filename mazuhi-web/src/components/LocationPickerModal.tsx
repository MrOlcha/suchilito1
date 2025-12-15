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
      // Verificar que Google Maps esté disponible
      if (!window.google || !window.google.maps) {
        console.log('Esperando a Google Maps...');
        // Reintentar en 500ms
        setTimeout(initializeMap, 500);
        return;
      }

      if (!mapRef.current) {
        console.error('mapRef.current no disponible');
        setLoading(false);
        return;
      }

      console.log('🗺️ Inicializando Google Maps...');

      const defaultLocation = { lat: 24.2769, lng: -110.2708 }; // Mazatlán

      // Crear mapa
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 15,
        center: defaultLocation,
        streetViewControl: false,
        fullscreenControl: true,
        mapTypeControl: true,
        zoomControl: true,
      });

      mapInstanceRef.current = map;

      // Crear marcador
      const marker = new window.google.maps.Marker({
        position: defaultLocation,
        map: map,
        draggable: true,
        title: 'Tu ubicación',
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
          }
        } catch (error) {
          console.error('Error geocoding:', error);
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
        updateAddress(lat, lng);
      });

      // Obtener dirección inicial
      await updateAddress(defaultLocation.lat, defaultLocation.lng);
      setLoading(false);
      setMapError(null);
    } catch (error) {
      console.error('Error inicializando mapa:', error);
      setMapError('Error al cargar el mapa. Por favor, intenta nuevamente.');
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
                  {loading ? (
                    <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin mx-auto mb-2"></div>
                        <p className="text-gray-600">Cargando mapa...</p>
                      </div>
                    </div>
                  ) : (
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
