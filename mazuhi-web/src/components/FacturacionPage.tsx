'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { DocumentTextIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

export default function FacturacionPage() {
  const [formData, setFormData] = useState({
    folio: '',
    importe: '',
    razonSocial: '',
    rfc: '',
    cp: '',
    regimenFiscal: 'General de Ley Personas Morales',
    usoCFDI: 'Gastos en General',
    correo: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simular envío de factura
    setTimeout(() => {
      setIsSubmitting(false)
      setShowSuccess(true)
      
      // Resetear formulario después de 3 segundos
      setTimeout(() => {
        setShowSuccess(false)
        setFormData({
          folio: '',
          importe: '',
          razonSocial: '',
          rfc: '',
          cp: '',
          regimenFiscal: 'General de Ley Personas Morales',
          usoCFDI: 'Gastos en General',
          correo: ''
        })
      }, 3000)
    }, 2000)
  }

  const handleBuscarFactura = () => {
    // Implementar búsqueda de factura
    alert('Funcionalidad de búsqueda en desarrollo')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-4">
            <DocumentTextIcon className="w-16 h-16 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Facturación Electrónica
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Genera tu factura proporcionando los datos de tu ticket de compra
          </p>
        </motion.div>

        {/* Success Message */}
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6"
          >
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-green-900">¡Factura generada exitosamente!</h3>
                <p className="text-green-700">Se ha enviado a tu correo electrónico</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Folio e Importe */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="folio" className="block text-sm font-semibold text-gray-700 mb-2">
                  Folio
                </label>
                <p className="text-xs text-gray-500 mb-2">Ubicado en la parte inferior del ticket</p>
                <input
                  type="text"
                  id="folio"
                  name="folio"
                  value={formData.folio}
                  onChange={handleInputChange}
                  required
                  placeholder="Ej: A12345"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label htmlFor="importe" className="block text-sm font-semibold text-gray-700 mb-2">
                  Importe
                </label>
                <input
                  type="number"
                  id="importe"
                  name="importe"
                  value={formData.importe}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Razón Social */}
            <div>
              <label htmlFor="razonSocial" className="block text-sm font-semibold text-gray-700 mb-2">
                Razón Social Receptor
              </label>
              <input
                type="text"
                id="razonSocial"
                name="razonSocial"
                value={formData.razonSocial}
                onChange={handleInputChange}
                required
                placeholder="Nombre o razón social"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* RFC y CP */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="rfc" className="block text-sm font-semibold text-gray-700 mb-2">
                  RFC Receptor
                </label>
                <input
                  type="text"
                  id="rfc"
                  name="rfc"
                  value={formData.rfc}
                  onChange={handleInputChange}
                  required
                  placeholder="XAXX010101000"
                  maxLength={13}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all uppercase"
                />
              </div>

              <div>
                <label htmlFor="cp" className="block text-sm font-semibold text-gray-700 mb-2">
                  CP Receptor
                </label>
                <input
                  type="text"
                  id="cp"
                  name="cp"
                  value={formData.cp}
                  onChange={handleInputChange}
                  required
                  placeholder="76000"
                  maxLength={5}
                  pattern="[0-9]{5}"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Régimen Fiscal */}
            <div>
              <label htmlFor="regimenFiscal" className="block text-sm font-semibold text-gray-700 mb-2">
                Régimen Fiscal Receptor
              </label>
              <select
                id="regimenFiscal"
                name="regimenFiscal"
                value={formData.regimenFiscal}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
              >
                <option value="General de Ley Personas Morales">General de Ley Personas Morales</option>
                <option value="Personas Morales con Fines no Lucrativos">Personas Morales con Fines no Lucrativos</option>
                <option value="Sueldos y Salarios e Ingresos Asimilados a Salarios">Sueldos y Salarios e Ingresos Asimilados a Salarios</option>
                <option value="Arrendamiento">Arrendamiento</option>
                <option value="Actividades Empresariales y Profesionales">Actividades Empresariales y Profesionales</option>
                <option value="Régimen Simplificado de Confianza">Régimen Simplificado de Confianza</option>
              </select>
            </div>

            {/* Uso CFDI */}
            <div>
              <label htmlFor="usoCFDI" className="block text-sm font-semibold text-gray-700 mb-2">
                Uso CFDI
              </label>
              <select
                id="usoCFDI"
                name="usoCFDI"
                value={formData.usoCFDI}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
              >
                <option value="Gastos en General">Gastos en General</option>
                <option value="Adquisición de Mercancías">Adquisición de Mercancías</option>
                <option value="Honorarios Médicos">Honorarios Médicos</option>
                <option value="Gastos Médicos por Incapacidad">Gastos Médicos por Incapacidad</option>
                <option value="Por Definir">Por Definir</option>
              </select>
            </div>

            {/* Correo */}
            <div>
              <label htmlFor="correo" className="block text-sm font-semibold text-gray-700 mb-2">
                Correo
              </label>
              <input
                type="email"
                id="correo"
                name="correo"
                value={formData.correo}
                onChange={handleInputChange}
                required
                placeholder="correo@ejemplo.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Generando...' : 'Generar Factura'}
              </button>

              <button
                type="button"
                onClick={handleBuscarFactura}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl"
              >
                Buscar Factura
              </button>
            </div>
          </form>
        </motion.div>

        {/* Info adicional */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6"
        >
          <h3 className="font-semibold text-blue-900 mb-3">Información importante:</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• La factura se enviará al correo electrónico proporcionado</li>
            <li>• Asegúrate de que los datos sean correctos antes de generar la factura</li>
            <li>• El folio se encuentra en la parte inferior de tu ticket de compra</li>
            <li>• La factura se generará en formato PDF y XML</li>
          </ul>
        </motion.div>

      </div>
    </div>
  )
}
