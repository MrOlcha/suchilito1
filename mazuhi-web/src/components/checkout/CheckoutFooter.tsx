'use client';

import React from 'react';
import { CheckIcon, ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';

interface CheckoutFooterProps {
  currentStep: number;
  totalSteps: number;
  isSubmitting: boolean;
  onPrev: () => void;
  onNext: () => void;
  onComplete: () => void;
}

export default function CheckoutFooter({
  currentStep,
  totalSteps,
  isSubmitting,
  onPrev,
  onNext,
  onComplete,
}: CheckoutFooterProps) {
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="flex flex-col-reverse md:flex-row md:justify-between md:items-center gap-4 mt-8 pt-6 border-t border-gray-200">
      <button
        onClick={onPrev}
        disabled={currentStep === 0}
        className="hidden md:flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeftIcon className="w-5 h-5 mr-1" />
        Anterior
      </button>

      {!isLastStep ? (
        <button
          onClick={onNext}
          disabled={isSubmitting}
          className="w-full md:w-auto flex items-center justify-center px-8 py-3 md:py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 font-semibold text-lg md:text-base shadow-lg md:shadow-none"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
              Procesando...
            </>
          ) : (
            <>
              Continuar
              <ChevronRightIcon className="w-5 h-5 ml-1" />
            </>
          )}
        </button>
      ) : (
        <button
          onClick={onComplete}
          disabled={isSubmitting}
          className="w-full md:w-auto flex items-center justify-center px-8 py-3 md:py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition-all transform hover:scale-105 font-semibold text-lg md:text-base shadow-lg md:shadow-none"
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
