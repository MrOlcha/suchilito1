'use client'

import { CartProvider } from '@/contexts/CartContext'
import CartSidebar from '@/components/CartSidebar'
import BottomNavigation from '@/components/BottomNavigation'
import ServiceWorker from '@/components/ServiceWorker'

export function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <ServiceWorker />
      {children}
      <CartSidebar />
      <BottomNavigation />
    </CartProvider>
  )
}
