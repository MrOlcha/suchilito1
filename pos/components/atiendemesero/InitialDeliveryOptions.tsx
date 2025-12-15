'use client';

import { motion } from 'framer-motion';
import { ShoppingBag, Utensils, Zap, CreditCard } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { PAGES, BASE_PATH } from '@/lib/config';

export default function InitialDeliveryOptions() {
  return (
    <div className="min-h-screen min-h-[100dvh] bg-gradient-to-b from-gray-50 to-white flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 py-6 sm:py-8 px-4">
        <div className="text-center">
          <Image 
            src={`${BASE_PATH}/images/logo.png`}
            alt="Logo" 
            width={125}
            height={63}
            className="mx-auto mb-3 sm:mb-4 drop-shadow-lg"
            priority
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="flex gap-4 sm:gap-6 justify-center">
          
          {/* Para Llevar */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-blue-500 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
            <Link
              href="/atiendemesero/para-llevar"
              className="relative w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-2xl hover:shadow-xl transition duration-300 border-2 border-blue-200 group-hover:border-blue-400 flex flex-col items-center justify-center"
            >
              <ShoppingBag className="w-8 sm:w-10 h-8 sm:h-10 text-blue-500 mb-1" />
              <span className="text-xs sm:text-sm font-semibold text-gray-900 text-center">Para Llevar</span>
            </Link>
          </motion.div>

          {/* Comer Aquí */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
            <Link
              href="/atiendemesero/comer-aqui"
              className="relative w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-2xl hover:shadow-xl transition duration-300 border-2 border-emerald-200 group-hover:border-emerald-400 flex flex-col items-center justify-center"
            >
              <Utensils className="w-8 sm:w-10 h-8 sm:h-10 text-emerald-500 mb-1" />
              <span className="text-xs sm:text-sm font-semibold text-gray-900 text-center">Comer Aquí</span>
            </Link>
          </motion.div>

          {/* Áreas Activas */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
            <Link
              href={PAGES.AREAS_ACTIVAS}
              className="relative w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-2xl hover:shadow-xl transition duration-300 border-2 border-purple-200 group-hover:border-purple-400 flex flex-col items-center justify-center"
            >
              <Zap className="w-8 sm:w-10 h-8 sm:h-10 text-purple-500 mb-1" />
              <span className="text-xs sm:text-sm font-semibold text-gray-900 text-center">Áreas Activas</span>
            </Link>
          </motion.div>

          {/* Caja */}
          
        </div>
      </main>

      {/* Footer Info */}
      <footer className="bg-gray-100 border-t border-gray-300 py-3 sm:py-4 px-4 sm:px-6 text-center text-gray-600 text-xs sm:text-sm">
        <p>Sistema de pedidos Mazuhi • Versión 1.0</p>
      </footer>
    </div>
  );
}
