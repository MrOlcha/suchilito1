'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { usePromociones } from '@/hooks/usePromociones'
import { Promocion } from '@/types/promocion'

const PromotionsSection = () => {
  const { promociones, loading, error } = usePromociones()

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
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-secondary-600 mb-4">
              Promociones <span className="text-primary-300">Irresistibles</span>
            </h2>
            <p className="text-lg text-secondary-500">Cargando ofertas especiales...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 rounded-2xl h-96 animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-secondary-600 mb-4">
            Promociones <span className="text-primary-300">Irresistibles</span>
          </h2>
          <p className="text-lg text-red-500">Error al cargar promociones: {error}</p>
        </div>
      </section>
    )
  }

  if (!promociones || promociones.length === 0) {
    return (
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-secondary-600 mb-4">
            Promociones <span className="text-primary-300">Irresistibles</span>
          </h2>
          <p className="text-lg text-secondary-500">No hay promociones activas en este momento.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-secondary-600 mb-4"
          >
            Promociones <span className="text-primary-300">Irresistibles</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg text-secondary-500 max-w-2xl mx-auto"
          >
            No te pierdas nuestras ofertas especiales y descuentos exclusivos. 
            ¡Aprovecha estas oportunidades únicas!
          </motion.p>
        </motion.div>

        {/* Promociones Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {promociones.map((promocion: Promocion, index: number) => (
            <motion.div
              key={promocion.id}
              variants={cardVariants}
              whileHover={{ 
                scale: 1.05, 
                y: -10,
                transition: { duration: 0.3 }
              }}
              className="relative group cursor-pointer"
            >
              <div className="relative h-96 rounded-2xl overflow-hidden shadow-xl">
                {/* Imagen de fondo con degradado */}
                {promocion.imagen_url ? (
                  <>
                    <Image
                      src={promocion.imagen_url}
                      alt={promocion.nombre}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-300 to-secondary-600"></div>
                )}

                {/* Contenido de la tarjeta */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
                  {/* Header con badges */}
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      {promocion.sucursal && (
                        <span className="bg-primary-300/90 text-white px-3 py-1 rounded-full text-xs font-bold uppercase backdrop-blur-sm">
                          VÁLIDO SOLO EN SUCURSAL
                        </span>
                      )}
                      {promocion.domicilio && (
                        <span className="bg-green-500/90 text-white px-3 py-1 rounded-full text-xs font-bold uppercase backdrop-blur-sm">
                          VÁLIDO A DOMICILIO
                        </span>
                      )}
                    </div>
                    <div className="text-4xl">🎉</div>
                  </div>

                  {/* Título y descripción */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold mb-2 leading-tight">
                        {promocion.nombre}
                      </h3>
                      <p className="text-sm opacity-90 leading-relaxed">
                        {promocion.descripcion}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Elementos decorativos */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-white/10 rounded-full blur-lg" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
      </div>
    </section>
  )
}

export default PromotionsSection