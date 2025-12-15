import { getDb } from './db';

export type LogLevel = 'info' | 'warning' | 'error' | 'critical';
export type EventType = 'api_call' | 'database' | 'auth' | 'payment' | 'printer' | 'sync' | 'error' | 'sistema' | 'transaction';

interface LogData {
  nivel: LogLevel;
  tipo: EventType;
  modulo: string;
  endpoint?: string;
  usuario_id?: number;
  metodo_http?: string;
  codigo_status?: number;
  mensaje: string;
  detalles?: string | object;
  duracion_ms?: number;
  ip_cliente?: string;
  user_agent?: string;
}

interface MetricaData {
  tipo_metrica: string;
  nombre: string;
  valor: number;
  unidad?: string;
  endpoint?: string;
  usuario_id?: number;
  tags?: Record<string, string>;
}

interface ErrorData {
  tipo_error: string;
  mensaje: string;
  stack_trace?: string;
  archivo?: string;
  linea?: number;
  endpoint?: string;
  usuario_id?: number;
  metodo_http?: string;
  url?: string;
  datos_request?: object;
}

interface AlertaData {
  tipo_alerta: string;
  severidad: 'baja' | 'media' | 'alta' | 'critica';
  titulo: string;
  descripcion?: string;
  metricas_asociadas?: string;
  umbral_activacion?: string;
  valor_actual?: number;
}

export class MonitoringService {
  private db: any;

  constructor() {
    this.db = getDb();
  }

