export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getDb } from '../../../lib/db';
import { requireAdminDashboard } from '../../../lib/dashboard-auth';
import {
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Calendar
} from 'lucide-react';
import CuentasTableClient from './page-client';
import PedidosWebComponent from './pedidos-web';

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

type DateFilter = 'all' | 'today' | 'yesterday' | 'week' | 'month';

// Función para obtener fecha en zona horaria de México (Querétaro)
function getMexicoDate(date: Date = new Date()): string {
  // Querétaro está en zona horaria America/Mexico_City (CST/CDT)
  // UTC-6 en invierno, UTC-5 en verano
  const mexicoTime = new Date(date.toLocaleString("en-US", {timeZone: "America/Mexico_City"}));
  return mexicoTime.toISOString().split('T')[0];
}

async function getCuentas(filter: DateFilter = 'all'): Promise<Cuenta[]> {
  const db = getDb();

  let dateCondition = '';

  switch (filter) {
    case 'today':
      const today = getMexicoDate();
      dateCondition = `WHERE DATE(c.fecha_apertura) = '${today}'`;
      break;
    case 'yesterday':
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = getMexicoDate(yesterday);
      dateCondition = `WHERE DATE(c.fecha_apertura) = '${yesterdayStr}'`;
      break;
    case 'week':
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = getMexicoDate(weekAgo);
      dateCondition = `WHERE DATE(c.fecha_apertura) >= '${weekAgoStr}'`;
      break;
    case 'month':
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      const monthAgoStr = getMexicoDate(monthAgo);
      dateCondition = `WHERE DATE(c.fecha_apertura) >= '${monthAgoStr}'`;
      break;
    default:
      dateCondition = '';
  }

  const cuentas = db.prepare(`
    SELECT
      c.id,
      c.mesa_numero,
      COALESCE(u_pedido.nombre, u.nombre) as mesero_nombre,
      c.estado,
      c.total,
      c.metodo_pago,
      c.fecha_apertura as creado_en,
      COUNT(p.id) as pedido_count
    FROM cuentas c
    LEFT JOIN usuarios u ON c.mesero_id = u.id
    LEFT JOIN pedidos p ON c.id = p.cuenta_id
    LEFT JOIN usuarios u_pedido ON p.mesero_id = u_pedido.id
    ${dateCondition}
    GROUP BY c.id
    ORDER BY c.fecha_apertura DESC
    LIMIT 100
  `).all();

  return cuentas as Cuenta[];
}

async function getEstadisticasCuentas(filter: DateFilter = 'all') {
  const db = getDb();

  let dateCondition = '';

  switch (filter) {
    case 'today':
      const today = getMexicoDate();
      dateCondition = `WHERE DATE(fecha_apertura) = '${today}'`;
      break;
    case 'yesterday':
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = getMexicoDate(yesterday);
      dateCondition = `WHERE DATE(fecha_apertura) = '${yesterdayStr}'`;
      break;
    case 'week':
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = getMexicoDate(weekAgo);
      dateCondition = `WHERE DATE(fecha_apertura) >= '${weekAgoStr}'`;
      break;
    case 'month':
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      const monthAgoStr = getMexicoDate(monthAgo);
      dateCondition = `WHERE DATE(fecha_apertura) >= '${monthAgoStr}'`;
      break;
    default:
      dateCondition = '';
  }

  const totalCuentas = db.prepare(`
    SELECT COUNT(*) as count, SUM(total) as total
    FROM cuentas
    ${dateCondition}
  `).get();

  const porEstado = db.prepare(`
    SELECT UPPER(estado) as estado, COUNT(*) as count
    FROM cuentas
    ${dateCondition}
    GROUP BY UPPER(estado)
  `).all();

  return {
    totalCuentas: totalCuentas?.count || 0,
    ventasTotal: totalCuentas?.total || 0,
    porEstado: porEstado || []
  };
}

function getEstadoColor(estado: string) {
  switch (estado?.toUpperCase()) {
    case 'ABIERTA': return 'bg-blue-100 text-blue-800';
    case 'CERRADA': return 'bg-yellow-100 text-yellow-800';
    case 'COBRADA': return 'bg-green-100 text-green-800';
    case 'CANCELADA': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function getEstadoIcon(estado: string) {
  switch (estado?.toUpperCase()) {
    case 'ABIERTA': return <Clock className="w-4 h-4" />;
    case 'CERRADA': return <CheckCircle className="w-4 h-4" />;
    case 'COBRADA': return <CheckCircle className="w-4 h-4" />;
    case 'CANCELADA': return <XCircle className="w-4 h-4" />;
    default: return <Clock className="w-4 h-4" />;
  }
}

export default async function PedidosPage({
  searchParams
}: {
  searchParams: { filter?: string }
}) {
  const filter = (searchParams.filter as DateFilter) || 'today';
  const cuentas = await getCuentas(filter);
  const stats = await getEstadisticasCuentas(filter);

  const filterOptions = [
    { value: 'all', label: 'Todos los tiempos' },
    { value: 'today', label: 'Hoy' },
    { value: 'yesterday', label: 'Ayer' },
    { value: 'week', label: 'Esta semana' },
    { value: 'month', label: 'Este mes' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pedidos / Cuentas</h1>
        <p className="text-gray-600 mt-1">Gestiona todas las cuentas y pedidos del restaurante</p>
      </div>

      {/* Sección de Pedidos Web */}
      <div className="border-t-2 border-purple-200 pt-6">
        <PedidosWebComponent />
      </div>

      {/* Separador */}
      <div className="border-t-2 border-gray-200 pt-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Cuentas de Restaurante</h2>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cuentas</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalCuentas}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ventas Total</p>
              <p className="text-3xl font-bold text-gray-900">${stats.ventasTotal?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Abiertas</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.porEstado.find((s: any) => s.estado === 'ABIERTA')?.count || 0}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cerradas</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.porEstado.find((s: any) => s.estado === 'CERRADA')?.count || 0}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      <CuentasTableClient 
        cuentasJSON={JSON.stringify(cuentas)}
        currentFilter={filter}
        filterOptions={filterOptions}
      />
    </div>
  );
}
