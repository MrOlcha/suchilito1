'use client';

import React from 'react';
import { CreditCardIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { CheckoutData, CASH_DENOMINATIONS, ValidationErrors } from '@/types/checkout';

interface CheckoutPaymentStepProps {
  data: CheckoutData;
  errors: ValidationErrors;
  cartTotal: number;
  shippingCost: number;
  onDataChange: (updates: Partial<CheckoutData>) => void;
}

export default function CheckoutPaymentStep({
  data,
  errors,
  cartTotal,
  shippingCost,
  onDataChange,
}: CheckoutPaymentStepProps) {
  const total = cartTotal + shippingCost;

  const getChange = () => {
    if (data.payment.method === 'cash' && data.payment.cashAmount) {
      return data.payment.cashAmount - total;
    }
    return 0;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <CreditCardIcon className="w-16 h-16 text-orange-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          ¿Cómo vas a pagar?
        </h3>
        <p className="text-gray-600">
          El pago se realiza al {data.delivery.type === 'pickup' ? 'recoger' : 'recibir'} tu pedido
        </p>
        {/* Mensaje de tarifa de envío si es delivery */}
        {data.delivery.type === 'delivery' && (
          <div className="mt-4 text-sm text-orange-600 font-semibold bg-orange-50 rounded-xl py-2 px-4 inline-block">
            Se realizará un cobro adicional de $30.00 por tarifa de envío a domicilio.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cash Option */}
        <button
          onClick={() => onDataChange({
            payment: { method: 'cash' }
          })}
          className={`p-6 border-2 rounded-2xl transition-all text-left ${
            data.payment.method === 'cash'
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <BanknotesIcon className="w-8 h-8 text-orange-500 mb-3" />
          <h4 className="font-semibold text-gray-900 mb-2">Efectivo</h4>
          <p className="text-sm text-gray-600">
            Paga en efectivo y te damos tu cambio
          </p>
        </button>

        {/* Card Option */}
        <button
          onClick={() => onDataChange({
            payment: { method: 'card' }
          })}
          className={`p-6 border-2 rounded-2xl transition-all text-left ${
            data.payment.method === 'card'
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <CreditCardIcon className="w-8 h-8 text-orange-500 mb-3" />
          <h4 className="font-semibold text-gray-900 mb-2">Tarjeta</h4>
          <p className="text-sm text-gray-600">
            Paga con tarjeta de crédito o débito
          </p>
        </button>
      </div>

      {/* Cash Amount Selection */}
      {data.payment.method === 'cash' && (
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            ¿Con cuánto vas a pagar? (Total: ${total.toFixed(2)}) *
          </label>
          
          {/* Opción de pago exacto */}
          <div className="mb-4">
            <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-gray-50">
              <input
                type="checkbox"
                checked={data.payment.exactChange || false}
                onChange={(e) => {
                  onDataChange({
                    payment: { 
                      ...data.payment, 
                      exactChange: e.target.checked,
                      cashAmount: e.target.checked ? total : data.payment.cashAmount
                    }
                  });
                }}
                className="mr-3"
              />
              <span className="text-sm font-medium">Pago exacto: ${total.toFixed(2)}</span>
            </label>
          </div>

          {/* Denominaciones */}
          {!data.payment.exactChange && (
            <div className="grid grid-cols-3 gap-2">
              {CASH_DENOMINATIONS.map((denom) => (
                <button
                  key={denom.value}
                  onClick={() => onDataChange({
                    payment: { ...data.payment, cashAmount: denom.value }
                  })}
                  className={`p-3 border-2 rounded-xl text-center transition-all ${
                    data.payment.cashAmount === denom.value
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold">{denom.label}</div>
                  {data.payment.cashAmount === denom.value && (
                    <div className="text-xs text-orange-600 mt-1">
                      Cambio: ${(denom.value - total).toFixed(2)}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
