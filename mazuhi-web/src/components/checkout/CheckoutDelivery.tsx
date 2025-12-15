'use client'

import React from 'react';
import { TruckIcon, BuildingStorefrontIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { ValidationErrors } from '@/types/checkout';
import CartSummary from './CartSummary';
import { CartItem } from '@/types/cart';

interface CheckoutDeliveryProps {
  deliveryType: 'pickup' | 'delivery';
  address?: string;
  items: CartItem[];
  total: number;
  itemCount: number;
  onDeliveryTypeChange: (type: 'pickup' | 'delivery') => void;
  onAddressChange: (address: string) => void;
  onLocationPickerOpen: () => void;
  errors?: ValidationErrors;
}

export default function CheckoutDelivery({
  deliveryType,
  address,
  items,
  total,
  itemCount,
  onDeliveryTypeChange,
  onAddressChange,
  onLocationPickerOpen,
  errors
}: CheckoutDeliveryProps) {
  return (
    <div className="space-y-4">
      {/* RESUMEN DEL PEDIDO */}
      <CartSummary items={items} total={total} itemCount={itemCount} />

      {/* Opción de entrega */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          ¿Cómo prefieres recibir tu pedido?
        </h3>
        <p className="text-sm text-gray-600">
          Elige entre recoger en sucursal o delivery a domicilio
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onDeliveryTypeChange('pickup')}
          className={`p-4 border-2 rounded-xl transition-all text-center hover:shadow-md ${
            deliveryType === 'pickup'
              ? 'border-orange-500 bg-orange-50 shadow-md'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <BuildingStorefrontIcon className="w-8 h-8 text-orange-500 mx-auto mb-3" />
          <h4 className="font-bold text-gray-900 text-sm mb-2">Recoger en Sucursal</h4>
          <div className="flex items-center justify-center text-xs text-orange-600 font-medium">
            <ClockIcon className="w-4 h-4 mr-1" />
            ~30 min
          </div>
        </button>

        <button
          onClick={() => onDeliveryTypeChange('delivery')}
          className={`p-4 border-2 rounded-xl transition-all text-center hover:shadow-md ${
            deliveryType === 'delivery'
              ? 'border-orange-500 bg-orange-50 shadow-md'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <TruckIcon className="w-8 h-8 text-orange-500 mx-auto mb-3" />
          <h4 className="font-bold text-gray-900 text-sm mb-2">Delivery a Domicilio</h4>
          <div className="flex items-center justify-center text-xs text-orange-600 font-medium">
            <ClockIcon className="w-4 h-4 mr-1" />
            ~45 min
          </div>
        </button>
      </div>

      {deliveryType === 'delivery' && (
        <div className="mt-6 space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Dirección de Entrega *
          </label>
          
          <button
            onClick={onLocationPickerOpen}
            className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all font-medium flex items-center justify-center gap-2"
          >
            📍 Seleccionar ubicación en mapa
          </button>

          {address && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-sm font-medium text-green-900">✓ Ubicación seleccionada:</p>
              <p className="text-sm text-green-700 mt-1">{address}</p>
            </div>
          )}

          <textarea
            value={address || ''}
            onChange={(e) => onAddressChange(e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm ${
              errors?.delivery?.address ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="O ingresa tu dirección manualmente..."
            rows={2}
          />
          {errors?.delivery?.address && (
            <p className="text-red-500 text-sm">{errors.delivery.address}</p>
          )}
        </div>
      )}
    </div>
  );
}
