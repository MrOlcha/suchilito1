'use client'

import React from 'react';
import { motion } from 'framer-motion';

interface CartViewFooterProps {
  total: number;
  onCheckout: () => void;
  onContinueShopping: () => void;
}

export default function CartViewFooter({
  total,
  onCheckout,
  onContinueShopping
}: CartViewFooterProps) {
  return (
    <div className="border-t border-gray-200 p-6 bg-white">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">Total:</span>
          <span className="text-2xl font-bold text-green-600">
            ${total.toFixed(2)}
          </span>
        </div>

        <div className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCheckout}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-4 rounded-xl transition-all transform shadow-lg hover:shadow-xl"
          >
            🚚 Finalizar Pedido
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onContinueShopping}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 rounded-xl transition-colors"
          >
            Continuar comprando
          </motion.button>
        </div>
      </div>
    </div>
  );
}
