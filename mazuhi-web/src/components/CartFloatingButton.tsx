'use client'

import React from 'react';
import { useCart } from '@/contexts/CartContext';
import { ShoppingBagIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartFloatingButton() {
  const { cart, toggleCart } = useCart();

  return (
    <AnimatePresence>
      {cart.itemCount > 0 && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleCart}
          className="fixed bottom-6 right-6 bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-2xl z-30 flex items-center gap-2 transition-colors md:flex hidden"
        >
          <ShoppingBagIcon className="w-6 h-6" />
          
          {/* Item count badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-white text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold"
          >
            {cart.itemCount}
          </motion.div>
          
          {/* Total amount */}
          <span className="font-semibold">
            ${cart.total.toFixed(2)}
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}