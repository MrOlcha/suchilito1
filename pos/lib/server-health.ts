import os from 'os';
import { getMonitoringService } from '../lib/monitoring';

/**
 * Obtener información de salud del sistema
 */
export function obtenerSaludServidor(): any {
  const cpus = os.cpus();
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  const memoryPercentage = (usedMemory / totalMemory) * 100;

  // Calcular CPU
  let totalIdle = 0;
  let totalTick = 0;

  cpus.forEach(cpu => {
    for (const type in cpu.times) {
      totalTick += cpu.times[type as keyof typeof cpu.times];
    }
    totalIdle += cpu.times.idle;
  });

  const cpuPercentage = 100 - ~~(100 * totalIdle / totalTick);

  // Uptime del sistema
  const uptime = os.uptime();

  // Carga del sistema
  const loadavg = os.loadavg();
  const numCPUs = cpus.length;

  // Determinar estado general
  let estadoGeneral = 'sano';
  if (memoryPercentage > 90 || cpuPercentage > 90) {
    estadoGeneral = 'critico';
  } else if (memoryPercentage > 75 || cpuPercentage > 75) {
    estadoGeneral = 'advertencia';
  }

  return {
    cpu_uso: cpuPercentage,
    memoria_uso: memoryPercentage,
    memoria_disponible_mb: Math.round(freeMemory / 1024 / 1024),
    memoria_total_mb: Math.round(totalMemory / 1024 / 1024),
    uptime_segundos: Math.floor(uptime),
    carga_promedio: loadavg,
    num_cpus: numCPUs,
    estado_general: estadoGeneral,
    timestamp: new Date().toISOString()
  };
}

/**
 * Iniciar monitoreo periódico del servidor
 */
let monitoringInterval: NodeJS.Timeout | null = null;

export function iniciarMonitoreoServidor(intervalo_ms: number = 60000) {
  if (monitoringInterval) {
    console.log('Monitoreo de servidor ya está activo');
    return;
  }

  console.log(`Iniciando monitoreo de servidor cada ${intervalo_ms}ms`);

  monitoringInterval = setInterval(() => {
    try {
      const monitoring = getMonitoringService();
      const salud = obtenerSaludServidor();
      
      // Registrar en la base de datos
      monitoring.registrarEstadoServidor(salud);

      // Crear alerta si hay problemas críticos
      if (salud.estado_general === 'critico') {
        if (salud.memoria_uso > 90) {
          monitoring.crearAlerta({
            tipo_alerta: 'memoria_critica',
            severidad: 'critica',
            titulo: 'Memoria del servidor crítica',
            descripcion: `Uso de memoria: ${salud.memoria_uso.toFixed(2)}%`,
            valor_actual: salud.memoria_uso
          });
        }

        if (salud.cpu_uso > 90) {
          monitoring.crearAlerta({
            tipo_alerta: 'cpu_critica',
            severidad: 'critica',
            titulo: 'CPU del servidor crítica',
            descripcion: `Uso de CPU: ${salud.cpu_uso.toFixed(2)}%`,
            valor_actual: salud.cpu_uso
          });
        }
      } else if (salud.estado_general === 'advertencia') {
        if (salud.memoria_uso > 75) {
          monitoring.crearAlerta({
            tipo_alerta: 'memoria_alta',
            severidad: 'media',
            titulo: 'Memoria del servidor alta',
            descripcion: `Uso de memoria: ${salud.memoria_uso.toFixed(2)}%`,
            valor_actual: salud.memoria_uso
          });
        }

        if (salud.cpu_uso > 75) {
          monitoring.crearAlerta({
            tipo_alerta: 'cpu_alta',
            severidad: 'media',
            titulo: 'CPU del servidor alta',
            descripcion: `Uso de CPU: ${salud.cpu_uso.toFixed(2)}%`,
            valor_actual: salud.cpu_uso
          });
        }
      }

      console.log(`[Monitoreo] CPU: ${salud.cpu_uso.toFixed(2)}% | Memoria: ${salud.memoria_uso.toFixed(2)}% | Estado: ${salud.estado_general}`);
    } catch (error) {
      console.error('Error en monitoreo de servidor:', error);
    }
  }, intervalo_ms);

  return monitoringInterval;
}

/**
 * Detener monitoreo del servidor
 */
export function detenerMonitoreoServidor() {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
    console.log('Monitoreo de servidor detenido');
  }
}

/**
 * Obtener métricas instantáneas del sistema
 */
export function obtenerMetricasInstantaneas() {
  const salud = obtenerSaludServidor();
  
  return {
    cpu_porcentaje: salud.cpu_uso.toFixed(2),
    memoria_porcentaje: salud.memoria_uso.toFixed(2),
    memoria_disponible_mb: salud.memoria_disponible_mb,
    memoria_total_mb: salud.memoria_total_mb,
    uptime_horas: (salud.uptime_segundos / 3600).toFixed(2),
    carga_promedio_1min: salud.carga_promedio[0].toFixed(2),
    carga_promedio_5min: salud.carga_promedio[1].toFixed(2),
    carga_promedio_15min: salud.carga_promedio[2].toFixed(2),
    num_cpus: salud.num_cpus,
    estado: salud.estado_general
  };
}
