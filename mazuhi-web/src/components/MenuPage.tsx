'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { menuData, MenuCategory, MenuItem } from '@/data/menuData'

const MenuPage = () => {
  const [activeCategory, setActiveCategory] = useState<string>('entradas')
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  
  const currentCategory = menuData.find(cat => cat.id === activeCategory)

  // Function to handle category change and auto-scroll
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId)
    scrollToCategory(categoryId)
  }

  // Function to scroll to center a category
  const scrollToCategory = (categoryId: string) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const categoryIndex = menuData.findIndex(cat => cat.id === categoryId)
      
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

  // Auto-scroll to center the initial category on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToCategory(activeCategory)
    }, 500) // Small delay to ensure DOM is ready
    
    return () => clearTimeout(timer)
  }, [])

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
    if (item.isNew) badges.push({ text: 'Nuevo', color: 'bg-primary-300 text-white' })
    if (item.isSpicy) badges.push({ text: 'Picante', color: 'bg-red-500 text-white' })
    if (item.isVegetarian) badges.push({ text: 'Vegetariano', color: 'bg-green-500 text-white' })
    return badges
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-secondary-600 mb-4">
            Nuestro Menú
          </h1>
          <p className="text-xl text-secondary-500 max-w-3xl mx-auto">
            Descubre una experiencia culinaria única con nuestros platos artesanales, 
            preparados con los ingredientes más frescos y técnicas tradicionales japonesas.
          </p>
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
            {menuData.map((category, index) => (
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
                    ? 'bg-primary-300 text-white shadow-lg'
                    : 'bg-white text-secondary-600 hover:bg-primary-50 border border-gray-200'
                }`}
              >
                <span className="mr-2 text-lg">{category.emoji}</span>
                {category.name}
                
                {/* Active indicator */}
                {activeCategory === category.id && (
                  <motion.div
                    layoutId="activeTabDesktop"
                    className="absolute inset-0 bg-primary-300 rounded-full -z-10"
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
                {menuData.map((category, index) => (
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
                        ? 'bg-primary-300 text-white shadow-lg scale-105'
                        : 'bg-white text-secondary-600 hover:bg-primary-50 border border-gray-200 opacity-75'
                    }`}
                    style={{ scrollSnapAlign: 'center' }}
                  >
                    <span className="mr-2 text-base">{category.emoji}</span>
                    <span className="text-sm font-medium">{category.name}</span>
                    
                    {/* Active indicator for mobile */}
                    {activeCategory === category.id && (
                      <motion.div
                        layoutId="activeTabMobile"
                        className="absolute inset-0 bg-primary-300 rounded-full -z-10"
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
                className="text-xs text-secondary-400 flex items-center bg-gray-50 px-3 py-1 rounded-full border border-gray-200"
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
                <div className="text-6xl mb-4">{currentCategory.emoji}</div>
                <h2 className="text-3xl md:text-4xl font-bold text-secondary-600 mb-4">
                  {currentCategory.name}
                </h2>
                <p className="text-lg text-secondary-500 max-w-2xl mx-auto">
                  {currentCategory.description}
                </p>
              </motion.div>

              {/* Menu Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {currentCategory.items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    custom={index}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
                  >
                    {/* Item Image/Emoji */}
                    <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center relative group-hover:scale-105 transition-transform duration-300">
                      <span className="text-6xl">{item.emoji}</span>
                      
                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {getBadges(item).map((badge, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}
                          >
                            {badge.text}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Item Content */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold text-secondary-600 group-hover:text-primary-300 transition-colors duration-300">
                          {item.name}
                        </h3>
                        <span className="text-2xl font-bold text-primary-300">
                          {item.price}
                        </span>
                      </div>
                      
                      <p className="text-secondary-500 text-sm mb-4 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Ingredients */}
                      {item.ingredients && (
                        <div className="mb-4">
                          <h4 className="text-xs font-semibold text-secondary-600 mb-2 uppercase tracking-wide">
                            Ingredientes:
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {item.ingredients.map((ingredient, idx) => (
                              <span
                                key={idx}
                                className="bg-gray-100 text-secondary-500 px-2 py-1 rounded-full text-xs"
                              >
                                {ingredient}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Add to Cart Button */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full bg-secondary-600 hover:bg-secondary-700 text-white font-medium py-3 rounded-full transition-colors duration-300 flex items-center justify-center space-x-2"
                      >
                        <span>Agregar al Carrito</span>
                        <span>🛒</span>
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  )
}

export default MenuPage