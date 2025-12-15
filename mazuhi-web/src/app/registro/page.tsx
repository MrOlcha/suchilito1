'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import Header from '@/components/Header';
import Link from 'next/link';

type RegistrationStep = 'form' | 'verification' | 'success';

export default function RegistroPage() {
  const router = useRouter();
  const searchParamsObj = useSearchParams();
  const { register, user } = useAuth();
  const { addToCart } = useCart();
  
  const searchParams = searchParamsObj as any;
  
  const [step, setStep] = useState<RegistrationStep>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    correo: '',
    password: '',
    confirmPassword: '',
    dia: '',
    mes: ''
  });

  // Si ya hay usuario logueado, redirigir a home
  useEffect(() => {
    if (user) {
      // Agregar producto pendiente si existe
      try {
        const pendingData = sessionStorage.getItem('pendingCartItem');
        if (pendingData) {
          const { product, configurations } = JSON.parse(pendingData);
          configurations.forEach((config: any) => {
            addToCart(product, config);
          });
          sessionStorage.removeItem('pendingCartItem');
        }
      } catch (err) {
        console.error('Error adding pending cart item:', err);
      }

      // Esperar 1 segundo antes de redirigir para que vea el mensaje
      const timer = setTimeout(() => {
        const returnUrl = searchParams.get('returnUrl') || '/';
        router.push(returnUrl);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, router, searchParams, addToCart]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'dia' || name === 'mes') {
      if (value && !/^\d+$/.test(value)) return;
      if (name === 'dia' && value && (parseInt(value) > 31 || parseInt(value) < 1)) return;
      if (name === 'mes' && value && (parseInt(value) > 12 || parseInt(value) < 1)) return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.nombre.trim()) {
      setError('Por favor ingresa tu nombre');
      return;
    }

    if (!formData.telefono.trim()) {
      setError('Por favor ingresa tu número de teléfono');
      return;
    }

    if (!formData.correo.trim()) {
      setError('Por favor ingresa tu correo');
      return;
    }

    if (!formData.correo.includes('@')) {
      setError('Por favor ingresa un correo válido');
      return;
    }

    if (!formData.password.trim()) {
      setError('Por favor ingresa una contraseña');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!formData.dia || !formData.mes) {
      setError('Por favor completa tu fecha de nacimiento');
      return;
    }

    const diaNum = parseInt(formData.dia);
    const mesNum = parseInt(formData.mes);

    if (diaNum < 1 || diaNum > 31) {
      setError('Día inválido (debe estar entre 1 y 31)');
      return;
    }

    if (mesNum < 1 || mesNum > 12) {
      setError('Mes inválido (debe estar entre 1 y 12)');
      return;
    }

    setLoading(true);
    try {
      const fechaNacimiento = `${formData.dia.padStart(2, '0')}/${formData.mes.padStart(2, '0')}`;
      
      // Registrar cliente
      const clientResponse = await fetch('/pos/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre,
          telefono: formData.telefono,
          correo: formData.correo,
          password: formData.password,
          fecha_nacimiento: fechaNacimiento
        })
      });

      if (!clientResponse.ok) {
        const data = await clientResponse.json();
        throw new Error(data.message || 'Error al registrar cliente');
      }

      // Enviar código de verificación
      const verifyResponse = await fetch('/pos/api/clientes/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo: formData.correo,
          nombre: formData.nombre
        })
      });

      if (!verifyResponse.ok) {
        const data = await verifyResponse.json();
        throw new Error(data.message || 'Error al enviar código de verificación');
      }

      // NO guardar en localStorage hasta verificar
      // await register({...}) - Se movió a handleVerification

      setStep('verification');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!verificationCode.trim()) {
      setError('Por favor ingresa el código de verificación');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/pos/api/clientes/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo: formData.correo,
          codigo: verificationCode
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Código inválido');
      }

      // AHORA SÍ guardar en localStorage después de verificar
      const fechaNacimiento = `${formData.dia.padStart(2, '0')}/${formData.mes.padStart(2, '0')}`;
      await register({
        nombre: formData.nombre,
        telefono: formData.telefono,
        correo: formData.correo,
        fechaNacimiento: fechaNacimiento,
        email_verificado: 1
      });

      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al verificar código');
    } finally {
      setLoading(false);
    }
  };

  // Si ya está registrado, mostrar mensaje
  if (user) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        {/* Header */}
        <Header />

        {/* Contenido */}
        <div className="flex-1 flex items-center justify-center p-4 py-12 mt-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
          >
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Ya estás registrado!
            </h2>
            <p className="text-gray-600 mb-6">
              Bienvenido {user.nombre}. Te redirigimos al inicio...
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce delay-200" />
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Contenido principal */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 mt-20">
        {step === 'success' ? (
          // Success Step
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8 text-center"
          >
            <div className="mb-6">
              <CheckCircleIcon className="h-20 w-20 text-green-500 mx-auto" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              ¡Verificado Exitosamente!
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Tu cuenta está completamente verificada y lista para usar.
            </p>
            
            {/* Card con datos */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 mb-8 text-left">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                    {formData.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 font-medium">Nombre</p>
                    <p className="text-lg font-semibold text-gray-900">{formData.nombre}</p>
                  </div>
                </div>
                <div className="h-px bg-gray-200" />
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Teléfono</p>
                  <p className="text-gray-900 font-medium">{formData.telefono}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Email</p>
                  <p className="text-gray-900 font-medium">{formData.correo}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push(searchParams.get('returnUrl') || '/')}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Continuar a la tienda
            </button>
          </motion.div>
        ) : step === 'verification' ? (
          // Verification Step
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Verifica tu Correo
              </h2>
              <p className="text-gray-600">
                Enviamos un código a <span className="font-semibold text-gray-900">{formData.correo}</span>
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleVerification} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Código de Verificación
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  maxLength={6}
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 font-mono text-lg text-center font-semibold tracking-widest"
                  disabled={loading}
                  autoComplete="off"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2">
                  Ingresa el código de 6 caracteres que recibiste por email
                </p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700 font-medium">
                  ℹ️ El código expira en 10 minutos
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  disabled={loading}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg font-semibold hover:bg-gray-200 disabled:opacity-50 transition-colors"
                >
                  Atrás
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 transition-all"
                >
                  {loading ? 'Verificando...' : 'Verificar'}
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          // Form Step
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Crear mi Cuenta
              </h2>
              <p className="text-gray-600">
                Regístrate para continuar con tu orden
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nombre */}
              <div>
                <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Juan Pérez"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-0 transition-colors"
                  disabled={loading}
                  autoFocus
                />
              </div>

              {/* Teléfono */}
              <div>
                <label htmlFor="telefono" className="block text-sm font-semibold text-gray-700 mb-2">
                  Número de Teléfono
                </label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  placeholder="+52 123 456 7890"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-0 transition-colors"
                  disabled={loading}
                />
              </div>

              {/* Correo */}
              <div>
                <label htmlFor="correo" className="block text-sm font-semibold text-gray-700 mb-2">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  id="correo"
                  name="correo"
                  value={formData.correo}
                  onChange={handleInputChange}
                  placeholder="ejemplo@gmail.com"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-0 transition-colors"
                  disabled={loading}
                />
              </div>

              {/* Contraseña */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-0 transition-colors"
                  disabled={loading}
                />
              </div>

              {/* Confirmar Contraseña */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Repite tu contraseña"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-0 transition-colors"
                  disabled={loading}
                />
              </div>

              {/* Fecha de Nacimiento */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fecha de Nacimiento (DD/MM)
                </label>
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <input
                      type="text"
                      name="dia"
                      value={formData.dia}
                      onChange={handleInputChange}
                      placeholder="DD"
                      maxLength={2}
                      className="w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-0 text-center font-semibold transition-colors"
                      disabled={loading}
                    />
                  </div>
                  <span className="text-gray-400 font-semibold pb-3">/</span>
                  <div className="flex-1">
                    <input
                      type="text"
                      name="mes"
                      value={formData.mes}
                      onChange={handleInputChange}
                      placeholder="MM"
                      maxLength={2}
                      className="w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-0 text-center font-semibold transition-colors"
                      disabled={loading}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Ej: 15/03</p>
              </div>

              {/* Info box */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  📧 Recibirás un código de verificación por correo
                </p>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <Link
                  href="/"
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-center"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 transition-all"
                >
                  {loading ? 'Registrando...' : 'Registrarse'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
