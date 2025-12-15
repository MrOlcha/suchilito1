'use client'

import { motion } from 'framer-motion'
import { usePlatillosDestacados } from '@/hooks/usePlatillosDestacados'
import Image from 'next/image'

const PopularDishes = () => {
  const { platillos, loading, error } = usePlatillosDestacados()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  return (
    <section id="menu" className="section-padding bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Platos Populares
          </h2>
          <div className="w-24 h-1 bg-primary-300 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Descubre nuestras creaciones más queridas, elaboradas con los ingredientes más frescos 
            y técnicas tradicionales japonesas.
          </p>
        </motion.div>

        {/* Dishes Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {loading && (
            <div className="col-span-full flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-300"></div>
            </div>
          )}
          
          {error && (
            <div className="col-span-full text-center py-12">
              <p className="text-red-500 mb-4">Error al cargar platillos destacados</p>
              <p className="text-gray-500 text-sm">{error}</p>
            </div>
          )}
          
          {!loading && !error && platillos.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No hay platillos destacados disponibles</p>
            </div>
          )}
          
          {!loading && !error && platillos.map((platillo, index) => (
            <motion.div
              key={`${platillo.nombre}-${index}`}
              variants={cardVariants}
              whileHover={{ 
                y: -10, 
                transition: { duration: 0.3 } 
              }}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
            >
              {/* Image Container */}
              <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-primary-50 group-hover:to-primary-100 transition-all duration-300 overflow-hidden">
                {platillo.imagen_url ? (
                  <Image
                    src={platillo.imagen_url}
                    alt={platillo.nombre}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-6xl transform group-hover:scale-110 transition-transform duration-300">
                      🍣
                    </div>
                  </div>
                )}
                
                {/* Badges */}
                                {platillo.promomiercoles ? (
                                  <div className="absolute top-4 left-4">
                                    <div className="bg-[#608f36] w-10 h-10 flex items-center justify-center rounded-full shadow-lg">
                                      <span className="text-white font-bold text-sm">Participa</span>
                                    </div>
                                  </div>
                                ) : platillo.nuevo ? (
                                  <div className="absolute top-4 left-4 bg-green-500/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-white">
                                    ¡Nuevo!
                                  </div>
                                ) : null}
                
                {platillo.vegetariano && (
                  <div className="absolute top-4 right-4 bg-green-600/90 backdrop-blur-sm px-2 py-1 rounded-full">
                    <span className="text-white text-xs">🌱</span>
                  </div>
                )}
                
                {platillo.picante && (
                  <div className="absolute bottom-4 right-4 bg-red-500/90 backdrop-blur-sm px-2 py-1 rounded-full">
                    <span className="text-white text-xs">🌶️</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-300 transition-colors duration-300">
                  {platillo.nombre}
                </h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {platillo.descripcion}
                </p>
                
                {/* Price and Action */}
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary-300">
                    ${platillo.precio.toFixed(2)}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-primary-300 hover:bg-primary-400 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 shadow-md hover:shadow-lg"
                  >
                    Agregar
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* View More Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-secondary text-lg px-8 py-4"
          >
            Ver Menú Completo
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}

export default PopularDishes