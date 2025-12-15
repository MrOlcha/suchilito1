/**
 * Componente de menú para una mesa específica - OPTIMIZADO PARA MÓVIL CON MODAL
 * Diseño igual a MenuParaLlevar con carrito modal
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePedidoContext } from '@/lib/context/PedidoContext';
import { MenuService, AuthService } from '@/lib/services';
import { MenuItem, MenuCategory } from '@/lib/services/menu.service';
import ProductModal from '@/components/atiendemesero/ProductModal';
import { SuccessModal } from '@/components/ui/SuccessModal';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCartIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Gift } from 'lucide-react';

interface MenuMesaProps {
  mesaNumero: string;
}

export default function MenuMesa({ mesaNumero }: MenuMesaProps) {
  const router = useRouter();
  const { cart, agregarAlCarrito, eliminarDelCarrito, actualizarCantidad, calcularTotal, calcularSubtotal, calcularDescuentoTotal, descuentosAplicados, limpiarTodo, setPromociones: setPromocionesContext } = usePedidoContext();
  const [categorias, setCategorias] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);
  const [selectedProductPromos, setSelectedProductPromos] = useState<any[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState({ numero_pedido: '', total: 0 });
  const [observaciones, setObservaciones] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [promociones, setPromociones] = useState<any[]>([]);
  const [promocionesAplicables, setPromocionesAplicables] = useState<any[]>([]);
  const [promocionesHoy, setPromocionesHoy] = useState<any[]>([]);
  const [itemsConPromociones, setItemsConPromociones] = useState<MenuItem[]>([]);

  // Obtener nombre del día actual
  const obtenerNombreDia = (): string => {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const ahora = new Date();
    return dias[ahora.getDay()];
  };

  // Función de validación de horario/día
  const esPromocionValidaAhora = (promocion: any): boolean => {
    const ahora = new Date();
    const diaSemana = ahora.getDay();
    const horaActual = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;

    if (promocion.diasAplicables) {
      try {
        const dias = JSON.parse(promocion.diasAplicables);
        if (!dias.includes(diaSemana)) {
          return false;
        }
      } catch {
        // Si no se puede parsear, asumir que aplica todos los días
      }
    }

    if (promocion.horaInicio && promocion.horaFin) {
      if (horaActual < promocion.horaInicio || horaActual > promocion.horaFin) {
        return false;
      }
    }

    return true;
  };

  // Función para detectar promociones aplicables
  const detectarPromocionesPara = (
    itemsEnCarrito: Array<{ id: number; cantidad: number; categoria?: string }>,
    promociones: any[]
  ): any[] => {
    const promocionesDetectadas: any[] = [];

    for (const promocion of promociones) {
      let itemsDePromocion = promocion.items.map((item: any) => item.id);

      if (promocion.aplicarACategoria) {
        itemsDePromocion = itemsDePromocion.filter((itemId: number) => {
          const item = promocion.items.find((i: any) => i.id === itemId);
          return item?.categoria === promocion.aplicarACategoria;
        });
      }

      const itemsQueCumplen = itemsEnCarrito
        .filter(cartItem => itemsDePromocion.includes(cartItem.id))
        .map(cartItem => cartItem.id);

      if (itemsQueCumplen.length >= promocion.itemsRequeridos) {
        promocionesDetectadas.push(promocion);
      }
    }

    return promocionesDetectadas;
  };

  // Obtener promociones válidas para un item específico
  const obtenerPromocionesPorItem = (itemId: number): any[] => {
    const promocionesValidas = promociones.filter(esPromocionValidaAhora);
    
    return promocionesValidas.filter(promo => {
      // Verificar si el item está en la promoción
      const estaEnPromo = promo.items.some((item: any) => item.id === itemId);
      
      if (!estaEnPromo) return false;

      // Si aplica a categoría específica, verificar que coincida
      if (promo.aplicarACategoria) {
        const itemInfo = promo.items.find((item: any) => item.id === itemId);
        return itemInfo?.categoria === promo.aplicarACategoria;
      }

      return true;
    });
  };

  useEffect(() => {
    cargarMenu();
    cargarPromociones();
  }, []);

  // Detectar promociones cada vez que el carrito cambia
  useEffect(() => {
    if (promociones.length > 0 && cart.length > 0) {
      const promocionesValidas = promociones.filter(esPromocionValidaAhora);
      const itemsCarrito = cart.map(item => ({
        id: item.item.id,
        cantidad: item.quantity,
        categoria: item.item.categoria
      }));
      const detectadas = detectarPromocionesPara(itemsCarrito, promocionesValidas);
      setPromocionesAplicables(detectadas);
    } else {
      setPromocionesAplicables([]);
    }
  }, [cart, promociones]);

  // Actualizar items con promociones cuando cambian promociones o categorías
  useEffect(() => {
    if (promociones.length > 0 && categorias.length > 0) {
      const items = obtenerItemsConPromociones();
      setItemsConPromociones(items);
      
      // Actualizar promociones válidas hoy
      const promoHoy = promociones.filter(esPromocionValidaAhora);
      setPromocionesHoy(promoHoy);
    } else {
      setItemsConPromociones([]);
      setPromocionesHoy([]);
    }
  }, [promociones, categorias]);

  const cargarPromociones = async () => {
    try {
      const response = await fetch('/pos/api/promociones');
      if (response.ok) {
        const data = await response.json();
        setPromociones(data);
        setPromocionesContext(data); // Actualizar contexto global
      }
    } catch (error) {
      console.error('Error cargando promociones:', error);
    }
  };

  // Obtener items que tienen promociones válidas
  const obtenerItemsConPromociones = (): MenuItem[] => {
    const promocionesValidas = promociones.filter(esPromocionValidaAhora);
    const itemsConPromo = new Set<number>();

    promocionesValidas.forEach(promo => {
      promo.items.forEach((item: any) => {
        itemsConPromo.add(item.id);
      });
    });

    // Recolectar todos los items de todas las categorías que tienen promociones
    const allItems: MenuItem[] = [];
    categorias.forEach(cat => {
      cat.items?.forEach((item: MenuItem) => {
        if (itemsConPromo.has(item.id)) {
          allItems.push(item);
        }
      });
    });

    return allItems;
  };

  const cargarMenu = async () => {
    try {
      setLoading(true);
      const data = await MenuService.obtenerMenu();
      setCategorias(data);
      if (data.length > 0) {
        setCategoriaSeleccionada(data[0].nombre || data[0].name || '');
      }
    } catch (error) {
      console.error('Error al cargar menú:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarItem = (item: MenuItem) => {
    setSelectedProduct(item);
    setSelectedProductPromos(obtenerPromocionesPorItem(item.id));
  };

  const handleAddToCart = (product: MenuItem, notes: string[], customNote: string) => {
    agregarAlCarrito({
      id: `${product.nombre}-${Date.now()}`,
      item: {
        id: product.id,
        nombre: product.nombre,
        descripcion: product.descripcion || '',
        precio: product.precio,
        imagen_url: product.imagen_url || '',
        categoria: product.categoria
      },
      quantity: 1,
      options: {
        notas: notes,
        notaPersonalizada: customNote
      }
    });
    setSelectedProduct(null);
  };

  const handleFinalizarPedido = async () => {
    if (cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    try {
      setProcesando(true);
      const meseroId = AuthService.obtenerMeseroId();
      const subtotalPedido = cart.reduce((sum, item) => sum + (item.item.precio * item.quantity), 0);
      const descuentoTotal = calcularDescuentoTotal();
      const totalPedido = subtotalPedido - descuentoTotal;
      
      const response = await fetch('/pos/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mesa_numero: mesaNumero,
          mesero_id: meseroId,
          comensales: 1,
          es_para_llevar: 0,
          subtotal: subtotalPedido,
          total_descuento: descuentoTotal,
          total: totalPedido,
          estado: 'pendiente',
          observaciones: observaciones || null,
          descuentos: descuentosAplicados, // Incluir array de descuentos aplicados
          items: cart.map((item: any) => ({
            menu_item_id: item.item.id || 1,
            producto_nombre: item.item.nombre,
            cantidad: item.quantity,
            precio_unitario: item.item.precio,
            subtotal: item.item.precio * item.quantity,
            notas: item.options?.notas?.join(', ') || '',
            especificaciones: item.options?.notaPersonalizada || ''
          }))
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el pedido');
      }

      const data = await response.json();
      const numeroPedido = data.pedido?.numero_pedido || data.numero_pedido || 'Desconocido';
      const total = (data.pedido?.total || data.total || totalPedido).toFixed(2);
      
      setSuccessData({ numero_pedido: numeroPedido, total: parseFloat(total) });
      setShowSuccessModal(true);
      
      setTimeout(() => {
        limpiarTodo();
        router.push('/atiendemesero');
      }, 3500);
    } catch (error: any) {
      console.error('Error al crear pedido:', error);
      alert('Error al crear el pedido: ' + (error.message || 'Error desconocido'));
    } finally {
      setProcesando(false);
    }
  };

  const categoriaActual = categorias.find(c => 
    (c.nombre === categoriaSeleccionada) || (c.name === categoriaSeleccionada)
  );
  
  // Si selecciona "Promociones", mostrar items con promociones
  const itemsAMostrar = categoriaSeleccionada === 'Promociones' 
    ? obtenerItemsConPromociones()
    : categoriaActual?.items || [];
  
  const total = calcularTotal();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-xl text-white">Cargando menú...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800/95 backdrop-blur-md shadow-xl p-2 sm:p-3 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white truncate">🍽️ Mesa {mesaNumero}</h1>
            <p className="text-xs sm:text-sm text-blue-400 font-medium">Pedido en local</p>
          </div>
          <button
            onClick={() => router.push('/atiendemesero/comer-aqui')}
            className="px-2 sm:px-3 py-1 sm:py-2 bg-gray-700 text-gray-200 rounded text-xs sm:text-sm hover:bg-gray-600 transition font-medium flex-shrink-0"
          >
            Volver
          </button>
        </div>
      </div>

      {/* Categorías - Scroll Horizontal */}
      <div className="bg-gray-800/50 backdrop-blur border-b border-gray-700 shadow-lg flex-shrink-0 overflow-x-auto scrollbar-hide">
        <div className="flex p-1.5 sm:p-2 space-x-1 sm:space-x-2">
          {/* Botón especial de Promociones */}
          {itemsConPromociones.length > 0 && (
            <button
              onClick={() => setCategoriaSeleccionada('Promociones')}
              className={`px-3 sm:px-4 py-1 sm:py-2 rounded-lg whitespace-nowrap font-bold transition-all transform hover:scale-105 text-xs flex items-center gap-1 ${
                categoriaSeleccionada === 'Promociones'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/50'
                  : 'bg-gradient-to-r from-green-700/50 to-emerald-700/50 text-green-300 hover:from-green-700 hover:to-emerald-700 border border-green-600'
              }`}
            >
              <Gift className="w-4 h-4" />
              Promociones
            </button>
          )}

          {categorias.map((categoria, idx) => (
            <button
              key={categoria.id || categoria.nombre || categoria.name || idx}
              onClick={() => setCategoriaSeleccionada(categoria.nombre || categoria.name || '')}
              className={`px-2 sm:px-4 py-1 sm:py-2 rounded-lg whitespace-nowrap font-bold transition-all transform hover:scale-105 text-xs ${
                (categoriaSeleccionada === categoria.nombre) || (categoriaSeleccionada === categoria.name)
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600'
              }`}
            >
              {categoria.nombre || categoria.name}
            </button>
          ))}
        </div>
      </div>

      {/* Items del menú - FULL SCREEN */}
      <div className="flex-1 overflow-y-auto p-1.5 sm:p-2 bg-gray-900">
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
          {itemsAMostrar.map((item, idx) => {
            const promosDelItem = obtenerPromocionesPorItem(item.id);
            return (
            <div
              key={item.nombre + idx}
              className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 cursor-pointer group aspect-square flex flex-col relative"
              onClick={() => handleAgregarItem(item)}
            >
              {/* Badge de promoción */}
              {promosDelItem.length > 0 && (
                <div className="absolute top-1 right-1 z-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-1.5 shadow-lg">
                  <Gift className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
              )}

              {item.imagen_url && (
                <div className="relative flex-1 overflow-hidden">
                  <img
                    src={item.imagen_url}
                    alt={item.nombre}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                </div>
              )}
              <div className="p-1.5 sm:p-2 flex flex-col justify-end">
                <h3 className="font-bold text-white mb-0.5 text-xs line-clamp-1">{item.nombre}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold text-blue-500">
                    ${item.precio.toFixed(2)}
                  </span>
                  <span className="text-xs text-gray-500 group-hover:text-blue-400 transition">+</span>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>

      {/* Floating Cart Button */}
      <button
        onClick={() => setShowCart(true)}
        className="fixed bottom-4 right-4 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-blue-500 rounded-full shadow-2xl shadow-blue-500/50 flex items-center justify-center hover:scale-110 transition-transform z-30"
      >
        <ShoppingCartIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        {cart.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center animate-pulse">
            {cart.length}
          </span>
        )}
      </button>

      {/* Cart Modal */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCart(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-40"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="bg-gray-800 rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden shadow-2xl pointer-events-auto">
                <button
                  onClick={() => setShowCart(false)}
                  className="absolute top-4 right-4 p-2 bg-gray-700 hover:bg-gray-600 rounded-full z-10"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
                
                {/* Cart Content */}
                <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-700 flex-shrink-0 bg-gray-750">
                  <h2 className="text-base sm:text-lg font-bold text-white">Carrito</h2>
                  <p className="text-xs sm:text-sm text-blue-400 font-medium">🍽️ Mesa {mesaNumero} • {obtenerNombreDia()}</p>
                  
                  {/* Mostrar promociones disponibles hoy - COMPACTO */}
                  {promocionesHoy.length > 0 && (
                    <div className="mt-2 p-1.5 bg-green-900/40 rounded border border-green-700/60 inline-block">
                      <p className="text-xs font-semibold text-green-300">
                        🏷️ {promocionesHoy.map(p => p.nombre.split('-')[0].trim()).join(' • ')}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-2 sm:py-3 space-y-2 bg-gray-900">
                  {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 py-6">
                      <ShoppingCartIcon className="w-12 h-12 mb-2 opacity-50" />
                      <p className="text-sm font-medium">Carrito vacío</p>
                      <p className="text-xs text-gray-500">Agrega productos</p>
                    </div>
                  ) : (
                    cart.map((cartItem) => (
                      <div key={cartItem.id} className="bg-gray-700/50 rounded-lg p-2">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-xs sm:text-sm truncate text-white">{cartItem.item.nombre}</h4>
                            <p className="text-blue-400 font-bold text-xs sm:text-sm mt-1">
                              ${(cartItem.item.precio * cartItem.quantity).toFixed(2)}
                            </p>
                          </div>
                          <button
                            onClick={() => eliminarDelCarrito(cartItem.id)}
                            className="p-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/40 flex-shrink-0"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-1 mt-2">
                          <button
                            onClick={() => actualizarCantidad(cartItem.id, Math.max(1, cartItem.quantity - 1))}
                            className="w-6 h-6 sm:w-7 sm:h-7 bg-gray-600 hover:bg-gray-500 rounded-lg flex items-center justify-center text-xs sm:text-sm"
                          >
                            -
                          </button>
                          <span className="w-6 text-center font-bold text-xs sm:text-sm text-white">{cartItem.quantity}</span>
                          <button
                            onClick={() => actualizarCantidad(cartItem.id, cartItem.quantity + 1)}
                            className="w-6 h-6 sm:w-7 sm:h-7 bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center justify-center text-xs sm:text-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="px-3 sm:px-4 py-2 sm:py-3 border-t border-gray-700 space-y-3 bg-gray-800 flex-shrink-0">
                  <textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Instrucciones especiales..."
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-700 text-white border border-gray-600 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm resize-none"
                    rows={2}
                  />
                  
                  <div className="bg-gray-700/50 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between text-xs sm:text-sm text-gray-400">
                      <span>Productos</span>
                      <span>{cart.length}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Subtotal</span>
                      <span>${calcularSubtotal().toFixed(2)}</span>
                    </div>
                    
                    {/* Mostrar detalles de descuentos aplicados - COMPACTO */}
                    {descuentosAplicados && descuentosAplicados.length > 0 && (
                      <div className="flex justify-between text-xs sm:text-sm text-green-400 font-semibold border-t border-gray-600 pt-2">
                        <span>🏷️ {descuentosAplicados.map(d => d.promocionNombre.split('-')[0].trim()).join(' • ')}</span>
                        <span>-${calcularDescuentoTotal().toFixed(2)}</span>
                      </div>
                    )}
                    
                    {calcularDescuentoTotal() > 0 && (
                      <div className="flex justify-between text-sm text-green-400 font-bold border-t border-gray-600 pt-2">
                        <span>💰 Descuento Total</span>
                        <span>-${calcularDescuentoTotal().toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg sm:text-xl font-bold border-t border-gray-600 pt-2">
                      <span className="text-white">Total</span>
                      <span className="text-blue-400">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Promociones detectadas */}
                  {promocionesAplicables.length > 0 && (
                    <div className="bg-gradient-to-r from-green-600/80 to-emerald-600/80 rounded-lg p-3 space-y-2 border border-green-400/30">
                      <div className="flex items-center gap-2">
                        <Gift className="w-5 h-5 text-yellow-300" />
                        <span className="text-sm font-bold text-white">¡Promociones disponibles!</span>
                      </div>
                      <div className="space-y-1">
                        {promocionesAplicables.map((promo) => (
                          <div key={promo.id} className="text-xs bg-white/10 rounded px-2 py-1 text-white">
                            ✓ {promo.nombre} ({promo.itemsRequeridos}x{promo.itemsGratis})
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      handleFinalizarPedido();
                      setShowCart(false);
                    }}
                    disabled={cart.length === 0 || procesando}
                    className={`w-full py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base transition-all ${
                      cart.length === 0 || procesando
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                    }`}
                  >
                    {procesando ? 'Procesando...' : '✓ Finalizar Pedido'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Product Modal for notes */}
      <ProductModal
        product={selectedProduct}
        isOpen={selectedProduct !== null}
        onClose={() => {
          setSelectedProduct(null);
          setSelectedProductPromos([]);
        }}
        onAddToCart={handleAddToCart}
        promociones={selectedProductPromos}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        title="¡Pedido Creado!"
        message="Tu pedido ha sido registrado correctamente"
        details={[
          { label: '📋 Número', value: successData.numero_pedido },
          { label: '💵 Total', value: `$${successData.total.toFixed(2)}` },
          { label: '⏱️ Estado', value: 'Pendiente' }
        ]}
        onClose={() => setShowSuccessModal(false)}
      />
    </div>
  );
}
