import { memo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

interface MenuCardProps {
  item: {
    nombre: string
    descripcion: string
    precio: number
    imagen_url?: string
    favorito?: boolean
    nuevo?: boolean
    vegetariano?: boolean
    picante?: boolean
  }
  index: number
}

const MenuCard = memo(({ item, index }: MenuCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group gpu-accelerated"
    >
      {/* Card Image */}
      <div className="h-56 md:h-48 bg-gradient-to-br from-primary-100 to-primary-200 relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
        {item.imagen_url ? (
          <Image
            src={item.imagen_url}
            alt={item.nombre}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover"
            loading={index < 4 ? "eager" : "lazy"}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-6xl">🍣</span>
          </div>
        )}

        {/* Badges */}
        {item.nuevo && (
          <div className="absolute top-4 left-4 bg-green-500/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-white">
            ¡Nuevo!
          </div>
        )}

        {item.vegetariano && (
          <div className="absolute top-4 right-4 bg-green-600/90 backdrop-blur-sm px-2 py-1 rounded-full">
            <span className="text-white text-xs">🌱</span>
          </div>
        )}

        {item.picante && (
          <div className="absolute bottom-4 right-4 bg-red-500/90 backdrop-blur-sm px-2 py-1 rounded-full">
            <span className="text-white text-xs">🌶️</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-secondary-600">{item.nombre}</h3>
          {item.favorito && (
            <div className="flex items-center">
              <span className="text-yellow-400 text-sm">⭐</span>
              <span className="text-sm text-secondary-500 ml-1">Favorito</span>
            </div>
          )}
        </div>

        <p className="text-secondary-500 text-sm mb-4 leading-relaxed">
          {item.descripcion}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary-300">${item.precio.toFixed(2)}</span>
        </div>
      </div>
    </motion.div>
  )
})

MenuCard.displayName = 'MenuCard'

export default MenuCard