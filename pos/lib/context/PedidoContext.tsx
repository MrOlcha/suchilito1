/**
 * Contexto global para el estado del pedido
 * Permite compartir estado entre diferentes partes de la app sin mezclar con UI
 */

'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

interface CartItem {
  id: string;
  item: {
    id?: number;
    nombre: string;
    descripcion: string;
    precio: number;
    imagen_url: string;
    categoria?: string;
  };
  quantity: number;
  options: {
    notas: string[];
    notaPersonalizada: string;
  };
}

interface DescuentoAplicado {
  promocionId: number;
  promocionNombre: string;
  descuentoTotal: number;
  cantidadItems: number;
  precioItemGratis: number;
}

interface PedidoContextState {
  // Estado del carrito
  cart: CartItem[];
  
  // Información del pedido actual
  mesaNumero: string | null;
  esParaLlevar: boolean;
  cuentaId: number | null;
  continuePedidoId: number | null;
  
  // Promociones
  promociones: any[];
  descuentosAplicados: DescuentoAplicado[];
  
  // Acciones
  setMesaNumero: (mesa: string | null) => void;
  setEsParaLlevar: (esParaLlevar: boolean) => void;
  setCuentaId: (id: number | null) => void;
  setContinuePedidoId: (id: number | null) => void;
  setPromociones: (promo: any[]) => void;
  
  agregarAlCarrito: (item: CartItem) => void;
  eliminarDelCarrito: (itemId: string) => void;
  actualizarCantidad: (itemId: string, cantidad: number) => void;
  limpiarCarrito: () => void;
  limpiarTodo: () => void;
  
  // Cálculos
  calcularTotal: () => number;
  calcularSubtotal: () => number;
  calcularDescuentoTotal: () => number;
  obtenerCantidadItems: () => number;
}

const PedidoContext = createContext<PedidoContextState | undefined>(undefined);

