'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircleIcon, SparklesIcon, ShieldCheckIcon, GiftIcon, UserGroupIcon } from '@heroicons/react/24/outline';
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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showBenefits, setShowBenefits] = useState(false);
  
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
    
    // Teléfono: máximo 10 caracteres, solo números
    if (name === 'telefono') {
      if (value && !/^\d*$/.test(value)) return;
      if (value.length > 10) return;
    }
    
    // Contraseña: máximo 4 dígitos, solo números
    if (name === 'password' || name === 'confirmPassword') {
      if (value && !/^\d*$/.test(value)) return;
      if (value.length > 4) return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Mostrar beneficios cuando el usuario comience a escribir
    if (value.length > 0) {
      setShowBenefits(true);
    }
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
      setError('Por favor ingresa tu PIN de acceso');
      return;
    }

    if (formData.password.length !== 4) {
      setError('El PIN debe tener exactamente 4 dígitos');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Los PINs no coinciden');
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

  // Componente DatePicker personalizado
  const DatePicker = () => {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    const diasPorMes = (mes: number) => {
      if ([1, 3, 5, 7, 8, 10, 12].includes(mes)) return 31;
      if ([4, 6, 9, 11].includes(mes)) return 30;
      return 28; // Simplificado sin años bisiestos
    };

    const mesSeleccionado = formData.mes ? parseInt(formData.mes) : null;
    const diaSeleccionado = formData.dia ? parseInt(formData.dia) : null;
    const diasDisponibles = mesSeleccionado ? diasPorMes(mesSeleccionado) : 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-300 rounded-lg p-4 shadow-lg z-50"
      >
        {/* Selector de Mes */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-600 mb-2 uppercase">Mes</p>
          <div className="grid grid-cols-3 gap-2">
            {meses.map((mes, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, mes: String(idx + 1) }));
                  // Resetear día si es mayor al máximo del nuevo mes
                  const maxDias = diasPorMes(idx + 1);
                  if (diaSeleccionado && diaSeleccionado > maxDias) {
                    setFormData(prev => ({ ...prev, dia: String(maxDias) }));
                  }
                }}
                className={`py-2 px-2 rounded text-xs font-semibold transition-colors ${
                  mesSeleccionado === idx + 1
                    ? 'bg-primary-300 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {mes.substring(0, 3)}
              </button>
            ))}
          </div>
        </div>

        {/* Selector de Día */}
        {mesSeleccionado && (
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2 uppercase">Día</p>
            <div className="grid grid-cols-7 gap-1 max-h-40 overflow-y-auto">
              {Array.from({ length: diasDisponibles }, (_, i) => i + 1).map((dia) => (
                <button
                  key={dia}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, dia: String(dia) }));
                    setShowDatePicker(false);
                  }}
                  className={`py-2 px-1 rounded text-xs font-semibold transition-colors ${
                    diaSeleccionado === dia
                      ? 'bg-primary-300 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {dia}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  // Si ya está registrado, mostrar mensaje
  if (user) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        {/* Header */}
        <Header />

        {/* Contenido */}
        <div className="flex-1 flex items-center justify-center p-4 py-12 mt-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-50 rounded-2xl p-8 max-w-md w-full text-center border border-gray-200"
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

  // Componente de beneficios para desktop
  const BenefitsSection = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-4xl font-bold text-gray-900 mb-2">
          Únete a Mazuhi
        </h2>
        <p className="text-gray-500 text-lg">
          Acceso a ofertas exclusivas y experiencias especiales
        </p>
      </div>

      {/* Beneficios */}
      <div className="space-y-4">
        {[
          {
            icon: <SparklesIcon className="w-6 h-6 text-orange-500" />,
            title: 'Ofertas Exclusivas',
            desc: 'Descuentos y promociones solo para miembros'
          },
          {
            icon: <GiftIcon className="w-6 h-6 text-orange-500" />,
            title: 'Puntos por Compras',
            desc: 'Acumula puntos y canjéalos en futuros pedidos'
          },
          {
            icon: <ShieldCheckIcon className="w-6 h-6 text-orange-500" />,
            title: 'Compras Seguras',
            desc: 'Tus datos protegidos con la máxima seguridad'
          },
          {
            icon: <UserGroupIcon className="w-6 h-6 text-orange-500" />,
            title: 'Comunidad',
            desc: 'Conecta con otros amantes de Mazuhi'
          }
        ].map((benefit, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex-shrink-0 mt-1">{benefit.icon}</div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">
                {benefit.title}
              </h3>
              <p className="text-gray-600 text-sm mt-0.5">
                {benefit.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Testimonial */}
      <div className="mt-12 p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200">
        <div className="flex gap-2 mb-3">
          {[...Array(5)].map((_, i) => (
            <span key={i} className="text-lg">⭐</span>
          ))}
        </div>
        <p className="text-gray-700 italic mb-3">
          "Mazuhi es mi favorito, ¡los sabores y la calidad son incomparables!"
        </p>
        <p className="text-sm font-semibold text-gray-900">
          María López
        </p>
        <p className="text-xs text-gray-600">
          Cliente desde 2022
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <Header />

      {/* Contenido principal - Layout responsivo */}
      <div className="flex-1 mt-20">
        {/* Desktop: 2 columnas */}
        <div className="hidden lg:grid grid-cols-2 gap-12 max-w-7xl mx-auto px-8 py-12">
          {/* Sección de beneficios - Izquierda */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: showBenefits ? 1 : 0.5, x: 0 }}
            transition={{ duration: 0.6 }}
            className={showBenefits ? '' : 'pointer-events-none'}
          >
            {showBenefits ? (
              <BenefitsSection />
            ) : (
              // Placeholder cuando no hay interacción
              <div className="space-y-8 opacity-40">
                <div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-2">
                    Únete a Mazuhi
                  </h2>
                  <p className="text-gray-500 text-lg">
                    Acceso a ofertas exclusivas y experiencias especiales
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Formulario - Derecha */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col"
          >
        {step === 'success' ? (
          // Success Step
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-200"
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
            <div className="bg-white rounded-xl p-6 mb-8 text-left border border-gray-200">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {formData.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Nombre</p>
                    <p className="text-lg font-semibold text-gray-900">{formData.nombre}</p>
                  </div>
                </div>
                <div className="h-px bg-gray-200" />
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Teléfono</p>
                  <p className="text-gray-900 font-medium">{formData.telefono}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Email</p>
                  <p className="text-gray-900 font-medium">{formData.correo}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push(searchParams.get('returnUrl') || '/')}
              className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300"
            >
              Continuar a la tienda
            </button>
          </motion.div>
        ) : step === 'verification' ? (
          // Verification Step
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50 rounded-2xl p-8 border border-gray-200"
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
                  className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 transition-all"
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
            className="bg-gray-50 rounded-2xl p-8 border border-gray-200 h-fit sticky top-24"
          >
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Crear mi Cuenta
              </h2>
              <p className="text-gray-600 text-sm">
                Completa el formulario para continuar
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

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-0 transition-colors text-sm"
                  disabled={loading}
                  autoFocus
                />
              </div>

              {/* Teléfono */}
              <div>
                <label htmlFor="telefono" className="block text-sm font-semibold text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  placeholder="1234567890"
                  maxLength={10}
                  inputMode="numeric"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-300 focus:ring-0 transition-colors text-sm"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">Máximo 10 dígitos</p>
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
                  placeholder="ejemplo@gmail.com"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-0 transition-colors text-sm"
                  disabled={loading}
                />
              </div>

              {/* Contraseña */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  PIN de Acceso (4 dígitos)
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="0000"
                  maxLength={4}
                  inputMode="numeric"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-300 focus:ring-0 transition-colors text-sm tracking-widest text-center font-semibold"
                  disabled={loading}
                />
              </div>

              {/* Confirmar Contraseña */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirmar PIN
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="0000"
                  maxLength={4}
                  inputMode="numeric"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-300 focus:ring-0 transition-colors text-sm tracking-widest text-center font-semibold"
                  disabled={loading}
                />
              </div>

              {/* Fecha de Nacimiento */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fecha de Nacimiento (Día/Mes)
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-300 focus:ring-0 transition-colors text-sm text-left bg-white hover:bg-gray-50"
                  >
                    {formData.dia && formData.mes
                      ? `${formData.dia.padStart(2, '0')} / ${formData.mes.padStart(2, '0')}`
                      : 'Selecciona tu fecha de nacimiento'}
                  </button>
                  {showDatePicker && <DatePicker />}
                </div>
                {formData.dia && formData.mes && (
                  <p className="text-xs text-gray-500 mt-2">
                    ✓ Fecha seleccionada
                  </p>
                )}
              </div>

              {/* Info box */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mt-6">
                <p className="text-xs text-blue-700">
                  📧 Recibirás un código de verificación por correo
                </p>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <Link
                  href="/"
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-center text-sm"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 transition-all text-sm"
                >
                  {loading ? 'Registrando...' : 'Registrarse'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
          </motion.div>
        </div>

        {/* Mobile: Full screen */}
        <div className="lg:hidden flex flex-col px-4 py-2 pb-6">
          {step === 'success' ? (
            // Success Step Mobile
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-200 mt-6"
            >
              <div className="mb-6">
                <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Verificado!
              </h2>
              <p className="text-gray-600 mb-6 text-sm">
                Tu cuenta está lista para usar.
              </p>
              
              {/* Card con datos */}
              <div className="bg-white rounded-xl p-4 mb-6 text-left border border-gray-200">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {formData.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Nombre</p>
                      <p className="font-semibold text-gray-900 text-sm">{formData.nombre}</p>
                    </div>
                  </div>
                  <div className="h-px bg-gray-200" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Teléfono</p>
                    <p className="text-gray-900 font-medium text-sm">{formData.telefono}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Email</p>
                    <p className="text-gray-900 font-medium text-sm">{formData.correo}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => router.push(searchParams.get('returnUrl') || '/')}
                className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 text-sm"
              >
                Continuar a la tienda
              </button>
            </motion.div>
          ) : step === 'verification' ? (
            // Verification Mobile
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 rounded-2xl p-6 border border-gray-200 mt-2"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Verifica tu Correo
              </h2>
              <p className="text-gray-600 text-sm mb-6">
                Código enviado a<br/><span className="font-semibold text-gray-900">{formData.correo}</span>
              </p>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
                >
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </motion.div>
              )}

              <form onSubmit={handleVerification} className="space-y-4">
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

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                  <p className="text-blue-700 font-medium">
                    ℹ️ El código expira en 10 minutos
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('form')}
                    disabled={loading}
                    className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg font-semibold hover:bg-gray-200 disabled:opacity-50 transition-colors text-sm"
                  >
                    Atrás
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 transition-all text-sm"
                  >
                    {loading ? 'Verificando...' : 'Verificar'}
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            // Form Mobile
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 rounded-2xl p-6 border border-gray-200 mt-2"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Crear Cuenta
              </h2>
              <p className="text-gray-600 text-sm mb-6">
                Completa el formulario
              </p>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
                >
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nombre */}
                <div>
                  <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    placeholder="Juan Pérez"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-0 transition-colors text-sm"
                    disabled={loading}
                    autoFocus
                  />
                </div>

                {/* Teléfono */}
                <div>
                  <label htmlFor="telefono" className="block text-sm font-semibold text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    placeholder="1234567890"
                    maxLength={10}
                    inputMode="numeric"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-300 focus:ring-0 transition-colors text-sm"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">Máximo 10 dígitos</p>
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
                    placeholder="ejemplo@gmail.com"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-0 transition-colors text-sm"
                    disabled={loading}
                  />
                </div>

                {/* Contraseña */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    PIN (4 dígitos)
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="0000"
                    maxLength={4}
                    inputMode="numeric"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-300 focus:ring-0 transition-colors text-sm tracking-widest text-center font-semibold"
                    disabled={loading}
                  />
                </div>

                {/* Confirmar Contraseña */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirmar PIN
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="0000"
                    maxLength={4}
                    inputMode="numeric"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-300 focus:ring-0 transition-colors text-sm tracking-widest text-center font-semibold"
                    disabled={loading}
                  />
                </div>

                {/* Fecha de Nacimiento */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Fecha de Nacimiento
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowDatePicker(!showDatePicker)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-300 focus:ring-0 transition-colors text-sm text-left bg-white hover:bg-gray-50"
                    >
                      {formData.dia && formData.mes
                        ? `${formData.dia.padStart(2, '0')} / ${formData.mes.padStart(2, '0')}`
                        : 'Selecciona tu fecha'}
                    </button>
                    {showDatePicker && <DatePicker />}
                  </div>
                </div>

                {/* Info */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
                  <p className="text-blue-700">
                    📧 Recibirás un código por correo
                  </p>
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-2">
                  <Link
                    href="/"
                    className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-center text-sm"
                  >
                    Cancelar
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 transition-all text-sm"
                  >
                    {loading ? 'Registrando...' : 'Registrarse'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
