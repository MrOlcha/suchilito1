'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Edit, Eye, Filter, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';

interface Cuenta {
  id: number;
  mesa_numero: string;
  mesero_nombre: string;
  estado: string;
  total: number;
  creado_en: string;
  pedido_count: number;
  metodo_pago?: string;
}

interface CuentasTableClientProps {
  cuentasJSON: string;
  currentFilter: string;
  filterOptions: Array<{
    value: string;
    label: string;
  }>;
}

export default function CuentasTableClient({ cuentasJSON, currentFilter, filterOptions }: CuentasTableClientProps) {
  const cuentas = JSON.parse(cuentasJSON) as Cuenta[];
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta cuenta? Esta acción no se puede deshacer.')) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/pos/api/cuentas/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        alert('Cuenta eliminada exitosamente');
        router.refresh();
      } else {
        alert(data.error || 'Error al eliminar la cuenta');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar la cuenta');
    } finally {
      setDeletingId(null);
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'abierta':
        return 'bg-green-100 text-green-800';
      case 'cerrada':
        return 'bg-gray-100 text-gray-800';
      case 'cobrada':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      {/* Filtros de fecha */}
      <div className="bg-white p-3 sm:p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900">Filtrar por fecha</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => {
            const isActive = currentFilter === option.value;
            
            const getIcon = () => {
              if (option.value === 'all') return <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />;
              if (option.value === 'week' || option.value === 'month') return <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />;
              return <Clock className="w-3 h-3 sm:w-4 sm:h-4" />;
            };
            
            return (
              <button
                key={option.value}
                onClick={() => window.location.href = `/pos/dashboard/pedidos?filter=${option.value}`}
                className={`inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg border text-xs sm:text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {getIcon()}
                <span className="hidden sm:inline">{option.label}</span>
                <span className="sm:hidden">{option.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabla de cuentas - Desktop */}
      <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
            {currentFilter === 'all' && 'Todas las Cuentas'}
            {currentFilter === 'today' && 'Cuentas de Hoy'}
            {currentFilter === 'yesterday' && 'Cuentas de Ayer'}
            {currentFilter === 'week' && 'Cuentas de Esta Semana'}
            {currentFilter === 'month' && 'Cuentas de Este Mes'}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mesa/Cuenta
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mesero
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pedidos
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Método Pago
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Creación
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
      {cuentas.length === 0 ? (
        <tr>
          <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
            <p className="text-lg mb-2">No hay cuentas</p>
            <p className="text-sm text-gray-400">Las cuentas aparecerán aquí cuando se creen</p>
          </td>
        </tr>
      ) : (
        cuentas.map((cuenta) => (
          <tr key={cuenta.id} className="hover:bg-gray-50">
            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
              <div className="text-xs sm:text-sm font-medium text-gray-900">
                Mesa {cuenta.mesa_numero}
              </div>
              <div className="text-xs text-gray-500">
                #{cuenta.id}
              </div>
            </td>
            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
              <div className="text-xs sm:text-sm text-gray-900 truncate">{cuenta.mesero_nombre || 'N/A'}</div>
            </td>
            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
              {cuenta.pedido_count}
            </td>
            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
              ${cuenta.total.toFixed(2)}
            </td>
            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
              <span
                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getEstadoBadge(
                  cuenta.estado
                )}`}
              >
                {cuenta.estado.charAt(0).toUpperCase() + cuenta.estado.slice(1).toLowerCase()}
              </span>
            </td>
            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs">
              {cuenta.metodo_pago ? (
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  cuenta.metodo_pago === 'efectivo' || cuenta.metodo_pago === 'cash'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {cuenta.metodo_pago === 'efectivo' || cuenta.metodo_pago === 'cash' 
                    ? '💵' 
                    : cuenta.metodo_pago === 'tarjeta' || cuenta.metodo_pago === 'card'
                    ? '💳'
                    : cuenta.metodo_pago}
                </span>
              ) : (
                <span className="text-gray-400 text-xs">N/A</span>
              )}
            </td>
            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
              {cuenta.creado_en
                ? (() => {
                    // creado_en viene como "2025-12-06 17:01:14" (hora de México)
                    // Se muestra directamente sin conversión adicional
                    const [date, time] = cuenta.creado_en.split(' ');
                    const [year, month, day] = date.split('-');
                    return `${day}/${month}/${year}`;
                  })()
                : '-'}
            </td>
            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div className="flex items-center gap-1 sm:gap-2">
                <Link
                  href={`/dashboard/pedidos/${cuenta.id}`}
                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors flex-shrink-0"
                  title="Ver detalles"
                >
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                </Link>
                <Link
                  href={`/dashboard/pedidos/${cuenta.id}/editar`}
                  className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50 transition-colors flex-shrink-0"
                  title="Editar cuenta"
                >
                  <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                </Link>
                <button
                  onClick={() => handleDelete(cuenta.id)}
                  disabled={deletingId === cuenta.id}
                  className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50 flex-shrink-0"
                  title="Eliminar cuenta"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            </td>
          </tr>
        ))
      )}
    </tbody>
          </table>
        </div>
      </div>

      {/* Vista Móvil - Tarjetas */}
      <div className="md:hidden space-y-3">
        {cuentas.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <p className="text-gray-600 mb-1">No hay cuentas</p>
            <p className="text-xs text-gray-400">Las cuentas aparecerán aquí cuando se creen</p>
          </div>
        ) : (
          cuentas.map((cuenta) => (
            <div key={cuenta.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-gray-900">Mesa {cuenta.mesa_numero}</h3>
                  <p className="text-xs text-gray-500">#{cuenta.id}</p>
                </div>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${getEstadoBadge(
                    cuenta.estado
                  )}`}
                >
                  {cuenta.estado.charAt(0).toUpperCase() + cuenta.estado.slice(1).toLowerCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-xs text-gray-600">Mesero</p>
                  <p className="font-medium text-gray-900 truncate">{cuenta.mesero_nombre || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-xs text-gray-600">Pedidos</p>
                  <p className="font-medium text-gray-900">{cuenta.pedido_count}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-xs text-gray-600">Total</p>
                  <p className="font-medium text-gray-900">${cuenta.total.toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-xs text-gray-600">Método</p>
                  <p className="font-medium text-gray-900">
                    {cuenta.metodo_pago === 'efectivo' || cuenta.metodo_pago === 'cash' 
                      ? '💵 Efectivo' 
                      : cuenta.metodo_pago === 'tarjeta' || cuenta.metodo_pago === 'card'
                      ? '💳 Tarjeta'
                      : cuenta.metodo_pago || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                {cuenta.creado_en
                  ? (() => {
                      const [date, time] = cuenta.creado_en.split(' ');
                      const [year, month, day] = date.split('-');
                      return `${day}/${month}/${year} ${time}`;
                    })()
                  : '-'}
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                <Link
                  href={`/dashboard/pedidos/${cuenta.id}`}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 px-3 rounded transition-colors text-center flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Ver
                </Link>
                <Link
                  href={`/dashboard/pedidos/${cuenta.id}/editar`}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-medium py-2 px-3 rounded transition-colors text-center flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </Link>
                <button
                  onClick={() => handleDelete(cuenta.id)}
                  disabled={deletingId === cuenta.id}
                  className="px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-medium py-2 rounded transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
