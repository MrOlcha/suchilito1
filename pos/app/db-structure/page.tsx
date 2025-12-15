'use client';

import { useEffect, useState } from 'react';

export default function DBStructurePage() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/ESTRUCTURA_BASE_DATOS.txt');
        if (!response.ok) throw new Error('No se pudo cargar el archivo');
        const text = await response.text();
        setContent(text);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };
    
    fetchContent();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">📊 Estructura de Base de Datos</h1>
          <p className="text-slate-400">Sistema POS - Documentación Completa</p>
        </div>

        {/* Controls */}
        <div className="mb-6 flex gap-4 flex-wrap">
          <button
            onClick={() => window.location.href = '/ESTRUCTURA_BASE_DATOS.txt'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            📥 Descargar TXT
          </button>
          <button
            onClick={() => window.print()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            🖨️ Imprimir
          </button>
        </div>

        {/* Content */}
        {loading && (
          <div className="bg-slate-800 rounded-lg p-8 text-center">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
            <p className="text-slate-300">Cargando contenido...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900 border border-red-700 rounded-lg p-6 text-red-100">
            ❌ Error: {error}
          </div>
        )}

        {!loading && !error && content && (
          <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 shadow-2xl">
            <pre className="text-slate-200 text-xs leading-relaxed whitespace-pre-wrap break-words font-mono overflow-x-auto">
              {content}
            </pre>
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            background: white;
          }
          .bg-slate-800, .bg-gradient-to-br {
            background: white !important;
            border: none !important;
          }
          pre {
            color: black !important;
            background: white !important;
          }
          button {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
