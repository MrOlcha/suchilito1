'use client';

import React from 'react';
import { Dialog, DialogPanel, Transition } from '@headlessui/react';
import { 
  CheckCircleIcon,
  ClockIcon,
  PhoneIcon,
  MapPinIcon,
  PrinterIcon,
  ShareIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import { CheckoutData } from '@/types/checkout';
import { CartState } from '@/types/cart';
import { motion } from 'framer-motion';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: CheckoutData;
  cart: CartState;
  orderNumber: string;
}

export default function OrderConfirmationModal({
  isOpen,
  onClose,
  orderData,
  cart,
  orderNumber
}: OrderConfirmationModalProps) {
  
  const getEstimatedTime = () => {
    const now = new Date();
    const minutes = orderData.delivery.type === 'pickup' ? 20 : 45;
    const estimatedTime = new Date(now.getTime() + minutes * 60000);
    return estimatedTime.toLocaleTimeString('es-MX', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatPhone = (phone: string) => {
    const numbers = phone.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  const handleShare = async () => {
    const orderDetails = `🍣 Pedido de Sushi Confirmado
📋 Orden #${orderNumber}
👤 ${orderData.contact.name}
📞 ${formatPhone(orderData.contact.phone)}
🚚 ${orderData.delivery.type === 'pickup' ? 'Recoger en sucursal' : 'Delivery'}
⏰ Listo a las ${getEstimatedTime()}
💰 Total: $${cart.total.toFixed(2)}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Confirmación de Pedido - Mazuhi Sushi',
          text: orderDetails,
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(orderDetails);
      }
    } else {
      navigator.clipboard.writeText(orderDetails);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Transition show={isOpen}>
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
                
                {/* Success Header */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-8 text-white text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  >
                    <CheckCircleIcon className="w-20 h-20 mx-auto mb-4" />
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h2 className="text-3xl font-bold mb-2">¡Pedido Confirmado! 🎉</h2>
                    <p className="text-green-100 text-lg">
                      Tu orden está siendo preparada con amor
                    </p>
                  </motion.div>
                </div>

                <div className="p-8">
                  {/* Order Number */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-center mb-8"
                  >
                    <div className="bg-gray-100 rounded-2xl p-6">
                      <h3 className="text-sm text-gray-600 mb-2">Número de Orden</h3>
                      <div className="text-3xl font-bold text-gray-900 font-mono tracking-wider">
                        #{orderNumber}
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Guarda este número para seguimiento
                      </p>
                    </div>
                  </motion.div>

                  {/* Delivery Info */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="mb-8"
                  >
                    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">
                      <div className="flex items-center mb-4">
                        {orderData.delivery.type === 'pickup' ? (
                          <HomeIcon className="w-8 h-8 text-orange-600 mr-3" />
                        ) : (
                          <MapPinIcon className="w-8 h-8 text-orange-600 mr-3" />
                        )}
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {orderData.delivery.type === 'pickup' ? 'Recoger en Sucursal' : 'Delivery a Domicilio'}
                          </h4>
                          <p className="text-gray-600 text-sm">
                            {orderData.delivery.type === 'pickup' 
                              ? 'Te esperamos en nuestro restaurante'
                              : `Entregaremos en: ${orderData.delivery.address}`
                            }
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between bg-white rounded-xl p-4">
                        <div className="flex items-center">
                          <ClockIcon className="w-6 h-6 text-orange-600 mr-2" />
                          <div>
                            <p className="font-medium text-gray-900">Tiempo Estimado</p>
                            <p className="text-sm text-gray-600">
                              {orderData.delivery.type === 'pickup' ? '15-20 minutos' : '30-45 minutos'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Listo aprox. a las</p>
                          <p className="text-xl font-bold text-orange-600">{getEstimatedTime()}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Contact Info */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                    className="mb-8"
                  >
                    <div className="border border-gray-200 rounded-2xl p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Información de Contacto</h4>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-blue-600 font-semibold text-lg">
                              {orderData.contact.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{orderData.contact.name}</p>
                            <div className="flex items-center text-gray-600">
                              <PhoneIcon className="w-4 h-4 mr-1" />
                              <span className="text-sm">{formatPhone(orderData.contact.phone)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Payment Summary */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                    className="mb-8"
                  >
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Resumen de Pago</h4>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-medium">${cart.total.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex justify-between text-lg font-semibold border-t pt-3">
                          <span>Total a Pagar</span>
                          <span className="text-green-600">${cart.total.toFixed(2)}</span>
                        </div>

                        <div className="mt-4 p-4 bg-white rounded-xl">
                          <p className="text-sm text-gray-600 mb-1">Método de Pago</p>
                          <p className="font-medium">
                            {orderData.payment.method === 'cash' ? (
                              <>
                                💵 Efectivo
                                {orderData.payment.cashAmount && (
                                  <span className="text-gray-600 ml-2">
                                    (Pagas con ${orderData.payment.cashAmount.toFixed(2)} - 
                                    Cambio: ${(orderData.payment.cashAmount - cart.total).toFixed(2)})
                                  </span>
                                )}
                              </>
                            ) : (
                              '💳 Tarjeta de Crédito/Débito'
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={handleShare}
                        className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                      >
                        <ShareIcon className="w-5 h-5 mr-2" />
                        Compartir
                      </button>
                      
                      <button
                        onClick={handlePrint}
                        className="flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
                      >
                        <PrinterIcon className="w-5 h-5 mr-2" />
                        Imprimir
                      </button>
                    </div>

                    <button
                      onClick={onClose}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-4 rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      ¡Perfecto! Entendido 🍣
                    </button>
                  </motion.div>

                  {/* Contact Information */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.6 }}
                    className="mt-8 text-center text-gray-500 text-sm"
                  >
                    <p className="mb-2">
                      📞 ¿Dudas? Contáctanos al <span className="font-medium">55-1234-5678</span>
                    </p>
                    <p>
                      Te enviaremos actualizaciones por WhatsApp al {formatPhone(orderData.contact.phone)}
                    </p>
                  </motion.div>
                </div>
              </DialogPanel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}