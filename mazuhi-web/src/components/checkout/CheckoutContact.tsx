'use client'

import React from 'react';
import { UserIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { ValidationErrors } from '@/types/checkout';

interface CheckoutContactProps {
  name: string;
  phone: string;
  onNameChange: (name: string) => void;
  onPhoneChange: (phone: string) => void;
  errors?: ValidationErrors;
}

export default function CheckoutContact({
  name,
  phone,
  onNameChange,
  onPhoneChange,
  errors
}: CheckoutContactProps) {
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

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
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
            errors?.contact?.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Ej: Juan Pérez"
        />
        {errors?.contact?.name && (
          <p className="text-red-500 text-sm mt-1">{errors.contact.name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Número de Teléfono *
        </label>
        <input
          type="tel"
          value={formatPhone(phone)}
          onChange={(e) => onPhoneChange(e.target.value.replace(/\D/g, ''))}
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
            errors?.contact?.phone ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="55-1234-5678"
          maxLength={12}
        />
        {errors?.contact?.phone && (
          <p className="text-red-500 text-sm mt-1">{errors.contact.phone}</p>
        )}
      </div>
    </div>
  );
}
