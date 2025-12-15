'use client'

import { motion } from 'framer-motion'
import { CheckIcon, ClockIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import Header from '@/components/Header'
import { CheckoutData } from '@/types/checkout'

interface OrderSuccessProps {
  orderData: CheckoutData;
  onNewOrder: () => void;
}

export default function OrderSuccess({ orderData, onNewOrder }: OrderSuccessProps) {
  const getEstimatedTime = () => {
    return orderData.delivery.type === 'pickup' ? '15-20 min' : '30-45 min';
  };

  const getDeliveryMethod = () => {
    return orderData.delivery.type === 'pickup' ? 'Recojo en tienda' : 'Delivery a domicilio';
  };

  const getPaymentMethod = () => {
    return orderData.payment.method === 'cash' ? 'Efectivo' : 'Tarjeta';
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 md:pt-24">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center"
          >
            {/* Icono de éxito */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckIcon className="w-12 h-12 text-green-600" />
            </motion.div>

            {/* Título principal */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-gray-800 mb-2"
            >
              ¡Pedido Enviado Exitosamente!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 mb-8"
            >
              Tu pedido ha sido enviado a nuestro equipo y será procesado pronto.
            </motion.p>

            {/* Información del pedido */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl p-6 shadow-lg mb-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Número de orden */}
                <div className="text-center md:text-left">
                  <h3 className="font-semibold text-gray-800 mb-2">Número de Orden</h3>
                  <p className="text-2xl font-bold text-blue-600">{orderData.orderNumber}</p>
                </div>

                {/* Tiempo estimado */}
                <div className="text-center md:text-left">
                  <h3 className="font-semibold text-gray-800 mb-2 flex items-center justify-center md:justify-start">
                    <ClockIcon className="w-5 h-5 mr-2" />
                    Tiempo Estimado
                  </h3>
                  <p className="text-xl font-semibold text-green-600">{getEstimatedTime()}</p>
                </div>

                {/* Cliente */}
                <div className="text-center md:text-left">
                  <h3 className="font-semibold text-gray-800 mb-2 flex items-center justify-center md:justify-start">
                    <PhoneIcon className="w-5 h-5 mr-2" />
                    Datos de Contacto
                  </h3>
                  <p className="text-gray-700">{orderData.contact.name}</p>
                  <p className="text-gray-600">{orderData.contact.phone}</p>
                </div>

                {/* Entrega */}
                <div className="text-center md:text-left">
                  <h3 className="font-semibold text-gray-800 mb-2 flex items-center justify-center md:justify-start">
                    <MapPinIcon className="w-5 h-5 mr-2" />
                    Método de Entrega
                  </h3>
                  <p className="text-gray-700">{getDeliveryMethod()}</p>
                  {orderData.delivery.address && (
                    <p className="text-gray-600 text-sm">{orderData.delivery.address}</p>
                  )}
                </div>

                {/* Pago */}
                <div className="text-center md:text-left md:col-span-2">
                  <h3 className="font-semibold text-gray-800 mb-2">Método de Pago</h3>
                  <p className="text-gray-700">{getPaymentMethod()}</p>
                  {orderData.payment.method === 'cash' && orderData.payment.cashAmount && (
                    <p className="text-gray-600 text-sm">
                      Paga con: ${orderData.payment.cashAmount.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Mensaje de seguimiento */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-blue-50 rounded-xl p-6 mb-8"
            >
              <h3 className="font-semibold text-blue-800 mb-2">¿Qué sigue?</h3>
              <p className="text-blue-700 text-sm">
                Nuestro equipo ha recibido tu pedido y se pondrá en contacto contigo para confirmar los detalles. 
                Te mantendremos informado sobre el estado de tu orden.
              </p>
            </motion.div>

            {/* Botones de acción */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onNewOrder}
                className="bg-gradient-to-r from-blue-500 via-secondary-600 to-indigo-600 hover:from-blue-600 hover:via-secondary-700 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300"
              >
                Realizar Nuevo Pedido
              </motion.button>

              <Link href="/menu">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-800 font-semibold py-3 px-8 rounded-full transition-all duration-300"
                >
                  Ver Menú
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
}