  /**
   * Registrar un evento de log
   */
  registrarLog(data: LogData): number {
    try {
      const detalles = typeof data.detalles === 'object' 
        ? JSON.stringify(data.detalles) 
        : data.detalles;

      const result = this.db.prepare(`
        INSERT INTO monitoring_logs (
          nivel, tipo, modulo, endpoint, usuario_id, metodo_http,
          codigo_status, mensaje, detalles, duracion_ms, ip_cliente, user_agent
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        data.nivel,
        data.tipo,
        data.modulo,
        data.endpoint || null,
        data.usuario_id || null,
        data.metodo_http || null,
        data.codigo_status || null,
        data.mensaje,
        detalles || null,
        data.duracion_ms || null,
        data.ip_cliente || null,
        data.user_agent || null
      );

      return result.lastInsertRowid as number;
    } catch (error) {
      console.error('Error al registrar log:', error);
      throw error;
    }
  }

  /**
   * Registrar una métrica
   */
  registrarMetrica(data: MetricaData): number {
    try {
      const tags = data.tags ? JSON.stringify(data.tags) : null;

      const result = this.db.prepare(`
        INSERT INTO monitoring_metricas (
          tipo_metrica, nombre, valor, unidad, endpoint, usuario_id, tags
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        data.tipo_metrica,
        data.nombre,
        data.valor,
        data.unidad || null,
        data.endpoint || null,
        data.usuario_id || null,
        tags
      );

      return result.lastInsertRowid as number;
    } catch (error) {
      console.error('Error al registrar métrica:', error);
      throw error;
    }
  }

  /**
   * Registrar un error
   */
  registrarError(data: ErrorData): number {
    try {
      const datos_request = data.datos_request ? JSON.stringify(data.datos_request) : null;

      const result = this.db.prepare(`
        INSERT INTO monitoring_errores (
          tipo_error, mensaje, stack_trace, archivo, linea, endpoint,
          usuario_id, metodo_http, url, datos_request
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        data.tipo_error,
        data.mensaje,
        data.stack_trace || null,
        data.archivo || null,
        data.linea || null,
        data.endpoint || null,
        data.usuario_id || null,
        data.metodo_http || null,
        data.url || null,
        datos_request
      );

      return result.lastInsertRowid as number;
    } catch (error) {
      console.error('Error al registrar error:', error);
      throw error;
    }
  }

  /**
   * Crear una alerta
   */
  crearAlerta(data: AlertaData): number {
    try {
      const result = this.db.prepare(`
        INSERT INTO monitoring_alertas (
          tipo_alerta, severidad, titulo, descripcion, metricas_asociadas,
          umbral_activacion, valor_actual
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        data.tipo_alerta,
        data.severidad,
        data.titulo,
        data.descripcion || null,
        data.metricas_asociadas || null,
        data.umbral_activacion || null,
        data.valor_actual || null
      );

      return result.lastInsertRowid as number;
    } catch (error) {
      console.error('Error al crear alerta:', error);
      throw error;
    }
  }

  /**
   * Obtener logs recientes
   */
  obtenerLogs(
    limite: number = 100,
    offset: number = 0,
    filtros?: { nivel?: LogLevel; tipo?: EventType; modulo?: string }
  ): any[] {
    try {
      let query = 'SELECT * FROM monitoring_logs WHERE 1=1';
      const params: any[] = [];

      if (filtros?.nivel) {
        query += ' AND nivel = ?';
        params.push(filtros.nivel);
      }
      if (filtros?.tipo) {
        query += ' AND tipo = ?';
        params.push(filtros.tipo);
      }
      if (filtros?.modulo) {
        query += ' AND modulo = ?';
        params.push(filtros.modulo);
      }

      query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
      params.push(limite, offset);

      return this.db.prepare(query).all(...params);
    } catch (error) {
      console.error('Error al obtener logs:', error);
      return [];
    }
  }

  /**
   * Obtener errores sin resolver
   */
  obtenerErroresSinResolver(limite: number = 50): any[] {
    try {
      return this.db.prepare(`
        SELECT * FROM monitoring_errores
        WHERE resolved = 0
        ORDER BY timestamp DESC
        LIMIT ?
      `).all(limite);
    } catch (error) {
      console.error('Error al obtener errores:', error);
      return [];
    }
  }

  /**
   * Obtener alertas activas
   */
  obtenerAlertasActivas(): any[] {
    try {
      return this.db.prepare(`
        SELECT * FROM monitoring_alertas
        WHERE estado IN ('activa', 'acusada')
        ORDER BY severidad DESC, timestamp DESC
      `).all();
    } catch (error) {
      console.error('Error al obtener alertas:', error);
      return [];
    }
  }

  /**
   * Obtener métricas de las últimas horas
   */
  obtenerMetricas(
    tipo: string,
    nombre?: string,
    horas: number = 24
  ): any[] {
    try {
      let query = `
        SELECT * FROM monitoring_metricas
        WHERE tipo_metrica = ?
        AND timestamp >= datetime('now', '-${horas} hours')
      `;
      const params: any[] = [tipo];

      if (nombre) {
        query += ' AND nombre = ?';
        params.push(nombre);
      }

      query += ' ORDER BY timestamp ASC';

      return this.db.prepare(query).all(...params);
    } catch (error) {
      console.error('Error al obtener métricas:', error);
      return [];
    }
  }

  /**
   * Registrar estado de servidor
   */
  registrarEstadoServidor(datos: any): number {
    try {
      const result = this.db.prepare(`
        INSERT INTO monitoring_salud_servidor (
          cpu_uso, memoria_uso, memoria_disponible_mb, disco_uso,
          uptime_segundos, conexiones_bd, procesos_activos, temperatura_cpu,
          estado_general
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        datos.cpu_uso || null,
        datos.memoria_uso || null,
        datos.memoria_disponible_mb || null,
        datos.disco_uso || null,
        datos.uptime_segundos || null,
        datos.conexiones_bd || null,
        datos.procesos_activos || null,
        datos.temperatura_cpu || null,
        datos.estado_general || 'sano'
      );

      return result.lastInsertRowid as number;
    } catch (error) {
      console.error('Error al registrar estado del servidor:', error);
      throw error;
    }
  }

  /**
   * Obtener último estado del servidor
   */
  obtenerUltimoEstadoServidor(): any {
    try {
      return this.db.prepare(`
        SELECT * FROM monitoring_salud_servidor
        ORDER BY timestamp DESC
        LIMIT 1
      `).get();
    } catch (error) {
      console.error('Error al obtener estado del servidor:', error);
      return null;
    }
  }

  /**
   * Obtener resumen de logs por nivel
   */
  obtenerResumenLogsPorNivel(horas: number = 24): Record<string, number> {
    try {
      const result = this.db.prepare(`
        SELECT nivel, COUNT(*) as count FROM monitoring_logs
        WHERE timestamp >= datetime('now', '-${horas} hours')
        GROUP BY nivel
      `).all();

      const resumen: Record<string, number> = {
        info: 0,
        warning: 0,
        error: 0,
        critical: 0
      };

      result.forEach((row: any) => {
        resumen[row.nivel] = row.count;
      });

      return resumen;
    } catch (error) {
      console.error('Error al obtener resumen de logs:', error);
      return { info: 0, warning: 0, error: 0, critical: 0 };
    }
  }

  /**
   * Limpiar logs antiguos (más de 30 días)
   */
  limpiarLogsAntiguos(dias: number = 30): number {
    try {
      const result = this.db.prepare(`
        DELETE FROM monitoring_logs
        WHERE timestamp < datetime('now', '-${dias} days')
      `).run();

      return result.changes || 0;
    } catch (error) {
      console.error('Error al limpiar logs:', error);
      return 0;
    }
  }

  /**
   * Marcar error como resuelto
   */
  marcarErrorResuelto(errorId: number, notasResolucion?: string): boolean {
    try {
      this.db.prepare(`
        UPDATE monitoring_errores
        SET resolved = 1, fecha_resolucion = datetime('now'), notas_resolucion = ?
        WHERE id = ?
      `).run(notasResolucion || null, errorId);

      return true;
    } catch (error) {
      console.error('Error al marcar error como resuelto:', error);
      return false;
    }
  }

  /**
   * Marcar alerta como acusada
   */
  marcarAlertaAcusada(alertaId: number): boolean {
    try {
      this.db.prepare(`
        UPDATE monitoring_alertas
        SET estado = 'acusada'
        WHERE id = ?
      `).run(alertaId);

      return true;
    } catch (error) {
      console.error('Error al marcar alerta como acusada:', error);
      return false;
    }
  }

  /**
   * Marcar alerta como resuelta
   */
  marcarAlertaResuelta(alertaId: number, usuarioId: number, notas?: string): boolean {
    try {
      this.db.prepare(`
        UPDATE monitoring_alertas
        SET estado = 'resuelta', usuario_id_resolucion = ?, 
            fecha_resolucion = datetime('now'), notas_resolucion = ?
        WHERE id = ?
      `).run(usuarioId, notas || null, alertaId);

      return true;
    } catch (error) {
      console.error('Error al marcar alerta como resuelta:', error);
      return false;
    }
  }

  /**
   * Obtener estadísticas generales
   */
  obtenerEstadisticas(horas: number = 24): any {
    try {
      const logs = this.db.prepare(`
        SELECT COUNT(*) as total FROM monitoring_logs
        WHERE timestamp >= datetime('now', '-${horas} hours')
      `).get();

      const errores = this.db.prepare(`
        SELECT COUNT(*) as total FROM monitoring_errores
        WHERE timestamp >= datetime('now', '-${horas} hours')
      `).get();

      const alertas = this.db.prepare(`
        SELECT COUNT(*) as total FROM monitoring_alertas
        WHERE timestamp >= datetime('now', '-${horas} hours')
      `).get();

      const alertasActivas = this.db.prepare(`
        SELECT COUNT(*) as total FROM monitoring_alertas
        WHERE estado = 'activa'
      `).get();

      const transacciones = this.db.prepare(`
        SELECT COUNT(*) as total FROM monitoring_transacciones
        WHERE timestamp >= datetime('now', '-${horas} hours')
      `).get();

      const transaccionesExitosas = this.db.prepare(`
        SELECT COUNT(*) as total FROM monitoring_transacciones
        WHERE timestamp >= datetime('now', '-${horas} hours')
        AND estado = 'exitosa'
      `).get();

      const transaccionesFallidas = this.db.prepare(`
        SELECT COUNT(*) as total FROM monitoring_transacciones
        WHERE timestamp >= datetime('now', '-${horas} hours')
        AND estado = 'fallida'
      `).get();

      // Calcular uptime (porcentaje de logs sin errores críticos)
      const logsTotal = logs?.total || 0;
      const erroresTotal = errores?.total || 0;
      const uptime = logsTotal > 0 ? ((logsTotal - erroresTotal) / logsTotal) * 100 : 100;

      return {
        logs_totales: logs?.total || 0,
        errores_totales: errores?.total || 0,
        alertas_activas: alertasActivas?.total || 0,
        alertas_totales: alertas?.total || 0,
        transacciones_exitosas: transaccionesExitosas?.total || 0,
        transacciones_fallidas: transaccionesFallidas?.total || 0,
        transacciones_totales: transacciones?.total || 0,
        uptime_porcentaje: uptime,
        periodo_horas: horas
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return null;
    }
  }
}

// Instancia singleton
let instance: MonitoringService | null = null;

export function getMonitoringService(): MonitoringService {
  if (!instance) {
    instance = new MonitoringService();
  }
  return instance;
}
