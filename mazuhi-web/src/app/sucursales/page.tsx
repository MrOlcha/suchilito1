'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useSucursales } from '@/hooks/useSucursales'
import { MapPinIcon, PhoneIcon, ClockIcon, BuildingOfficeIcon, PhotoIcon } from '@heroicons/react/24/outline'

export default function SucursalesPage() {
  const { sucursales, loading, error, cities, filterByCity } = useSucursales()
  const [selectedCity, setSelectedCity] = useState<string>('')

  const filteredSucursales = selectedCity ? filterByCity(selectedCity) : sucursales

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-primary-300 border-t-transparent rounded-full mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Cargando sucursales...
            </h3>
            <p className="text-gray-600">
              Preparando la ubicación más cercana a ti 📍
            </p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Error al cargar sucursales
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-primary-300 hover:bg-primary-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
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
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-secondary-600 mb-6 font-condiment">
              Nuestras Sucursales
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Encuentra la sucursal más cercana y disfruta de nuestros deliciosos platillos
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filtros */}
      {cities.length > 1 && (
        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <span className="text-gray-700 font-medium">Filtrar por ciudad:</span>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-transparent"
              >
                <option value="">Todas las ciudades</option>
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </section>
      )}

      {/* Lista de Sucursales */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCity}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredSucursales.map((sucursal, index) => (
                <motion.div
                  key={sucursal.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300"
                >
                  {/* Imagen de la Sucursal */}
                  <div className="relative h-64 w-full bg-gray-100">
                    {sucursal.imagen_url ? (
                      <Image
                        src={sucursal.imagen_url}
                        alt={`Imagen de ${sucursal.nombre}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <PhotoIcon className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Overlay con nombre */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent">
                      <div className="absolute bottom-4 left-4">
                        <div className="flex items-center text-white">
                          <BuildingOfficeIcon className="h-6 w-6 mr-2" />
                          <h3 className="text-lg font-bold">{sucursal.nombre}</h3>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div className="flex items-start">
                      <MapPinIcon className="h-5 w-5 text-gray-400 mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-gray-800 font-medium">{sucursal.direccion}</p>
                        <p className="text-gray-600 text-sm">
                          {sucursal.ciudad}, {sucursal.estado} {sucursal.codigo_postal}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <a 
                        href={`tel:${sucursal.telefono}`}
                        className="text-primary-300 hover:text-primary-400 font-medium transition-colors"
                      >
                        {sucursal.telefono}
                      </a>
                    </div>
                    
                    <div className="flex items-center">
                      <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <p className="text-gray-700">{sucursal.horario}</p>
                    </div>
                    
                    <div className="pt-4 space-y-2">
                      <a 
                        href={`https://maps.google.com?q=${encodeURIComponent(sucursal.direccion + ', ' + sucursal.ciudad)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-primary-300 hover:bg-primary-400 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                      >
                        <MapPinIcon className="h-4 w-4 mr-2" />
                        Ver en Mapa
                      </a>
                      <a 
                        href={`tel:${sucursal.telefono}`}
                        className="w-full bg-secondary-600 hover:bg-secondary-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                      >
                        <PhoneIcon className="h-4 w-4 mr-2" />
                        Llamar
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
          
          {filteredSucursales.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-gray-400 text-6xl mb-4">🏪</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No hay sucursales en esta ciudad
              </h3>
              <p className="text-gray-600">
                Intenta seleccionar otra ciudad o ver todas las sucursales
              </p>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}