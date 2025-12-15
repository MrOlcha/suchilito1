'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Dialog, DialogPanel, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useLocationPicker } from '@/hooks/useLocationPicker';
import LocationSearch from '@/components/location/LocationSearch';
import LocationMap from '@/components/location/LocationMap';
import LocationFooter from '@/components/location/LocationFooter';

interface PlacePrediction {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
}

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (address: string, lat: number, lng: number) => void;
}

export default function LocationPickerModal({
  isOpen,
  onClose,
  onSelectLocation
}: LocationPickerModalProps) {
  const { mapRef, initializeMap, handleSearch, handleSelectPrediction } = useLocationPicker();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [coverageStatus, setCoverageStatus] = useState<{ within: boolean; distance: number; message: string } | null>(null);

  // Initialize map on modal open
  useEffect(() => {
    if (!isOpen) {
      setLoading(true);
      return;
    }

    let attempts = 0;
    const maxAttempts = 50;
    
    const waitForMapRef = setInterval(() => {
      attempts++;
      
      if (mapRef.current) {
        clearInterval(waitForMapRef);
        initializeMap(
          (location) => setSelectedLocation(location),
          (coverage) => setCoverageStatus(coverage),
          (error) => setMapError(error),
          (loading) => setLoading(loading)
        );
      } else if (attempts >= maxAttempts) {
        clearInterval(waitForMapRef);
        setMapError('Error: El contenedor del mapa no se pudo renderizar');
        setLoading(false);
      }
    }, 100);

    return () => {
      clearInterval(waitForMapRef);
    };
  }, [isOpen, initializeMap, mapRef]);

  const handleSearchChange = async (value: string) => {
    setSearchInput(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.length < 2) {
      setPredictions([]);
      setShowPredictions(false);
      return;
    }

    setSearchLoading(true);
    
    searchTimeoutRef.current = setTimeout(async () => {
      await handleSearch(value, setPredictions);
      setShowPredictions(true);
      setSearchLoading(false);
    }, 300);
  };

  const handlePredictionSelect = async (prediction: PlacePrediction) => {
    try {
      await handleSelectPrediction(
        prediction,
        (location) => setSelectedLocation(location),
        (coverage) => setCoverageStatus(coverage)
      );
      setSearchInput(prediction.description);
      setPredictions([]);
      setShowPredictions(false);
    } catch (error) {
      console.error('Error selecting prediction:', error);
    }
  };

  const handleConfirm = () => {
    if (!selectedLocation || loading || mapError || (coverageStatus && !coverageStatus.within)) {
      return;
    }

    const confirmButton = document.querySelector('[data-confirm-button]');
    if (confirmButton) {
      confirmButton.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    setTimeout(() => {
      onSelectLocation(
        selectedLocation.address,
        selectedLocation.lat,
        selectedLocation.lng
      );
      onClose();
    }, 300);
  };

  const handleRetry = () => {
    setLoading(true);
    setMapError(null);
    initializeMap(
      (location) => setSelectedLocation(location),
      (coverage) => setCoverageStatus(coverage),
      (error) => setMapError(error),
      (loading) => setLoading(loading)
    );
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
                    <h2 className="text-xl font-semibold">Selecciona tu ubicación</h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded p-1 hover:bg-orange-700 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <LocationSearch
                  value={searchInput}
                  onChange={handleSearchChange}
                  onPredictionSelect={handlePredictionSelect}
                  predictions={predictions}
                  searchLoading={searchLoading}
                  showPredictions={showPredictions}
                  onPredictionsVisibilityChange={setShowPredictions}
                />

                <LocationMap
                  mapRef={mapRef}
                  loading={loading}
                  mapError={mapError}
                  onRetry={handleRetry}
                />

                <LocationFooter
                  selectedLocation={selectedLocation}
                  coverageStatus={coverageStatus}
                />

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
