'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCartIcon, SparklesIcon, UserIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const { user, logout, isLoading } = useAuth()


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { name: 'Inicio', href: '/' },
    { name: 'Menú', href: '/menu' },
    { name: 'Ubicación', href: '/ubicacion' },
    { name: 'Historia', href: '/historia' },
  ]

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`md:fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-lg shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between md:justify-between items-center h-16 md:h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex-shrink-0 md:flex-shrink-0 mx-auto md:mx-0"
          >
            <div className="flex items-center space-x-2">
              {/* Logo para desktop */}
              <Image 
                src="/images/logo.svg" 
                alt="Mazuhi Sushi Logo" 
                width={120} 
                height={40}
                className="h-10 w-auto hidden md:block"
              />
              {/* Logo para móvil - más grande y centrado */}
              <Image 
                src="/images/iconologo.svg" 
                alt="Mazuhi Sushi Logo" 
                width={60} 
                height={60}
                className="h-12 w-auto md:hidden"
              />
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Link
                    href={item.href}
                    className="text-gray-700 hover:text-primary-300 px-3 py-2 font-medium transition-colors duration-300 relative group font-condiment"
                    style={{ fontSize: '1.2rem' }}
                  >
                    {item.name}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-300 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA Buttons / User Status */}
          <div className="hidden md:flex items-center space-x-3">
            {!isLoading && user ? (
              // Usuario logeado
              <>
                <div className="flex items-center space-x-3 bg-green-50 px-4 py-3 rounded-lg border border-green-200">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {user.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-green-700">
                      {user.nombre}
                    </span>
                    {user.email_verificado === 0 && (
                      <span className="text-xs text-orange-600 font-medium">
                        ⚠️ Email no verificado
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200 text-sm"
                >
                  <span>Cerrar Sesión</span>
                </button>
              </>
            ) : (
              // Usuario no logeado
              <>
                <Link href="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 bg-primary-300 hover:bg-primary-400 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-200"
                  >
                    <UserIcon className="h-4 w-4" />
                    <span className="text-sm">Iniciar Sesión</span>
                  </motion.button>
                </Link>
                <Link href="/facturacion">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-200"
                  >
                    <span className="text-sm">Facturación</span>
                  </motion.button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </motion.header>
  )
}

export default Header