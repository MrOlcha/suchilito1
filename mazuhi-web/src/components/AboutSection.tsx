'use client'

import { motion } from 'framer-motion'

const AboutSection = () => {
  const features = [
    {
      icon: '🍽️',
      title: 'Chefs Expertos',
      description: 'Nuestros maestros sushimen tienen más de 15 años de experiencia en la auténtica cocina japonesa.'
    },
    {
      icon: '🐟',
      title: 'Ingredientes Frescos',
      description: 'Importamos los mejores pescados y mariscos directamente desde los mercados de Japón.'
    },
    {
      icon: '🏆',
      title: 'Calidad Premium',
      description: 'Cada pieza es preparada con técnicas tradicionales y los más altos estándares de calidad.'
    },
    {
      icon: '⚡',
      title: 'Servicio Rápido',
      description: 'Preparamos tu pedido con rapidez sin comprometer la calidad y frescura de nuestros platillos.'
    }
  ]

  return (
    <section id="empresa" className="section-padding bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Somos Más Que{' '}
              <span className="text-primary-300">Múltiples Servicios</span>
            </h2>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              En nuestro restaurante, no solo servimos sushi excepcional. Ofrecemos una experiencia 
              culinaria completa que combina tradición japonesa con innovación moderna, creando 
              momentos inolvidables para nuestros clientes.
            </p>

            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                  className="p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <div className="text-3xl mb-3">{feature.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary"
            >
              Conoce Más Sobre Nosotros
            </motion.button>
          </motion.div>

          {/* Image/Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Main Image Container */}
            <div className="relative h-96 md:h-[500px] bg-gradient-to-br from-primary-100 to-primary-200 rounded-3xl overflow-hidden">
              {/* Placeholder content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-primary-300">
                  <div className="text-8xl mb-4">👨‍🍳</div>
                  <p className="text-lg font-medium">Chef Preparando Sushi</p>
                  <p className="text-sm opacity-75">Imagen del equipo/restaurante</p>
                </div>
              </div>

              {/* Decorative Elements */}
              <motion.div
                animate={{ rotate: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute top-8 right-8 w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center"
              >
                <span className="text-2xl">🥋</span>
              </motion.div>

              <motion.div
                animate={{ rotate: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                className="absolute bottom-8 left-8 w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center"
              >
                <span className="text-2xl">🍜</span>
              </motion.div>
            </div>

            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              viewport={{ once: true }}
              className="absolute -bottom-8 -left-8 bg-white rounded-2xl shadow-xl p-6 border border-gray-100"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-300 mb-1">15+</div>
                <div className="text-sm text-gray-600">Años de Experiencia</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
              viewport={{ once: true }}
              className="absolute -top-8 -right-8 bg-white rounded-2xl shadow-xl p-6 border border-gray-100"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-300 mb-1">98%</div>
                <div className="text-sm text-gray-600">Satisfacción</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection