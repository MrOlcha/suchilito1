import { NextRequest, NextResponse } from 'next/server';
import { getMonitoringService } from './monitoring';

/**
 * Wrapper para handlers de API que instrumenta automáticamente
 * Registra logs, métricas, errores y alertas
 */
export function withMonitoringHandler<T extends (req: NextRequest, ...args: any[]) => Promise<NextResponse>>(
  handler: T,
  options?: {
    tipo?: string;
    modulo?: string;
    criticidad?: 'baja' | 'media' | 'alta';
  }
): T {
  return (async (req: NextRequest, ...args: any[]) => {
    const startTime = Date.now();
    const monitoring = getMonitoringService();
    
    const pathname = req.nextUrl.pathname;
    const method = req.method;
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    try {
      // Ejecutar el handler
      const response = await handler(req, ...args);
      
      const duracion = Date.now() - startTime;
      const statusCode = response?.status || 200;

      // Registrar log
      const nivel: 'info' | 'warning' | 'error' | 'critical' = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warning' : 'info';
      monitoring.registrarLog({
        nivel,
        tipo: (options?.tipo || 'api_call') as any,
        modulo: options?.modulo || 'api',
        endpoint: pathname,
        metodo_http: method,
        codigo_status: statusCode,
        mensaje: `${method} ${pathname} - ${statusCode}`,
        duracion_ms: duracion,
        ip_cliente: ip,
        user_agent: userAgent
      });

      // Registrar métrica
      monitoring.registrarMetrica({
        tipo_metrica: 'api_response_time',
        nombre: pathname,
        valor: duracion,
        unidad: 'ms'
      });

      // Alertar si es muy lenta
      if (duracion > 5000) {
        monitoring.crearAlerta({
          tipo_alerta: 'slow_api',
          severidad: duracion > 10000 ? 'alta' : 'media',
          titulo: `API lenta: ${method} ${pathname}`,
          descripcion: `Tiempo de respuesta: ${duracion}ms`,
          valor_actual: duracion
        });
      }

      // Alertar si hay error
      if (statusCode >= 500) {
        monitoring.crearAlerta({
          tipo_alerta: 'api_error_5xx',
          severidad: 'alta',
          titulo: `Error 5xx: ${method} ${pathname}`,
          descripcion: `Status: ${statusCode}`,
          valor_actual: statusCode
        });
      }

      return response;
    } catch (error: any) {
      const duracion = Date.now() - startTime;

      // Registrar error
      monitoring.registrarError({
        tipo_error: error.name || 'UnknownError',
        mensaje: error.message || 'Error desconocido',
        stack_trace: error.stack,
        endpoint: pathname,
        metodo_http: method,
        url: req.url
      });

      // Registrar log crítico
      monitoring.registrarLog({
        nivel: 'critical',
        tipo: 'error',
        modulo: options?.modulo || 'api',
        endpoint: pathname,
        metodo_http: method,
        codigo_status: 500,
        mensaje: `Error crítico en ${method} ${pathname}: ${error.message}`,
        duracion_ms: duracion,
        ip_cliente: ip,
        user_agent: userAgent
      });

      // Crear alerta crítica
      monitoring.crearAlerta({
        tipo_alerta: 'api_exception',
        severidad: 'critica',
        titulo: `Excepción en API: ${method} ${pathname}`,
        descripcion: error.message,
        valor_actual: 500
      });

      return NextResponse.json(
        { 
          message: error.message || 'Error interno del servidor',
          error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        },
        { status: 500 }
      );
    }
  }) as T;
}

/**
 * Registrar una transacción (pago, pedido, etc)
 */
export function registrarTransaccion(
  tipo: string,
  monto: number,
  estado: string,
  datos?: {
    pedido_id?: number;
    cuenta_id?: number;
    usuario_id?: number;
    metodo_pago?: string;
    duracion_ms?: number;
  }
) {
  const monitoring = getMonitoringService();
  
  monitoring.registrarLog({
    nivel: estado === 'exitoso' ? 'info' : 'warning',
    tipo: 'transaction',
    modulo: tipo,
    mensaje: `Transacción ${tipo}: ${monto} - ${estado}`,
    detalles: datos
  });

  monitoring.registrarMetrica({
    tipo_metrica: 'transaccion',
    nombre: tipo,
    valor: monto,
    unidad: 'MXN',
    tags: { estado, ...Object.keys(datos || {}).reduce((acc: any, key: string) => {
      acc[key] = String((datos as any)?.[key] || '');
      return acc;
    }, {}) }
  });
}
