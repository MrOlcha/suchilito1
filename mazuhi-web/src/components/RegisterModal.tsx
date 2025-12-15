'use client';

import React, { useState } from 'react';
import { Dialog, DialogPanel, Transition } from '@headlessui/react';
import { XMarkIcon, CheckCircleIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type RegistrationStep = 'form' | 'verification' | 'success';

export default function RegisterModal({
  isOpen,
  onClose,
  onSuccess
}: RegisterModalProps) {
  const { register } = useAuth();
  const [step, setStep] = useState<RegistrationStep>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    correo: '',
    dia: '',
    mes: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Validar números para día y mes
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

    // Validar campos
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
      // Primero, registrar al cliente en la BD
      const fechaNacimiento = `${formData.dia.padStart(2, '0')}/${formData.mes.padStart(2, '0')}`;
      
      const clientResponse = await fetch('/pos/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre,
          telefono: formData.telefono,
          correo: formData.correo,
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

      // Guardar en localStorage
      await register({
        nombre: formData.nombre,
        telefono: formData.telefono,
        correo: formData.correo,
        fechaNacimiento: fechaNacimiento
      });

      // Pasar al paso de verificación
      setStep('verification');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ nombre: '', telefono: '', correo: '', dia: '', mes: '' });
      setVerificationCode('');
      setError('');
      setStep('form');
      onClose();
    }
  };

  const handleBackToForm = () => {
    setVerificationCode('');
    setError('');
    setStep('form');
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

      setStep('success');
      setTimeout(() => {
        onSuccess?.();
        handleClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al verificar código');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition show={isOpen}>
      <Dialog onClose={handleClose} className="relative z-50">
        <Transition.Child
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {step === 'success' ? (
                  // Success Message
                  <div className="text-center py-8">
                    <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      ¡Email Verificado! 🎉
                    </h3>
                    <p className="text-gray-600">
                      Te has registrado exitosamente. Ahora puedes continuar con tu pedido.
                    </p>
                  </div>
                ) : step === 'verification' ? (
                  // Verification Step
                  <>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          Verifica tu Correo
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Hemos enviado un código a {formData.correo}
                        </p>
                      </div>
                      <button
                        onClick={handleClose}
                        disabled={loading}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleVerification} className="space-y-4">
                      {/* Código */}
                      <div>
                        <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                          Código de Verificación *
                        </label>
                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-300 rounded-lg p-3">
                          <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                          <input
                            type="text"
                            id="code"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                            placeholder="Ej: ABC123"
                            maxLength={6}
                            className="flex-1 bg-transparent outline-none font-mono text-lg text-center font-semibold"
                            disabled={loading}
                            autoComplete="off"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Ingresa el código de 6 caracteres que recibiste
                        </p>
                      </div>

                      {/* Info */}
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs text-blue-700">
                          ℹ️ El código expira en 10 minutos
                        </p>
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={handleBackToForm}
                          disabled={loading}
                          className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                        >
                          Atrás
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? 'Verificando...' : 'Verificar'}
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  // Registration Form
                  <>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          Bienvenido a Mazuhi
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Regístrate para continuar con tu pedido
                        </p>
                      </div>
                      <button
                        onClick={handleClose}
                        disabled={loading}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Nombre */}
                      <div>
                        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre Completo *
                        </label>
                        <input
                          type="text"
                          id="nombre"
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleInputChange}
                          placeholder="Ej: Juan Pérez"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          disabled={loading}
                        />
                      </div>

                      {/* Teléfono */}
                      <div>
                        <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
                          Número de Teléfono *
                        </label>
                        <input
                          type="tel"
                          id="telefono"
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleInputChange}
                          placeholder="Ej: +52 123 456 7890"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          disabled={loading}
                        />
                      </div>

                      {/* Correo */}
                      <div>
                        <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-2">
                          Correo Electrónico *
                        </label>
                        <input
                          type="email"
                          id="correo"
                          name="correo"
                          value={formData.correo}
                          onChange={handleInputChange}
                          placeholder="Ej: ejemplo@gmail.com"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          disabled={loading}
                        />
                      </div>

                      {/* Fecha de Nacimiento */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fecha de Nacimiento (sin año) *
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            name="dia"
                            value={formData.dia}
                            onChange={handleInputChange}
                            placeholder="DD"
                            maxLength={2}
                            className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center"
                            disabled={loading}
                          />
                          <span className="flex items-center text-gray-500">/</span>
                          <input
                            type="text"
                            name="mes"
                            value={formData.mes}
                            onChange={handleInputChange}
                            placeholder="MM"
                            maxLength={2}
                            className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center"
                            disabled={loading}
                          />
                          <span className="text-sm text-gray-500 flex items-center">
                            Ej: 15/03
                          </span>
                        </div>
                      </div>

                      {/* Nota */}
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs text-blue-700">
                          ℹ️ Recibirás un código por correo para verificar tu cuenta
                        </p>
                      </div>

                      {/* Botones */}
                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={handleClose}
                          disabled={loading}
                          className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? 'Registrando...' : 'Registrarse'}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </DialogPanel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
