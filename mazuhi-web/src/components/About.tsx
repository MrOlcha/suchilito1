'use client'

import { motion } from 'framer-motion'

const AboutSection = () => {
  const features = [
    {
      icon: '🍱',
      title: 'Ingredientes Frescos',
      description: 'Seleccionamos solo los mejores ingredientes del mar para garantizar calidad excepcional'
    },
    {
      icon: '👨‍🍳',
      title: 'Chefs Expertos',
      description: 'Nuestros maestros sushi tienen décadas de experiencia en la cocina japonesa tradicional'
    },
    {
      icon: '🏆',
      title: 'Técnicas Tradicionales',
      description: 'Respetamos y preservamos las técnicas ancestrales de preparación del sushi'
    },
    {
      icon: '🌟',
      title: 'Experiencia Única',
      description: 'Cada visita es una experiencia culinaria memorable en un ambiente moderno y acogedor'
    }
  ]

  return (
    <section id="empresa" className="section-padding bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold text-secondary-600 mb-6"
            >
              Somos Más Que Múltiples Servicios
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-secondary-500 mb-8 leading-relaxed"
            >
              Desde 2008, hemos sido pioneros en llevar la auténtica experiencia del sushi japonés 
              a nuestra comunidad. Combinamos tradición milenaria con innovación moderna para crear 
              momentos gastronómicos únicos e inolvidables.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-6"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="flex items-start space-x-4"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">{feature.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-secondary-600 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-secondary-500">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-10 flex flex-col sm:flex-row gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary"
              >
                Conoce Nuestra Historia
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-dark"
              >
                Ver Certificaciones
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Right Content - Chef Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="relative w-full h-96 md:h-[500px]">
              {/* Chef Image Placeholder */}
              <div className="absolute inset-0 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-3xl flex items-center justify-center">
                <div className="text-center text-secondary-600">
                  <div className="text-8xl mb-4">👨‍🍳</div>
                  <p className="text-lg font-medium">Maestro Chef Sushi</p>
                  <p className="text-sm opacity-75">Reemplazar con imagen real</p>
                </div>
              </div>
              
              {/* Floating Stats */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="absolute -top-4 -left-4 bg-white rounded-2xl p-4 shadow-lg"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-300">15+</div>
                  <div className="text-xs text-secondary-500">Años</div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 1 }}
                className="absolute -bottom-4 -right-4 bg-secondary-600 text-white rounded-2xl p-4 shadow-lg"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold">100%</div>
                  <div className="text-xs opacity-90">Fresco</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection