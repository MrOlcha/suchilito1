'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, BarChart3, Users, ClipboardList, FileText, TrendingUp, DollarSign, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface VentaDia {
  dia: number;
  fecha: string;
  venta: number;
  cantidad: number;
}

interface Producto {
  id: number;
  nombre: string;
  cantidad: number;
  venta: number;
}

interface Gasto {
  concepto: string;
  monto: number;
  porcentaje: number;
}

export default function AdministracionSucursalPage() {
  const router = useRouter();
  const [mesActual, setMesActual] = useState(new Date());
  const [sucursalNombre] = useState('Sucursal Centro');

  // Generar datos de ventas por día del mes
  const ventasPorDia: VentaDia[] = useMemo(() => {
    const dias = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0).getDate();
    const ventas: VentaDia[] = [];
    
    for (let i = 1; i <= dias; i++) {
      const fecha = new Date(mesActual.getFullYear(), mesActual.getMonth(), i);
      const esDomingo = fecha.getDay() === 0;
      const venta = esDomingo ? Math.random() * 2000 + 8000 : Math.random() * 3000 + 5000;
      
      ventas.push({
        dia: i,
        fecha: fecha.toLocaleDateString('es-MX', { weekday: 'short' }),
        venta: Math.round(venta),
        cantidad: Math.floor(Math.random() * 30 + 10),
      });
    }
    
    return ventas;
  }, [mesActual]);

  // Productos más vendidos
  const productosVendidos: Producto[] = [
    { id: 1, nombre: 'Tacos al Pastor', cantidad: 245, venta: 12250 },
    { id: 2, nombre: 'Quesadillas', cantidad: 189, venta: 9450 },
    { id: 3, nombre: 'Enchiladas Verdes', cantidad: 156, venta: 7800 },
    { id: 4, nombre: 'Ceviche', cantidad: 134, venta: 8040 },
    { id: 5, nombre: 'Chiles Rellenos', cantidad: 98, venta: 5880 },
  ];

  // Gastos de operación
  const gastosOperacion: Gasto[] = [
    { concepto: 'Nómina', monto: 8500, porcentaje: 42 },
    { concepto: 'Renta Local', monto: 4000, porcentaje: 20 },
    { concepto: 'Servicios (Agua, Luz)', monto: 1800, porcentaje: 9 },
    { concepto: 'Mantenimiento', monto: 1200, porcentaje: 6 },
    { concepto: 'Otros Gastos', monto: 4500, porcentaje: 23 },
  ];

  const totalVentas = ventasPorDia.reduce((sum, v) => sum + v.venta, 0);
  const totalGastos = gastosOperacion.reduce((sum, g) => sum + g.monto, 0);
  const ganancia = totalVentas - totalGastos;

  const cambiarMes = (direccion: 'anterior' | 'siguiente') => {
    const nuevoMes = new Date(mesActual);
    if (direccion === 'anterior') {
      nuevoMes.setMonth(nuevoMes.getMonth() - 1);
    } else {
      nuevoMes.setMonth(nuevoMes.getMonth() + 1);
    }
    setMesActual(nuevoMes);
  };

  const maxVenta = Math.max(...ventasPorDia.map(v => v.venta));

  const menuItems = [
    { href: '#pedidos', label: 'Pedidos', icon: ClipboardList },
    { href: '#meseros', label: 'Meseros', icon: Users },
    { href: '#colaboradores', label: 'Colaboradores', icon: Users },
    { href: '#reportes', label: 'Reportes', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Administración de {sucursalNombre}</h1>
        <p className="text-gray-600 mt-1">Gestiona y monitorea el desempeño de tu sucursal</p>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Tabla de Ventas por Día */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          {/* Header con Navegación de Meses */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Ventas del Mes
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {mesActual.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => cambiarMes('anterior')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <span className="text-sm font-medium text-gray-700 min-w-[120px] text-center">
                {mesActual.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' })}
              </span>
              <button
                onClick={() => cambiarMes('siguiente')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>

          {/* Gráfico de Barras */}
          <div className="overflow-x-auto mb-6">
            <div className="flex items-end gap-2 h-64 p-4 bg-gray-50 rounded-lg border border-gray-200 min-w-max">
              {ventasPorDia.map((venta, idx) => (
                <motion.div
                  key={idx}
                  initial={{ height: 0 }}
                  animate={{ height: (venta.venta / maxVenta) * 200 }}
                  transition={{ delay: idx * 0.02 }}
                  className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg hover:shadow-lg transition-all duration-300 group cursor-pointer min-w-[24px]"
                  title={`${venta.dia} ${venta.fecha}: $${venta.venta}`}
                >
                  <div className="h-full flex flex-col justify-end p-2">
                    <span className="text-xs font-bold text-white text-center whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      ${venta.venta}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Tabla detallada */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Día</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Fecha</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Venta</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Cantidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {ventasPorDia.slice(0, 10).map((venta, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{venta.dia}</td>
                    <td className="px-4 py-3 text-center text-gray-700">{venta.fecha}</td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-600">${venta.venta.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center text-gray-700">{venta.cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Productos Más Vendidos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Productos Más Vendidos
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {productosVendidos.map((producto, idx) => {
              const maxVentaProducto = Math.max(...productosVendidos.map(p => p.venta));
              return (
                <motion.div
                  key={producto.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                  className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg p-4 border border-emerald-200"
                >
                  <p className="text-sm font-semibold text-emerald-900 mb-2 line-clamp-2">{producto.nombre}</p>
                  <div className="mb-3">
                    <div className="w-full bg-emerald-200 rounded-full h-2">
                      <div
                        className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(producto.venta / maxVentaProducto) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-emerald-700 font-semibold">Unidades</p>
                      <p className="text-lg font-bold text-emerald-600">{producto.cantidad}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-emerald-700 font-semibold">Venta</p>
                      <p className="text-lg font-bold text-emerald-600">${(producto.venta / 1000).toFixed(1)}k</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Gastos de Operación */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-red-600" />
            Total de Gastos de Operación
          </h2>

          <div className="space-y-4">
            {gastosOperacion.map((gasto, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + idx * 0.05 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900">{gasto.concepto}</p>
                  <span className="text-sm font-bold text-gray-900">${gasto.monto.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${gasto.porcentaje}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">{gasto.porcentaje}% del total</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
            <p className="font-bold text-gray-900">Total Gastos Mes</p>
            <p className="text-2xl font-bold text-red-600">${totalGastos.toLocaleString()}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
