import { MenuItem } from '@/lib/googleSheets';

export interface ProductOption {
  id: string;
  name: string;
  price?: number;
  category: 'complemento' | 'soya' | 'cubiertos';
}

export interface CartItemOptions {
  complementos: ProductOption[];
  soya: ProductOption | null;
  cubiertos: ProductOption | null;
  comentarios?: string;
  special?: string; // Para opciones especiales como "Con chile", "Sin chile", etc
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  options: CartItemOptions;
  subtotal: number;
}

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  isOpen: boolean;
}

export interface CartContextType {
  cart: CartState;
  addToCart: (item: MenuItem, options: CartItemOptions) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
}

// Opciones predefinidas para el restaurante
export const PRODUCT_OPTIONS = {
  complementos: [
    { id: 'salsa-chipotle', name: 'Salsa Chipotle', price: 0, category: 'complemento' as const },
    { id: 'salsa-anguila', name: 'Salsa de Anguila', price: 0, category: 'complemento' as const },
  ],
  soya: [
    { id: 'soya-picante', name: 'Con Picante', price: 0, category: 'soya' as const },
    { id: 'soya-normal', name: 'Sin Picante', price: 0, category: 'soya' as const },
  ],
  cubiertos: [
    { id: 'tenedor', name: 'Tenedor', price: 0, category: 'cubiertos' as const },
    { id: 'palillos', name: 'Palillos', price: 0, category: 'cubiertos' as const },
  ],
} as const;