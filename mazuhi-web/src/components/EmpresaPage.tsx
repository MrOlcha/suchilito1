'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Footer from './Footer'

export default function EmpresaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 font-condiment">
            Nuestra <span className="text-primary-300">Historia</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            La historia de dos amigos y un sushi que cambió todo
          </p>
        </motion.div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              El día que todo cambió 🍣
            </h2>
            
            <div className="prose prose-lg text-gray-600 space-y-4">
              <p>
                Imagínate esto: <strong>Eduardo</strong>, un sinaloense amante del sushi auténtico, llega a Querétaro lleno de esperanza. "Aquí debe haber buen sushi", pensaba mientras entraba a un restaurante. Pero, oh sorpresa... 😅
              </p>

              <p>
                Pidió un yakimeshi creyendo que sería una explosión de sabor. En cambio, lo que llegó fue una experiencia que sus papilas gustativas querían olvidar rápidamente. Y como si eso fuera poco, el rollo de sushi que probó... ¡estaba hecho con arroz mexicano! 🤦‍♂️ 
              </p>

              <p>
                "Esto no es sushi", murmuró Eduardo con una mezcla de desencanto y dolor de estómago. Ese día fue duro. Muy duro. Todo lo que comió le cayó mal, y se pasó la noche lamentando el destino que lo había llevado a Querétaro.
              </p>

              <div className="bg-primary-50 p-6 rounded-lg border-l-4 border-primary-300 my-6">
                <p className="text-lg font-medium text-gray-800 italic">
                  "Necesita haber alguien que traiga el verdadero sushi a esta ciudad..." pensó Eduardo esa noche.
                </p>
              </div>

              <p>
                Al día siguiente, sin esperar más, Eduardo levantó el teléfono y llamó a su mejor amigo <strong>Ángel</strong>. La conversación fue breve pero poderosa:
              </p>

              <p>
                <strong>Eduardo:</strong> "¡Mijo! Ven para acá. Querétaro necesita el sushi que nosotros sabemos hacer. ¡El sushi de verdad!"
              </p>

              <p>
                Y así, con la ilusión de traer la auténtica tradición sinaloense a Querétaro, Eduardo y Ángel decidieron crear <strong>MAZUHI</strong> 🎉 – un lugar donde cada rollo, cada plato, cada bocado cuenta la historia de dos amigos que se propusieron cambiar el paladar de una ciudad.
              </p>

              <p>
                Aquí no hay sorpresas desagradables. Solo ingredientes frescos, técnicas tradicionales y mucho ❤️ en cada preparación.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
              {/* Background image covering the whole container */}
              <Image
                src="/images/angelyeduardo.png"
                alt="La pasión por el sushi"
                fill
                className="object-cover"
                priority
              />
              {/* Gradient overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 right-0 pb-6">
                <div className="text-center relative z-10">
                  <h3 className="text-2xl font-bold text-white mb-2">Nuestra Pasión</h3>
                  <p className="text-white/90">Sushi de calidad desde el corazón</p>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-4 right-4 text-4xl animate-bounce">🍣</div>
              <div className="absolute bottom-4 left-4 text-3xl animate-pulse">🌮</div>
              <div className="absolute top-1/2 left-4 text-2xl animate-bounce delay-300">✨</div>
            </div>
          </motion.div>
        </div>

        {/* Values Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Nuestros <span className="text-secondary-600">Valores</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Calidad Auténtica</h3>
              <p className="text-gray-600">
                Ingredientes frescos y técnicas tradicionales de Sinaloa para garantizar 
                el mejor sabor en cada bocado.
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">❤️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Pasión</h3>
              <p className="text-gray-600">
                Cada rollo está hecho con amor y dedicación, porque creemos que la comida 
                debe nutrir tanto el cuerpo como el alma.
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">🏠</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Comunidad</h3>
              <p className="text-gray-600">
                Somos más que un restaurante, somos familia. Queremos que cada cliente 
                se sienta como en casa.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Nuestra <span className="text-primary-300">Misión</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Ser el mejor restaurante de sushi en Querétaro, creando momentos memorables en cada mesa con sabores excepcionales, ingredientes frescos y un servicio que viene del corazón. Porque creemos que la buena comida une a las personas y crea historias que perduran.
          </p>
        </motion.div>

      </div>
    </div>
  )
}