'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Download, Eye } from 'lucide-react';

interface ReportData {
  tipo: 'diario' | 'semanal' | 'mensual';
  periodo: string;
  estadisticas: {
    total_pedidos: number;
    total_ventas: number;
    promedio_venta: number;
    error_rate: number;
    api_performance: number;
    uptime: number;
    usuarios_activos: number;
    transacciones_exitosas: number;
    transacciones_fallidas: number;
    cpu_promedio: number;
    memoria_promedio: number;
  };
  top_endpoints: Array<{ endpoint: string; llamadas: number; tiempo_promedio: number }>;
  errores_frecuentes: Array<{ tipo: string; cantidad: number; porcentaje: number }>;
  tendencias_diarias: Array<{ fecha: string; pedidos: number; ventas: number; errores: number }>;
  performance_por_hora: Array<{ hora: string; respuesta_ms: number; errores: number }>;
  transacciones_por_tipo: Array<{ tipo: string; cantidad: number; monto: number }>;
  actividad_usuarios: Array<{ usuario: string; pedidos: number; valor_total: number }>;
}

export default function ReportesAvanzados() {
  const [tipoReporte, setTipoReporte] = useState<'diario' | 'semanal' | 'mensual'>('diario');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [exportando, setExportando] = useState(false);
  const [activeTab, setActiveTab] = useState<'resumen' | 'estadisticas' | 'performance' | 'errores' | 'descargas'>('resumen');

  useEffect(() => {
    cargarReporte();
  }, [tipoReporte]);

  const cargarReporte = async () => {
    try {
      setCargando(true);
      const response = await fetch(`/pos/api/reports?tipo=${tipoReporte}`);
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Error al cargar reporte:', error);
    } finally {
      setCargando(false);
    }
  };

  const exportarPDF = async () => {
    try {
      setExportando(true);
      if (!reportData) return;
      
      const response = await fetch(`/pos/api/reports/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'pdf',
          periodo: tipoReporte,
          datos: reportData,
        }),
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_${tipoReporte}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error al exportar PDF:', error);
    } finally {
      setExportando(false);
    }
  };

  const exportarExcel = async () => {
    try {
      setExportando(true);
      if (!reportData) return;
      
      const response = await fetch(`/pos/api/reports/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'excel',
          periodo: tipoReporte,
          datos: reportData,
        }),
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_${tipoReporte}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error al exportar Excel:', error);
    } finally {
      setExportando(false);
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando reporte...</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">No hay datos disponibles</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="pb-8 border-b border-gray-800 mb-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center">
                <Eye className="w-7 h-7 text-black" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Jhaycorp Logs - Reportes</h1>
                <p className="text-sm text-gray-500">Análisis detallado y exportación de datos</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportarPDF}
                disabled={exportando}
                className="bg-white text-black px-4 py-2 rounded font-semibold hover:bg-gray-200 transition flex items-center gap-2 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                PDF
              </button>
              <button
                onClick={exportarExcel}
                disabled={exportando}
                className="bg-white text-black px-4 py-2 rounded font-semibold hover:bg-gray-200 transition flex items-center gap-2 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Excel
              </button>
            </div>
          </div>

          {/* Período Selector */}
          <div className="flex gap-2">
            {(['diario', 'semanal', 'mensual'] as const).map(tipo => (
              <button
                key={tipo}
                onClick={() => setTipoReporte(tipo)}
                className={`px-4 py-2 rounded font-semibold transition-colors ${
                  tipoReporte === tipo
                    ? 'bg-white text-black'
                    : 'border border-gray-700 hover:border-gray-500'
                }`}
              >
                {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-gray-800 overflow-x-auto">
          {(['resumen', 'estadisticas', 'performance', 'errores', 'descargas'] as const).map(tab => (
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
              {tab === 'estadisticas' && '📈 Estadísticas'}
              {tab === 'performance' && '⚡ Rendimiento'}
              {tab === 'errores' && '⚠️ Errores'}
              {tab === 'descargas' && '💾 Descargas'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* RESUMEN TAB */}
          {activeTab === 'resumen' && (
            <div>
              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="border border-gray-800 rounded-lg p-6 bg-black hover:border-gray-600 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-500 text-sm mb-2">Pedidos</p>
                      <p className="text-4xl font-bold text-white">{reportData.estadisticas.total_pedidos}</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-gray-900 flex items-center justify-center">
                      📦
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-4">Total período</p>
                </div>

                <div className="border border-gray-800 rounded-lg p-6 bg-black hover:border-gray-600 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-500 text-sm mb-2">Ventas</p>
                      <p className="text-4xl font-bold text-white">${reportData.estadisticas.total_ventas.toFixed(0)}</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-gray-900 flex items-center justify-center">
                      💰
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-4">Ingresos totales</p>
                </div>

                <div className="border border-gray-800 rounded-lg p-6 bg-black hover:border-gray-600 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-500 text-sm mb-2">Promedio</p>
                      <p className="text-4xl font-bold text-white">${reportData.estadisticas.promedio_venta.toFixed(2)}</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-gray-900 flex items-center justify-center">
                      📊
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-4">Por transacción</p>
                </div>

                <div className="border border-gray-800 rounded-lg p-6 bg-black hover:border-gray-600 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-500 text-sm mb-2">Uptime</p>
                      <p className="text-4xl font-bold text-white">{reportData.estadisticas.uptime.toFixed(2)}%</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-gray-900 flex items-center justify-center">
                      ✅
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-4">Disponibilidad</p>
                </div>
              </div>

              {/* Gráfico de Tendencias */}
              <div className="border border-gray-800 rounded-lg p-8 bg-black mb-8">
                <h2 className="text-2xl font-bold mb-6 text-white">📈 Tendencias del Período</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={reportData.tendencias_diarias}>
                    <defs>
                      <linearGradient id="colorPedidos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ffffff" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ffffff" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="fecha" stroke="#999" />
                    <YAxis stroke="#999" />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', color: '#fff' }} />
                    <Area type="monotone" dataKey="pedidos" stroke="#ffffff" fillOpacity={1} fill="url(#colorPedidos)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ESTADISTICAS TAB */}
          {activeTab === 'estadisticas' && (
            <div className="space-y-8">
              {/* Top Endpoints */}
              <div className="border border-gray-800 rounded-lg p-8 bg-black">
                <h2 className="text-2xl font-bold mb-6 text-white">🎯 Endpoints Más Utilizados</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData.top_endpoints}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="endpoint" stroke="#999" />
                    <YAxis stroke="#999" />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', color: '#fff' }} />
                    <Bar dataKey="llamadas" fill="#ffffff" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Transacciones por Tipo */}
              {reportData.transacciones_por_tipo.length > 0 && (
                <div className="border border-gray-800 rounded-lg p-8 bg-black">
                  <h2 className="text-2xl font-bold mb-6 text-white">🔄 Transacciones por Tipo</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={reportData.transacciones_por_tipo}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry: any) => `${entry.tipo}: ${entry.cantidad}`}
                        outerRadius={100}
                        fill="#ffffff"
                        dataKey="cantidad"
                      >
                        <Cell fill="#ffffff" />
                        <Cell fill="#cccccc" />
                        <Cell fill="#999999" />
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* PERFORMANCE TAB */}
          {activeTab === 'performance' && (
            <div className="space-y-8">
              {/* Performance por Hora */}
              <div className="border border-gray-800 rounded-lg p-8 bg-black">
                <h2 className="text-2xl font-bold mb-6 text-white">⚡ Rendimiento por Hora</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={reportData.performance_por_hora}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="hora" stroke="#999" />
                    <YAxis stroke="#999" />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', color: '#fff' }} />
                    <Legend />
                    <Line type="monotone" dataKey="respuesta_ms" stroke="#ffffff" name="Respuesta (ms)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Indicadores de Rendimiento */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border border-gray-800 rounded-lg p-6 bg-black">
                  <p className="text-gray-500 text-sm mb-2">Error Rate</p>
                  <p className="text-4xl font-bold text-white">{reportData.estadisticas.error_rate.toFixed(2)}%</p>
                  <p className="text-xs text-gray-600 mt-4">Tasa de errores</p>
                </div>

                <div className="border border-gray-800 rounded-lg p-6 bg-black">
                  <p className="text-gray-500 text-sm mb-2">API Performance</p>
                  <p className="text-4xl font-bold text-white">{reportData.estadisticas.api_performance.toFixed(0)}ms</p>
                  <p className="text-xs text-gray-600 mt-4">Respuesta promedio</p>
                </div>

                <div className="border border-gray-800 rounded-lg p-6 bg-black">
                  <p className="text-gray-500 text-sm mb-2">Usuarios Activos</p>
                  <p className="text-4xl font-bold text-white">{reportData.estadisticas.usuarios_activos}</p>
                  <p className="text-xs text-gray-600 mt-4">Conectados</p>
                </div>
              </div>
            </div>
          )}

          {/* ERRORES TAB */}
          {activeTab === 'errores' && (
            <div className="space-y-8">
              {reportData.errores_frecuentes.length > 0 && (
                <div className="border border-gray-800 rounded-lg p-8 bg-black">
                  <h2 className="text-2xl font-bold mb-6 text-white">⚠️ Errores Más Frecuentes</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.errores_frecuentes} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis type="number" stroke="#999" />
                      <YAxis dataKey="tipo" type="category" stroke="#999" width={100} />
                      <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', color: '#fff' }} />
                      <Bar dataKey="cantidad" fill="#ffffff" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Resumen de Transacciones */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-800 rounded-lg p-6 bg-black">
                  <p className="text-gray-500 text-sm mb-2">Transacciones Exitosas</p>
                  <p className="text-4xl font-bold text-white">{reportData.estadisticas.transacciones_exitosas}</p>
                  <p className="text-xs text-gray-600 mt-4">Completadas exitosamente</p>
                </div>

                <div className="border border-gray-800 rounded-lg p-6 bg-black">
                  <p className="text-gray-500 text-sm mb-2">Transacciones Fallidas</p>
                  <p className="text-4xl font-bold text-white">{reportData.estadisticas.transacciones_fallidas}</p>
                  <p className="text-xs text-gray-600 mt-4">Con errores</p>
                </div>
              </div>
            </div>
          )}

          {/* DESCARGAS TAB */}
          {activeTab === 'descargas' && (
            <div className="border border-gray-800 rounded-lg p-8 bg-black text-center">
              <h2 className="text-2xl font-bold mb-8 text-white">💾 Descargar Reportes</h2>
              <p className="text-gray-400 mb-8">Exporta tus reportes en PDF o Excel para compartir y analizar</p>
              <div className="flex gap-4 justify-center flex-wrap">
                <button
                  onClick={exportarPDF}
                  disabled={exportando}
                  className="bg-white text-black px-8 py-4 rounded font-semibold hover:bg-gray-200 transition flex items-center gap-2 disabled:opacity-50 text-lg"
                >
                  <Download className="w-5 h-5" />
                  Descargar PDF
                </button>
                <button
                  onClick={exportarExcel}
                  disabled={exportando}
                  className="bg-white text-black px-8 py-4 rounded font-semibold hover:bg-gray-200 transition flex items-center gap-2 disabled:opacity-50 text-lg"
                >
                  <Download className="w-5 h-5" />
                  Descargar Excel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
