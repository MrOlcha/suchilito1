import { useState, useEffect } from 'react'
import { Promocion } from '@/types/promocion'

interface UsePromocionesResult {
  promociones: Promocion[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function usePromociones(tipo?: 'sucursal' | 'domicilio'): UsePromocionesResult {
  const [promociones, setPromociones] = useState<Promocion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPromociones = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const url = tipo 
        ? `/api/promociones?tipo=${tipo}`
        : '/api/promociones'
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        setPromociones(result.data)
      } else {
        throw new Error(result.error || 'Failed to fetch promociones')
      }
    } catch (err) {
      console.error('Error fetching promociones:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setPromociones([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPromociones()
  }, [tipo])

  return {
    promociones,
    loading,
    error,
    refetch: fetchPromociones
  }
}