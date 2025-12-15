export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getDb } from '../../../lib/db';
import { Globe, Package, MapPin, Clock, DollarSign, User, Phone } from 'lucide-react';

interface PedidoWeb {
  id: number;
  numero_pedido: string;
  cliente_nombre: string;
  cliente_telefono: string;
  tipo_entrega: string;
  direccion_entrega?: string;
  total: number;
  estado: string;
  creado_en: string;
  origen: string;
}

async function getPedidosWeb(): Promise<PedidoWeb[]> {
  const db = getDb();
  
  const pedidos = db.prepare(`
    SELECT 
      id,
      numero_pedido,
      cliente_nombre,
      cliente_telefono,
      tipo_entrega,
      direccion_entrega,
      total,
      estado,
      creado_en,
      origen
    FROM pedidos
    WHERE origen = 'web'
      AND estado NOT IN ('completado', 'pagado', 'cancelado')
    ORDER BY creado_en DESC
    LIMIT 50
  `).all();

  return pedidos as PedidoWeb[];
}

export default async function PedidosWebComponent() {
  const pedidos = await getPedidosWeb();

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'preparando':
        return 'bg-blue-100 text-blue-800';
      case 'listo':
        return 'bg-green-100 text-green-800';
      case 'entregado':
        return 'bg-purple-100 text-purple-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeliveryLabel = (tipo: string) => {
    return tipo === 'pickup' ? 'Recojo en Tienda' : 'Delivery';
  };

  const getDeliveryColor = (tipo: string) => {
    return tipo === 'pickup' 
      ? 'bg-orange-50 border-l-4 border-orange-500'
      : 'bg-blue-50 border-l-4 border-blue-500';
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('es-MX', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Globe className="w-6 h-6 text-purple-600" />
          Pedidos desde Sitio Web
        </h2>
        <p className="text-gray-600 mt-1">Pedidos completados a través de beta.mazuhi.com</p>
      </div>

      {/* Contador */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-purple-700">Pedidos Web Activos</p>
          <p className="text-3xl font-bold text-purple-900">{pedidos.length}</p>
        </div>
        <Globe className="w-12 h-12 text-purple-300" />
      </div>

      {/* Lista de pedidos */}
      {pedidos.length > 0 ? (
        <div className="grid gap-4">
          {pedidos.map((pedido) => (
            <Link
              key={pedido.id}
              href={`/pos/dashboard/pedidos/${pedido.id}`}
              className={`p-4 rounded-lg shadow-sm border-2 hover:shadow-md transition-all ${getDeliveryColor(pedido.tipo_entrega)} cursor-pointer`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Globe className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">#{pedido.numero_pedido}</h3>
                    <p className="text-sm text-gray-600">{pedido.cliente_nombre}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getEstadoBadgeColor(pedido.estado)}`}>
                  {pedido.estado?.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {/* Cliente */}
                <div className="flex items-center gap-2 text-gray-700">
                  <User className="w-4 h-4 text-gray-500" />
                  <span>{pedido.cliente_nombre}</span>
                </div>

                {/* Teléfono */}
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>{pedido.cliente_telefono}</span>
                </div>

                {/* Tipo de Entrega */}
                <div className="flex items-center gap-2 text-gray-700">
                  {pedido.tipo_entrega === 'pickup' ? (
                    <Package className="w-4 h-4 text-orange-500" />
                  ) : (
                    <MapPin className="w-4 h-4 text-blue-500" />
                  )}
                  <span>{getDeliveryLabel(pedido.tipo_entrega)}</span>
                </div>

                {/* Hora */}
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>{formatTime(pedido.creado_en)}</span>
                </div>

                {/* Dirección (solo para delivery) */}
                {pedido.tipo_entrega === 'delivery' && pedido.direccion_entrega && (
                  <div className="flex items-start gap-2 text-gray-700 md:col-span-2">
                    <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span className="text-xs">{pedido.direccion_entrega}</span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="text-xl font-bold text-gray-900 flex items-center gap-1">
                  <DollarSign className="w-5 h-5" />
                  {pedido.total.toFixed(2)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <Globe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 text-lg">No hay pedidos web en este momento</p>
          <p className="text-gray-500 text-sm mt-1">Los pedidos web aparecerán aquí cuando se completen</p>
        </div>
      )}
    </div>
  );
}
