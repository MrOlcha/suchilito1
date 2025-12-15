/**
 * Página para pedidos PARA LLEVAR
 * Ruta: /atiendemesero/para-llevar
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePedidoContext } from '@/lib/context/PedidoContext';
import MenuParaLlevar from '@/components/atiendemesero/MenuParaLlevar';

interface CuentaInfo {
  id: number;
  mesa_numero: string | null;
  es_para_llevar: number;
  numero_cuenta: string;
}

export default function ParaLlevarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setEsParaLlevar, setMesaNumero, setCuentaId, limpiarTodo } = usePedidoContext();
  const [cuentaInfo, setCuentaInfo] = useState<CuentaInfo | null>(null);
  const [loadingCuenta, setLoadingCuenta] = useState(false);

  useEffect(() => {
    // Limpiar estado anterior
    limpiarTodo();
    
    // Leer cuentaId de la URL si existe
    const cuentaParam = searchParams.get('cuenta');
    if (cuentaParam) {
      const cuentaId = parseInt(cuentaParam);
      setCuentaId(cuentaId);
      
      // Fetch información de la cuenta
      fetchCuentaInfo(cuentaId);
    } else {
      // Configurar para llevar normal
      setEsParaLlevar(true);
      setMesaNumero('PARA_LLEVAR');
    }
  }, [setEsParaLlevar, setMesaNumero, setCuentaId, limpiarTodo, searchParams]);

  const fetchCuentaInfo = async (cuentaId: number) => {
    setLoadingCuenta(true);
    try {
      const response = await fetch(`/pos/api/cuentas/${cuentaId}`);
      if (response.ok) {
        const result = await response.json();
        const cuenta = result.data || result;
        setCuentaInfo(cuenta);
        
        // Configurar según el tipo de cuenta
        if (cuenta.es_para_llevar === 1) {
          setEsParaLlevar(true);
          setMesaNumero('PARA_LLEVAR');
        } else {
          setEsParaLlevar(false);
          setMesaNumero(cuenta.mesa_numero || 'MESA');
        }
      }
    } catch (error) {
      console.error('Error fetching cuenta info:', error);
    } finally {
      setLoadingCuenta(false);
    }
  };

  return <MenuParaLlevar cuentaInfo={cuentaInfo} loadingCuenta={loadingCuenta} />;
}
