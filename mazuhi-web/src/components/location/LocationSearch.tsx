'use client';

import React, { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface PlacePrediction {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
}

interface LocationSearchProps {
  value: string;
  onChange: (value: string) => void;
  onPredictionSelect: (prediction: PlacePrediction) => void;
  predictions: PlacePrediction[];
  searchLoading: boolean;
  showPredictions: boolean;
  onPredictionsVisibilityChange: (visible: boolean) => void;
}

export default function LocationSearch({
  value,
  onChange,
  onPredictionSelect,
  predictions,
  searchLoading,
  showPredictions,
  onPredictionsVisibilityChange,
}: LocationSearchProps) {
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="border-b border-gray-200 p-4 bg-gray-50 relative z-20">
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <MagnifyingGlassIcon className="h-5 w-5" />
        </div>
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Busca tu ubicación (ej: Avenida Camarón Sábalo, Mazatlán)..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            if (predictions.length > 0) {
              onPredictionsVisibilityChange(true);
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

      {/* Predictions Dropdown */}
      {showPredictions && predictions.length > 0 && (
        <div className="absolute top-full left-4 right-4 mt-1 bg-white border-2 border-orange-300 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
          <div className="p-2">
            {predictions.map((prediction, index) => (
              <button
                key={`${prediction.place_id}-${index}`}
                onClick={() => {
                  onPredictionSelect(prediction);
                  onPredictionsVisibilityChange(false);
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
      {showPredictions && predictions.length === 0 && !searchLoading && value.length >= 2 && (
        <div className="absolute top-full left-4 right-4 mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-xl z-50 p-4">
          <p className="text-center text-gray-500 text-sm">No se encontraron resultados para "{value}"</p>
        </div>
      )}
    </div>
  );
}
