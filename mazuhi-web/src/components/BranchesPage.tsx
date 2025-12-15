'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { branchesData, type Branch } from '@/data/branchesData'
import { MapPinIcon, PhoneIcon, ClockIcon, StarIcon } from '@heroicons/react/24/outline'
import { TruckIcon, BuildingStorefrontIcon, UserGroupIcon, GiftIcon } from '@heroicons/react/24/solid'

export default function BranchesPage() {
  const [selectedCity, setSelectedCity] = useState<string>('all')
  
  // Extract all branches from cities
  const allBranches: Branch[] = branchesData.flatMap(city => city.branches)
  const cities = branchesData.map(city => city.name)
  
  const filteredBranches = selectedCity === 'all' 
    ? allBranches 
    : allBranches.filter(branch => branch.city === selectedCity)

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Nuestras <span className="text-primary">Sucursales</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Encuentra la sucursal más cercana a ti y disfruta de la mejor experiencia Sushi
          </p>
        </motion.div>

        {/* City Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          <button
            onClick={() => setSelectedCity('all')}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
              selectedCity === 'all'
                ? 'bg-secondary-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Todas las ciudades
          </button>
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                selectedCity === city
                  ? 'bg-secondary-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {city}
            </button>
          ))}
        </motion.div>

        {/* Branches Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredBranches.map((branch, index) => (
            <motion.div
              key={branch.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Branch Image */}
              <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-4xl font-bold text-primary/40">SUSHI</div>
                </div>
                <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 flex items-center gap-1">
                  <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">{branch.rating}</span>
                </div>
              </div>

              {/* Branch Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{branch.name}</h3>
                    <p className="text-sm font-medium text-primary">{branch.city}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600 text-sm">{branch.address}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <PhoneIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <a 
                      href={`tel:${branch.phone}`}
                      className="text-gray-600 text-sm hover:text-primary transition-colors"
                    >
                      {branch.phone}
                    </a>
                  </div>

                  <div className="flex items-center gap-3">
                    <ClockIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div className="text-gray-600 text-sm">
                      <p>{branch.hours.weekdays}</p>
                      <p>{branch.hours.weekends}</p>
                    </div>
                  </div>
                </div>

                {/* Services */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Servicios disponibles</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {branch.services.map((service) => (
                      <div key={service.id} className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-lg">{service.icon}</span>
                        <div>
                          <span className="font-medium">{service.name}</span>
                          {service.description && (
                            <p className="text-xs text-gray-500">{service.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Features */}
                {branch.features.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Características</h4>
                    <div className="flex flex-wrap gap-1">
                      {branch.features.map((feature) => (
                        <span
                          key={feature}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(branch.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-secondary-600 text-white py-2 px-4 rounded-lg text-sm font-medium text-center hover:bg-secondary-700 transition-colors"
                  >
                    Cómo llegar
                  </a>
                  <a
                    href={`tel:${branch.phone}`}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium text-center hover:bg-gray-200 transition-colors"
                  >
                    Llamar
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* No results message */}
        {filteredBranches.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-gray-500 text-lg">
              No hay sucursales disponibles en {selectedCity}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}