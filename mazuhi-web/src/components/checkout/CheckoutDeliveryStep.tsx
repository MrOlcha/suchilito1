'use client';

import React from 'react';
import { TruckIcon, BuildingStorefrontIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { CheckoutData, ValidationErrors } from '@/types/checkout';

interface CheckoutDeliveryStepProps {
  data: CheckoutData;
  errors: ValidationErrors;
  onDataChange: (updates: Partial<CheckoutData>) => void;
  contentRef?: React.RefObject<HTMLDivElement>;
}

export default function CheckoutDeliveryStep({
  data,
  errors,
  onDataChange,
  contentRef,
}: CheckoutDeliveryStepProps) {
  const handleDeliveryTypeChange = (type: 'pickup' | 'delivery') => {
    onDataChange({
      delivery: { type, address: data.delivery.address || '' }
    });
    // Auto-scroll to continue button on mobile
    setTimeout(() => {
      if (contentRef?.current) {
        contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }, 300);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <TruckIcon className="w-16 h-16 text-orange-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          ¿Cómo prefieres recibir tu pedido?
        </h3>
        <p className="text-gray-600">
          Elige entre recoger en sucursal o delivery a domicilio
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pickup Option */}
        <button
          onClick={() => handleDeliveryTypeChange('pickup')}
          className={`p-6 border-2 rounded-2xl transition-all text-left ${
            data.delivery.type === 'pickup'
              ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-300'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <BuildingStorefrontIcon className="w-8 h-8 text-orange-500 mb-3" />
          <h4 className="font-semibold text-gray-900 mb-2">Recoger en Sucursal</h4>
          <p className="text-sm text-gray-600 mb-2">
            Recoge tu pedido en nuestro restaurante
          </p>
          <div className="flex items-center text-sm text-orange-600">
            <ClockIcon className="w-4 h-4 mr-1" />
            Listo en 30 min
          </div>
        </button>

        {/* Delivery Option */}
        <button
          onClick={() => handleDeliveryTypeChange('delivery')}
          className={`p-6 border-2 rounded-2xl transition-all text-left ${
            data.delivery.type === 'delivery'
              ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-300'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <TruckIcon className="w-8 h-8 text-orange-500 mb-3" />
          <h4 className="font-semibold text-gray-900 mb-2">Delivery a Domicilio</h4>
          <p className="text-sm text-gray-600 mb-2">
            Te llevamos tu pedido hasta tu puerta
          </p>
          <div className="flex items-center text-sm text-orange-600">
            <ClockIcon className="w-4 h-4 mr-1" />
            Llega en 45 min
          </div>
        </button>
      </div>

      {/* Mobile Hint - Show after delivery type is selected */}
      {(data.delivery.type === 'pickup' || data.delivery.type === 'delivery') && (
        <div className="md:hidden mt-4 p-3 bg-blue-50 border border-blue-300 rounded-lg flex items-center gap-2">
          <span className="text-lg">👇</span>
          <p className="text-sm text-blue-700 font-medium">Pulsa "Continuar" abajo para avanzar</p>
        </div>
      )}

      {/* Address Field for Delivery */}
      {data.delivery.type === 'delivery' && (
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dirección de Entrega *
          </label>
          <textarea
            value={data.delivery.address || ''}
            onChange={(e) => onDataChange({
              delivery: { ...data.delivery, address: e.target.value }
            })}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
              errors.delivery?.address ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ingresa tu dirección completa con referencias..."
            rows={3}
          />
          {errors.delivery?.address && (
            <p className="text-red-500 text-sm mt-1">{errors.delivery.address}</p>
          )}
        </div>
      )}
    </div>
  );
}
