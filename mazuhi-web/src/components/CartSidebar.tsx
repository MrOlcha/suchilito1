'use client'

import React, { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ShoppingBagIcon as ShoppingBagIconSolid } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckoutData, CheckoutStep, ValidationErrors } from '@/types/checkout';
import { generateOrderNumber, sendOrderToTelegram } from '@/utils/telegram';
import LocationPickerModal from '@/components/LocationPickerModal';
import SuccessOrderModal from '@/components/SuccessOrderModal';

// Import new modular components
import CartItems from '@/components/checkout/CartItems';
import CartViewFooter from '@/components/checkout/CartViewFooter';
import CheckoutHeader from '@/components/checkout/CheckoutHeader';
import CheckoutContact from '@/components/checkout/CheckoutContact';
import CheckoutDelivery from '@/components/checkout/CheckoutDelivery';
import CheckoutPayment from '@/components/checkout/CheckoutPayment';
import CheckoutReview from '@/components/checkout/CheckoutReview';
import CheckoutNavigation from '@/components/checkout/CheckoutNavigation';

type ViewType = 'cart' | 'checkout' | 'success';

export default function CartSidebar() {
  const { cart, removeFromCart, updateQuantity, clearCart, toggleCart } = useCart();
  const { user, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('cart');
  const [currentStep, setCurrentStep] = useState(0);
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    contact: { name: '', phone: '' },
    delivery: { type: 'pickup' },
    payment: { method: 'cash' },
    notes: ''
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  // Tarifa de envío
  const shippingCost = checkoutData.delivery.type === 'delivery' ? 30 : 0;

  const steps: CheckoutStep[] = [
    {
      id: 'contact',
      title: 'Información de Contacto',
      description: 'Tu nombre y teléfono',
      isCompleted: currentStep > 0,
      isActive: currentStep === 0
    },
    {
      id: 'delivery',
      title: 'Método de Entrega',
      description: 'Recojo o delivery',
      isCompleted: currentStep > 1,
      isActive: currentStep === 1
    },
    {
      id: 'payment',
      title: 'Método de Pago',
      description: 'Efectivo o tarjeta',
      isCompleted: currentStep > 2,
      isActive: currentStep === 2
    },
    {
      id: 'review',
      title: 'Revisar Pedido',
      description: 'Confirma tu orden',
      isCompleted: currentStep > 3,
      isActive: currentStep === 3
    }
  ];

  // Reset when cart closes
  useEffect(() => {
    if (!cart.isOpen) {
      setTimeout(() => {
        setCurrentView('cart');
        setCurrentStep(0);
        setCheckoutData({
          contact: { name: '', phone: '' },
          delivery: { type: 'pickup' },
          payment: { method: 'cash' },
          notes: ''
        });
        setErrors({});
        setIsSubmitting(false);
      }, 300);
    }
  }, [cart.isOpen]);

  // Cuando se abre el checkout, si hay usuario, saltar al paso 1
  useEffect(() => {
    if (currentView === 'checkout' && !isLoading) {
      if (user) {
        console.log('✅ CartSidebar: Usuario detectado - Saltando paso de contacto');
        setCurrentStep(1);
        setCheckoutData(prev => ({
          ...prev,
          contact: {
            name: `${user.telefono}`,
            phone: user.telefono,
            email: user.correo
          }
        }));
      } else {
        console.log('❌ CartSidebar: Sin usuario - Mostrar paso de contacto');
        setCurrentStep(0);
      }
    }
  }, [currentView, user, isLoading]);

  const updateCheckoutData = (updates: Partial<CheckoutData>) => {
    setCheckoutData(prev => ({
      ...prev,
      ...updates
    }));
    setErrors({});
  };

  const validateStep = (step: number): boolean => {
    const newErrors: ValidationErrors = {};

    switch (step) {
      case 0:
        if (!user) {
          if (!checkoutData.contact.name.trim()) {
            newErrors.contact = { ...newErrors.contact, name: 'El nombre es requerido' };
          }
          if (!checkoutData.contact.phone.trim()) {
            newErrors.contact = { ...newErrors.contact, phone: 'El teléfono es requerido' };
          } else if (!/^\d{10}$/.test(checkoutData.contact.phone.replace(/\D/g, ''))) {
            newErrors.contact = { ...newErrors.contact, phone: 'Ingresa un teléfono válido (10 dígitos)' };
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

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleStartCheckout = () => {
    setCurrentView('checkout');
  };

  const handleBackToCart = () => {
    setCurrentView('cart');
    setCurrentStep(0);
  };

  const handleComplete = async () => {
    if (validateStep(currentStep)) {
      setIsSubmitting(true);
      
      try {
        const newOrderNumber = generateOrderNumber();
        const telegramResult = await sendOrderToTelegram(checkoutData, cart, newOrderNumber);
        
        if (telegramResult.success) {
          setOrderNumber(newOrderNumber);
          toggleCart();
          setTimeout(() => {
            setCurrentView('success');
            clearCart();
          }, 500);
        } else {
          alert(`Error: ${telegramResult.message}`);
        }
        
        setIsSubmitting(false);
      } catch (error) {
        console.error('Error al procesar el pedido:', error);
        alert('Error al procesar el pedido. Por favor intenta nuevamente.');
        setIsSubmitting(false);
      }
    }
  };

  const handleLocationSelected = (address: string, lat: number, lng: number) => {
    updateCheckoutData({
      delivery: {
        ...checkoutData.delivery,
        address: address,
        coordinates: { lat, lng }
      }
    });
    console.log('✅ Ubicación seleccionada:', { address, lat, lng });
  };

  const getEstimatedTime = () => {
    return checkoutData.delivery.type === 'pickup' ? '30 min' : '45 min';
  };

  const sidebarVariants = {
    closed: { x: '100%' },
    open: { x: 0 }
  };

  const backdropVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 }
  };

  return (
    <>
      <AnimatePresence>
        {cart.isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              variants={backdropVariants}
              initial="closed"
              animate="open"
              exit="closed"
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={toggleCart}
            />

            {/* Sidebar */}
            <motion.div
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
            >
              {/* CART VIEW */}
              {currentView === 'cart' && (
                <>
                  {/* Header */}
                  <div className="border-b border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <ShoppingBagIconSolid className="w-6 h-6 text-red-600" />
                        <h2 className="text-xl font-bold text-gray-900">
                          Mi Carrito ({cart.itemCount})
                        </h2>
                      </div>
                      <button
                        onClick={toggleCart}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <XMarkIcon className="w-6 h-6" />
                      </button>
                    </div>
                  </div>

                  {/* Items */}
                  <CartItems
                    items={cart.items}
                    onUpdateQuantity={updateQuantity}
                    onRemoveItem={removeFromCart}
                    onClearCart={clearCart}
                  />

                  {/* Footer */}
                  {cart.items.length > 0 && (
                    <CartViewFooter
                      total={cart.total}
                      onCheckout={handleStartCheckout}
                      onContinueShopping={toggleCart}
                    />
                  )}
                </>
              )}

              {/* CHECKOUT VIEW */}
              {currentView === 'checkout' && (
                <>
                  {/* Header with progress */}
                  <CheckoutHeader
                    steps={steps}
                    currentStep={currentStep}
                    onClose={handleBackToCart}
                  />

                  {/* Checkout Content */}
                  <div className="flex-1 overflow-y-auto p-6">
                    {/* Step 0: Contact Info - Solo mostrar si NO hay usuario */}
                    {currentStep === 0 && !user && (
                      <CheckoutContact
                        name={checkoutData.contact.name}
                        phone={checkoutData.contact.phone}
                        onNameChange={(name) => updateCheckoutData({
                          contact: { ...checkoutData.contact, name }
                        })}
                        onPhoneChange={(phone) => updateCheckoutData({
                          contact: { ...checkoutData.contact, phone }
                        })}
                        errors={errors}
                      />
                    )}

                    {/* Step 1: Delivery Method */}
                    {currentStep === 1 && (
                      <CheckoutDelivery
                        deliveryType={checkoutData.delivery.type}
                        address={checkoutData.delivery.address}
                        items={cart.items}
                        total={cart.total}
                        itemCount={cart.itemCount}
                        onDeliveryTypeChange={(type) => updateCheckoutData({
                          delivery: { type, address: checkoutData.delivery.address }
                        })}
                        onAddressChange={(address) => updateCheckoutData({
                          delivery: { ...checkoutData.delivery, address }
                        })}
                        onLocationPickerOpen={() => setShowLocationPicker(true)}
                        errors={errors}
                      />
                    )}

                    {/* Step 2: Payment Method */}
                    {currentStep === 2 && (
                      <CheckoutPayment
                        method={checkoutData.payment.method}
                        cashAmount={checkoutData.payment.cashAmount}
                        exactChange={checkoutData.payment.exactChange}
                        total={cart.total}
                        shippingCost={shippingCost}
                        deliveryType={checkoutData.delivery.type}
                        onMethodChange={(method) => updateCheckoutData({
                          payment: { ...checkoutData.payment, method }
                        })}
                        onCashAmountChange={(cashAmount) => updateCheckoutData({
                          payment: { ...checkoutData.payment, cashAmount }
                        })}
                        onExactChangeChange={(exactChange) => updateCheckoutData({
                          payment: { ...checkoutData.payment, exactChange }
                        })}
                        errors={errors}
                      />
                    )}

                    {/* Step 3: Review Order */}
                    {currentStep === 3 && (
                      <CheckoutReview
                        checkoutData={checkoutData}
                        total={cart.total}
                        shippingCost={shippingCost}
                        estimatedTime={getEstimatedTime()}
                        onNotesChange={(notes) => updateCheckoutData({ notes })}
                      />
                    )}
                  </div>

                  {/* Navigation */}
                  <CheckoutNavigation
                    steps={steps}
                    currentStep={currentStep}
                    isSubmitting={isSubmitting}
                    onPrevStep={prevStep}
                    onNextStep={nextStep}
                    onComplete={handleComplete}
                  />
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* SUCCESS ORDER MODAL */}
      <SuccessOrderModal
        isOpen={currentView === 'success' && !cart.isOpen}
        onClose={() => {
          setCurrentView('cart');
          setCurrentStep(0);
        }}
        checkoutData={checkoutData}
        orderNumber={orderNumber}
        getEstimatedTime={getEstimatedTime}
      />

      {/* Location Picker Modal */}
      <LocationPickerModal
        isOpen={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onSelectLocation={handleLocationSelected}
      />
    </>
  );
}
