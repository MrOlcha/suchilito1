'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { EnvelopeIcon, KeyIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

type Step = 'email' | 'code' | 'success'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/pos/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: email })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al enviar código')
      }

      setStep('code')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar código')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/pos/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          correo: email,
          codigo: code,
          newPassword 
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al cambiar contraseña')
      }

      setStep('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar contraseña')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <Header />

      <div className="pt-24 pb-16">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            {step === 'success' ? (
              // Success Step
              <div className="p-8 text-center">
                <CheckCircleIcon className="h-20 w-20 text-green-500 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  ¡Contraseña Actualizada!
                </h2>
                <p className="text-gray-600 mb-8">
                  Tu contraseña ha sido cambiada exitosamente.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-primary-300 to-secondary-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Iniciar Sesión
                </Link>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-300 to-secondary-600 px-8 py-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <KeyIcon className="h-10 w-10 text-primary-300" />
                  </motion.div>
                  <h1 className="text-2xl font-bold text-white mb-2">
                    {step === 'email' ? 'Recuperar Contraseña' : 'Nueva Contraseña'}
                  </h1>
                  <p className="text-white/90">
                    {step === 'email' 
                      ? 'Te enviaremos un código a tu correo'
                      : 'Ingresa el código y tu nueva contraseña'}
                  </p>
                </div>

                {/* Form */}
                <div className="px-8 py-8">
                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600 font-medium">{error}</p>
                    </div>
                  )}

                  {step === 'email' ? (
                    <form onSubmit={handleSendCode} className="space-y-6">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          Correo Electrónico
                        </label>
                        <div className="relative">
                          <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all duration-200"
                            placeholder="tu@email.com"
                          />
                          <EnvelopeIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-primary-300 to-secondary-600 hover:from-primary-400 hover:to-secondary-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-200 disabled:opacity-50"
                      >
                        {isLoading ? 'Enviando...' : 'Enviar Código'}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                      <div>
                        <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                          Código de Verificación
                        </label>
                        <input
                          id="code"
                          type="text"
                          value={code}
                          onChange={(e) => setCode(e.target.value.toUpperCase())}
                          maxLength={6}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all duration-200 text-center font-mono text-lg font-semibold tracking-widest"
                          placeholder="ABC123"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Revisa tu correo e ingresa el código de 6 caracteres
                        </p>
                      </div>

                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                          Nueva Contraseña
                        </label>
                        <input
                          id="newPassword"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all duration-200"
                          placeholder="Mínimo 6 caracteres"
                        />
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                          Confirmar Contraseña
                        </label>
                        <input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all duration-200"
                          placeholder="Repite tu contraseña"
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setStep('email')}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                        >
                          Atrás
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="flex-1 bg-gradient-to-r from-primary-300 to-secondary-600 hover:from-primary-400 hover:to-secondary-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-200 disabled:opacity-50"
                        >
                          {isLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Back to login */}
                  <div className="mt-6 text-center">
                    <Link
                      href="/login"
                      className="text-sm text-gray-600 hover:text-primary-300 transition-colors"
                    >
                      ← Volver a Iniciar Sesión
                    </Link>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
