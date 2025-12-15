'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  MinusIcon, 
  TrashIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface MenuItem {
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url: string;
  categoria?: string;
}

interface CartItemOptions {
  conChile: boolean;
  picosillo: boolean;
  notar?: string;
}

interface CartItem {
  id: string;
  item: MenuItem;
  quantity: number;
  options: CartItemOptions;
}

interface MenuCategory {
  id?: string;
  name?: string;
  nombre?: string;
  items: MenuItem[];
}

const SPECIAL_OPTIONS = [
  { id: 'conChile', label: 'Con Chile', default: false },
  { id: 'picosillo', label: 'Picosillo', default: false },
];

export default function RestaurantPage() {
  const [menuData, setMenuData] = useState<MenuCategory[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [tableNumber, setTableNumber] = useState<string>('1');
  const [isParaLlevar, setIsParaLlevar] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<CartItemOptions>({
    conChile: false,
    picosillo: false,
    notar: ''
  });

  // Cargar menú
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        console.log('📥 Cargando menú desde /api/menu');
        const response = await fetch('/api/menu');
        const result = await response.json();
        
        const categories = result.data || result.categories || [];
        
        if (categories.length > 0) {
          setMenuData(categories);
          setActiveCategory(categories[0].nombre || categories[0].name);
          console.log('✅ Menú cargado');
        }
      } catch (error) {
        console.error('❌ Error loading menu:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  // Agregar al carrito
  const addToCart = (item: MenuItem) => {
    setSelectedItem(item);
    setSelectedOptions({
      conChile: false,
      picosillo: false,
      notar: ''
    });
  };

  const confirmAddToCart = () => {
    if (!selectedItem) return;

    const uniqueId = `${selectedItem.nombre}-${Date.now()}-${Math.random()}`;
    setCart(prev => [
      ...prev,
      { 
        id: uniqueId, 
        item: selectedItem, 
        quantity: 1, 
        options: { ...selectedOptions }
      }
    ]);
    
    setSelectedItem(null);
  };

  // Actualizar cantidad
  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => {
      return prev.map(c => {
        if (c.id === id) {
          const newQty = c.quantity + delta;
          return newQty > 0 ? { ...c, quantity: newQty } : c;
        }
        return c;
      }).filter(c => c.quantity > 0);
    });
  };

  // Remover del carrito
  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(c => c.id !== id));
  };

  // Calcular total
  const total = cart.reduce((sum, c) => sum + (c.item.precio * c.quantity), 0);
  const itemCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  // Generar descripción de opciones
  const getOptionsDescription = (options: CartItemOptions): string => {
    const parts = [];
    if (options.conChile) parts.push('Con Chile');
    if (options.picosillo) parts.push('Picosillo');
    if (options.notar) parts.push(`Nota: ${options.notar}`);
    return parts.length > 0 ? parts.join(' • ') : 'Sin opciones';
  };

  // Enviar pedido a Telegram
  const sendOrder = async () => {
    if (cart.length === 0) {
      alert('Agrega productos al carrito');
      return;
    }
    
    setSending(true);
    try {
      const response = await fetch('/api/waiter-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart: {
            items: cart.map(c => ({
              menuItem: c.item,
              quantity: c.quantity,
              subtotal: c.item.precio * c.quantity,
              options: {
                complementos: [],
                soya: null,
                cubiertos: null,
              },
              specialOptions: c.options
            })),
            total,
            itemCount
          },
          tableNumber,
          isParaLlevar,
          isWaiterOrder: true
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setShowSuccess(true);
        setCart([]);
        setTableNumber('1');
        setIsParaLlevar(false);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        alert('Error al enviar: ' + result.message);
      }
    } catch (error) {
      console.error('❌ Error al enviar pedido:', error);
      alert('Error de conexión');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col lg:flex-row">
      {/* LADO IZQUIERDO - MENÚ */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gray-800 shadow-lg z-30">
          <div className="px-4 py-4 space-y-3">
            {/* Título y Logo */}
            <div className="flex items-center gap-3">
              <Image 
                src="/images/iconologo.svg" 
                alt="Logo" 
                width={40} 
                height={40}
              />
              <div>
                <h1 className="font-bold text-lg">Mazuhi</h1>
                <p className="text-xs text-gray-400">Modo Mesero</p>
              </div>
            </div>

            {/* Categorías */}
            <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
              {menuData.map((category) => {
                const categoryName = category.nombre || category.name || '';
                return (
                  <button
                    key={categoryName}
                    onClick={() => setActiveCategory(categoryName)}
                    className={`px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                      activeCategory === categoryName
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {categoryName.replace(/_/g, ' ')}
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {/* Menu Grid */}
        <main className="flex-1 overflow-y-auto p-3 md:p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-3">
            {menuData
              .find(c => (c.nombre || c.name) === activeCategory)
              ?.items?.map((item, index) => {
                const inCart = cart.filter(c => c.item.nombre === item.nombre).length;
                return (
                  <motion.div
                    key={item.nombre + index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => addToCart(item)}
                    className={`bg-gray-800 rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-105 hover:shadow-xl ${
                      inCart > 0 ? 'ring-2 ring-orange-500' : ''
                    }`}
                  >
                    <div className="relative h-20 sm:h-24">
                      <Image
                        src={item.imagen_url || '/images/menu/placeholder.jpg'}
                        alt={item.nombre}
                        fill
                        className="object-cover"
                      />
                      {inCart > 0 && (
                        <div className="absolute top-1 right-1 bg-orange-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">
                          {inCart}
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <h3 className="font-medium text-xs sm:text-sm truncate">{item.nombre}</h3>
                      <p className="text-orange-400 font-bold text-xs sm:text-sm">${item.precio}</p>
                    </div>
                  </motion.div>
                );
              })}
          </div>
        </main>
      </div>

      {/* LADO DERECHO - CARRITO Y CONTROLES */}
      <div className="w-full lg:w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
        {/* Controles de Mesa y Para Llevar */}
        <div className="p-4 border-b border-gray-700 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Mesa</label>
            <div className="flex gap-2 flex-wrap">
              {['1', '2', '3', '4', '5', '6'].map(table => (
                <button
                  key={table}
                  onClick={() => setTableNumber(table)}
                  className={`w-10 h-10 rounded-lg font-bold transition-all text-sm ${
                    tableNumber === table
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {table}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all">
            <input
              type="checkbox"
              checked={isParaLlevar}
              onChange={(e) => setIsParaLlevar(e.target.checked)}
              className="w-5 h-5 cursor-pointer"
            />
            <span className="font-medium text-sm">Para llevar</span>
          </label>
        </div>

        {/* Carrito */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {cart.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              <p>Carrito vacío</p>
            </div>
          ) : (
            cart.map((cartItem) => (
              <div key={cartItem.id} className="bg-gray-700 rounded-lg p-2 text-xs">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-medium truncate flex-1">{cartItem.item.nombre}</p>
                  <button
                    onClick={() => removeFromCart(cartItem.id)}
                    className="w-5 h-5 bg-red-600/20 text-red-400 rounded flex items-center justify-center hover:bg-red-600/40 flex-shrink-0"
                  >
                    <TrashIcon className="w-3 h-3" />
                  </button>
                </div>
                
                {(cartItem.options.conChile || cartItem.options.picosillo || cartItem.options.notar) && (
                  <p className="text-gray-400 text-xs mb-1 truncate">{getOptionsDescription(cartItem.options)}</p>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-orange-400 font-bold">${(cartItem.item.precio * cartItem.quantity).toFixed(2)}</span>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQuantity(cartItem.id, -1)}
                      className="w-5 h-5 bg-gray-600 rounded flex items-center justify-center hover:bg-gray-500 text-xs"
                    >
                      <MinusIcon className="w-2 h-2" />
                    </button>
                    <span className="w-4 text-center text-xs font-medium">{cartItem.quantity}</span>
                    <button
                      onClick={() => updateQuantity(cartItem.id, 1)}
                      className="w-5 h-5 bg-gray-600 rounded flex items-center justify-center hover:bg-gray-500 text-xs"
                    >
                      <PlusIcon className="w-2 h-2" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Resumen y Botón de Envío */}
        <div className="border-t border-gray-700 p-4 space-y-3">
          <div className="bg-gray-700 rounded-lg p-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span>Mesa: <span className="font-bold">{tableNumber}</span></span>
              {isParaLlevar && <span className="text-orange-400 font-bold text-xs">Para Llevar</span>}
            </div>
            <div className="flex justify-between text-gray-300">
              <span>{itemCount} producto{itemCount !== 1 ? 's' : ''}</span>
              <span className="text-orange-400 font-bold">${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={sendOrder}
            disabled={sending || cart.length === 0}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all text-sm"
          >
            {sending ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                Enviando...
              </>
            ) : (
              <>
                <PaperAirplaneIcon className="w-4 h-4" />
                Enviar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal de Opciones */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-2xl max-w-sm w-full p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{selectedItem.nombre}</h2>
                  <p className="text-orange-400 font-bold text-lg">${selectedItem.precio}</p>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-400 hover:text-white flex-shrink-0"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Opciones especiales */}
              <div className="space-y-3 mb-6">
                <h3 className="font-semibold text-gray-300">Opciones Especiales</h3>
                {SPECIAL_OPTIONS.map(option => (
                  <label
                    key={option.id}
                    className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 cursor-pointer transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={selectedOptions[option.id as keyof CartItemOptions] as boolean || false}
                      onChange={(e) => setSelectedOptions(prev => ({
                        ...prev,
                        [option.id]: e.target.checked
                      }))}
                      className="w-5 h-5 cursor-pointer"
                    />
                    <span className="font-medium">{option.label}</span>
                  </label>
                ))}
              </div>

              {/* Notas */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-300 mb-2">Notas adicionales</label>
                <textarea
                  value={selectedOptions.notar || ''}
                  onChange={(e) => setSelectedOptions(prev => ({
                    ...prev,
                    notar: e.target.value
                  }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 text-sm"
                  placeholder="Ej: Sin anguila, extra picante..."
                  rows={3}
                />
              </div>

              {/* Botones */}
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmAddToCart}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-all"
                >
                  Agregar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Éxito */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="bg-gray-800 rounded-2xl p-8 text-center max-w-sm mx-4"
            >
              <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">¡Pedido Enviado!</h2>
              <p className="text-gray-400 text-sm">La notificación ha sido enviada a cocina</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
