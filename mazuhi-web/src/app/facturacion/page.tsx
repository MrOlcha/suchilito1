import FacturacionPage from '@/components/FacturacionPage'
import Header from '@/components/Header'
import BottomNavigation from '@/components/BottomNavigation'

export const metadata = {
  title: 'Facturación - Sushi Time',
  description: 'Genera tu factura electrónica con los datos de tu ticket de compra',
}

export default function Facturacion() {
  return (
    <>
      <Header />
      <FacturacionPage />
      <BottomNavigation />
    </>
  )
}