export function PedidoProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mesaNumero, setMesaNumero] = useState<string | null>(null);
  const [esParaLlevar, setEsParaLlevar] = useState(false);
  const [cuentaId, setCuentaId] = useState<number | null>(null);
  const [continuePedidoId, setContinuePedidoId] = useState<number | null>(null);
  const [promociones, setPromociones] = useState<any[]>([]);
  const [descuentosAplicados, setDescuentosAplicados] = useState<DescuentoAplicado[]>([]);

  const agregarAlCarrito = useCallback((item: CartItem) => {
    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(cartItem => 
        cartItem.item.nombre === item.item.nombre &&
        JSON.stringify(cartItem.options) === JSON.stringify(item.options)
      );

      if (existingIndex >= 0) {
        const newCart = [...prevCart];
        newCart[existingIndex].quantity += item.quantity;
        return newCart;
      }

      return [...prevCart, item];
    });
  }, []);

  const eliminarDelCarrito = useCallback((itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  }, []);

  const actualizarCantidad = useCallback((itemId: string, cantidad: number) => {
    if (cantidad <= 0) {
      eliminarDelCarrito(itemId);
      return;
    }

    setCart(prevCart => 
      prevCart.map(item => 
        item.id === itemId 
          ? { ...item, quantity: cantidad }
          : item
      )
    );
  }, [eliminarDelCarrito]);

  const limpiarCarrito = useCallback(() => {
    setCart([]);
  }, []);

  const limpiarTodo = useCallback(() => {
    setCart([]);
    setMesaNumero(null);
    setEsParaLlevar(false);
    setCuentaId(null);
    setContinuePedidoId(null);
  }, []);

  // Calcular subtotal sin descuentos
  const calcularSubtotal = useCallback(() => {
    return cart.reduce((total, item) => 
      total + (item.item.precio * item.quantity), 0
    );
  }, [cart]);

  // Calcular descuentos aplicables cuando cambia el carrito o las promociones
  useEffect(() => {
    if (cart.length > 0 && promociones.length > 0) {
      // Implementar lógica de descuentos directamente aquí
      const descuentos: DescuentoAplicado[] = [];

      for (const promo of promociones) {
        if (!promo.activa) continue;

        // Validar que la promoción esté vigente en día/hora actual
        const ahora = new Date();
        const diaSemana = ahora.getDay();
        const horaActual = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;

        // Validar día
        if (promo.diasAplicables) {
          try {
            const dias = JSON.parse(promo.diasAplicables);
            if (!dias.includes(diaSemana)) {
              continue; // Esta promoción no aplica hoy
            }
          } catch {
            // Si no se puede parsear, asumir que aplica todos los días
          }
        }

        // Validar hora
        if (promo.horaInicio && promo.horaFin) {
          if (horaActual < promo.horaInicio || horaActual > promo.horaFin) {
            continue; // Esta promoción no aplica en esta hora
          }
        }

        // Obtener IDs de items en la promoción
        const idsEnPromo = new Set((promo.items || []).map((item: any) => item.id));

        // Obtener items del carrito que están en la promoción
        const itemsEnPromo = cart.filter(
          cartItem => cartItem.item.id !== undefined && idsEnPromo.has(cartItem.item.id)
        );

        if (itemsEnPromo.length === 0) continue;

        // Calcular cantidad total de items de esta promoción
        const cantidadTotal = itemsEnPromo.reduce((sum, item) => sum + item.quantity, 0);

        // Calcular cuántas veces completa se la promoción
        const vecesQueAplica = Math.floor(cantidadTotal / (promo.itemsRequeridos || 1));

        if (vecesQueAplica > 0) {
          // Crear un array plano con todos los items (repetidos según cantidad)
          const itemsPlanos = itemsEnPromo.flatMap(cartItem =>
            Array(cartItem.quantity)
              .fill(null)
              .map(() => ({
                id: cartItem.item.id!,
                nombre: cartItem.item.nombre,
                precio: cartItem.item.precio
              }))
          );

          // Ordenar por precio (menor a mayor) para aplicar descuento al más barato
          itemsPlanos.sort((a, b) => a.precio - b.precio);

          // Aplicar descuentos
          let descuentoTotal = 0;
          let itemsGratis = 0;

          for (let i = 0; i < vecesQueAplica; i++) {
            // En cada aplicación de la promoción, el PRIMER item (más barato) es gratis
            // De cada grupo de itemsRequeridos, tomamos el primero (índice 0 del grupo)
            const indiceGratis = i * (promo.itemsRequeridos || 1);

            if (indiceGratis < itemsPlanos.length) {
              const itemGratis = itemsPlanos[indiceGratis];
              descuentoTotal += itemGratis.precio;
              itemsGratis++;
            }
          }

          if (descuentoTotal > 0) {
            const precioItemGratis = itemsPlanos[0]?.precio || 0;
            descuentos.push({
              promocionId: promo.id,
              promocionNombre: promo.nombre,
              descuentoTotal,
              cantidadItems: itemsGratis,
              precioItemGratis
            });
          }
        }
      }

      setDescuentosAplicados(descuentos);
    } else {
      setDescuentosAplicados([]);
    }
  }, [cart, promociones]);

  // Calcular descuento total
  const calcularDescuentoTotal = useCallback(() => {
    return descuentosAplicados.reduce((sum, d) => sum + d.descuentoTotal, 0);
  }, [descuentosAplicados]);

  // Calcular total con descuentos
  const calcularTotal = useCallback(() => {
    const subtotal = calcularSubtotal();
    const descuento = calcularDescuentoTotal();
    return Math.max(0, subtotal - descuento);
  }, [calcularSubtotal, calcularDescuentoTotal]);

  const obtenerCantidadItems = useCallback(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  return (
    <PedidoContext.Provider value={{
      cart,
      mesaNumero,
      esParaLlevar,
      cuentaId,
      continuePedidoId,
      promociones,
      descuentosAplicados,
      setMesaNumero,
      setEsParaLlevar,
      setCuentaId,
      setContinuePedidoId,
      setPromociones,
      agregarAlCarrito,
      eliminarDelCarrito,
      actualizarCantidad,
      limpiarCarrito,
      limpiarTodo,
      calcularTotal,
      calcularSubtotal,
      calcularDescuentoTotal,
      obtenerCantidadItems
    }}>
      {children}
    </PedidoContext.Provider>
  );
}

export function usePedidoContext() {
  const context = useContext(PedidoContext);
  if (!context) {
    throw new Error('usePedidoContext debe usarse dentro de PedidoProvider');
  }
  return context;
}
