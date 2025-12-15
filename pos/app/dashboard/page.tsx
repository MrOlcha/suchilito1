import { cookies } from 'next/headers';
import Link from 'next/link';
import { verifyToken } from '../../lib/auth';
import { getDb } from '../../lib/db';
import {
  ClipboardList,
  DollarSign,
  UtensilsCrossed,
  Users,
  ShoppingCart,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

async function getDashboardStats() {
  const db = getDb();

  // Estadísticas básicas
  const cuentasAbiertas = db.prepare("SELECT COUNT(*) as count FROM cuentas WHERE estado = 'ABIERTA'").get();
  const pedidosHoy = db.prepare("SELECT COUNT(*) as count FROM pedidos WHERE date(creado_en) = date('now')").get();
  const productosActivos = db.prepare('SELECT COUNT(*) as count FROM menu_items WHERE disponible = 1').get();
  const ventasHoy = db.prepare("SELECT SUM(total) as total FROM pedidos WHERE date(creado_en) = date('now')").get();

  return {
    cuentasAbiertas: cuentasAbiertas?.count || 0,
    pedidosHoy: pedidosHoy?.count || 0,
    productosActivos: productosActivos?.count || 0,
    ventasHoy: ventasHoy?.total || 0,
  };
}

interface MenuItem {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

export default async function DashboardPage() {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return null;
  }

  const user = verifyToken(token);
  if (!user) {
    return null;
  }

  const stats = await getDashboardStats();

  const menuItems: MenuItem[] = [
    {
      href: '/dashboard/cuentas',
      icon: <ShoppingCart className="w-6 h-6" />,
      title: 'Cuentas',
      description: 'Gestiona todas las cuentas del restaurante',
      color: 'bg-blue-50 border-blue-200 text-blue-700'
    },
    {
      href: '/dashboard/pedidos',
      icon: <ClipboardList className="w-6 h-6" />,
      title: 'Pedidos',
      description: 'Ver todos los pedidos del sistema',
      color: 'bg-purple-50 border-purple-200 text-purple-700'
    },
    {
      href: '/dashboard/menu',
      icon: <UtensilsCrossed className="w-6 h-6" />,
      title: 'Menú',
      description: 'Administra productos y categorías',
      color: 'bg-green-50 border-green-200 text-green-700'
    },
    {
      href: '/dashboard/usuarios',
      icon: <Users className="w-6 h-6" />,
      title: 'Usuarios',
      description: 'Gestiona usuarios y permisos',
      color: 'bg-orange-50 border-orange-200 text-orange-700'
    },
    {
      href: '/dashboard/caja',
      icon: <DollarSign className="w-6 h-6" />,
      title: 'Caja',
      description: 'Control de caja y pagos',
      color: 'bg-green-50 border-green-200 text-green-700'
    },
    {
      href: '/dashboard/reportes',
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Reportes',
      description: 'Análisis y reportes de ventas',
      color: 'bg-red-50 border-red-200 text-red-700'
    }
  ];

  return (
    <div className="space-y-6 md:space-y-8 pb-16 lg:pb-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Bienvenido, {user.nombre || 'Administrador'}</p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Cuentas Abiertas</p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600 mt-1">{stats.cuentasAbiertas}</p>
            </div>
            <div className="bg-blue-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Pedidos Hoy</p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-600 mt-1">{stats.pedidosHoy}</p>
            </div>
            <div className="bg-purple-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Productos Activos</p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-600 mt-1">{stats.productosActivos}</p>
            </div>
            <div className="bg-green-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <UtensilsCrossed className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Ventas Hoy</p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-600 mt-1">${stats.ventasHoy?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="bg-green-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Menú de navegación */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Acceso Rápido</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`p-4 sm:p-6 rounded-lg border ${item.color} hover:shadow-lg transition-all hover:scale-105 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 group`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 sm:p-3 rounded-lg bg-white bg-opacity-50 flex-shrink-0">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">{item.description}</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 hidden sm:block" />
            </Link>
          ))}
        </div>
      </div>

      {/* Footer info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-blue-900">
          <strong>Nota:</strong> Esta es la página de administración. Usa el menú para navegar a diferentes secciones.
        </p>
      </div>
    </div>
  );
}