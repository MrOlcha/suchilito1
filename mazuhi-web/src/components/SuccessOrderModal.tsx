'use client'

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  ClockIcon,
  BuildingStorefrontIcon,
  TruckIcon,
  MapPinIcon,
  BanknotesIcon,
  CreditCardIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import { CheckoutData } from '@/types/checkout';

interface SuccessOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkoutData: CheckoutData;
  orderNumber: string;
  getEstimatedTime: () => string;
}

export default function SuccessOrderModal({
  isOpen,
  onClose,
  checkoutData,
  orderNumber,
  getEstimatedTime
}: SuccessOrderModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden"
          >
            {/* Layout horizontal: Izquierda - Info del pedido | Derecha - Detalles */}
            <div className="grid grid-cols-1 md:grid-cols-5">
              {/* Columna izquierda - Imagen del Chef */}
              <div className="md:col-span-2 bg-white p-2 flex items-center justify-center relative overflow-hidden">
                {/* Imagen del cocinero */}
                <div className="w-full h-full flex items-center justify-center">
                  <Image
                    src="/images/cocina.png"
                    alt="Chef"
                    width={600}
                    height={600}
                    className="object-contain w-full h-auto max-h-full scale-110"
                    priority
                  />
                </div>
              </div>

              {/* Columna derecha - Detalles del pedido */}
              <div className="md:col-span-3 p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">¡Tu pedido ha sido realizado exitosamente!</h3>
                
                <div className="space-y-4 mb-6">
                  {/* Tiempo estimado */}
                  <div className="flex items-center gap-4 bg-gradient-to-r from-[#a2cbec]/30 to-[#3d89c5]/20 rounded-xl p-4 border border-[#3d89c5]/30">
                    <div className="w-12 h-12 bg-[#3d89c5] rounded-full flex items-center justify-center flex-shrink-0">
                      <ClockIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 font-medium">Tiempo estimado</p>
                      <p className="text-xl font-bold text-gray-900">{getEstimatedTime()}</p>
                    </div>
                  </div>

                  {/* Tipo de entrega */}
                  <div className="flex items-center gap-4 bg-gradient-to-r from-[#a2cbec]/30 to-[#3d89c5]/20 rounded-xl p-4 border border-[#3d89c5]/30">
                    <div className="w-12 h-12 bg-[#3d89c5] rounded-full flex items-center justify-center flex-shrink-0">
                      {checkoutData.delivery.type === 'pickup' ? (
                        <BuildingStorefrontIcon className="w-6 h-6 text-white" />
                      ) : (
                        <TruckIcon className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 font-medium">Tipo de entrega</p>
                      <p className="text-xl font-bold text-gray-900">
                        {checkoutData.delivery.type === 'pickup' ? 'Recoger en sucursal' : 'Delivery a domicilio'}
                      </p>
                    </div>
                  </div>

                  {/* Dirección (si es delivery) */}
                  {checkoutData.delivery.type === 'delivery' && checkoutData.delivery.address && (
                    <div className="flex items-start gap-4 bg-gradient-to-r from-[#a2cbec]/30 to-[#3d89c5]/20 rounded-xl p-4 border border-[#3d89c5]/30">
                      <div className="w-12 h-12 bg-[#3d89c5] rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPinIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 font-medium mb-1">Dirección de entrega</p>
                        <p className="text-lg text-gray-900">{checkoutData.delivery.address}</p>
                      </div>
                    </div>
                  )}

                  {/* Número de Pedido */}
                  <div className="flex items-center gap-4 bg-gradient-to-r from-[#a2cbec]/30 to-[#3d89c5]/20 rounded-xl p-4 border border-[#3d89c5]/30">
                    <div className="w-12 h-12 bg-[#3d89c5] rounded-full flex items-center justify-center flex-shrink-0">
                      <PhoneIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 font-medium">Número de pedido</p>
                      <p className="text-xl font-bold text-gray-900">{orderNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Mensaje de WhatsApp */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <p className="text-center text-sm text-blue-800">
                    <span className="font-semibold">📱 Hemos enviado la confirmación a tu WhatsApp.</span>
                    <br />
                    Nos pondremos en contacto contigo pronto.
                  </p>
                </div>

                {/* Botón de cerrar */}
                <button
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-[#3d89c5] to-[#2563eb] hover:from-[#2563eb] hover:to-[#1d4ed8] text-white font-semibold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl"
                >
                  Continuar Navegando
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
