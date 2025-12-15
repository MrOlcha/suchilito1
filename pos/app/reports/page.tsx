'use client';

import { Suspense } from 'react';
import ReportesAvanzados from '@/components/ReportesAvanzados';
import { Eye } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  Jhaycorp Logs
                </h1>
                <p className="text-sm text-slate-400">Sistema Avanzado de Reportes</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-cyan-400">📊</p>
              <p className="text-xs text-slate-500">Monitoreo en Tiempo Real</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-700/50 mb-4">
                  <div className="animate-spin">
                    <Eye className="w-6 h-6 text-cyan-400" />
                  </div>
                </div>
                <p className="text-slate-400">Cargando reportes...</p>
              </div>
            </div>
          }
        >
          <ReportesAvanzados />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/30 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-slate-500 text-sm">
          <p>
            Jhaycorp Logs © 2024 • Todos los datos están protegidos y encriptados
          </p>
        </div>
      </footer>
    </div>
  );
}
