'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react';
import { CheckoutData, CheckoutStep, ValidationErrors } from '@/types/checkout';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { generateOrderNumber, sendOrderToTelegram, sendWaiterNotification } from '@/utils/telegram';
import CheckoutHeaderComponent from './checkout/CheckoutHeaderComponent';
import CheckoutContactStep from './checkout/CheckoutContactStep';
import CheckoutDeliveryStep from './checkout/CheckoutDeliveryStep';
import CheckoutPaymentStep from './checkout/CheckoutPaymentStep';
import CheckoutReviewStep from './checkout/CheckoutReviewStep';
import CheckoutFooter from './checkout/CheckoutFooter';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: CheckoutData) => void;
}

export default function CheckoutModal({ isOpen, onClose, onComplete }: CheckoutModalProps) {
  const { cart } = useCart();
  const { user, isLoading } = useAuth();
  
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

  // Initialize on modal open
  useEffect(() => {
    if (isOpen && !isLoading) {
      if (user) {
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
      isActive: user ? currentStep === 0 : currentStep === 1
    },
    {
      id: 'payment',
      title: 'Método de Pago',
      description: 'Efectivo o tarjeta',
      isCompleted: false,
      isActive: user ? currentStep === 1 : currentStep === 2
    },
    {
      id: 'review',
      title: 'Revisar Pedido',
      description: 'Confirma tu orden',
      isCompleted: false,
      isActive: user ? currentStep === 2 : currentStep === 3
    }
  ];

  const updateCheckoutData = (updates: Partial<CheckoutData>) => {
    setCheckoutData((prev) => ({ ...prev, ...updates }));
  };

  const validateStep = (step: number) => {
    const newErrors: ValidationErrors = {};
    const actualStep = user ? step + 1 : step;

    switch (actualStep) {
      case 0:
        if (!user) {
          if (checkoutData.contact.name.toLowerCase().trim() === 'cc') {
            break;
          }
          if (!checkoutData.contact.name.trim()) {
            newErrors.contact = { name: 'El nombre es requerido' };
          }
          if (!checkoutData.contact.phone.trim()) {
            newErrors.contact = { ...newErrors.contact, phone: 'El teléfono es requerido' };
          }
        }
        break;
      case 1:
        if (checkoutData.delivery.type === 'delivery' && !checkoutData.delivery.address?.trim()) {
          newErrors.delivery = { address: 'La dirección es requerida para delivery' };
        }
        break;
      case 2:
        if (checkoutData.payment.method === 'cash' && !checkoutData.payment.exactChange && !checkoutData.payment.cashAmount) {
          newErrors.payment = { cashAmount: 'Selecciona la denominación con la que pagarás o marca pago exacto' };
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = async () => {
    const nombreLimpio = checkoutData.contact.name.toLowerCase().trim();

    if (currentStep === 0 && !user && nombreLimpio === 'cc') {
      setErrors({});
      setIsSubmitting(true);
      try {
        const waiterResult = await sendWaiterNotification(cart);
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

    const maxSteps = user ? 3 : 4;
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

  const maxSteps = user ? 3 : 4;
  const displaySteps = user ? steps.slice(0, 4) : steps;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel className="w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
            <CheckoutHeaderComponent
              currentStep={currentStep}
              steps={displaySteps}
              title={displaySteps[currentStep]?.title || 'Checkout'}
              onClose={onClose}
            />

            <div ref={contentRef} className="p-8">
              {isLoading ? (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Verificando tu sesión...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Contact Step */}
                  {currentStep === 0 && !user && (
                    <CheckoutContactStep
                      data={checkoutData}
                      errors={errors}
                      onDataChange={updateCheckoutData}
                    />
                  )}

                  {/* Delivery Step */}
                  {(user ? currentStep === 0 : currentStep === 1) && (
                    <CheckoutDeliveryStep
                      data={checkoutData}
                      errors={errors}
                      onDataChange={updateCheckoutData}
                      contentRef={contentRef}
                    />
                  )}

                  {/* Payment Step */}
                  {(user ? currentStep === 1 : currentStep === 2) && (
                    <CheckoutPaymentStep
                      data={checkoutData}
                      errors={errors}
                      cartTotal={cart.total}
                      shippingCost={shippingCost}
                      onDataChange={updateCheckoutData}
                    />
                  )}

                  {/* Review Step */}
                  {(user ? currentStep === 2 : currentStep === 3) && (
                    <CheckoutReviewStep
                      data={checkoutData}
                      cartTotal={cart.total}
                      shippingCost={shippingCost}
                      onNotesChange={(notes) => updateCheckoutData({ notes })}
                    />
                  )}

                  {/* Navigation Footer */}
                  <CheckoutFooter
                    currentStep={currentStep}
                    totalSteps={maxSteps}
                    isSubmitting={isSubmitting}
                    onPrev={prevStep}
                    onNext={nextStep}
                    onComplete={handleComplete}
                  />
                </>
              )}
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
