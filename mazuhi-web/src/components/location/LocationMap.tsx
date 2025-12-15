'use client';

import React from 'react';

interface LocationMapProps {
  mapRef: React.RefObject<HTMLDivElement>;
  loading: boolean;
  mapError: string | null;
  onRetry: () => void;
}

export default function LocationMap({
  mapRef,
  loading,
  mapError,
  onRetry,
}: LocationMapProps) {
  return (
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
              onClick={onRetry}
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
  );
}
