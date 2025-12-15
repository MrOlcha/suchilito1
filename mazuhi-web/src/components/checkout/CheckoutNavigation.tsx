'use client'

import React from 'react';
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { CheckoutStep } from '@/types/checkout';

interface CheckoutNavigationProps {
  steps: CheckoutStep[];
  currentStep: number;
  isSubmitting: boolean;
  onPrevStep: () => void;
  onNextStep: () => void;
  onComplete: () => void;
}

export default function CheckoutNavigation({
  steps,
  currentStep,
  isSubmitting,
  onPrevStep,
  onNextStep,
  onComplete
}: CheckoutNavigationProps) {
  return (
    <div className="flex justify-between items-center p-6 border-t border-gray-200">
      <button
        onClick={onPrevStep}
        disabled={currentStep === 0}
        className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeftIcon className="w-5 h-5 mr-1" />
        Anterior
      </button>

      {currentStep < steps.length - 1 ? (
        <button
          onClick={onNextStep}
          className="flex items-center px-8 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all transform hover:scale-105"
        >
          Continuar
          <ChevronRightIcon className="w-5 h-5 ml-1" />
        </button>
      ) : (
        <button
          onClick={onComplete}
          disabled={isSubmitting}
          className="flex items-center px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 transition-all transform hover:scale-105"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
              Procesando...
            </>
          ) : (
            <>
              <CheckIcon className="w-5 h-5 mr-1" />
              Confirmar Pedido
            </>
          )}
        </button>
      )}
    </div>
  );
}
