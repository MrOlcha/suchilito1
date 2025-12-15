import dynamic from 'next/dynamic'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import { LoadingSkeleton } from '@/components/LoadingComponents'

// Lazy loading de componentes no críticos con mejores skeletons
const PromotionsSection = dynamic(() => import('@/components/PromotionsSection'), {
  loading: () => (
    <section className="section-padding bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <LoadingSkeleton height="h-12" className="w-96 mx-auto mb-8" />
        <LoadingSkeleton height="h-6" className="w-2xl mx-auto mb-16" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <LoadingSkeleton key={i} height="h-80" />
          ))}
        </div>
      </div>
    </section>
  )
})

const MenuSection = dynamic(() => import('@/components/MenuSection'), {
  loading: () => (
    <section className="section-padding bg-white">
      <div className="max-w-7xl mx-auto">
        <LoadingSkeleton height="h-16" className="w-80 mx-auto mb-4" />
        <LoadingSkeleton height="h-6" className="w-xl mx-auto mb-16" />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => (
            <LoadingSkeleton key={i} height="h-96" />
          ))}
        </div>
      </div>
    </section>
  )
})

const Footer = dynamic(() => import('@/components/Footer'), {
  loading: () => (
    <footer className="bg-secondary-600">
      <LoadingSkeleton height="h-64" className="rounded-none" />
    </footer>
  )
})

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <PromotionsSection />
      <MenuSection />
      <Footer />
    </main>
  )
}