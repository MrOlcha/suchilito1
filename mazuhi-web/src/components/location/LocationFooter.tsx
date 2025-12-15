'use client';

import React from 'react';
import { SUCURSAL_LOCATION, COVERAGE_RADIUS_KM } from '@/utils/locationPickerUtils';

interface LocationFooterProps {
  selectedLocation: { lat: number; lng: number; address: string } | null;
  coverageStatus: { within: boolean; distance: number; message: string } | null;
}

export default function LocationFooter({
  selectedLocation,
  coverageStatus,
}: LocationFooterProps) {
  return (
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
  );
}
