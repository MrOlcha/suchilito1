export type DeliveryType = 'pickup' | 'delivery';
export type PaymentMethod = 'cash' | 'card';

export interface ContactInfo {
  name: string;
  phone: string;
}

export interface DeliveryInfo {
  type: DeliveryType;
  address?: string; // Solo requerido para delivery
  coordinates?: { lat: number; lng: number }; // Coordenadas seleccionadas desde el mapa
}

export interface PaymentInfo {
  method: PaymentMethod;
  cashAmount?: number; // Solo para efectivo
  exactChange?: boolean; // Pago con cambio exacto
}

export interface CheckoutData {
  contact: ContactInfo;
  delivery: DeliveryInfo;
  payment: PaymentInfo;
  notes?: string; // Notas adicionales del pedido
  // Campos de respuesta después del envío
  orderNumber?: string;
  success?: boolean;
  message?: string;
}

export interface CheckoutStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
}

// Denominaciones de efectivo disponibles
export const CASH_DENOMINATIONS = [
  { value: 20, label: '$20' },
  { value: 50, label: '$50' },
  { value: 100, label: '$100' },
  { value: 200, label: '$200' },
  { value: 500, label: '$500' },
  { value: 1000, label: '$1,000' },
] as const;

// Validaciones
export interface ValidationErrors {
  contact?: {
    name?: string;
    phone?: string;
  };
  delivery?: {
    address?: string;
  };
  payment?: {
    cashAmount?: string;
    exactChange?: string;
  };
}