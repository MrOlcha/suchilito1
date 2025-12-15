'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  ChevronLeft,
  Trash2,
  Package,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface DetallePedido {
  id: number;
  producto_nombre: string;
  cantidad: number;
  especificaciones: string;
  notas: string;
  precio_unitario: number;
  subtotal: number;
}

interface Pedido {
  id: number;
  numero_pedido: string;
  mesero_nombre: string;
  mesa_numero: string;
  es_para_llevar: number;
  comensales: number;
  estado: string;
  total: number;
  observaciones: string;
  creado_en: string;
  actualizado_en: string;
  detalles: DetallePedido[];
}

function getEstadoColor(estado: string) {
  switch (estado?.toLowerCase()) {
    case 'pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'preparando': return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'listo': return 'bg-green-100 text-green-800 border-green-300';
    case 'entregado': return 'bg-gray-100 text-gray-800 border-gray-300';
    case 'cancelado': return 'bg-red-100 text-red-800 border-red-300';
    default: return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

function getEstadoIcon(estado: string) {
  switch (estado?.toLowerCase()) {
    case 'pendiente': return '⏱️';
    case 'preparando': return '👨‍🍳';
    case 'listo': return '✅';
    case 'entregado': return '📦';
    case 'cancelado': return '❌';
    default: return '⏱️';
  }
}

export default function PedidoDetailClient({ pedido, cuentaId }: { pedido: Pedido; cuentaId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [estado, setEstado] = useState(pedido.estado);

  const handleDeletePedido = async () => {
    if (!confirm('¿Estás seguro que deseas eliminar este pedido? Esta acción no se puede deshacer.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/pos/api/pedidos/${pedido.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el pedido');
      }

      alert('Pedido eliminado correctamente');
      router.push(`/dashboard/cuentas/${cuentaId}`);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar el pedido');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEstado = async (nuevoEstado: string) => {
    setLoading(true);
    setEstado(nuevoEstado);
    try {
      const response = await fetch(`/pos/api/pedidos/${pedido.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el pedido');
      }

      alert('Pedido actualizado correctamente');
      router.refresh();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar el pedido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/dashboard/cuentas/${cuentaId}`}
          className="text-blue-600 hover:text-blue-900 flex items-center gap-2 mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver a cuenta
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">#{pedido.numero_pedido}</h1>
            <p className="text-gray-600 mt-1">Detalles completos del pedido</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDeletePedido}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </button>
          </div>
        </div>
      </div>

      {/* Info principal del pedido */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-xs font-medium text-gray-500 uppercase mb-2">Estado</p>
          <select
            value={estado}
            onChange={(e) => handleChangeEstado(e.target.value)}
            disabled={loading}
            className={`w-full px-3 py-2 border rounded-lg text-sm font-medium cursor-pointer ${getEstadoColor(estado)}`}
          >
            <option value="pendiente">Pendiente</option>
            <option value="preparando">Preparando</option>
            <option value="listo">Listo</option>
            <option value="entregado">Entregado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-xs font-medium text-gray-500 uppercase mb-2">Tipo</p>
          <p className={`text-sm font-medium px-3 py-2 rounded ${
            pedido.es_para_llevar === 1 
              ? 'bg-green-100 text-green-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {pedido.es_para_llevar === 1 ? 'Para llevar' : 'En mesa'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-xs font-medium text-gray-500 uppercase mb-2">Items</p>
          <p className="text-2xl font-bold text-gray-900">{pedido.detalles.length}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-xs font-medium text-gray-500 uppercase mb-2">Total</p>
          <p className="text-2xl font-bold text-gray-900">${pedido.total.toFixed(2)}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-xs font-medium text-gray-500 uppercase mb-2">Comensales</p>
          <p className="text-2xl font-bold text-gray-900">{pedido.comensales || '-'}</p>
        </div>
      </div>

      {/* Items del pedido */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Items del Pedido ({pedido.detalles.length})
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {pedido.detalles.map((item, index) => (
            <div key={item.id} className={`p-6 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'} hover:bg-gray-50 transition-colors`}>
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                      {item.cantidad}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                      {item.producto_nombre}
                    </h3>
                  </div>

                  {item.especificaciones && (
                    <p className="text-sm text-blue-600 mb-1 italic ml-11">
                      • {item.especificaciones}
                    </p>
                  )}

                  {item.notas && (
                    <p className="text-sm text-amber-600 mb-3 ml-11">
                      📝 {item.notas}
                    </p>
                  )}
                </div>

                <div className="text-right ml-4">
                  <div className="text-sm text-gray-600 mb-1">
                    ${item.precio_unitario.toFixed(2)} c/u
                  </div>
                  <div className="text-lg font-bold text-gray-900 bg-green-50 px-3 py-1 rounded-lg inline-block">
                    ${item.subtotal.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {pedido.detalles.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex justify-end">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 mb-1">Total del Pedido:</p>
                  <p className="text-2xl font-bold text-green-600 bg-green-50 px-4 py-2 rounded-lg inline-block">
                    ${pedido.total.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Observaciones */}
      {pedido.observaciones && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm font-medium text-amber-800 mb-2">Observaciones</p>
          <p className="text-amber-900">{pedido.observaciones}</p>
        </div>
      )}

      {/* Información adicional */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-600 mb-2">Mesa</p>
          <p className="text-2xl font-bold text-gray-900">{pedido.mesa_numero || 'N/A'}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-600 mb-2">Mesero</p>
          <p className="text-2xl font-bold text-gray-900">{pedido.mesero_nombre || 'N/A'}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-600 mb-2">Creado</p>
          <p className="text-sm text-gray-900">
            {new Date(pedido.creado_en).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-600 mb-2">Actualizado</p>
          <p className="text-sm text-gray-900">
            {new Date(pedido.actualizado_en).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
