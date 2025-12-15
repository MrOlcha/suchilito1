'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

const Hero = () => {
  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 to-white">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary-100 rounded-full opacity-50 animate-float"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-primary-50 rounded-full opacity-30 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gray-100 rounded-full opacity-40 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-secondary-600 leading-tight font-condiment"
            >
              El Auténtico{' '}
              <span className="text-primary-300 relative">
                Sushi
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1, delay: 1 }}
                  className="absolute bottom-2 left-0 h-3 bg-primary-100 -z-10"
                ></motion.div>
              </span>{' '}
              Sinaloense
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-6 text-lg md:text-xl text-secondary-500 max-w-2xl mx-auto lg:mx-0"
            >
              Directamente desde Mazatlán hasta tu mesa. Fusionamos la tradición japonesa con el sabor 
              único de Sinaloa. Cada rollo lleva el sazón que nos identifica como Sinaloenses.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link href="/menu">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary text-lg px-8 py-4 hidden sm:block"
                >
                  🍣 Ver Menú
                </motion.button>
              </Link>

              {/* Botón móvil especial */}
              <Link href="/menu" className="sm:hidden">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mx-auto max-w-xs bg-gradient-to-r from-blue-500 via-secondary-600 to-indigo-600 hover:from-blue-600 hover:via-secondary-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-full shadow-lg transform transition-all duration-300 relative overflow-hidden group"
                >
                  {/* Efectos de fondo para móvil */}
                  <div className="absolute inset-0 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 opacity-0 group-active:opacity-100 transition-opacity duration-200"></div>
                  
                  {/* Contenido del botón móvil */}
                  <div className="relative z-10 flex items-center justify-center">
                    <span className="text-lg font-extrabold tracking-wide">Ordenar en Línea</span>
                  </div>
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative w-full h-96 md:h-[500px] lg:h-[600px]"
          >
            <Image
              src="/images/gabo.png"
              alt="Delicioso sushi premium estilo Sinaloa"
              fill
              className="object-contain rounded-2xl"
              priority
            />
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center"
        >
          <div className="w-1 h-3 bg-gray-300 rounded-full mt-2"></div>
        </motion.div>
      </motion.div>
    </section>
  )
}

export default Hero