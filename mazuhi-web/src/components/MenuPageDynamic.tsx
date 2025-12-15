'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { PlusIcon } from '@heroicons/react/24/outline'
import { useMenuData } from '@/hooks/useMenuData'
import { useAuth } from '@/contexts/AuthContext'
import { MenuItem, MenuCategory } from '@/lib/googleSheets'
import ProductCustomizationModal from '@/components/ProductCustomizationModal'
import AuthPromptModal from '@/components/AuthPromptModal'

const MenuPage = () => {
  const router = useRouter()
  const { user } = useAuth()
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  
  // Usar datos reales de Google Sheets
  const { menuData, loading, error, refetch } = useMenuData()
  
  const currentCategory = menuData?.find((cat: MenuCategory) => cat.id === activeCategory)

  // Set first category as active when data loads
  useEffect(() => {
    if (menuData && menuData.length > 0 && !activeCategory) {
      const firstCategory = menuData[0].id
      setActiveCategory(firstCategory)
      console.log('📌 Auto-seleccionando primera categoría:', firstCategory)
    }
  }, [menuData, activeCategory])

  // Function to handle category change and auto-scroll
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId)
    scrollToCategory(categoryId)
  }

  // Function to manually refresh menu
  const handleRefreshMenu = async () => {
    setIsRefreshing(true)
    try {
      await refetch()
      console.log('✅ Menú actualizado manualmente')
    } catch (error) {
      console.error('Error refreshing menu:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Function to scroll to center a category
  const scrollToCategory = (categoryId: string) => {
    if (scrollContainerRef.current && menuData) {
      const container = scrollContainerRef.current
      const categoryIndex = menuData.findIndex((cat: MenuCategory) => cat.id === categoryId)
      
      // Get actual button width from DOM
      const buttons = container.querySelectorAll('button')
      if (buttons[categoryIndex]) {
        const button = buttons[categoryIndex] as HTMLElement
        const buttonRect = button.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect()
        
        const buttonCenter = button.offsetLeft + button.offsetWidth / 2
        const containerCenter = container.offsetWidth / 2
        const scrollPosition = buttonCenter - containerCenter
        
        container.scrollTo({
          left: Math.max(0, scrollPosition),
          behavior: 'smooth'
        })
      }
    }
  }

  // Auto-scroll to center the active category
  useEffect(() => {
    if (menuData && menuData.length > 0 && activeCategory) {
      const timer = setTimeout(() => {
        scrollToCategory(activeCategory)
      }, 500) // Small delay to ensure DOM is ready
      
      return () => clearTimeout(timer)
    }
  }, [menuData, activeCategory])

  const categoryVariants = {
    enter: { opacity: 0, y: 20 },
    center: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.1,
        duration: 0.5
      }
    })
  }

  const getBadges = (item: MenuItem) => {
    const badges = []
    // Si promomiercoles es true, solo mostrar "Participa" y no "Nuevo"
    if (item.promomiercoles) {
      badges.push({ text: 'Participa', color: 'bg-green-600 text-white border-2 border-white', style: 'font-bold' })
    } else {
      if (item.nuevo) badges.push({ text: 'Nuevo', color: 'bg-green-500 text-white' })
    }
    if (item.picante) badges.push({ text: 'Picante', color: 'bg-red-500 text-white' })
    if (item.vegetariano) badges.push({ text: 'Vegetariano', color: 'bg-green-600 text-white' })
    return badges
  }

  const getCategoryEmoji = (categoryId: string) => {
    const emojiMap: { [key: string]: string } = {
      'entradas': '🥢',
      'arroces': '🍚',
      'rollos-naturales': '🍣',
      'rollos-empanizados': '🍤',
      'rollos-especiales': '✨',
      'rollos-horneados': '🔥',
      'bebidas': '🥤',
      'postres': '🍮',
      'extras': '🍜'
    }
    return emojiMap[categoryId] || '🍱'
  }

  const getCategoryDescription = (categoryId: string) => {
    const descriptionMap: { [key: string]: string } = {
      'entradas': 'Deliciosos aperitivos para comenzar tu experiencia culinaria',
      'arroces': 'Arroces preparados con mariscos frescos y el sazón sinaloense',
      'rollos-naturales': 'Sushi tradicional con pescado fresco y vegetales',
      'rollos-empanizados': 'Rollos crujientes y dorados al estilo tempura',
      'rollos-especiales': 'Creaciones únicas de nuestro chef especialista',
      'rollos-horneados': 'Deliciosos rollos gratinados con ingredientes especiales',
      'bebidas': 'Refrescantes bebidas para acompañar tu comida',
      'postres': 'Dulces tradicionales para terminar perfectamente',
      'extras': 'Acompañamientos y salsas especiales'
    }
    return descriptionMap[categoryId] || 'Descubre nuestras especialidades'
  }

  const handleAddToCart = (item: MenuItem) => {
    console.log('🛒 Agregando al carrito:', item.nombre);
    
    // Si no hay usuario, mostrar modal de autenticación
    if (!user) {
      const cartData = {
        product: item,
        configurations: [{
          complementos: [],
          soya: { id: 'sin-picante', name: 'Sin Picante' },
          cubiertos: { id: 'tenedor', name: 'Tenedor' },
          comentarios: ''
        }]
      }
      sessionStorage.setItem('pendingCartItem', JSON.stringify(cartData))
      setSelectedItem(item)
      setShowAuthPrompt(true)
      return
    }

    // Verificar si el email está verificado
    if (user.email_verificado === 0) {
      alert('⚠️ Debes verificar tu correo electrónico antes de realizar pedidos.\n\nRevisa tu email y verifica tu cuenta.');
      return;
    }
    
    // Si está logueado, mostrar modal de personalización
    setSelectedItem(item)
    setIsModalOpen(true)
    console.log('🎯 Modal abierto, item seleccionado:', item);
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedItem(null)
  }

  // Loading state
  if (loading) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            {/* Animación de comida/vapor */}
            <div className="relative mb-8">
              <div className="relative inline-block">
                {/* Plato base con sombra */}
                <div className="w-28 h-28 bg-gradient-to-br from-orange-200 via-orange-300 to-orange-400 rounded-full mx-auto mb-4 shadow-2xl relative overflow-hidden">
                  {/* Brillo en el plato */}
                  <div className="absolute top-2 left-4 w-8 h-4 bg-white rounded-full opacity-30"></div>
                  
                  {/* Comida en el plato - Sushi rolls */}
                  <div className="absolute top-3 left-1/2 transform -translate-x-1/2">
                    {/* Sushi roll 1 */}
                    <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-red-600 rounded-full relative">
                      <div className="w-3 h-3 bg-white rounded-full absolute top-1.5 left-1.5"></div>
                      <div className="w-1.5 h-1.5 bg-red-700 rounded-full absolute top-2.5 left-2.5"></div>
                    </div>
                    
                    {/* Sushi roll 2 */}
                    <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full absolute top-1 left-6 relative">
                      <div className="w-3 h-3 bg-white rounded-full absolute top-1.5 left-1.5"></div>
                      <div className="w-1.5 h-1.5 bg-orange-700 rounded-full absolute top-2.5 left-2.5"></div>
                    </div>
                    
                    {/* Sushi roll 3 */}
                    <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-full absolute top-3 left-3 relative">
                      <div className="w-3 h-3 bg-white rounded-full absolute top-1.5 left-1.5"></div>
                      <div className="w-1.5 h-1.5 bg-green-700 rounded-full absolute top-2.5 left-2.5"></div>
                    </div>
                    
                    {/* Jengibre */}
                    <div className="w-3 h-2 bg-gradient-to-r from-pink-300 to-pink-400 rounded-full absolute top-5 left-8"></div>
                    
                    {/* Wasabi */}
                    <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-green-500 rounded-full absolute top-6 left-1"></div>
                  </div>
                </div>
                
                {/* Vapor animado más realista */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="animate-bounce">
                    <div className="w-1 h-8 bg-gradient-to-t from-gray-400 via-gray-300 to-transparent rounded-full opacity-70 animate-pulse"></div>
                  </div>
                  <div className="absolute -left-2 top-1 animate-bounce" style={{ animationDelay: '0.3s' }}>
                    <div className="w-0.5 h-6 bg-gradient-to-t from-gray-400 via-gray-300 to-transparent rounded-full opacity-60 animate-pulse"></div>
                  </div>
                  <div className="absolute -right-2 top-1 animate-bounce" style={{ animationDelay: '0.6s' }}>
                    <div className="w-0.5 h-6 bg-gradient-to-t from-gray-400 via-gray-300 to-transparent rounded-full opacity-60 animate-pulse"></div>
                  </div>
                  <div className="absolute -left-4 top-2 animate-bounce" style={{ animationDelay: '0.9s' }}>
                    <div className="w-0.5 h-4 bg-gradient-to-t from-gray-300 to-transparent rounded-full opacity-50 animate-pulse"></div>
                  </div>
                  <div className="absolute -right-4 top-2 animate-bounce" style={{ animationDelay: '1.2s' }}>
                    <div className="w-0.5 h-4 bg-gradient-to-t from-gray-300 to-transparent rounded-full opacity-50 animate-pulse"></div>
                  </div>
                </div>

                {/* Partículas flotantes */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                  <div className="absolute top-4 left-8 w-1 h-1 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                  <div className="absolute top-6 right-8 w-1 h-1 bg-orange-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute top-2 right-12 w-0.5 h-0.5 bg-red-400 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
              Preparando menú delicioso...
            </h2>
            <p className="text-gray-600 text-lg mb-6">
              Los exquisitos platillos están por aparecer 🍣
            </p>
            
            {/* Mensaje motivacional rotativo */}
            <div className="mb-6">
              <p className="text-sm text-gray-500 animate-pulse">
                Cada plato es preparado con mariscos frescos y el sazón sinaloense
              </p>
            </div>
            
            {/* Puntos de carga animados con colores de comida */}
            <div className="flex justify-center space-x-3">
              <div className="w-4 h-4 bg-red-500 rounded-full animate-bounce shadow-lg"></div>
              <div className="w-4 h-4 bg-orange-500 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-4 h-4 bg-green-500 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.4s' }}></div>
              <div className="w-4 h-4 bg-yellow-500 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.6s' }}></div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Error state
  if (error) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Error al cargar el menú</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-[#E09E7D] text-white px-6 py-3 rounded-lg hover:bg-opacity-80 transition-colors"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </section>
    )
  }

  // No data state
  if (!menuData || menuData.length === 0) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-gray-600 mb-2">Menú no disponible</h2>
            <p className="text-gray-500">No se pudieron cargar los datos del menú</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 relative"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-[#374058] mb-4 font-condiment">
            Nuestro Menú
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            Descubre una experiencia culinaria única con nuestros platillos artesanales, 
            preparados con mariscos frescos de Sinaloa y una deliciosa fusión de sabores orientales.
          </p>
          
          {/* Refresh Button */}
          <button
            onClick={handleRefreshMenu}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#E09E7D] hover:bg-[#d88a6a] text-white rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isRefreshing ? 'Actualizando...' : 'Actualizar Menú'}
          </button>
        </motion.div>

        {/* Category Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-12"
        >
          {/* Desktop Navigation */}
          <div className="hidden lg:flex flex-wrap justify-center gap-4">
            {menuData.map((category: MenuCategory, index: number) => (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCategoryChange(category.id)}
                className={`relative px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  activeCategory === category.id
                    ? 'bg-[#E09E7D] text-white shadow-lg'
                    : 'bg-white text-[#374058] hover:bg-orange-50 border border-gray-200'
                }`}
              >
                <span className="mr-2 text-lg">{getCategoryEmoji(category.id)}</span>
                {category.nombre}
                <span className="ml-2 text-sm opacity-75">({category.items.length})</span>
                
                {/* Active indicator */}
                {activeCategory === category.id && (
                  <motion.div
                    layoutId="activeTabDesktop"
                    className="absolute inset-0 bg-[#E09E7D] rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Mobile Navigation - Horizontal Scrollable */}
          <div className="lg:hidden">
            <div 
              ref={scrollContainerRef}
              className="overflow-x-auto scrollbar-hide scroll-smooth"
              style={{ 
                scrollSnapType: 'x mandatory',
                scrollPadding: '0 50%' 
              }}
            >
              <div 
                className="flex space-x-4 py-2" 
                style={{ 
                  width: 'max-content',
                  paddingLeft: '25%',
                  paddingRight: '25%'
                }}
              >
                {menuData.map((category: MenuCategory, index: number) => (
                  <motion.button
                    key={category.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`relative px-5 py-2.5 rounded-full font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0 min-w-fit ${
                      activeCategory === category.id
                        ? 'bg-[#E09E7D] text-white shadow-lg scale-105'
                        : 'bg-white text-[#374058] hover:bg-orange-50 border border-gray-200 opacity-75'
                    }`}
                    style={{ scrollSnapAlign: 'center' }}
                  >
                    <span className="mr-2 text-base">{getCategoryEmoji(category.id)}</span>
                    <span className="text-sm font-medium">{category.nombre}</span>
                    
                    {/* Active indicator for mobile */}
                    {activeCategory === category.id && (
                      <motion.div
                        layoutId="activeTabMobile"
                        className="absolute inset-0 bg-[#E09E7D] rounded-full -z-10"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
            
            {/* Scroll Indicator */}
            <div className="flex justify-center mt-3">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1 }}
                className="text-xs text-gray-500 flex items-center bg-gray-50 px-3 py-1 rounded-full border border-gray-200"
              >
                <span>👈</span>
                <span className="mx-2">Desliza para explorar</span>
                <span>👉</span>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Category Content */}
        <AnimatePresence mode="wait">
          {currentCategory && (
            <motion.div
              key={activeCategory}
              variants={categoryVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5 }}
            >
              {/* Category Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <div className="text-6xl mb-4">{getCategoryEmoji(currentCategory.id)}</div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#374058] mb-4">
                  {currentCategory.nombre}
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  {getCategoryDescription(currentCategory.id)}
                </p>
                <div className="mt-4 text-sm text-gray-500">
                  {currentCategory.items.length} {currentCategory.items.length === 1 ? 'producto' : 'productos'} disponible{currentCategory.items.length !== 1 ? 's' : ''}
                </div>
              </motion.div>

              {/* Menu Items Grid */}
              {currentCategory.items.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {currentCategory.items.map((item: MenuItem, index: number) => {
                    // Debug: verificar que favorito esté llegando
                    console.log(`� Item: ${item.nombre}, favorito: ${item.favorito}`);
                    
                    return (
                    <motion.div
                      key={index}
                      custom={index}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover={{ y: -5 }}
                      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
                    >
                      {/* Item Image/Emoji */}
                      <div className="h-64 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center relative group-hover:scale-105 transition-transform duration-300">
                        
                        {/* Background emoji/image */}
                        <span className="text-7xl z-0">{getCategoryEmoji(currentCategory.id)}</span>
                        
                        {/* Image if available */}
                        {item.imagen_url && (
                          <img 
                            src={item.imagen_url} 
                            alt={item.nombre}
                            className="absolute inset-0 w-full h-full object-cover z-5"
                          />
                        )}
                        
                        {/* Favorite Badge - Top Right */}
                        {item.favorito && (
                          <div className="absolute top-2 right-2 z-10">
                            <div className="bg-red-600 text-white px-3 py-2 rounded-full text-sm font-bold flex items-center gap-1 shadow-2xl border-2 border-white animate-pulse">
                              ❤️ Favorito
                            </div>
                          </div>
                        )}
                        
                        {/* Other Badges - Top Left */}
                        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                          {getBadges(item).map((badge, idx) => (
                            <span
                              key={idx}
                              className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color} ${badge.style || ''}`}
                              style={badge.text === 'Participa' ? { boxShadow: '0 0 0 4px #fff', fontWeight: 700 } : {}}
                            >
                              {badge.text}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Item Content */}
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-xl font-bold text-[#374058] group-hover:text-[#E09E7D] transition-colors duration-300">
                            {item.nombre}
                          </h3>
                          <span className="text-2xl font-bold text-[#E09E7D]">
                            ${item.precio.toLocaleString()}
                          </span>
                        </div>
                        
                        {item.descripcion && (
                          <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                            {item.descripcion}
                          </p>
                        )}

                        {/* Add to Cart Button */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAddToCart(item)}
                          className="w-full bg-[#374058] hover:bg-[#2a2f42] text-white font-medium py-3 rounded-full transition-colors duration-300 flex items-center justify-center space-x-2"
                        >
                          <PlusIcon className="w-5 h-5" />
                          <span>Agregar a la Orden</span>
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold text-gray-600 mb-2">
                    No hay productos en esta categoría
                  </h3>
                  <p className="text-gray-500">
                    Esta categoría está siendo actualizada. Vuelve pronto para ver nuevos productos.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Product Customization Modal */}
      <ProductCustomizationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        product={selectedItem}
      />

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        returnUrl={typeof window !== 'undefined' ? window.location.pathname : '/'}
      />
    </section>
  )
}

export default MenuPage
