'use client'

import { useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { TrashIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline'
import { HeartIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'
import Header from '@/components/Header'
import CheckoutModal from '@/components/CheckoutModal'
import OrderSuccess from '@/components/OrderSuccess'
import { CheckoutData } from '@/types/checkout'

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart()
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false)
  const [orderCompleted, setOrderCompleted] = useState<CheckoutData | null>(null)

  const handleCheckout = () => {
    setIsCheckoutModalOpen(true)
  }

  const handleCheckoutComplete = (data: CheckoutData) => {
    setIsCheckoutModalOpen(false)
    
    // Si el pedido fue exitoso, mostrar pantalla de éxito
    if (data.success) {
      setOrderCompleted(data)
      clearCart()
    }
  }

  const handleNewOrder = () => {
    setOrderCompleted(null)
  }

  // Calcular costo de envío si es delivery
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  // El tipo de entrega se determina en el modal, pero aquí lo usamos para mostrar el resumen
  // Se puede pasar el tipo desde el modal al cerrar checkout
  const shippingCost = deliveryType === 'delivery' ? 30 : 0;

  // Si el pedido se completó exitosamente, mostrar pantalla de éxito
  if (orderCompleted) {
    return <OrderSuccess orderData={orderCompleted} onNewOrder={handleNewOrder} />
  }

  if (cart.itemCount === 0) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 md:pt-24">
          <div className="container mx-auto px-4 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-md mx-auto"
            >
              <div className="mb-8">
                <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg 
                    className="w-16 h-16 text-gray-400" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1} 
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.35 5M7 13l1.35-5M7 13L5.65 18M7 13h10m0 0l1.35 5M17 13l-1.35 5M9 21h6" 
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Tu carrito está vacío</h2>
                <p className="text-gray-600 mb-8">
                  ¡Descubre nuestros deliciosos platillos y agrega tus favoritos!
                </p>
              </div>
              
              <Link href="/menu">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-blue-500 via-secondary-600 to-indigo-600 hover:from-blue-600 hover:via-secondary-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-full shadow-lg transition-all duration-300"
                >
                  Ver Menú
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 md:pt-24">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            {/* Header del carrito */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800">Tu Carrito</h1>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearCart}
                className="text-red-500 hover:text-red-700 font-medium transition-colors"
              >
                Vaciar carrito
              </motion.button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Lista de productos */}
              <div className="lg:col-span-2 space-y-4">
                {cart.items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-4">
                      {/* Imagen del producto */}
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src={item.menuItem.imagen_url || '/images/menu/placeholder.jpg'}
                          alt={item.menuItem.nombre}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Información del producto */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-800">{item.menuItem.nombre}</h3>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </motion.button>
                        </div>

                        {/* Opciones seleccionadas */}
                        {item.options && (
                          <div className="text-sm text-gray-600 mb-2 space-y-1">
                            {item.options.complementos.length > 0 && (
                              <p>Complementos: {item.options.complementos.map(c => c.name).join(', ')}</p>
                            )}
                            {item.options.soya && (
                              <p>Salsa de soya: {item.options.soya.name}</p>
                            )}
                            {item.options.cubiertos && (
                              <p>Cubiertos: {item.options.cubiertos.name}</p>
                            )}
                            {item.options.comentarios && (
                              <p>Comentarios: {item.options.comentarios}</p>
                            )}
                          </div>
                        )}

                        {/* Precio y controles de cantidad */}
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-secondary-600">
                            ${item.subtotal.toFixed(2)}
                          </span>
                          
                          <div className="flex items-center gap-3">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                            >
                              <MinusIcon className="w-4 h-4" />
                            </motion.button>
                            
                            <span className="font-semibold text-gray-800 min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                            >
                              <PlusIcon className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Resumen del pedido */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-xl shadow-sm p-6 sticky top-24"
                >
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Resumen del Pedido</h2>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold">${cart.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Envío</span>
                      <span className={`font-semibold ${shippingCost > 0 ? 'text-orange-600' : 'text-green-600'}`}>{shippingCost > 0 ? `$${shippingCost.toFixed(2)}` : 'Gratis'}</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-secondary-600">${(cart.total + shippingCost).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCheckout}
                    className="w-full bg-gradient-to-r from-blue-500 via-secondary-600 to-indigo-600 hover:from-blue-600 hover:via-secondary-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-full shadow-lg transition-all duration-300 mb-4"
                  >
                    Finalizar Pedido
                  </motion.button>

                  <Link href="/menu">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-full transition-all duration-300"
                    >
                      Continuar Comprando
                    </motion.button>
                  </Link>

                  {/* Información adicional */}
                  <div className="mt-6 pt-6 border-t">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <HeartIcon className="w-4 h-4 text-red-500" />
                      <span>Preparado con amor sinaloense</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Los precios incluyen IVA. Tiempo estimado de entrega: 30-45 min.
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        onComplete={(data) => {
          // Actualizar el tipo de entrega al finalizar checkout
          setDeliveryType(data.delivery.type);
          handleCheckoutComplete(data);
        }}
      />
    </>
  )
}