'use client';

import { useState, useEffect } from 'react';
import { Eye, Download, Calendar, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface JhaycorpStats {
  logs_totales: number;
  errores_totales: number;
  alertas_activas: number;
  alertas_totales?: number;
  uptime_porcentaje: number;
  transacciones_exitosas: number;
  transacciones_fallidas: number;
  transacciones_totales?: number;
}

export default function JhaycorpLogsApp() {
  const [stats, setStats] = useState<JhaycorpStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePeriodo, setActivePeriodo] = useState('24h');

  useEffect(() => {
    cargarEstadisticas();
    const interval = setInterval(cargarEstadisticas, 30000);
    return () => clearInterval(interval);
  }, [activePeriodo]);

  const cargarEstadisticas = async () => {
    try {
      const horas = activePeriodo === '24h' ? 24 : activePeriodo === '7d' ? 168 : 720;
      const response = await fetch(`/pos/api/monitoring?tipo=estadisticas&horas=${horas}`);
      const data = await response.json();
      if (data.datos) {
        setStats(data.datos);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Encabezado con branding */}
      <header className="border-b border-gray-800 bg-black sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                <Eye className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Jhaycorp Logs</h1>
                <p className="text-xs text-gray-500">Sistema Avanzado de Monitoreo</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 rounded border border-gray-700 hover:bg-gray-900 transition">
                <Download className="w-4 h-4 inline mr-2" />
                Exportar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Selector de período */}
      <div className="border-b border-gray-800 bg-black">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex gap-2">
            {['24h', '7d', '30d'].map(periodo => (
              <button
                key={periodo}
                onClick={() => setActivePeriodo(periodo)}
                className={`px-4 py-2 rounded border transition ${
                  activePeriodo === periodo
                    ? 'bg-white text-black border-white'
                    : 'border-gray-700 hover:border-gray-500'
                }`}
              >
                {periodo === '24h' ? 'Últimas 24h' : periodo === '7d' ? 'Última semana' : 'Último mes'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : stats ? (
          <>
            {/* Grid de KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {/* Logs Totales */}
              <div className="border border-gray-800 rounded-lg p-6 bg-black hover:border-gray-600 transition">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm mb-2">Logs Totales</p>
                    <p className="text-4xl font-bold text-white">{stats.logs_totales.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-gray-900 flex items-center justify-center">
                    <Eye className="w-6 h-6 text-gray-400" />
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-4">Eventos registrados</p>
              </div>

              {/* Errores */}
              <div className="border border-gray-800 rounded-lg p-6 bg-black hover:border-gray-600 transition">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm mb-2">Errores</p>
                    <p className="text-4xl font-bold text-white">{stats.errores_totales ?? 0}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-gray-900 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-gray-400" />
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-4">
                  {(((stats.errores_totales ?? 0) / (stats.logs_totales ?? 1)) * 100).toFixed(2)}% de tasa de error
                </p>
              </div>

              {/* Alertas Activas */}
              <div className="border border-gray-800 rounded-lg p-6 bg-black hover:border-gray-600 transition">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm mb-2">Alertas Activas</p>
                    <p className="text-4xl font-bold text-white">{stats.alertas_activas ?? 0}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-gray-900 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-gray-400" />
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-4">Sin resolver</p>
              </div>

              {/* Uptime */}
              <div className="border border-gray-800 rounded-lg p-6 bg-black hover:border-gray-600 transition">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm mb-2">Uptime</p>
                    <p className="text-4xl font-bold text-white">{(stats.uptime_porcentaje ?? 100).toFixed(2)}%</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-gray-900 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-gray-400" />
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-4">Disponibilidad</p>
              </div>

              {/* Transacciones Exitosas */}
              <div className="border border-gray-800 rounded-lg p-6 bg-black hover:border-gray-600 transition">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm mb-2">Exitosas</p>
                    <p className="text-4xl font-bold text-white">{stats.transacciones_exitosas ?? 0}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-gray-900 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-gray-400" />
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-4">Transacciones completadas</p>
              </div>

              {/* Transacciones Fallidas */}
              <div className="border border-gray-800 rounded-lg p-6 bg-black hover:border-gray-600 transition">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm mb-2">Fallidas</p>
                    <p className="text-4xl font-bold text-white">{stats.transacciones_fallidas ?? 0}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-gray-900 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-gray-400" />
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-4">No completadas</p>
              </div>
            </div>

            {/* Sección de acciones */}
            <div className="border border-gray-800 rounded-lg p-8 bg-black">
              <h2 className="text-2xl font-bold mb-6 text-white">Acciones Disponibles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <a
                  href="/reports"
                  className="border border-gray-700 rounded-lg p-6 hover:border-white hover:bg-gray-900 transition group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-900 group-hover:bg-gray-800 flex items-center justify-center">
                      📊
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Reportes Avanzados</h3>
                      <p className="text-sm text-gray-600">Análisis detallado y exportación</p>
                    </div>
                  </div>
                </a>

                <a
                  href="/monitoring"
                  className="border border-gray-700 rounded-lg p-6 hover:border-white hover:bg-gray-900 transition group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-900 group-hover:bg-gray-800 flex items-center justify-center">
                      👁️
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Monitoreo en Vivo</h3>
                      <p className="text-sm text-gray-600">Actualización en tiempo real</p>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-black mt-16 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-600 text-sm">
          <p>© 2024 Jhaycorp Logs - Sistema Avanzado de Monitoreo y Reportes</p>
        </div>
      </footer>
    </div>
  );
}
