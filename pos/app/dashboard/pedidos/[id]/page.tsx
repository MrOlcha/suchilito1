export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getDb } from '../../../../lib/db';
import {
  ChevronLeft,
  Clock,
  CheckCircle,
  XCircle,
  ChefHat,
  Truck,
  Users,
  Package,
  Edit,
  Trash2
} from 'lucide-react';
import { PedidoItemsClient } from './items-client';

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
  es_para_llevar: number;
  estado: string;
  total: number;
  creado_en: string;
  actualizado_en: string;
  metodo_pago?: string;
  detalles: DetallePedido[];
}

interface Cuenta {
  id: number;
  mesa_numero: string;
  mesero_nombre: string;
  estado: string;
  total: number;
  creado_en: string;
  pedido_count: number;
}

async function getCuenta(id: string): Promise<Cuenta | null> {
  const db = getDb();
  const cuenta = db.prepare(`
    SELECT
      c.id,
      c.mesa_numero,
      COALESCE(u_pedido.nombre, u.nombre) as mesero_nombre,
      c.estado,
      c.total,
      c.fecha_apertura as creado_en,
      COUNT(p.id) as pedido_count
    FROM cuentas c
    LEFT JOIN usuarios u ON c.mesero_id = u.id
    LEFT JOIN pedidos p ON c.id = p.cuenta_id
    LEFT JOIN usuarios u_pedido ON p.mesero_id = u_pedido.id
    WHERE c.id = ?
    GROUP BY c.id
  `).get(parseInt(id));

  return cuenta as Cuenta | null;
}

async function getPedidosDeCuenta(cuentaId: string): Promise<Pedido[]> {
  const db = getDb();
  const pedidos = db.prepare(`
    SELECT
      p.id,
      p.numero_pedido,
      p.es_para_llevar,
      p.estado,
      p.total,
      p.creado_en,
      p.actualizado_en,
      c.metodo_pago
    FROM pedidos p
    LEFT JOIN cuentas c ON p.cuenta_id = c.id
    WHERE p.cuenta_id = ?
    ORDER BY p.creado_en DESC
  `).all(parseInt(cuentaId));

  // Para cada pedido, obtener sus detalles
  const pedidosConDetalles = (pedidos as any[]).map((p) => {
    const detalles = db.prepare(`
      SELECT
        id,
        producto_nombre,
        cantidad,
        especificaciones,
        notas,
        precio_unitario,
        subtotal
      FROM detalle_pedidos
      WHERE pedido_id = ?
    `).all(p.id) as DetallePedido[];

    return {
      ...p,
      detalles
    };
  });

  return pedidosConDetalles as Pedido[];
}

function getEstadoColor(estado: string) {
  switch (estado?.toUpperCase()) {
    case 'PENDIENTE': return 'bg-yellow-100 text-yellow-800';
    case 'PREPARANDO': return 'bg-blue-100 text-blue-800';
    case 'LISTO': return 'bg-green-100 text-green-800';
    case 'ENTREGADO': return 'bg-gray-100 text-gray-800';
    case 'CANCELADO': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function getEstadoIcon(estado: string) {
  switch (estado?.toUpperCase()) {
    case 'PENDIENTE': return <Clock className="w-4 h-4" />;
    case 'PREPARANDO': return <ChefHat className="w-4 h-4" />;
    case 'LISTO': return <CheckCircle className="w-4 h-4" />;
    case 'ENTREGADO': return <Truck className="w-4 h-4" />;
    case 'CANCELADO': return <XCircle className="w-4 h-4" />;
    default: return <Clock className="w-4 h-4" />;
  }
}

function getCuentaEstadoColor(estado: string) {
  switch (estado?.toUpperCase()) {
    case 'ABIERTA': return 'bg-blue-100 text-blue-800';
    case 'CERRADA': return 'bg-yellow-100 text-yellow-800';
    case 'COBRADA': return 'bg-green-100 text-green-800';
    case 'CANCELADA': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export default async function CuentaDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const cuenta = await getCuenta(params.id);
  const pedidos = await getPedidosDeCuenta(params.id);

  if (!cuenta) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 p-6 rounded-lg border border-red-200">
          <p className="text-red-800 font-medium">Cuenta no encontrada</p>
        </div>
        <Link
          href="/dashboard/pedidos"
          className="text-blue-600 hover:text-blue-900 flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver a cuentas
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con volver */}
      <div>
        <Link
          href="/dashboard/pedidos"
          className="text-blue-600 hover:text-blue-900 flex items-center gap-2 mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver a cuentas
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          {cuenta.mesa_numero || `Cuenta ${cuenta.id}`}
        </h1>
        <p className="text-gray-600 mt-1">Detalles y pedidos asociados</p>
      </div>

      {/* Info de la cuenta */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cuenta</p>
              <p className="text-3xl font-bold text-gray-900">${cuenta.total.toFixed(2)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mesero</p>
              <p className="text-2xl font-bold text-gray-900">{cuenta.mesero_nombre || 'N/A'}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pedidos</p>
              <p className="text-3xl font-bold text-gray-900">{cuenta.pedido_count}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Estado</p>
              <p className={`text-xl font-bold rounded px-2 py-1 ${getCuentaEstadoColor(cuenta.estado)}`}>
                {cuenta.estado?.toUpperCase()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pedidos expandidos con detalles */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">Pedidos de la Cuenta</h2>
        
        {pedidos.length === 0 ? (
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 text-center">
            <p className="text-gray-600">No hay pedidos en esta cuenta</p>
          </div>
        ) : (
          pedidos.map((pedido) => (
            <div key={pedido.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Header del pedido */}
              <div className="px-6 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">#{pedido.numero_pedido}</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(pedido.creado_en).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                      })} • {new Date(pedido.creado_en).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    pedido.es_para_llevar === 1 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {pedido.es_para_llevar === 1 ? 'Llevar' : 'Mesa'}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getEstadoColor(pedido.estado)}`}>
                    {pedido.estado?.charAt(0).toUpperCase() + pedido.estado?.slice(1).toLowerCase()}
                  </span>
                </div>
              </div>

              {/* Items del pedido */}
              <PedidoItemsClient 
                pedidoId={pedido.id}
                detalles={pedido.detalles}
              />

              {/* Total del pedido */}
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-between items-center">
                <div className="flex gap-2">
                  {pedido.metodo_pago && (
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      pedido.metodo_pago === 'efectivo' || pedido.metodo_pago === 'cash'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {pedido.metodo_pago === 'efectivo' || pedido.metodo_pago === 'cash' 
                        ? '💵 Efectivo' 
                        : pedido.metodo_pago === 'tarjeta' || pedido.metodo_pago === 'card'
                        ? '💳 Tarjeta'
                        : pedido.metodo_pago}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600 mb-0.5">Total:</p>
                  <p className="text-lg font-bold text-green-600 bg-green-50 px-3 py-1 rounded inline-block">
                    ${pedido.total.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
