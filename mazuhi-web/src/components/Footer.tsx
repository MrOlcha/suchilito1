'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerSections = [
    {
      title: 'Navegación',
      links: [
        { name: 'Inicio', href: '#inicio' },
        { name: 'Menú', href: '#menu' },
        { name: 'Ubicación', href: '/ubicacion' },
        { name: 'Historia', href: '/historia' },
      ]
    },
    {
      title: 'Servicios',
      links: [
        { name: 'Delivery', href: '#' },
        { name: 'Reservaciones', href: '#' },
        { name: 'Eventos Privados', href: '#' },
        { name: 'Catering', href: '#' },
      ]
    },
    {
      title: 'Contacto',
      links: [
        { name: 'MAZUHI SUSHI - Ciudad del Sol', href: '#' },
        { name: 'Valle Puerta del Sol 597, Valle de Santiago', href: '#' },
        { name: 'Santiago de Querétaro, Querétaro 76116', href: '#' },
        { name: '442 599 66 33', href: 'tel:+524425996633' },
      ]
    }
  ]

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Brand Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="lg:col-span-1"
            >
              <div className="mb-6">
                <div className="mb-4">
                  <Image 
                    src="/images/logolight.svg" 
                    alt="Mazuhi Sushi Logo" 
                    width={150} 
                    height={50}
                    className="h-12 w-auto"
                  />
                </div>
                <p className="text-gray-400 leading-relaxed">
                  Auténtica fusión sinaloense-oriental con los mariscos más frescos 
                  y sabores únicos de Sinaloa combinados con técnicas orientales.
                </p>
              </div>
            </motion.div>

            {/* Footer Links */}
            {footerSections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="text-lg font-semibold text-white mb-4">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="text-gray-400 hover:text-primary-300 transition-colors duration-300 text-sm"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Bottom Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="border-t border-gray-800 pt-8"
          >
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex flex-col items-center md:items-start space-y-2">
                <p className="text-gray-400 text-sm">
                  © {currentYear} Mazuhi Sushi. Todos los derechos reservados.
                </p>
                <p className="text-gray-500 text-xs">
                  WPA Desarrollada por{' '}
                  <a 
                    href="https://olcha.mx" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary-400 hover:text-primary-300 transition-colors duration-300 font-medium"
                  >
                    Olcha Technologies
                  </a>
                </p>
              </div>
              <div className="flex space-x-6 text-sm">
                <a href="#" className="text-gray-400 hover:text-primary-300 transition-colors duration-300">
                  Política de Privacidad
                </a>
                <a href="#" className="text-gray-400 hover:text-primary-300 transition-colors duration-300">
                  Términos de Servicio
                </a>
                <a href="#" className="text-gray-400 hover:text-primary-300 transition-colors duration-300">
                  Cookies
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  )
}

export default Footer