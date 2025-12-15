'use client'

import React from 'react';
import { CartItem } from '@/types/cart';
import { ShoppingBagIcon } from '@heroicons/react/24/solid';

interface CartSummaryProps {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export default function CartSummary({ items, total, itemCount }: CartSummaryProps) {
  return (
    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border-2 border-orange-200">
      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <ShoppingBagIcon className="w-5 h-5 text-orange-600" />
        Resumen de tu Pedido
      </h4>
      
      {/* Items del carrito */}
      <div className="space-y-2 mb-3 max-h-64 overflow-y-auto">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between items-start bg-white rounded-lg p-2">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{item.menuItem.nombre}</p>
              {(item.options.complementos.length > 0 || item.options.soya || item.options.cubiertos || item.options.comentarios) && (
                <p className="text-xs text-gray-600 mt-1">
                  {[
                    item.options.complementos.map(c => c.name).join(', '),
                    item.options.soya?.name,
                    item.options.cubiertos?.name,
                    item.options.comentarios
                  ]
                    .filter(Boolean)
                    .join(' • ')}
                </p>
              )}
            </div>
            <div className="text-right ml-2">
              <div className="bg-orange-100 text-orange-700 font-bold px-2 py-1 rounded-lg text-sm min-w-[40px]">
                x{item.quantity}
              </div>
              <p className="text-xs text-gray-600 mt-1">${item.subtotal.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Totales */}
      <div className="border-t border-orange-200 pt-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-700">Subtotal ({itemCount} items):</span>
          <span className="font-semibold text-gray-900">${total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-700">Total artículos:</span>
          <span className="font-bold text-lg text-orange-600">{itemCount}</span>
        </div>
      </div>
    </div>
  );
}
