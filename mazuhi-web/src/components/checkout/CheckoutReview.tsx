'use client'

import React from 'react';
import { CheckIcon, UserIcon, PhoneIcon, BuildingStorefrontIcon, TruckIcon, MapPinIcon, ClockIcon, BanknotesIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { CheckoutData } from '@/types/checkout';

interface CheckoutReviewProps {
  checkoutData: CheckoutData;
  total: number;
  shippingCost: number;
  estimatedTime: string;
  onNotesChange: (notes: string) => void;
}

export default function CheckoutReview({
  checkoutData,
  total,
  shippingCost,
  estimatedTime,
  onNotesChange
}: CheckoutReviewProps) {
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  const getChange = () => {
    if (checkoutData.payment.method === 'cash' && checkoutData.payment.cashAmount) {
      return checkoutData.payment.cashAmount - (total + shippingCost);
    }
    return 0;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <CheckIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Revisa tu Pedido
        </h3>
        <p className="text-gray-600">
          Confirma que todo esté correcto antes de finalizar
        </p>
      </div>

      <div className="bg-gray-50 rounded-2xl p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Resumen del Pedido</h4>
        
        <div className="mb-4 pb-4 border-b border-gray-200">
          <div className="flex items-center mb-2">
            <UserIcon className="w-5 h-5 text-gray-500 mr-2" />
            <span className="font-medium">{checkoutData.contact.name}</span>
          </div>
          <div className="flex items-center">
            <PhoneIcon className="w-5 h-5 text-gray-500 mr-2" />
            <span>{formatPhone(checkoutData.contact.phone)}</span>
          </div>
        </div>

        <div className="mb-4 pb-4 border-b border-gray-200">
          <div className="flex items-center mb-2">
            {checkoutData.delivery.type === 'pickup' ? (
              <BuildingStorefrontIcon className="w-5 h-5 text-gray-500 mr-2" />
            ) : (
              <TruckIcon className="w-5 h-5 text-gray-500 mr-2" />
            )}
            <span className="font-medium">
              {checkoutData.delivery.type === 'pickup' ? 'Recoger en Sucursal' : 'Delivery a Domicilio'}
            </span>
          </div>
          {checkoutData.delivery.address && (
            <div className="flex items-start">
              <MapPinIcon className="w-5 h-5 text-gray-500 mr-2 mt-0.5" />
              <span className="text-sm text-gray-600">{checkoutData.delivery.address}</span>
            </div>
          )}
          <div className="flex items-center mt-2">
            <ClockIcon className="w-5 h-5 text-gray-500 mr-2" />
            <span className="text-sm text-gray-600">
              Tiempo estimado: {estimatedTime}
            </span>
          </div>
        </div>

        <div className="mb-4 pb-4 border-b border-gray-200">
          <div className="flex items-center mb-2">
            {checkoutData.payment.method === 'cash' ? (
              <BanknotesIcon className="w-5 h-5 text-gray-500 mr-2" />
            ) : (
              <CreditCardIcon className="w-5 h-5 text-gray-500 mr-2" />
            )}
            <span className="font-medium">
              {checkoutData.payment.method === 'cash' ? 'Efectivo' : 'Tarjeta'}
            </span>
          </div>
          {checkoutData.payment.method === 'cash' && checkoutData.payment.cashAmount && (
            <div className="text-sm text-gray-600">
              {checkoutData.payment.exactChange ? (
                <span className="text-green-600 font-medium">✓ Pago exacto: ${checkoutData.payment.cashAmount.toFixed(2)}</span>
              ) : (
                <>
                  Pagas con: ${checkoutData.payment.cashAmount.toFixed(2)}<br />
                  Tu cambio: ${getChange().toFixed(2)}
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center text-lg font-semibold">
          <span>Subtotal:</span>
          <span>${total.toFixed(2)}</span>
        </div>
        {shippingCost > 0 && (
          <div className="flex justify-between items-center text-sm text-gray-600 mt-2">
            <span>Envío a domicilio:</span>
            <span>${shippingCost.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between items-center text-xl font-bold text-orange-600 mt-3 pt-3 border-t border-gray-200">
          <span>Total a Pagar:</span>
          <span>${(total + shippingCost).toFixed(2)}</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notas Adicionales (Opcional)
        </label>
        <textarea
          value={checkoutData.notes || ''}
          onChange={(e) => onNotesChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          placeholder="Alguna instrucción especial para tu pedido..."
          rows={3}
        />
      </div>
    </div>
  );
}
