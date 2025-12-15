'use client'

import React from 'react';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { CheckoutStep } from '@/types/checkout';

interface CheckoutHeaderProps {
  steps: CheckoutStep[];
  currentStep: number;
  onClose: () => void;
}

export default function CheckoutHeader({
  steps,
  currentStep,
  onClose
}: CheckoutHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">Finalizar Pedido</h2>
          <p className="text-orange-100 mt-1">
            {steps[currentStep].title}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>
      
      {/* Progress Steps */}
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
  );
}
