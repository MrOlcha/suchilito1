'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogPanel, Transition } from '@headlessui/react';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { PRODUCT_OPTIONS, CartItemOptions, ProductOption } from '@/types/cart';
import { MenuItem } from '@/lib/googleSheets';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import AuthPromptModal from '@/components/AuthPromptModal';

interface ProductCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: MenuItem | null;
}

export default function ProductCustomizationModal({
  isOpen,
  onClose,
  product
}: ProductCustomizationModalProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [totalQuantity, setTotalQuantity] = useState(1);
  const [currentUnit, setCurrentUnit] = useState(0);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [unitConfigurations, setUnitConfigurations] = useState<CartItemOptions[]>([
    {
      complementos: [],
      soya: PRODUCT_OPTIONS.soya[1], // Sin Picante por defecto
      cubiertos: PRODUCT_OPTIONS.cubiertos[0], // Tenedor por defecto
      comentarios: ''
    }
  ]);

  const resetModal = () => {
    setTotalQuantity(1);
    setCurrentUnit(0);
    setUnitConfigurations([{
      complementos: [],
      soya: PRODUCT_OPTIONS.soya[1], // Sin Picante por defecto
      cubiertos: PRODUCT_OPTIONS.cubiertos[0], // Tenedor por defecto
      comentarios: ''
    }]);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) return;
    
    setTotalQuantity(newQuantity);
    
    // Ajustar configuraciones para el nuevo total
    const newConfigurations = [...unitConfigurations];
    if (newQuantity > unitConfigurations.length) {
      // Agregar nuevas configuraciones
      for (let i = unitConfigurations.length; i < newQuantity; i++) {
        newConfigurations.push({
          complementos: [],
          soya: PRODUCT_OPTIONS.soya[1], // Sin Picante por defecto
          cubiertos: PRODUCT_OPTIONS.cubiertos[0], // Tenedor por defecto
          comentarios: ''
        });
      }
    } else if (newQuantity < unitConfigurations.length) {
      // Remover configuraciones excedentes
      newConfigurations.splice(newQuantity);
    }
    
    setUnitConfigurations(newConfigurations);
    
    // Ajustar currentUnit si es necesario
    if (currentUnit >= newQuantity) {
      setCurrentUnit(newQuantity - 1);
    }
  };

  const updateCurrentUnitConfig = (updates: Partial<CartItemOptions>) => {
    const newConfigurations = [...unitConfigurations];
    newConfigurations[currentUnit] = {
      ...newConfigurations[currentUnit],
      ...updates
    };
    setUnitConfigurations(newConfigurations);
  };

  const handleComplementoToggle = (complemento: ProductOption) => {
    const currentConfig = unitConfigurations[currentUnit];
    const newComplementos = currentConfig.complementos.find(c => c.id === complemento.id)
      ? currentConfig.complementos.filter(c => c.id !== complemento.id)
      : [...currentConfig.complementos, complemento];
    
    updateCurrentUnitConfig({ complementos: newComplementos });
  };

  const handleAddToCart = () => {
    if (!product) return;

    // Verificar si el usuario está registrado
    if (!user) {
      // Guardar configuración en sessionStorage para agregar después de registrarse
      const cartData = {
        product: product,
        configurations: unitConfigurations
      };
      sessionStorage.setItem('pendingCartItem', JSON.stringify(cartData));
      
      // Mostrar modal de autenticación
      setShowAuthPrompt(true);
      return;
    }

    // Verificar si el email está verificado
    if (user.email_verificado === 0) {
      alert('⚠️ Debes verificar tu correo electrónico antes de realizar pedidos.\n\nRevisa tu email y verifica tu cuenta.');
      handleClose();
      return;
    }

    // Agregar cada unidad individualmente al carrito
    unitConfigurations.forEach((config, index) => {
      addToCart(product, config);
    });

    handleClose();
  };

  const canNavigatePrev = currentUnit > 0;
  const canNavigateNext = currentUnit < totalQuantity - 1;

  const currentConfig = unitConfigurations[currentUnit] || {
    complementos: [],
    soya: PRODUCT_OPTIONS.soya[1], // Sin Picante por defecto
    cubiertos: PRODUCT_OPTIONS.cubiertos[0], // Tenedor por defecto
    comentarios: ''
  };

  if (!product) return null;

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
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Personalizar {product.nombre}
                  </h3>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Cantidad Total */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cantidad Total
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleQuantityChange(totalQuantity - 1)}
                      disabled={totalQuantity <= 1}
                      className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center text-lg font-medium disabled:opacity-50"
                    >
                      -
                    </button>
                    <span className="text-xl font-semibold min-w-[2rem] text-center">
                      {totalQuantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(totalQuantity + 1)}
                      className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center text-lg font-medium"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Navegación entre unidades */}
                {totalQuantity > 1 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-medium text-gray-900">
                        Configurar Unidad {currentUnit + 1}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setCurrentUnit(currentUnit - 1)}
                          disabled={!canNavigatePrev}
                          className="p-2 rounded-lg border border-gray-300 disabled:opacity-50"
                        >
                          <ChevronLeftIcon className="h-4 w-4" />
                        </button>
                        <span className="text-sm text-gray-600">
                          {currentUnit + 1} de {totalQuantity}
                        </span>
                        <button
                          onClick={() => setCurrentUnit(currentUnit + 1)}
                          disabled={!canNavigateNext}
                          className="p-2 rounded-lg border border-gray-300 disabled:opacity-50"
                        >
                          <ChevronRightIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Complementos */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Complementos (Sin costo)
                  </label>
                  <div className="space-y-2">
                    {PRODUCT_OPTIONS.complementos.map((complemento) => (
                      <label key={complemento.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={currentConfig.complementos.find(c => c.id === complemento.id) !== undefined}
                          onChange={() => handleComplementoToggle(complemento)}
                          className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <span className="ml-3 text-sm text-gray-700">
                          {complemento.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Soya */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Soya
                  </label>
                  <div className="space-y-2">
                    {PRODUCT_OPTIONS.soya.map((soyaOption) => (
                      <label key={soyaOption.id} className="flex items-center">
                        <input
                          type="radio"
                          name={`soya-${currentUnit}`}
                          checked={currentConfig.soya?.id === soyaOption.id}
                          onChange={() => updateCurrentUnitConfig({ soya: soyaOption })}
                          className="h-4 w-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                        />
                        <span className="ml-3 text-sm text-gray-700">
                          {soyaOption.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Cubiertos */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Cubiertos
                  </label>
                  <div className="space-y-2">
                    {PRODUCT_OPTIONS.cubiertos.map((cubiertoOption) => (
                      <label key={cubiertoOption.id} className="flex items-center">
                        <input
                          type="radio"
                          name={`cubiertos-${currentUnit}`}
                          checked={currentConfig.cubiertos?.id === cubiertoOption.id}
                          onChange={() => updateCurrentUnitConfig({ cubiertos: cubiertoOption })}
                          className="h-4 w-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                        />
                        <span className="ml-3 text-sm text-gray-700">
                          {cubiertoOption.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Comentarios */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comentarios especiales
                  </label>
                  <textarea
                    value={currentConfig.comentarios}
                    onChange={(e) => updateCurrentUnitConfig({ comentarios: e.target.value })}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Alguna instrucción especial para esta unidad..."
                  />
                </div>

                {/* Footer */}
                <div className="flex space-x-3">
                  <button
                    onClick={handleClose}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700"
                  >
                    Agregar a la orden
                  </button>
                </div>
              </DialogPanel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
      
      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={showAuthPrompt}
        onClose={() => {
          setShowAuthPrompt(false);
          handleClose();
        }}
        returnUrl={typeof window !== 'undefined' ? window.location.pathname : '/'}
      />
    </Transition>
  );
}