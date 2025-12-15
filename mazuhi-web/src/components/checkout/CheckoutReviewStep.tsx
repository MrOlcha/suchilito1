'use client';

import React from 'react';
import {
  CheckIcon,
  UserIcon,
  PhoneIcon,
  BuildingStorefrontIcon,
  TruckIcon,
  MapPinIcon,
  ClockIcon,
  BanknotesIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';
import { CheckoutData } from '@/types/checkout';

interface CheckoutReviewStepProps {
  data: CheckoutData;
  cartTotal: number;
  shippingCost: number;
  onNotesChange: (notes: string) => void;
}

const formatPhone = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
};

export default function CheckoutReviewStep({
  data,
  cartTotal,
  shippingCost,
  onNotesChange,
}: CheckoutReviewStepProps) {
  const total = cartTotal + shippingCost;

  const getChange = () => {
    if (data.payment.method === 'cash' && data.payment.cashAmount) {
      return data.payment.cashAmount - total;
    }
    return 0;
  };

  const getEstimatedTime = () => {
    return data.delivery.type === 'pickup' ? '30 min' : '45 min';
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <CheckIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Revisa tu pedido
        </h3>
        <p className="text-gray-600">
          Confirma que todo esté correcto antes de enviar
        </p>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Resumen del Pedido</h4>
        
        {/* Contact Info */}
        <div className="mb-4 pb-4 border-b border-gray-200">
          <div className="flex items-center mb-2">
            <UserIcon className="w-5 h-5 text-gray-500 mr-2" />
            <span className="font-medium">{data.contact.name}</span>
          </div>
          <div className="flex items-center">
            <PhoneIcon className="w-5 h-5 text-gray-500 mr-2" />
            <span>{formatPhone(data.contact.phone)}</span>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="mb-4 pb-4 border-b border-gray-200">
          <div className="flex items-center mb-2">
            {data.delivery.type === 'pickup' ? (
              <BuildingStorefrontIcon className="w-5 h-5 text-gray-500 mr-2" />
            ) : (
              <TruckIcon className="w-5 h-5 text-gray-500 mr-2" />
            )}
            <span className="font-medium">
              {data.delivery.type === 'pickup' ? 'Recoger en Sucursal' : 'Delivery a Domicilio'}
            </span>
          </div>
          {data.delivery.address && (
            <div className="flex items-start">
              <MapPinIcon className="w-5 h-5 text-gray-500 mr-2 mt-0.5" />
              <span className="text-sm text-gray-600">{data.delivery.address}</span>
            </div>
          )}
          <div className="flex items-center mt-2">
            <ClockIcon className="w-5 h-5 text-gray-500 mr-2" />
            <span className="text-sm text-gray-600">
              Tiempo estimado: {getEstimatedTime()}
            </span>
          </div>
        </div>

        {/* Payment Info */}
        <div className="mb-4 pb-4 border-b border-gray-200">
          <div className="flex items-center mb-2">
            {data.payment.method === 'cash' ? (
              <BanknotesIcon className="w-5 h-5 text-gray-500 mr-2" />
            ) : (
              <CreditCardIcon className="w-5 h-5 text-gray-500 mr-2" />
            )}
            <span className="font-medium">
              {data.payment.method === 'cash' ? 'Efectivo' : 'Tarjeta'}
            </span>
          </div>
          {data.payment.method === 'cash' && data.payment.cashAmount && (
            <div className="text-sm text-gray-600">
              {data.payment.exactChange ? (
                <span className="text-green-600 font-medium">✓ Pago exacto: ${(data.payment.cashAmount).toFixed(2)}</span>
              ) : (
                <>
                  Pagas con: ${(data.payment.cashAmount).toFixed(2)}<br />
                  Tu cambio: ${getChange().toFixed(2)}
                </>
              )}
            </div>
          )}
        </div>

        {/* Order Total */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-base">
            <span className="text-gray-600">Subtotal productos</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          {shippingCost > 0 && (
            <div className="flex justify-between items-center text-base">
              <span className="text-gray-600">Envío a domicilio</span>
              <span className="text-orange-600">${shippingCost.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between items-center text-lg font-semibold pt-2 border-t border-gray-300">
            <span>Total a Pagar:</span>
            <span className="text-orange-600">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Additional Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notas Adicionales (Opcional)
        </label>
        <textarea
          value={data.notes || ''}
          onChange={(e) => onNotesChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          placeholder="Alguna instrucción especial para tu pedido..."
          rows={3}
        />
      </div>
    </div>
  );
}
