import { useState, useEffect } from 'react';
import { Sucursal } from '@/types/sucursal';

interface UseSucursalesReturn {
  sucursales: Sucursal[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  filterByCity: (ciudad: string) => Sucursal[];
  cities: string[];
}

export function useSucursales(): UseSucursalesReturn {
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSucursales = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching sucursales from API...');
      
      const response = await fetch('/api/sucursales', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 300 } // Cache for 5 minutes
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Sucursales loaded successfully:', result.data.length);
        setSucursales(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch sucursales');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('❌ Error fetching sucursales:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSucursales();
  }, []);

  const filterByCity = (ciudad: string): Sucursal[] => {
    if (!ciudad) return sucursales;
    return sucursales.filter(sucursal => 
      sucursal.ciudad.toLowerCase().includes(ciudad.toLowerCase())
    );
  };

  const cities = Array.from(new Set(sucursales.map(sucursal => sucursal.ciudad))).sort();

  return {
    sucursales,
    loading,
    error,
    refetch: fetchSucursales,
    filterByCity,
    cities
  };
}