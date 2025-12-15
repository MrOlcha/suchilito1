'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { MapPinIcon, PhoneIcon, ClockIcon } from '@heroicons/react/24/outline'

export default function UbicacionPage() {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  
  // Placeholder images - usuario las subirá luego
  const galleryImages = [
    '/images/placeholder-1.jpg',
    '/images/placeholder-2.jpg',
    '/images/placeholder-3.jpg',
    '/images/placeholder-4.jpg',
    '/images/placeholder-5.jpg',
    '/images/placeholder-6.jpg',
  ]

  const contactInfo = {
    nombre: 'MAZUHI SUSHI - Ciudad del Sol',
    direccion: 'Valle Puerta del Sol 597, Valle de Santiago',
    ciudad: 'Santiago de Querétaro',
    estado: 'Querétaro',
    codigoPostal: '76116',
    telefono: '4425996633',
    telefonoFormato: '442 599 66 33',
    horario: 'Mar-Dom 13:00-22:00',
    whatsapp: '4425996633'
  }

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)
  }

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % galleryImages.length)
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-secondary-600 mb-4 font-condiment">
              Nuestra ubicación
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ven y disfruta de la mejor fusión sinaloense-oriental en un ambiente acogedor
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Galería Principal */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2"
            >
              <div className="space-y-6">
                {/* Imagen Principal */}
                <div className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden shadow-2xl bg-gray-100">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedImageIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="relative w-full h-full"
                    >
                      <Image
                        src={galleryImages[selectedImageIndex]}
                        alt={`Vista de MAZUHI ${selectedImageIndex + 1}`}
                        fill
                        className="object-cover"
                        priority
                      />
                      {/* Overlay con información */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Controles de navegación */}
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 rounded-full p-3 transition-all duration-300 shadow-lg z-20"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 rounded-full p-3 transition-all duration-300 shadow-lg z-20"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* Indicador de imagen */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-2 rounded-full text-white text-sm font-medium">
                    {selectedImageIndex + 1} / {galleryImages.length}
                  </div>
                </div>

                {/* Galería de miniaturas */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {galleryImages.map((image, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                        selectedImageIndex === index
                          ? 'border-primary-300 shadow-lg'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`Miniatura ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Información de Contacto */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="sticky top-24 space-y-6">
                
                {/* Card Principal */}
                <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-8 shadow-lg border border-primary-200">
                  <h3 className="text-2xl font-bold text-secondary-600 mb-6 text-center">
                    {contactInfo.nombre}
                  </h3>

                  {/* Dirección */}
                  <div className="mb-6">
                    <div className="flex items-start mb-3">
                      <MapPinIcon className="h-6 w-6 text-primary-300 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-900 text-lg">
                          {contactInfo.direccion}
                        </p>
                        <p className="text-gray-700 mt-1">
                          {contactInfo.ciudad}, {contactInfo.estado}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {contactInfo.codigoPostal}
                        </p>
                      </div>
                    </div>
                  </div>

                  <hr className="border-gray-300 my-6" />

                  {/* Teléfono y WhatsApp */}
                  <div className="mb-6">
                    <div className="flex items-center mb-4">
                      <PhoneIcon className="h-6 w-6 text-primary-300 mr-3 flex-shrink-0" />
                      <a 
                        href={`tel:${contactInfo.telefono}`}
                        className="font-bold text-gray-900 text-lg hover:text-primary-300 transition-colors"
                      >
                        {contactInfo.telefonoFormato}
                      </a>
                    </div>
                    
                    <a 
                      href={`https://wa.me/${contactInfo.whatsapp}?text=Hola%20MAZUHI%20Sushi%20Ciudad%20del%20Sol%2C%20me%20gustaría%20conocer%20más%20sobre%20sus%20servicios`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.447-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-5.031 1.378c-3.055 2.364-3.905 6.75-1.896 10.317 1.51 2.617 4.123 4.107 7.021 4.107.842 0 1.704-.107 2.527-.322l.39.03c3.46 0 6.29-2.882 6.58-6.361.052-.502.048-1.01.027-1.516C20.496 9.09 17.694 6.979 14.051 6.979z"/>
                      </svg>
                      Enviar WhatsApp
                    </a>
                  </div>

                  <hr className="border-gray-300 my-6" />

                  {/* Horario */}
                  <div className="flex items-center">
                    <ClockIcon className="h-6 w-6 text-primary-300 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Horario</p>
                      <p className="text-gray-700 font-bold mt-1">
                        {contactInfo.horario}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botón de Maps */}
                <a 
                  href={`https://maps.google.com?q=${encodeURIComponent(contactInfo.direccion + ', ' + contactInfo.ciudad)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 px-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-lg"
                >
                  <MapPinIcon className="h-6 w-6" />
                  Ver en Google Maps
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
