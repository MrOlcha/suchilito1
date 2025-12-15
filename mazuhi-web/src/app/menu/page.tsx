import Header from '@/components/Header'
import MenuPageDynamic from '@/components/MenuPageDynamic'
import Footer from '@/components/Footer'

export default function Menu() {
  return (
    <main className="min-h-screen">
      <Header />
      <MenuPageDynamic />
      <Footer />
    </main>
  )
}