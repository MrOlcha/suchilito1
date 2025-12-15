'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { CartState, CartContextType, CartItem, CartItemOptions } from '@/types/cart';
import { MenuItem } from '@/lib/googleSheets';

const initialCartState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
  isOpen: false,
};

type CartAction =
  | { type: 'ADD_TO_CART'; payload: { item: MenuItem; options: CartItemOptions } }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'LOAD_CART'; payload: CartState };

function calculateSubtotal(item: MenuItem, options: CartItemOptions, quantity: number): number {
  const basePrice = item.precio;
  const complementosPrice = options.complementos.reduce((sum, comp) => sum + (comp.price || 0), 0);
  return (basePrice + complementosPrice) * quantity;
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const { item, options } = action.payload;
      
      // Crear un nuevo item individual con ID único
      const id = `${item.nombre}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const newCartItem: CartItem = {
        id,
        menuItem: item,
        quantity: 1, // Siempre 1 porque cada item es individual
        options,
        subtotal: calculateSubtotal(item, options, 1),
      };

      const newItems = [...state.items, newCartItem];
      const newTotal = newItems.reduce((sum, cartItem) => sum + cartItem.subtotal, 0);
      const newItemCount = newItems.reduce((sum, cartItem) => sum + cartItem.quantity, 0);

      return {
        ...state,
        items: newItems,
        total: newTotal,
        itemCount: newItemCount,
      };
    }

    case 'REMOVE_FROM_CART': {
      const newItems = state.items.filter(item => item.id !== action.payload);
      const newTotal = newItems.reduce((sum, cartItem) => sum + cartItem.subtotal, 0);
      const newItemCount = newItems.reduce((sum, cartItem) => sum + cartItem.quantity, 0);

      return {
        ...state,
        items: newItems,
        total: newTotal,
        itemCount: newItemCount,
      };
    }

    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      
      if (quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_FROM_CART', payload: id });
      }

      const newItems = state.items.map(item => {
        if (item.id === id) {
          const newSubtotal = calculateSubtotal(item.menuItem, item.options, quantity);
          return { ...item, quantity, subtotal: newSubtotal };
        }
        return item;
      });

      const newTotal = newItems.reduce((sum, cartItem) => sum + cartItem.subtotal, 0);
      const newItemCount = newItems.reduce((sum, cartItem) => sum + cartItem.quantity, 0);

      return {
        ...state,
        items: newItems,
        total: newTotal,
        itemCount: newItemCount,
      };
    }

    case 'CLEAR_CART':
      return initialCartState;

    case 'TOGGLE_CART':
      return {
        ...state,
        isOpen: !state.isOpen,
      };

    case 'LOAD_CART':
      return action.payload;

    default:
      return state;
  }
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, dispatch] = useReducer(cartReducer, initialCartState);

  // Cargar carrito desde localStorage al inicializar
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('sushi-cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: parsedCart });
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    try {
      localStorage.setItem('sushi-cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cart]);

  const addToCart = (item: MenuItem, options: CartItemOptions) => {
    dispatch({ type: 'ADD_TO_CART', payload: { item, options } });
  };

  const removeFromCart = (id: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: id });
  };

  // Función simplificada - ya no necesitamos updateQuantity
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
    }
    // No hacemos nada más porque cada item es individual
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' });
  };

  const contextValue: CartContextType = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleCart,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}