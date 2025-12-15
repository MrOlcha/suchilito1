'use client';

import React from 'react';
import { UserIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { CheckoutData, ValidationErrors } from '@/types/checkout';

interface CheckoutContactStepProps {
  data: CheckoutData;
  errors: ValidationErrors;
  onDataChange: (updates: Partial<CheckoutData>) => void;
}

const formatPhone = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
};

export default function CheckoutContactStep({
  data,
  errors,
  onDataChange,
}: CheckoutContactStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <UserIcon className="w-16 h-16 text-orange-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Información de Contacto
        </h3>
        <p className="text-gray-600">
          Necesitamos tus datos para contactarte sobre tu pedido
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nombre Completo *
        </label>
        <input
          type="text"
          value={data.contact.name}
          onChange={(e) => {
            const newName = e.target.value;
            onDataChange({
              contact: { ...data.contact, name: newName }
            });
          }}
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
            errors.contact?.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Ej: Juan Pérez"
        />
        {errors.contact?.name && (
          <p className="text-red-500 text-sm mt-1">{errors.contact.name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Número de Teléfono *
        </label>
        <input
          type="tel"
          value={formatPhone(data.contact.phone)}
          onChange={(e) => onDataChange({
            contact: { ...data.contact, phone: e.target.value.replace(/\D/g, '') }
          })}
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
            errors.contact?.phone ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="55-1234-5678"
          maxLength={12}
        />
        {errors.contact?.phone && (
          <p className="text-red-500 text-sm mt-1">{errors.contact.phone}</p>
        )}
      </div>
    </div>
  );
}
