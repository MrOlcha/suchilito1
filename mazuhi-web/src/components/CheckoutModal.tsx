
'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react';
import { 
  XMarkIcon, 
  CheckIcon, 
  TruckIcon, 
  BuildingStorefrontIcon,
  CreditCardIcon,
  BanknotesIcon,
  PhoneIcon,
  UserIcon,
  MapPinIcon,
  ClockIcon,
  ChevronRightIcon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline';
import { CheckoutData, CheckoutStep, CASH_DENOMINATIONS, ValidationErrors } from '@/types/checkout';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { generateOrderNumber, sendOrderToTelegram, sendWaiterNotification } from '@/utils/telegram';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: CheckoutData) => void;
}

export default function CheckoutModal({ isOpen, onClose, onComplete }: CheckoutModalProps) {
  const { cart } = useCart();
  const { user, isLoading } = useAuth();
  
  // El estado debe ser reactivo basado en si hay usuario o no
  const [currentStep, setCurrentStep] = useState(0);
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    contact: { name: '', phone: '' },
    delivery: { type: 'pickup' },
    payment: { method: 'cash' },
    notes: ''
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Cuando se abre el modal, verificar si hay usuario y configurar el paso inicial
  useEffect(() => {
    if (isOpen && !isLoading) {
      console.log('🔍 CheckoutModal abierto - Estado del usuario:', {
        user: user ? { telefono: user.telefono, correo: user.correo } : null,
        isLoading,
        currentStep
      });
      
      if (user) {
        // Usuario registrado: empezar en paso 0 (delivery)
        console.log('✅ Usuario detectado - Saltando paso de contacto');
        setCurrentStep(0);
        setCheckoutData((prev) => ({
          ...prev,
          contact: {
            name: `${user.telefono}`,
            phone: user.telefono,
            email: user.correo
          }
        }));
      } else {
        // No hay usuario: empezar en paso 0 (contacto)
        console.log('❌ Sin usuario - Mostrar paso de contacto');
        setCurrentStep(0);
        setCheckoutData({
          contact: { name: '', phone: '' },
          delivery: { type: 'pickup' },
          payment: { method: 'cash' },
          notes: ''
        });
      }
    }
  }, [isOpen, isLoading, user]);

  // Tarifa de envío
  const shippingCost = checkoutData.delivery.type === 'delivery' ? 30 : 0;

  const steps: CheckoutStep[] = [
    {
      id: 'contact',
      title: 'Información de Contacto',
      description: 'Tu nombre y teléfono',
      isCompleted: false,
      isActive: currentStep === 0
    },
    {
      id: 'delivery',
      title: 'Método de Entrega',
      description: 'Recojo o delivery',
      isCompleted: false,
      isActive: user ? currentStep === 0 : currentStep === 1  // Si hay usuario, delivery es paso 0
    },
    {
      id: 'payment',
      title: 'Método de Pago',
      description: 'Efectivo o tarjeta',
      isCompleted: false,
      isActive: user ? currentStep === 1 : currentStep === 2  // Si hay usuario, payment es paso 1
    },
    {
      id: 'review',
      title: 'Revisar Pedido',
      description: 'Confirma tu orden',
      isCompleted: false,
      isActive: user ? currentStep === 2 : currentStep === 3  // Si hay usuario, review es paso 2
    }
  ];

  const updateCheckoutData = (updates: Partial<CheckoutData>) => {
    setCheckoutData((prev) => ({ ...prev, ...updates }));
  };

  const validateStep = (step: number) => {
    const newErrors: ValidationErrors = {};
    
    // Mapear pasos dependiendo de si hay usuario o no
    const actualStep = user ? step + 1 : step; // Si hay usuario, sumar 1 para comparar con el paso real

    switch (actualStep) {
      case 0:
        // Step de contacto (solo sin usuario)
        if (!user) {
          // Si es "cc" (mesero), no validar nada
          if (checkoutData.contact.name.toLowerCase().trim() === 'cc') {
            break;
          }
          // Validación normal para otros casos
          if (!checkoutData.contact.name.trim()) {
            newErrors.contact = { name: 'El nombre es requerido' };
          }
          if (!checkoutData.contact.phone.trim()) {
            newErrors.contact = { ...newErrors.contact, phone: 'El teléfono es requerido' };
          }
        }
        break;
      case 1:
        // Step de delivery
        if (checkoutData.delivery.type === 'delivery' && !checkoutData.delivery.address?.trim()) {
          newErrors.delivery = { address: 'La dirección es requerida para delivery' };
        }
        break;
      case 2:
        // Step de payment
        if (checkoutData.payment.method === 'cash' && !checkoutData.payment.exactChange && !checkoutData.payment.cashAmount) {
          newErrors.payment = { cashAmount: 'Selecciona la denominación con la que pagarás o marca pago exacto' };
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = async () => {
    // DEBUG: Mostrar el valor actual del nombre
    const nombreActual = checkoutData.contact.name;
    const nombreLimpio = nombreActual.toLowerCase().trim();
    console.log('🔍 DEBUG nextStep:', { 
      nombreActual, 
      nombreLimpio, 
      esCC: nombreLimpio === 'cc',
      currentStep,
      user: !!user
    });
    
    // Detectar si es "cc" en el nombre y está en el primer paso (solo para usuarios no registrados)
    if (currentStep === 0 && !user && nombreLimpio === 'cc') {
      console.log('✅ DETECTADO CC - Enviando notificación de mesero');
      // Limpiar errores
      setErrors({});
      
      // Enviar notificación de mesero SIN validar
      setIsSubmitting(true);
      try {
        const waiterResult = await sendWaiterNotification(cart);
        console.log('📤 Resultado de notificación:', waiterResult);
        if (waiterResult.success) {
          alert('✅ Notificación de mesero enviada');
          onClose();
        } else {
          alert(`Error: ${waiterResult.message}`);
        }
      } catch (error) {
        console.error('Error al enviar notificación de mesero:', error);
        alert('Error al enviar notificación de mesero');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Calcular cuántos pasos hay (menos pasos si hay usuario)
    const maxSteps = user ? 3 : 4;
    
    // Validar paso actual
    if (validateStep(currentStep)) {
      const nextStepNum = currentStep + 1;
      if (nextStepNum < maxSteps) {
        setCurrentStep(nextStepNum);
      }
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  const getEstimatedTime = () => {
    return checkoutData.delivery.type === 'pickup' ? '30 min' : '45 min';
  };

  const getChange = () => {
    if (checkoutData.payment.method === 'cash' && checkoutData.payment.cashAmount) {
      return checkoutData.payment.cashAmount - (cart.total + shippingCost);
    }
    return 0;
  };

  const handleComplete = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      const orderNumber = generateOrderNumber();
      const telegramResult = await sendOrderToTelegram(checkoutData, cart, orderNumber);

      if (telegramResult.success) {
        onComplete({
          ...checkoutData,
          orderNumber,
          success: true,
          message: telegramResult.message
        });
      } else {
        alert(`Error: ${telegramResult.message}`);
      }
    } catch (error) {
      console.error('Error al procesar el pedido:', error);
      alert('Error al procesar el pedido. Por favor intenta nuevamente.');
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel className="w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 px-8 py-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Finalizar Pedido</h2>
                  <p className="text-orange-100 mt-1">
                    {steps[currentStep].title}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              {/* Progress Steps */}
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                      <div className={`
                        flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                        ${index <= currentStep 
                          ? 'bg-white text-orange-500' 
                          : 'bg-orange-400 text-white'
                        }
                      `}>
                        {index < currentStep ? (
                          <CheckIcon className="w-4 h-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      {index < steps.length - 1 && (
                        <div className={`
                          w-12 h-0.5 mx-2
                          ${index < currentStep ? 'bg-white' : 'bg-orange-400'}
                        `} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div ref={contentRef} className="p-8">
              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Verificando tu sesión...</p>
                  </div>
                </div>
              )}

              {!isLoading && (
                <>
                  {/* Step 0: Contact Info - Solo mostrar si NO hay usuario registrado */}
                  {currentStep === 0 && !user && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <UserIcon className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Información de Contacto
                    </h3>
                    <p className="text-gray-600">
                      Necesitamos tus datos para contactarte sobre tu pedido
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      value={checkoutData.contact.name}
                      onChange={(e) => {
                        const newName = e.target.value;
                        updateCheckoutData({
                          contact: { ...checkoutData.contact, name: newName }
                        });
                        // Si escribe "cc", limpiar errores
                        if (newName.toLowerCase().trim() === 'cc') {
                          setErrors({});
                        }
                      }}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                        errors.contact?.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ej: Juan Pérez"
                    />
                    {errors.contact?.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.contact.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Teléfono *
                    </label>
                    <input
                      type="tel"
                      value={formatPhone(checkoutData.contact.phone)}
                      onChange={(e) => updateCheckoutData({
                        contact: { ...checkoutData.contact, phone: e.target.value.replace(/\D/g, '') }
                      })}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                        errors.contact?.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="55-1234-5678"
                      maxLength={12}
                    />
                    {errors.contact?.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.contact.phone}</p>
                    )}
                  </div>
                </div>
              )}

                  {/* Step 1: Delivery Method - Paso 0 si hay usuario, paso 1 si no hay */}
                  {(user ? currentStep === 0 : currentStep === 1) && (
                    <div className="space-y-6">
                  <div className="text-center mb-8">
                    <TruckIcon className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      ¿Cómo prefieres recibir tu pedido?
                    </h3>
                    <p className="text-gray-600">
                      Elige entre recoger en sucursal o delivery a domicilio
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Pickup Option */}
                    <button
                      onClick={() => {
                        updateCheckoutData({
                          delivery: { type: 'pickup' }
                        });
                        // Auto-scroll to continue button on mobile
                        setTimeout(() => {
                          if (contentRef.current) {
                            contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
                          }
                        }, 300);
                      }}
                      className={`p-6 border-2 rounded-2xl transition-all text-left ${
                        checkoutData.delivery.type === 'pickup'
                          ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-300'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <BuildingStorefrontIcon className="w-8 h-8 text-orange-500 mb-3" />
                      <h4 className="font-semibold text-gray-900 mb-2">Recoger en Sucursal</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Recoge tu pedido en nuestro restaurante
                      </p>
                      <div className="flex items-center text-sm text-orange-600">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        Listo en 30 min
                      </div>
                    </button>

                    {/* Delivery Option */}
                    <button
                      onClick={() => {
                        updateCheckoutData({
                          delivery: { type: 'delivery', address: checkoutData.delivery.address || '' }
                        });
                        // Auto-scroll to continue button on mobile
                        setTimeout(() => {
                          if (contentRef.current) {
                            contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
                          }
                        }, 300);
                      }}
                      className={`p-6 border-2 rounded-2xl transition-all text-left ${
                        checkoutData.delivery.type === 'delivery'
                          ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-300'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <TruckIcon className="w-8 h-8 text-orange-500 mb-3" />
                      <h4 className="font-semibold text-gray-900 mb-2">Delivery a Domicilio</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Te llevamos tu pedido hasta tu puerta
                      </p>
                      <div className="flex items-center text-sm text-orange-600">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        Llega en 45 min
                      </div>
                    </button>
                  </div>

                  {/* Mobile Hint - Show after delivery type is selected */}
                  {(checkoutData.delivery.type === 'pickup' || checkoutData.delivery.type === 'delivery') && (
                    <div className="md:hidden mt-4 p-3 bg-blue-50 border border-blue-300 rounded-lg flex items-center gap-2">
                      <span className="text-lg">👇</span>
                      <p className="text-sm text-blue-700 font-medium">Pulsa "Continuar" abajo para avanzar</p>
                    </div>
                  )}

                  {/* Address Field for Delivery */}
                  {checkoutData.delivery.type === 'delivery' && (
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dirección de Entrega *
                      </label>
                      <textarea
                        value={checkoutData.delivery.address || ''}
                        onChange={(e) => updateCheckoutData({
                          delivery: { ...checkoutData.delivery, address: e.target.value }
                        })}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                          errors.delivery?.address ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Ingresa tu dirección completa con referencias..."
                        rows={3}
                      />
                      {errors.delivery?.address && (
                        <p className="text-red-500 text-sm mt-1">{errors.delivery.address}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

                  {/* Step 2: Payment Method - Paso 1 si hay usuario, paso 2 si no hay */}
                  {(user ? currentStep === 1 : currentStep === 2) && (
                    <div className="space-y-6">
                  <div className="text-center mb-8">
                    <CreditCardIcon className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      ¿Cómo vas a pagar?
                    </h3>
                    <p className="text-gray-600">
                      El pago se realiza al {checkoutData.delivery.type === 'pickup' ? 'recoger' : 'recibir'} tu pedido
                    </p>
                    {/* Mensaje de tarifa de envío si es delivery */}
                    {checkoutData.delivery.type === 'delivery' && (
                      <div className="mt-4 text-sm text-orange-600 font-semibold bg-orange-50 rounded-xl py-2 px-4 inline-block">
                        Se realizará un cobro adicional de $30.00 por tarifa de envío a domicilio.
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Cash Option */}
                    <button
                      onClick={() => updateCheckoutData({
                        payment: { method: 'cash' }
                      })}
                      className={`p-6 border-2 rounded-2xl transition-all text-left ${
                        checkoutData.payment.method === 'cash'
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <BanknotesIcon className="w-8 h-8 text-orange-500 mb-3" />
                      <h4 className="font-semibold text-gray-900 mb-2">Efectivo</h4>
                      <p className="text-sm text-gray-600">
                        Paga en efectivo y te damos tu cambio
                      </p>
                    </button>

                    {/* Card Option */}
                    <button
                      onClick={() => updateCheckoutData({
                        payment: { method: 'card' }
                      })}
                      className={`p-6 border-2 rounded-2xl transition-all text-left ${
                        checkoutData.payment.method === 'card'
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <CreditCardIcon className="w-8 h-8 text-orange-500 mb-3" />
                      <h4 className="font-semibold text-gray-900 mb-2">Tarjeta</h4>
                      <p className="text-sm text-gray-600">
                        Paga con tarjeta de crédito o débito
                      </p>
                    </button>
                  </div>

                  {/* Cash Amount Selection */}
                  {checkoutData.payment.method === 'cash' && (
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        ¿Con cuánto vas a pagar? (Total: ${(cart.total + shippingCost).toFixed(2)}) *
                      </label>
                      
                      {/* Opción de pago exacto */}
                      <div className="mb-4">
                        <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={checkoutData.payment.exactChange || false}
                            onChange={(e) => {
                              updateCheckoutData({
                                payment: { 
                                  ...checkoutData.payment, 
                                  exactChange: e.target.checked,
                                  cashAmount: e.target.checked ? cart.total + shippingCost : checkoutData.payment.cashAmount
                                }
                              });
                            }}
                            className="mr-3"
                          />
                          <span className="text-sm font-medium">Pago exacto: ${(cart.total + shippingCost).toFixed(2)}</span>
                        </label>
                      </div>

                      {/* Denominaciones */}
                      {!checkoutData.payment.exactChange && (
                        <div className="grid grid-cols-3 gap-2">
                          {CASH_DENOMINATIONS.map((denom) => (
                            <button
                              key={denom.value}
                              onClick={() => updateCheckoutData({
                                payment: { ...checkoutData.payment, cashAmount: denom.value }
                              })}
                              className={`p-3 border-2 rounded-xl text-center transition-all ${
                                checkoutData.payment.cashAmount === denom.value
                                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="font-semibold">{denom.label}</div>
                              {checkoutData.payment.cashAmount === denom.value && (
                                <div className="text-xs text-orange-600 mt-1">
                                  Cambio: ${(denom.value - (cart.total + shippingCost)).toFixed(2)}
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

                  {/* Step 3: Review - Paso 2 si hay usuario, paso 3 si no hay */}
                  {(user ? currentStep === 2 : currentStep === 3) && (
                    <div className="space-y-6">
                  <div className="text-center mb-8">
                    <CheckIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Revisa tu pedido
                    </h3>
                    <p className="text-gray-600">
                      Confirma que todo esté correcto antes de enviar
                    </p>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Resumen del Pedido</h4>
                    
                    {/* Contact Info */}
                    <div className="mb-4 pb-4 border-b border-gray-200">
                      <div className="flex items-center mb-2">
                        <UserIcon className="w-5 h-5 text-gray-500 mr-2" />
                        <span className="font-medium">{checkoutData.contact.name}</span>
                      </div>
                      <div className="flex items-center">
                        <PhoneIcon className="w-5 h-5 text-gray-500 mr-2" />
                        <span>{formatPhone(checkoutData.contact.phone)}</span>
                      </div>
                    </div>

                    {/* Delivery Info */}
                    <div className="mb-4 pb-4 border-b border-gray-200">
                      <div className="flex items-center mb-2">
                        {checkoutData.delivery.type === 'pickup' ? (
                          <BuildingStorefrontIcon className="w-5 h-5 text-gray-500 mr-2" />
                        ) : (
                          <TruckIcon className="w-5 h-5 text-gray-500 mr-2" />
                        )}
                        <span className="font-medium">
                          {checkoutData.delivery.type === 'pickup' ? 'Recoger en Sucursal' : 'Delivery a Domicilio'}
                        </span>
                      </div>
                      {checkoutData.delivery.address && (
                        <div className="flex items-start">
                          <MapPinIcon className="w-5 h-5 text-gray-500 mr-2 mt-0.5" />
                          <span className="text-sm text-gray-600">{checkoutData.delivery.address}</span>
                        </div>
                      )}
                      <div className="flex items-center mt-2">
                        <ClockIcon className="w-5 h-5 text-gray-500 mr-2" />
                        <span className="text-sm text-gray-600">
                          Tiempo estimado: {getEstimatedTime()}
                        </span>
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div className="mb-4 pb-4 border-b border-gray-200">
                      <div className="flex items-center mb-2">
                        {checkoutData.payment.method === 'cash' ? (
                          <BanknotesIcon className="w-5 h-5 text-gray-500 mr-2" />
                        ) : (
                          <CreditCardIcon className="w-5 h-5 text-gray-500 mr-2" />
                        )}
                        <span className="font-medium">
                          {checkoutData.payment.method === 'cash' ? 'Efectivo' : 'Tarjeta'}
                        </span>
                      </div>
                      {checkoutData.payment.method === 'cash' && checkoutData.payment.cashAmount && (
                        <div className="text-sm text-gray-600">
                          {checkoutData.payment.exactChange ? (
                            <span className="text-green-600 font-medium">✓ Pago exacto: ${(checkoutData.payment.cashAmount).toFixed(2)}</span>
                          ) : (
                            <>
                              Pagas con: ${(checkoutData.payment.cashAmount).toFixed(2)}<br />
                              Tu cambio: ${getChange().toFixed(2)}
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Order Total */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-base">
                        <span className="text-gray-600">Subtotal productos</span>
                        <span>${cart.total.toFixed(2)}</span>
                      </div>
                      {shippingCost > 0 && (
                        <div className="flex justify-between items-center text-base">
                          <span className="text-gray-600">Envío a domicilio</span>
                          <span className="text-orange-600">${shippingCost.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-lg font-semibold pt-2 border-t border-gray-300">
                        <span>Total a Pagar:</span>
                        <span className="text-orange-600">${(cart.total + shippingCost).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notas Adicionales (Opcional)
                    </label>
                    <textarea
                      value={checkoutData.notes || ''}
                      onChange={(e) => updateCheckoutData({ notes: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="Alguna instrucción especial para tu pedido..."
                      rows={3}
                    />
                  </div>
                </div>
              )}

                  {/* Navigation Buttons */}
                  <div className="flex flex-col-reverse md:flex-row md:justify-between md:items-center gap-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="hidden md:flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeftIcon className="w-5 h-5 mr-1" />
                  Anterior
                </button>

                {currentStep < steps.length - 1 ? (
                  <button
                    onClick={nextStep}
                    disabled={isSubmitting}
                    className="w-full md:w-auto flex items-center justify-center px-8 py-3 md:py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 font-semibold text-lg md:text-base shadow-lg md:shadow-none"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        Continuar
                        <ChevronRightIcon className="w-5 h-5 ml-1" />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleComplete}
                    disabled={isSubmitting}
                    className="w-full md:w-auto flex items-center justify-center px-8 py-3 md:py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition-all transform hover:scale-105 font-semibold text-lg md:text-base shadow-lg md:shadow-none"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <CheckIcon className="w-5 h-5 mr-1" />
                        Confirmar Pedido
                      </>
                    )}
                  </button>
                )}
                  </div>
                </>
              )}
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}