/**
 * Instrumentación automática de endpoints con logging y error tracking
 * Captura logs y errores reales para Jhaycorp Logs
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMonitoringService } from './monitoring';

export interface EndpointContext {
  request: NextRequest;
  endpoint: string;
  method: string;
  userId?: number;
  ip: string;
}

/**
 * Wrapper para instrumentar automáticamente un endpoint
 * Captura logs, errores, duraciones y registra todo en Jhaycorp Logs
 */
export async function withAutoLogging<T extends any[]>(
  handler: (context: EndpointContext, ...args: T) => Promise<NextResponse>,
  context: EndpointContext,
  ...args: T
): Promise<NextResponse> {
  const monitoring = getMonitoringService();
  const startTime = Date.now();
  const { request, endpoint, method, userId, ip } = context;

  try {
    // Log de inicio
    monitoring.registrarLog({
      nivel: 'info',
      tipo: 'api_call',
      modulo: 'endpoint',
      endpoint,
      metodo_http: method,
      usuario_id: userId,
      mensaje: `${method} ${endpoint} iniciado`,
      ip_cliente: ip,
    });

    // Ejecutar el handler
    const response = await handler(context, ...args);
    
    const duracion = Date.now() - startTime;
    const statusCode = response.status;
    
    // Log de completación exitosa
    monitoring.registrarLog({
      nivel: statusCode >= 400 ? 'warning' : 'info',
      tipo: 'api_call',
      modulo: 'endpoint',
      endpoint,
      metodo_http: method,
      codigo_status: statusCode,
      usuario_id: userId,
      mensaje: `${method} ${endpoint} completado`,
      duracion_ms: duracion,
      ip_cliente: ip,
    });

    // Registrar métrica de rendimiento
    monitoring.registrarMetrica({
      tipo_metrica: 'api_response_time',
      nombre: `${method} ${endpoint}`,
      valor: duracion,
      unidad: 'ms',
      endpoint,
      usuario_id: userId,
    });

    return response;
  } catch (error: any) {
    const duracion = Date.now() - startTime;
    
    // Registrar error detallado
    monitoring.registrarError({
      tipo_error: error.name || 'UnknownError',
      mensaje: error.message || 'Error desconocido',
      stack_trace: error.stack,
      archivo: error.filename || 'unknown',
      linea: error.lineno,
      endpoint,
      usuario_id: userId,
      metodo_http: method,
      url: request.url,
    });

    // Log del error
    monitoring.registrarLog({
      nivel: 'error',
      tipo: 'error',
      modulo: 'endpoint',
      endpoint,
      metodo_http: method,
      usuario_id: userId,
      mensaje: `Error en ${method} ${endpoint}: ${error.message}`,
      duracion_ms: duracion,
      ip_cliente: ip,
      detalles: {
        error_type: error.name,
        error_message: error.message,
      }
    });

    // Crear alerta crítica
    monitoring.crearAlerta({
      tipo_alerta: 'endpoint_error',
      severidad: 'alta',
      titulo: `Error en endpoint ${endpoint}`,
      descripcion: `${method} ${endpoint}: ${error.message}`,
      valor_actual: 1,
    });

    // Retornar error 500
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * Extrae información del contexto del request
 */
export function extractContext(req: NextRequest, endpoint: string): EndpointContext {
  return {
    request: req,
    endpoint,
    method: req.method,
    ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
  };
}

/**
 * Wrapper simple para funciones que necesitan logging
 */
export async function withLogging<T>(
  fn: () => Promise<T>,
  context: { endpoint: string; userId?: number; ip?: string }
): Promise<T> {
  const monitoring = getMonitoringService();
  const startTime = Date.now();

  try {
    monitoring.registrarLog({
      nivel: 'info',
      tipo: 'sistema',
      modulo: context.endpoint,
      usuario_id: context.userId,
      mensaje: `Iniciando ${context.endpoint}`,
      ip_cliente: context.ip,
    });

    const result = await fn();

    monitoring.registrarLog({
      nivel: 'info',
      tipo: 'sistema',
      modulo: context.endpoint,
      usuario_id: context.userId,
      mensaje: `${context.endpoint} completado`,
      duracion_ms: Date.now() - startTime,
      ip_cliente: context.ip,
    });

    return result;
  } catch (error: any) {
    monitoring.registrarError({
      tipo_error: error.name || 'Error',
      mensaje: error.message,
      stack_trace: error.stack,
      endpoint: context.endpoint,
      usuario_id: context.userId,
    });

    monitoring.registrarLog({
      nivel: 'error',
      tipo: 'error',
      modulo: context.endpoint,
      usuario_id: context.userId,
      mensaje: `Error en ${context.endpoint}: ${error.message}`,
      duracion_ms: Date.now() - startTime,
      ip_cliente: context.ip,
    });

    throw error;
  }
}
