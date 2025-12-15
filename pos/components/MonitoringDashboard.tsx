'use client';

import { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Eye, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';

interface LogEntry {
  id: number;
  timestamp: string;
  nivel: string;
  tipo: string;
  modulo: string;
  endpoint?: string;
  mensaje: string;
  duracion_ms?: number;
}

interface Alerta {
  id: number;
  timestamp: string;
  titulo: string;
  severidad: string;
  descripcion?: string;
  estado: string;
  valor_actual?: number;
}

interface Estadisticas {
  logs_totales: number;
  errores_totales: number;
  alertas_totales: number;
  transacciones_totales: number;
  periodo_horas: number;
}

interface SaludServidor {
  cpu_uso: number;
  memoria_uso: number;
  memoria_disponible_mb: number;
  uptime_segundos: number;
  estado_general: string;
}

export default function MonitoringDashboard() {
  const [activeTab, setActiveTab] = useState<'resumen' | 'logs' | 'alertas' | 'errores' | 'metricas'>('resumen');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [saludServidor, setSaludServidor] = useState<SaludServidor | null>(null);
  const [cargando, setCargando] = useState(true);
  const [metricas, setMetricas] = useState<any[]>([]);
  const [autoActualizar, setAutoActualizar] = useState(true);

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      const response = await fetch('/pos/api/monitoring?tipo=resumen&horas=24');
      const data = await response.json();

      if (data.datos) {
        setEstadisticas(data.datos.estadisticas);
        setAlertas(data.datos.alertas_activas || []);
        setSaludServidor(data.datos.salud_servidor);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setCargando(false);
    }
  }, []);

  const cargarLogs = useCallback(async () => {
    try {
      const response = await fetch('/pos/api/monitoring?tipo=logs&limite=50');
      const data = await response.json();
      if (data.datos) {
        setLogs(data.datos);
      }
    } catch (error) {
      console.error('Error al cargar logs:', error);
    }
  }, []);

  const cargarMetricas = useCallback(async () => {
    try {
      const response = await fetch('/pos/api/monitoring?tipo=metricas&nombre=api_response_time&horas=1');
      const data = await response.json();
      if (data.datos) {
        setMetricas(data.datos);
      }
    } catch (error) {
      console.error('Error al cargar métricas:', error);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
    cargarLogs();
    cargarMetricas();

    if (autoActualizar) {
      const interval = setInterval(() => {
        cargarDatos();
        cargarLogs();
        cargarMetricas();
      }, 30000); // Actualizar cada 30 segundos

      return () => clearInterval(interval);
    }
  }, [autoActualizar, cargarDatos, cargarLogs, cargarMetricas]);

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'error':
      case 'critical':
        return 'bg-black text-white border-l-4 border-red-500';
      case 'warning':
        return 'bg-black text-white border-l-4 border-yellow-500';
      case 'info':
        return 'bg-black text-white border-l-4 border-blue-500';
      default:
        return 'bg-black text-white border-l-4 border-gray-500';
    }
  };

  const getSeveridadColor = (severidad: string) => {
    switch (severidad) {
      case 'critica':
        return 'bg-red-50 text-red-900 border-l-4 border-red-500';
      case 'alta':
        return 'bg-red-50 text-red-900 border-l-4 border-orange-500';
      case 'media':
        return 'bg-gray-50 text-gray-900 border-l-4 border-yellow-500';
      case 'baja':
        return 'bg-gray-50 text-gray-900 border-l-4 border-green-500';
      default:
        return 'bg-gray-50 text-gray-900 border-l-4 border-gray-500';
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'critico':
        return 'text-red-600';
      case 'advertencia':
        return 'text-yellow-600';
      case 'sano':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center">
              <Eye className="w-7 h-7 text-black" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Jhaycorp Logs</h1>
              <p className="text-sm text-gray-500">Sistema Avanzado de Monitoreo</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer hover:text-gray-400 transition">
              <input
                type="checkbox"
                checked={autoActualizar}
                onChange={(e) => setAutoActualizar(e.target.checked)}
                className="w-4 h-4 accent-white"
              />
              <span className="text-sm">Auto-actualizar</span>
            </label>
            <button
              onClick={() => {
                cargarDatos();
                cargarLogs();
                cargarMetricas();
              }}
              className="bg-white text-black px-4 py-2 rounded font-semibold hover:bg-gray-200 transition"
            >
              🔄 Actualizar
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-800 overflow-x-auto">
          {(['resumen', 'logs', 'alertas', 'errores', 'metricas'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'border-white text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-400'
              }`}
            >
              {tab === 'resumen' && '📊 Resumen'}
              {tab === 'logs' && '📝 Logs'}
              {tab === 'alertas' && '🔔 Alertas'}
              {tab === 'errores' && '⚠️ Errores'}
              {tab === 'metricas' && '📈 Métricas'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* RESUMEN TAB */}
          {activeTab === 'resumen' && (
            <div>
              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="border border-gray-800 rounded-lg p-6 bg-black hover:border-gray-600 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-500 text-sm mb-2">Total Logs</p>
                      <p className="text-4xl font-bold text-white">
                        {estadisticas?.logs_totales || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-gray-900 flex items-center justify-center">
                      📝
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-4">Últimas 24h</p>
                </div>
                
                <div className="border border-gray-800 rounded-lg p-6 bg-black hover:border-gray-600 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-500 text-sm mb-2">Errores</p>
                      <p className="text-4xl font-bold text-white">
                        {estadisticas?.errores_totales || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-gray-900 flex items-center justify-center">
                      ⚠️
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-4">Últimas 24h</p>
                </div>
                
                <div className="border border-gray-800 rounded-lg p-6 bg-black hover:border-gray-600 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-500 text-sm mb-2">Alertas Activas</p>
                      <p className="text-4xl font-bold text-white">
                        {alertas.filter(a => a.estado !== 'resuelta').length}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-gray-900 flex items-center justify-center">
                      🔔
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-4">Sin resolver</p>
                </div>
                
                <div className="border border-gray-800 rounded-lg p-6 bg-black hover:border-gray-600 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-500 text-sm mb-2">Transacciones</p>
                      <p className="text-4xl font-bold text-white">
                        {estadisticas?.transacciones_totales || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-gray-900 flex items-center justify-center">
                      ✅
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-4">Últimas 24h</p>
                </div>
              </div>

              {/* Salud del Servidor */}
              {saludServidor && (
                <div className="border border-gray-800 rounded-lg p-8 bg-black mb-8">
                  <h2 className="text-2xl font-bold mb-6 text-white">💻 Salud del Servidor</h2>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="p-4 rounded border border-gray-800">
                      <p className="text-gray-500 text-sm mb-2">CPU</p>
                      <p className={`text-3xl font-bold ${saludServidor.cpu_uso > 75 ? 'text-red-500' : 'text-white'}`}>
                        {saludServidor.cpu_uso.toFixed(1)}%
                      </p>
                    </div>
                    <div className="p-4 rounded border border-gray-800">
                      <p className="text-gray-500 text-sm mb-2">Memoria</p>
                      <p className={`text-3xl font-bold ${saludServidor.memoria_uso > 75 ? 'text-red-500' : 'text-white'}`}>
                        {saludServidor.memoria_uso.toFixed(1)}%
                      </p>
                    </div>
                    <div className="p-4 rounded border border-gray-800">
                      <p className="text-gray-500 text-sm mb-2">Disponible</p>
                      <p className="text-3xl font-bold text-white">
                        {saludServidor.memoria_disponible_mb}MB
                      </p>
                    </div>
                    <div className="p-4 rounded border border-gray-800">
                      <p className="text-gray-500 text-sm mb-2">Uptime</p>
                      <p className="text-3xl font-bold text-white">
                        {(saludServidor.uptime_segundos / 3600).toFixed(1)}h
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Alertas Activas */}
              {alertas.length > 0 && (
                <div className="border border-gray-800 rounded-lg p-8 bg-black">
                  <h2 className="text-2xl font-bold mb-6 text-white">🔔 Alertas Activas</h2>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {alertas.filter(a => a.estado !== 'resuelta').map(alerta => (
                      <div key={alerta.id} className={`p-4 rounded border ${getSeveridadColor(alerta.severidad)}`}>
                        <p className="font-semibold text-lg">{alerta.titulo}</p>
                        <p className="text-sm opacity-80 mt-1">{alerta.descripcion}</p>
                        <p className="text-xs opacity-60 mt-2">{new Date(alerta.timestamp).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* LOGS TAB */}
          {activeTab === 'logs' && (
            <div className="border border-gray-800 rounded-lg p-8 bg-black">
              <h2 className="text-2xl font-bold mb-6 text-white">📝 Logs Recientes</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left p-3 text-gray-500 font-semibold">Timestamp</th>
                      <th className="text-left p-3 text-gray-500 font-semibold">Nivel</th>
                      <th className="text-left p-3 text-gray-500 font-semibold">Tipo</th>
                      <th className="text-left p-3 text-gray-500 font-semibold">Endpoint</th>
                      <th className="text-left p-3 text-gray-500 font-semibold">Mensaje</th>
                      <th className="text-left p-3 text-gray-500 font-semibold">Duración</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(log => (
                      <tr key={log.id} className="border-b border-gray-800 hover:bg-gray-900">
                        <td className="p-3 text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getNivelColor(log.nivel)}`}>
                            {log.nivel}
                          </span>
                        </td>
                        <td className="p-3 text-white">{log.tipo}</td>
                        <td className="p-3 text-gray-400">{log.endpoint || '-'}</td>
                        <td className="p-3 text-gray-300 max-w-xs truncate">{log.mensaje}</td>
                        <td className="p-3">{log.duracion_ms ? `${log.duracion_ms}ms` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ALERTAS TAB */}
          {activeTab === 'alertas' && (
            <div className="border border-gray-800 rounded-lg p-8 bg-black">
              <h2 className="text-2xl font-bold mb-6 text-white">⚠️ Todas las Alertas</h2>
              <div className="space-y-4">
                {alertas.map(alerta => (
                  <div key={alerta.id} className={`p-4 rounded border-l-4 ${getSeveridadColor(alerta.severidad)}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-lg">{alerta.titulo}</p>
                        <p className="text-sm opacity-80">{alerta.descripcion}</p>
                      </div>
                      <span className={`px-3 py-1 rounded text-xs font-bold`}>
                        {alerta.estado.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs opacity-60">{new Date(alerta.timestamp).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ERRORES TAB */}
          {activeTab === 'errores' && (
            <div className="border border-gray-800 rounded-lg p-8 bg-black text-center">
              <h2 className="text-2xl font-bold mb-4 text-white">❌ Errores Sin Resolver</h2>
              <p className="text-gray-600">Cargando errores...</p>
            </div>
          )}

          {/* METRICAS TAB */}
          {activeTab === 'metricas' && metricas.length > 0 && (
            <div className="border border-gray-800 rounded-lg p-8 bg-black">
              <h2 className="text-2xl font-bold mb-6 text-white">📊 Tiempo de Respuesta de APIs</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metricas}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="timestamp" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />

                  <Legend />
                  <Line type="monotone" dataKey="valor" stroke="#3b82f6" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
