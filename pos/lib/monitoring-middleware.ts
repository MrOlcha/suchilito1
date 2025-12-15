import { NextRequest, NextResponse } from 'next/server';
import { getMonitoringService } from './monitoring';

/**
 * Middleware para monitorear todas las llamadas API
 * Se ejecuta antes de cada request de API
 */
export function createMonitoringMiddleware() {
  return async (req: NextRequest) => {
    const startTime = Date.now();
    const monitoring = getMonitoringService();
    
    const method = req.method;
    const pathname = req.nextUrl.pathname;
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Extraer usuario_id si está disponible (ejemplo: desde JWT o sesión)
    let userId: number | undefined;
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      try {
        // Aquí iría la lógica para extraer el usuario del JWT
        // Por ahora es un placeholder
        // userId = extractUserFromJWT(authHeader);
      } catch (err) {
        // Ignorar errores de auth
      }
    }

    try {
      // Registrar inicio de request
      monitoring.registrarLog({
        nivel: 'info',
        tipo: 'api_call',
        modulo: 'middleware',
        endpoint: pathname,
        metodo_http: method,
        mensaje: `${method} ${pathname} iniciado`,
        ip_cliente: ip,
        user_agent: userAgent,
        usuario_id: userId
      });

      // Retornar el request sin bloquearlo
      // El middleware solo monitorea, no intercepta la lógica
      return NextResponse.next();
    } catch (error) {
      console.error('Error en monitoring middleware:', error);
      return NextResponse.next();
    }
  };
}

/**
 * Wrapper para instrumentar handlers de API
 * Envuelve un handler y registra automáticamente logs, métricas y errores
 */
export function withMonitoring<T extends (...args: any[]) => any>(
  handler: T,
  options?: {
    tipo?: string;
    modulo?: string;
    critical?: boolean;
  }
): T {
  return (async (req: NextRequest, ...args: any[]) => {
    const startTime = Date.now();
    const monitoring = getMonitoringService();
    const pathname = req.nextUrl.pathname;
    const method = req.method;
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    try {
      // Ejecutar el handler
      let response = await handler(req, ...args);

      // Calcular duración
      const duracion = Date.now() - startTime;

      // Obtener código de status
      const statusCode = response?.status || 200;
      const nivel: 'info' | 'warning' | 'error' | 'critical' = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warning' : 'info';

      // Registrar log
      monitoring.registrarLog({
        nivel,
        tipo: (options?.tipo || 'api_call') as any,
        modulo: options?.modulo || 'api',
        endpoint: pathname,
        metodo_http: method,
        codigo_status: statusCode,
        mensaje: `${method} ${pathname} completado`,
        duracion_ms: duracion,
        ip_cliente: ip,
        user_agent: userAgent
      });

      // Registrar métrica de tiempo de respuesta
      monitoring.registrarMetrica({
        tipo_metrica: 'api_response_time',
        nombre: pathname,
        valor: duracion,
        unidad: 'ms',
        endpoint: pathname
      });

      // Alertar si es muy lenta
      if (duracion > 5000 && options?.critical) {
        monitoring.crearAlerta({
          tipo_alerta: 'slow_api',
          severidad: 'media',
          titulo: `API lenta: ${method} ${pathname}`,
          descripcion: `Tiempo de respuesta: ${duracion}ms`,
          metricas_asociadas: 'api_response_time',
          valor_actual: duracion
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
        nivel: 'error',
        tipo: 'error',
        modulo: options?.modulo || 'api',
        endpoint: pathname,
        metodo_http: method,
        mensaje: `Error en ${method} ${pathname}: ${error.message}`,
        duracion_ms: duracion,
        ip_cliente: ip,
        user_agent: userAgent
      });

      // Crear alerta crítica
      monitoring.crearAlerta({
        tipo_alerta: 'api_error',
        severidad: 'alta',
        titulo: `Error en API: ${method} ${pathname}`,
        descripcion: error.message,
        valor_actual: 500
      });

      // Retornar error al cliente
      return NextResponse.json(
        { message: error.message || 'Error interno del servidor' },
        { status: 500 }
      );
    }
  }) as T;
}
