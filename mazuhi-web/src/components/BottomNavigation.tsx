'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
  HomeIcon,
  ShoppingCartIcon,
  MapPinIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeIconSolid,
  ShoppingCartIcon as ShoppingCartIconSolid,
  MapPinIcon as MapPinIconSolid,
  BuildingOfficeIcon as BuildingOfficeIconSolid
} from '@heroicons/react/24/solid'
import { useCart } from '@/contexts/CartContext'

const BottomNavigation = () => {
  const pathname = usePathname()
  const { cart } = useCart()

  // No mostrar navegación en la página /rest
  if (pathname === '/rest') {
    return null
  }

  const navItems = [
    {
      name: 'INICIO',
      href: '/',
      icon: HomeIcon,
      iconSolid: HomeIconSolid,
    },
    {
      name: 'MENÚ',
      href: '/menu',
      icon: 'custom-menu',
      iconSolid: 'custom-menu',
    },
    {
      name: 'CARRITO',
      href: '/cart',
      icon: ShoppingCartIcon,
      iconSolid: ShoppingCartIconSolid,
      isCenter: true,
    },
    {
      name: 'UBICACIÓN',
      href: '/ubicacion',
      icon: MapPinIcon,
      iconSolid: MapPinIconSolid,
    },
    {
      name: 'HISTORIA',
      href: '/historia',
      icon: BuildingOfficeIcon,
      iconSolid: BuildingOfficeIconSolid,
    },
  ]

  const totalItems = cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0)

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-lg z-50 md:hidden"
    >
      <div className="flex items-center justify-around py-2 px-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`relative flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
                item.isCenter ? 'mx-2' : ''
              }`}
            >
              {item.isCenter ? (
                // Centro - Carrito especial
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 via-secondary-600 to-indigo-600 text-white'
                      : 'bg-gradient-to-r from-blue-400 via-secondary-500 to-indigo-500 text-white'
                  }`}
                >
                  <ShoppingCartIcon className="w-7 h-7" />
                  {totalItems > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg"
                    >
                      {totalItems > 99 ? '99+' : totalItems}
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                // Elementos laterales - Solo iconos
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center"
                >
                  <div
                    className={`p-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-50 text-secondary-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {(() => {
                      if (item.icon === 'custom-menu') {
                        return (
                          <div className="relative w-6 h-6">
                            <Image
                              src="/images/menu.svg"
                              alt="Menú"
                              width={24}
                              height={24}
                              className={`w-6 h-6 transition-all duration-200 ${
                                isActive
                                  ? 'brightness-0 saturate-100'
                                  : 'brightness-0 saturate-100 opacity-60'
                              }`}
                              style={{
                                filter: isActive 
                                  ? 'invert(29%) sepia(96%) saturate(1582%) hue-rotate(208deg) brightness(97%) contrast(93%)' // Color secondary-600
                                  : 'invert(55%) sepia(8%) saturate(9%) hue-rotate(316deg) brightness(95%) contrast(86%)' // Color gray-500
                              }}
                            />
                          </div>
                        );
                      } else {
                        const Icon = isActive ? item.iconSolid : item.icon;
                        return <Icon className="w-6 h-6" />;
                      }
                    })()}
                  </div>
                </motion.div>
              )}
            </Link>
          )
        })}
      </div>
    </motion.nav>
  )
}

export default BottomNavigation