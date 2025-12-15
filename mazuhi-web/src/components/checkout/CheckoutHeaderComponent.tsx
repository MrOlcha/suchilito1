'use client';

import React from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { CheckoutStep } from '@/types/checkout';

interface CheckoutHeaderProps {
  currentStep: number;
  steps: CheckoutStep[];
  title: string;
  onClose: () => void;
}

export default function CheckoutHeaderComponent({
  currentStep,
  steps,
  title,
  onClose,
}: CheckoutHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 px-8 py-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Finalizar Pedido</h2>
          <p className="text-orange-100 mt-1">{title}</p>
        </div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>
      
      {/* Progress Steps */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                ${index <= currentStep 
                  ? 'bg-white text-orange-500' 
                  : 'bg-orange-400 text-white'
                }
              `}>
                {index < currentStep ? (
                  <CheckIcon className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`
                  w-12 h-0.5 mx-2
                  ${index < currentStep ? 'bg-white' : 'bg-orange-400'}
                `} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
