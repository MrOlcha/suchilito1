'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePlatillosDestacados } from '@/hooks/usePlatillosDestacados'
import MenuCard from '@/components/MenuCard'

const MenuSection = () => {
  const { platillos, loading, error } = usePlatillosDestacados()

  return (
    <section id="menu" className="section-padding bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-secondary-600 mb-4">
            Platos Populares
          </h2>
          <p className="text-lg text-secondary-500 max-w-2xl mx-auto">
            Descubre nuestros platos más destacados. Para realizar pedidos, visita nuestro menú completo
          </p>
        </motion.div>

        {/* Menu Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
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

          {!loading && !error && platillos.slice(0, 4).map((item, index) => (
            <MenuCard
              key={`${item.nombre}-${index}`}
              item={item}
              index={index}
            />
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-12"
        >
          <Link href="/menu">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary text-lg px-8 py-4"
            >
              Ver Menú Completo
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default MenuSection