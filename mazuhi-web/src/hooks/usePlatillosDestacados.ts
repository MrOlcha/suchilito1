'use client'

import { useState, useEffect } from 'react'
import { MenuItem } from '@/lib/googleSheets'

export const usePlatillosDestacados = () => {
  const [platillos, setPlatillos] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPlatillosDestacados = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/platillos-destacados')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        setPlatillos(data)
      } catch (err) {
        console.error('Error fetching platillos destacados:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
        setPlatillos([])
      } finally {
        setLoading(false)
      }
    }

    fetchPlatillosDestacados()
  }, [])

  return { platillos, loading, error }
}