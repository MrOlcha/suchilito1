import { useEffect, useCallback } from 'react';

export interface ComandaEvento {
  tipo: 'item_completado' | 'item_descompletado' | 'estado_cambio';
  pedidoId: number;
  itemIndex?: number;
  estado?: string;
  timestamp: string;
}

export function useComandaRealtime(
  onEventoRecibido: (evento: ComandaEvento) => void
) {
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;

    const conectar = () => {
      try {
        console.log('[Hook] Conectando a SSE...');
        eventSource = new EventSource('/pos/api/comanda/eventos');

        eventSource.onopen = () => {
          console.log('[Hook] Conectado a SSE');
          reconnectAttempts = 0;
        };

        eventSource.onmessage = (event) => {
          try {
            // Ignorar heartbeats
            if (event.data === '' || event.data.includes('heartbeat')) {
              return;
            }
            
            console.log('[Hook] Evento recibido:', event.data);
            const data = JSON.parse(event.data);
            onEventoRecibido(data);
          } catch (error) {
            console.error('[Hook] Error parseando evento:', error, 'Data:', event.data);
          }
        };

        eventSource.onerror = (error) => {
          console.error('[Hook] Error en conexión SSE:', error);
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          
          // Intentar reconectar
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
            console.log(`[Hook] Reintentando conexión en ${delay}ms...`);
            setTimeout(conectar, delay);
          }
        };
      } catch (error) {
        console.error('[Hook] Error configurando SSE:', error);
      }
    };

    conectar();

    return () => {
      console.log('[Hook] Desconectando SSE');
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [onEventoRecibido]);
}

/**
 * Envía un evento de comanda a todos los clientes conectados
 */
export async function enviarEventoComanda(evento: Omit<ComandaEvento, 'timestamp'>) {
  try {
    console.log('[enviarEventoComanda] Enviando evento:', evento);
    
    const response = await fetch('/pos/api/comanda/eventos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(evento)
    });

    if (!response.ok) {
      console.error('[enviarEventoComanda] Error:', response.statusText);
      return;
    }

    const data = await response.json();
    console.log('[enviarEventoComanda] Respuesta:', data);
    return data;
  } catch (error) {
    console.error('[enviarEventoComanda] Error:', error);
  }
}
