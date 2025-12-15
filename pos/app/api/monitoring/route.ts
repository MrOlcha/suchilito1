import { NextRequest, NextResponse } from 'next/server';
import { getMonitoringService } from '../../../lib/monitoring';

export async function GET(request: NextRequest) {
  try {
    const monitoring = getMonitoringService();
    const searchParams = request.nextUrl.searchParams;
    
    const tipo = searchParams.get('tipo') || 'logs'; // logs, errores, alertas, metricas, estadisticas, salud
    const limite = parseInt(searchParams.get('limite') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const filtroNivel = searchParams.get('nivel') as 'info' | 'warning' | 'error' | 'critical' | null;
    const filtroTipo = searchParams.get('filtro_tipo');
    const filtroModulo = searchParams.get('modulo');
    const horas = parseInt(searchParams.get('horas') || '24');

    let datos: any;

    switch (tipo) {
      case 'logs':
        datos = monitoring.obtenerLogs(limite, offset, {
          nivel: filtroNivel || undefined,
          tipo: filtroTipo as any,
          modulo: filtroModulo || undefined
        });
        break;

      case 'errores':
        datos = monitoring.obtenerErroresSinResolver(limite);
        break;

      case 'alertas':
        datos = monitoring.obtenerAlertasActivas();
        break;

      case 'metricas':
        const nombreMetrica = searchParams.get('nombre');
        datos = monitoring.obtenerMetricas(
          filtroTipo || 'api_response_time',
          nombreMetrica || undefined,
          horas
        );
        break;

      case 'estadisticas':
        datos = monitoring.obtenerEstadisticas(horas);
        break;

      case 'salud':
        datos = monitoring.obtenerUltimoEstadoServidor();
        break;

      case 'resumen':
        datos = {
          logs: monitoring.obtenerResumenLogsPorNivel(horas),
          estadisticas: monitoring.obtenerEstadisticas(horas),
          alertas_activas: monitoring.obtenerAlertasActivas(),
          salud_servidor: monitoring.obtenerUltimoEstadoServidor()
        };
        break;

      default:
        return NextResponse.json(
          { message: 'Tipo de consulta no válido' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      tipo,
      datos,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error en monitoring API GET:', error);
    return NextResponse.json(
      { message: 'Error al obtener datos de monitoreo', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const monitoring = getMonitoringService();
    const body = await request.json();
    const accion = body.accion || 'log'; // log, error, alerta, salud

    let resultado: any;

    switch (accion) {
      case 'log':
        resultado = monitoring.registrarLog({
          nivel: body.nivel || 'info',
          tipo: body.tipo || 'sistema',
          modulo: body.modulo || 'desconocido',
          mensaje: body.mensaje,
          endpoint: body.endpoint,
          usuario_id: body.usuario_id,
          metodo_http: body.metodo_http,
          codigo_status: body.codigo_status,
          detalles: body.detalles,
          duracion_ms: body.duracion_ms
        });
        break;

      case 'error':
        resultado = monitoring.registrarError({
          tipo_error: body.tipo_error || 'Error',
          mensaje: body.mensaje,
          stack_trace: body.stack_trace,
          archivo: body.archivo,
          linea: body.linea,
          endpoint: body.endpoint,
          url: body.url
        });
        break;

      case 'alerta':
        resultado = monitoring.crearAlerta({
          tipo_alerta: body.tipo_alerta,
          severidad: body.severidad || 'media',
          titulo: body.titulo,
          descripcion: body.descripcion,
          metricas_asociadas: body.metricas_asociadas,
          umbral_activacion: body.umbral_activacion,
          valor_actual: body.valor_actual
        });
        break;

      case 'salud':
        resultado = monitoring.registrarEstadoServidor(body.datos);
        break;

      case 'resolver_error':
        resultado = monitoring.marcarErrorResuelto(body.error_id, body.notas);
        break;

      case 'acusar_alerta':
        resultado = monitoring.marcarAlertaAcusada(body.alerta_id);
        break;

      case 'resolver_alerta':
        resultado = monitoring.marcarAlertaResuelta(body.alerta_id, body.usuario_id, body.notas);
        break;

      default:
        return NextResponse.json(
          { message: 'Acción no válida' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      accion,
      resultado,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error en monitoring API POST:', error);
    return NextResponse.json(
      { message: 'Error al procesar solicitud de monitoreo', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const monitoring = getMonitoringService();
    const searchParams = request.nextUrl.searchParams;
    
    const accion = searchParams.get('accion') || 'limpiar_logs'; // limpiar_logs
    const dias = parseInt(searchParams.get('dias') || '30');

    let resultado: any;

    switch (accion) {
      case 'limpiar_logs':
        resultado = monitoring.limpiarLogsAntiguos(dias);
        break;

      default:
        return NextResponse.json(
          { message: 'Acción no válida' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      accion,
      resultado: `${resultado} registros eliminados`,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error en monitoring API DELETE:', error);
    return NextResponse.json(
      { message: 'Error al procesar solicitud de monitoreo', error: error.message },
      { status: 500 }
    );
  }
}
