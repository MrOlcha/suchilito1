'use client'

import { motion } from 'framer-motion'

const Locations = () => {
  const locations = [
    {
      id: 1,
      name: 'Sucursal Centro',
      address: 'Av. Principal 123, Centro Histórico',
      phone: '+52 55 1234 5678',
      hours: 'Lun - Dom: 12:00 PM - 10:00 PM',
      image: '🏢',
      features: ['Valet Parking', 'Terraza', 'Eventos Privados']
    },
    {
      id: 2,
      name: 'Sucursal Polanco',
      address: 'Av. Masaryk 456, Polanco',
      phone: '+52 55 8765 4321',
      hours: 'Lun - Dom: 1:00 PM - 11:00 PM',
      image: '🌆',
      features: ['Vista Panorámica', 'Bar de Sake', 'Chef Privado']
    },
    {
      id: 3,
      name: 'Sucursal Santa Fe',
      address: 'Centro Comercial Santa Fe, Local 234',
      phone: '+52 55 9876 5432',
      hours: 'Lun - Dom: 11:00 AM - 10:00 PM',
      image: '🏬',
      features: ['Food Court', 'Takeaway', 'Delivery Express']
    }
  ]

  return (
    <section id="sucursales" className="section-padding bg-white">
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
            Nuestras Sucursales
          </h2>
          <div className="w-24 h-1 bg-primary-300 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Visítanos en cualquiera de nuestras ubicaciones estratégicas en la ciudad. 
            Cada sucursal ofrece la misma calidad excepcional con su ambiente único.
          </p>
        </motion.div>

        {/* Locations Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {locations.map((location, index) => (
            <motion.div
              key={location.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ 
                y: -10, 
                transition: { duration: 0.3 } 
              }}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100"
            >
              {/* Header */}
              <div className="relative h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center group-hover:from-primary-200 group-hover:to-primary-300 transition-all duration-300">
                <div className="text-8xl transform group-hover:scale-110 transition-transform duration-300">
                  {location.image}
                </div>
                {/* Floating badge */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-primary-300">
                  📍 Ubicación
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-300 transition-colors duration-300">
                  {location.name}
                </h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-start space-x-3">
                    <span className="text-primary-300 mt-1">📍</span>
                    <p className="text-gray-600 text-sm">{location.address}</p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className="text-primary-300">📞</span>
                    <p className="text-gray-600 text-sm">{location.phone}</p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className="text-primary-300">⏰</span>
                    <p className="text-gray-600 text-sm">{location.hours}</p>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Características:</h4>
                  <div className="flex flex-wrap gap-2">
                    {location.features.map((feature, idx) => (
                      <span
                        key={idx}
                        className="bg-primary-50 text-primary-300 px-2 py-1 rounded-full text-xs font-medium"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 bg-primary-300 hover:bg-primary-400 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300"
                  >
                    Ver Mapa
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300"
                  >
                    Llamar
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 text-center bg-gradient-to-r from-primary-50 to-primary-100 rounded-3xl p-8 md:p-12"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            ¿No Puedes Visitarnos?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Disfruta de nuestro delicioso sushi en la comodidad de tu hogar. 
            Ofrecemos servicio de delivery a toda la ciudad.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary text-lg px-8 py-4"
          >
            🚚 Pedir a Domicilio
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}

export default Locations