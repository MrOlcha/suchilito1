'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, UserIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  returnUrl?: string;
}

export default function AuthPromptModal({ isOpen, onClose, returnUrl = '/' }: AuthPromptModalProps) {
  const router = useRouter();

  const handleLogin = () => {
    onClose();
    router.push('/login?returnUrl=' + encodeURIComponent(returnUrl));
  };

  const handleRegister = () => {
    onClose();
    router.push('/registro?returnUrl=' + encodeURIComponent(returnUrl));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              {/* Header */}
              <div className="relative bg-gradient-to-r from-orange-500 to-red-600 px-6 py-8 text-center">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
                
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🍱</span>
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-2">
                  ¡Hola! 👋
                </h2>
                <p className="text-white/90 text-sm">
                  Para continuar con tu pedido necesitas una cuenta
                </p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Login Option */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogin}
                  className="w-full flex items-center gap-4 p-5 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl shadow-lg transition-all duration-200"
                >
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <UserIcon className="w-6 h-6" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-semibold text-lg">Iniciar Sesión</div>
                    <div className="text-sm text-white/80">Ya tengo una cuenta</div>
                  </div>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">o</span>
                  </div>
                </div>

                {/* Register Option */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRegister}
                  className="w-full flex items-center gap-4 p-5 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-orange-500 rounded-xl transition-all duration-200"
                >
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <UserPlusIcon className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-semibold text-lg text-gray-900">Crear Cuenta</div>
                    <div className="text-sm text-gray-600">Soy nuevo en Mazuhi</div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>

                {/* Info */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700 text-center">
                    <strong>¿Por qué necesito una cuenta?</strong><br />
                    Para procesar tu pedido y mantenerte informado del estado de tu entrega 📦
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
