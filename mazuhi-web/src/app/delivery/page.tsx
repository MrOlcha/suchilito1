'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { MapPinIcon, ChevronLeftIcon } from '@heroicons/react/24/outline'
import Header from '@/components/Header'
import LocationPickerModal from '@/components/LocationPickerModal'

export default function DeliveryPage() {
  const router = useRouter()
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(true)
  const [selectedAddress, setSelectedAddress] = useState('')

  const handleSelectLocation = (address: string, lat: number, lng: number) => {
    setSelectedAddress(address)
    setIsLocationModalOpen(false)
    // Aquí puedes guardar la dirección en el contexto o localStorage
    console.log('Dirección seleccionada:', { address, lat, lng })
    // Redirigir de vuelta al carrito o al siguiente paso
    router.push('/cart')
  }

  const handleBack = () => {
    router.push('/cart')
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 md:pt-24">
        <div className="container mx-auto px-4 py-8 pb-24 md:pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <MapPinIcon className="w-16 h-16 text-primary-300 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Delivery a Domicilio
                </h1>
                <p className="text-gray-600">
                  Selecciona tu dirección de entrega en el mapa
                </p>
              </div>

              {selectedAddress && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
                >
                  <p className="text-sm font-medium text-green-800 mb-1">
                    Dirección seleccionada:
                  </p>
                  <p className="text-sm text-green-700">{selectedAddress}</p>
                </motion.div>
              )}

              <div className="space-y-4">
                <button
                  onClick={() => setIsLocationModalOpen(true)}
                  className="w-full p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-all text-center"
                >
                  <MapPinIcon className="w-8 h-8 text-primary-300 mx-auto mb-2" />
                  <p className="font-semibold text-gray-900">
                    {selectedAddress ? 'Cambiar dirección' : 'Seleccionar dirección en el mapa'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Usa el mapa interactivo para elegir tu ubicación
                  </p>
                </button>

                {/* Direcciones de ejemplo */}
                <div className="mt-8">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Direcciones frecuentes:
                  </h3>
                  <div className="space-y-2">
                    {[
                      'Valle Puerta del Sol 597, Valle de Santiago',
                      'Av. Constituyentes 150, Centro',
                      'Blvd. Bernardo Quintana 4100, San Pablo'
                    ].map((address, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedAddress(address)
                          // Aquí podrías hacer geocoding para obtener lat/lng
                        }}
                        className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all"
                      >
                        <div className="flex items-center">
                          <MapPinIcon className="w-5 h-5 text-gray-400 mr-3" />
                          <span className="text-sm text-gray-700">{address}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBack}
                  className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <ChevronLeftIcon className="w-5 h-5 mr-1" />
                  Atrás
                </motion.button>

                {selectedAddress && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push('/cart')}
                    className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all"
                  >
                    Continuar
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <LocationPickerModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSelectLocation={handleSelectLocation}
      />
    </>
  )
}
