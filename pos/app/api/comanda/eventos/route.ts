import { NextRequest, NextResponse } from 'next/server';

// Almacenar conexiones SSE activas
interface SSEClient {
  controller: ReadableStreamController<Uint8Array>;
  encoder: TextEncoder;
}

const clientes: Set<SSEClient> = new Set();

export async function GET(request: NextRequest) {
  console.log('[SSE] Cliente conectándose a eventos');
  
  const encoder = new TextEncoder();
  let cliente: SSEClient | null = null;
  let heartbeatInterval: NodeJS.Timeout;
  
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      cliente = { controller, encoder };
      clientes.add(cliente);
      
      console.log(`[SSE] Cliente conectado. Total: ${clientes.size}`);
      
      // Enviar heartbeat inicial
      try {
        controller.enqueue(encoder.encode(': heartbeat\n\n'));
      } catch (e) {
        console.error('[SSE] Error enviando heartbeat inicial:', e);
      }
      
      // Heartbeat cada 30 segundos
      heartbeatInterval = setInterval(() => {
        try {
          if (cliente) {
            cliente.controller.enqueue(encoder.encode(': heartbeat\n\n'));
          }
        } catch (error) {
          console.error('[SSE] Error en heartbeat:', error);
          if (cliente) {
            clientes.delete(cliente);
          }
          clearInterval(heartbeatInterval);
        }
      }, 30000);
    },
    cancel() {
      console.log('[SSE] Conexión cerrada. Clientes restantes:', clientes.size - 1);
      if (cliente) {
        clientes.delete(cliente);
      }
      clearInterval(heartbeatInterval);
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tipo, pedidoId, itemIndex, estado } = body;

    console.log(`[SSE] Evento recibido: tipo=${tipo}, pedidoId=${pedidoId}, itemIndex=${itemIndex}`);
    console.log(`[SSE] Clientes conectados: ${clientes.size}`);

    const encoder = new TextEncoder();
    const evento = JSON.stringify({
      tipo,
      pedidoId,
      itemIndex,
      estado,
      timestamp: new Date().toISOString()
    });

    // Enviar evento a todos los clientes conectados
    let clientesNotificados = 0;
    let clientesDesconectados = 0;
    
    for (const cliente of clientes) {
      try {
        const mensaje = `data: ${evento}\n\n`;
        cliente.controller.enqueue(encoder.encode(mensaje));
        clientesNotificados++;
      } catch (error) {
        console.error('[SSE] Error enviando a cliente:', error);
        clientes.delete(cliente);
        clientesDesconectados++;
      }
    }

    console.log(`[SSE] Evento enviado a ${clientesNotificados} clientes. ${clientesDesconectados} desconectados.`);

    return NextResponse.json({
      success: true,
      clientesNotificados,
      clientesDesconectados,
      clientesTotalConectados: clientes.size
    });
  } catch (error) {
    console.error('[SSE] Error en evento comanda:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
