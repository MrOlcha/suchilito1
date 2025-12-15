'use client'

import React from 'react';
import { BanknotesIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { ValidationErrors, CASH_DENOMINATIONS } from '@/types/checkout';

interface CheckoutPaymentProps {
  method: 'cash' | 'card';
  cashAmount?: number;
  exactChange?: boolean;
  total: number;
  shippingCost: number;
  deliveryType: 'pickup' | 'delivery';
  onMethodChange: (method: 'cash' | 'card') => void;
  onCashAmountChange: (amount: number) => void;
  onExactChangeChange: (exact: boolean) => void;
  errors?: ValidationErrors;
}

export default function CheckoutPayment({
  method,
  cashAmount,
  exactChange,
  total,
  shippingCost,
  deliveryType,
  onMethodChange,
  onCashAmountChange,
  onExactChangeChange,
  errors
}: CheckoutPaymentProps) {
  const totalToPay = total + shippingCost;
  const getChange = () => {
    if (method === 'cash' && cashAmount) {
      return cashAmount - totalToPay;
    }
    return 0;
  };

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          ¿Cómo vas a pagar?
        </h3>
        <p className="text-sm text-gray-600">
          El pago se realiza al {deliveryType === 'pickup' ? 'recoger' : 'recibir'} tu pedido
        </p>
        {/* Mensaje de tarifa de envío si es delivery */}
        {deliveryType === 'delivery' && (
          <div className="mt-4 text-sm text-orange-600 font-semibold bg-orange-50 rounded-xl py-2 px-4 inline-block">
            Se realizará un cobro adicional de ${shippingCost.toFixed(2)} por tarifa de envío a domicilio.
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onMethodChange('cash')}
          className={`p-3 border-2 rounded-xl transition-all text-center ${
            method === 'cash'
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <BanknotesIcon className="w-6 h-6 text-orange-500 mx-auto mb-2" />
          <h4 className="font-semibold text-gray-900 text-sm">Efectivo</h4>
        </button>

        <button
          onClick={() => onMethodChange('card')}
          className={`p-3 border-2 rounded-xl transition-all text-center ${
            method === 'card'
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <CreditCardIcon className="w-6 h-6 text-orange-500 mx-auto mb-2" />
          <h4 className="font-semibold text-gray-900 text-sm">Tarjeta</h4>
        </button>
      </div>

      {method === 'cash' && (
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            ¿Con cuánto vas a pagar? (Total: ${totalToPay.toFixed(2)}) *
          </label>
          
          <div className="mb-4">
            <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-gray-50">
              <input
                type="checkbox"
                checked={exactChange || false}
                onChange={(e) => {
                  onExactChangeChange(e.target.checked);
                  if (e.target.checked) {
                    onCashAmountChange(totalToPay);
                  }
                }}
                className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
              />
              <div className="ml-3">
                <span className="font-medium text-gray-900">Pago con cambio exacto</span>
                <p className="text-sm text-gray-600">Pagaré exactamente ${totalToPay.toFixed(2)}</p>
              </div>
            </label>
          </div>

          {!exactChange && (
            <>
              <p className="text-sm text-gray-600 mb-3">O selecciona con qué billete pagarás:</p>
              <div className="grid grid-cols-3 gap-3">
                {CASH_DENOMINATIONS.map((denomination) => (
                  <button
                    key={denomination.value}
                    onClick={() => {
                      onCashAmountChange(denomination.value);
                      onExactChangeChange(false);
                    }}
                    disabled={denomination.value < totalToPay}
                    className={`p-3 border-2 rounded-xl text-center transition-all ${
                      cashAmount === denomination.value && !exactChange
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : denomination.value < totalToPay
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold">{denomination.label}</div>
                    {denomination.value >= totalToPay && (
                      <div className="text-xs text-gray-500 mt-1">
                        Cambio: ${(denomination.value - totalToPay).toFixed(2)}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
          {errors?.payment?.cashAmount && (
            <p className="text-red-500 text-sm mt-2">{errors.payment.cashAmount}</p>
          )}
        </div>
      )}
    </div>
  );
}
