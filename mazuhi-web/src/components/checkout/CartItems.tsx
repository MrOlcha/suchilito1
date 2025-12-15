'use client'

import React from 'react';
import { CartItem } from '@/types/cart';
import { MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBagIcon } from '@heroicons/react/24/solid';

interface CartItemsProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
}

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};

export default function CartItems({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart
}: CartItemsProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      {items.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBagIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Tu carrito está vacío
          </h3>
          <p className="text-gray-500">
            Agrega algunos productos para comenzar
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-xl p-4 border border-gray-200"
              >
                <div className="flex gap-3">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                    {item.menuItem.imagen_url ? (
                      <Image
                        src={item.menuItem.imagen_url}
                        alt={item.menuItem.nombre}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl">
                        🍱
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">
                      {item.menuItem.nombre}
                    </h4>
                    <p className="text-xs text-gray-600 mb-2">
                      ${item.menuItem.precio} c/u
                    </p>

                    <div className="text-xs text-gray-500 space-y-1">
                      {item.options.complementos.length > 0 && (
                        <div>
                          <span className="font-medium">Complementos: </span>
                          {item.options.complementos.map(comp => comp.name).join(', ')}
                        </div>
                      )}
                      {item.options.soya && (
                        <div>
                          <span className="font-medium">Soya: </span>
                          {item.options.soya.name}
                        </div>
                      )}
                      {item.options.cubiertos && (
                        <div>
                          <span className="font-medium">Cubiertos: </span>
                          {item.options.cubiertos.name}
                        </div>
                      )}
                      {item.options.comentarios && (
                        <div>
                          <span className="font-medium">Comentarios: </span>
                          {item.options.comentarios}
                        </div>
                      )}
                      {item.options.special && (
                        <div>
                          <span className="font-medium">Especial: </span>
                          {item.options.special}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                        >
                          <MinusIcon className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                        >
                          <PlusIcon className="w-3 h-3" />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">
                          ${item.subtotal.toFixed(2)}
                        </span>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {items.length > 0 && (
            <button
              onClick={onClearCart}
              className="w-full text-red-600 hover:text-red-700 text-sm font-medium py-2 transition-colors"
            >
              Vaciar carrito
            </button>
          )}
        </div>
      )}
    </div>
  );
}
