'use client'

import { motion } from 'framer-motion'

interface LoadingSkeletonProps {
  height?: string
  className?: string
}

export const LoadingSkeleton = ({ height = 'h-64', className = '' }: LoadingSkeletonProps) => {
  return (
    <div className={`${height} ${className} animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg relative overflow-hidden`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
    </div>
  )
}

export const MenuCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <LoadingSkeleton height="h-48" className="rounded-none" />
      <div className="p-6 space-y-3">
        <LoadingSkeleton height="h-6" className="w-3/4" />
        <LoadingSkeleton height="h-4" className="w-full" />
        <LoadingSkeleton height="h-4" className="w-2/3" />
        <LoadingSkeleton height="h-8" className="w-1/3" />
      </div>
    </div>
  )
}

export const PageLoadingSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-primary-300 border-t-primary-600 rounded-full mx-auto mb-4"
        />
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl font-semibold text-secondary-600"
        >
          Cargando Mazuhi Sushi...
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-secondary-500 mt-2"
        >
          Preparando los mejores sabores
        </motion.p>
      </motion.div>
    </div>
  )
}