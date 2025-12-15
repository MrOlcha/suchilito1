'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit2, MapPin, Users, TrendingUp, Star, MoreVertical } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Sucursal {
  id: number;
  nombre: string;
  imagen: string;
  gerente: string;
  usuariosOperaciones: number;
  ventaPromedioMensual: number;
  calificacionGoogle: number;
}

export default function SucursalesPage() {
  const [sucursales] = useState<Sucursal[]>([
    {
      id: 1,
      nombre: 'Sucursal Centro',
      imagen: 'https://i.postimg.cc/6pSVfNWZ/cdsol.jpg',
      gerente: 'Juan García López',
      usuariosOperaciones: 8,
      ventaPromedioMensual: 45000,
      calificacionGoogle: 4.8,
    },
    {
      id: 2,
      nombre: 'Sucursal Zona Norte',
      imagen: 'https://i.postimg.cc/6pSVfNWZ/cdsol.jpg',
      gerente: 'María Rodríguez Pérez',
      usuariosOperaciones: 6,
      ventaPromedioMensual: 38000,
      calificacionGoogle: 4.5,
    },
    {
      id: 3,
      nombre: 'Sucursal Zona Sur',
      imagen: 'https://i.postimg.cc/6pSVfNWZ/cdsol.jpg',
      gerente: 'Carlos Martínez Gómez',
      usuariosOperaciones: 7,
      ventaPromedioMensual: 42000,
      calificacionGoogle: 4.7,
    },
    {
      id: 4,
      nombre: 'Sucursal Área Comercial',
      imagen: 'https://i.postimg.cc/6pSVfNWZ/cdsol.jpg',
      gerente: 'Ana Sánchez Torres',
      usuariosOperaciones: 9,
      ventaPromedioMensual: 52000,
      calificacionGoogle: 4.9,
    },
  ]);

  const handleAdministrar = (sucursal: Sucursal) => {
    // La navegación se maneja a través del Link
  };

  const totalVentas = sucursales.reduce((sum, s) => sum + s.ventaPromedioMensual, 0);
  const totalUsuarios = sucursales.reduce((sum, s) => sum + s.usuariosOperaciones, 0);
  const calificacionPromedio = (sucursales.reduce((sum, s) => sum + s.calificacionGoogle, 0) / sucursales.length).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sucursales</h1>
          <p className="text-gray-600 mt-1">Gestiona todas tus sucursales</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          + Nueva Sucursal
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <p className="text-gray-600 text-sm font-medium">Total de Sucursales</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{sucursales.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <p className="text-gray-600 text-sm font-medium">Venta Total Mensual</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">${(totalVentas / 1000).toFixed(0)}k</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <p className="text-gray-600 text-sm font-medium">Total de Operarios</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">{totalUsuarios}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <p className="text-gray-600 text-sm font-medium">Calificación Promedio</p>
          <p className="text-3xl font-bold text-yellow-500 mt-2">{calificacionPromedio} ⭐</p>
        </div>
      </div>

      {/* Grid de Sucursales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sucursales.map((sucursal, index) => (
          <motion.div
            key={sucursal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            {/* Imagen de Sucursal */}
            <div className="relative w-full h-48 bg-gray-200 overflow-hidden">
              <Image
                src={sucursal.imagen}
                alt={sucursal.nombre}
                fill
                className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                priority={index === 0}
              />
            </div>

            {/* Información de Sucursal */}
            <div className="p-6">
              {/* Nombre */}
              <h3 className="text-xl font-bold text-gray-900 mb-4">{sucursal.nombre}</h3>

              {/* Gerente */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider mb-1">Gerente de Sucursal</p>
                <p className="text-gray-900 font-medium">{sucursal.gerente}</p>
              </div>

              {/* Información en Grid */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Usuarios de Operaciones */}
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-blue-600" />
                    <p className="text-xs text-blue-700 font-semibold">Operarios</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{sucursal.usuariosOperaciones}</p>
                </div>

                {/* Venta Promedio Mensual */}
                <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <p className="text-xs text-emerald-700 font-semibold">Venta Mensual</p>
                  </div>
                  <p className="text-lg font-bold text-emerald-600">${(sucursal.ventaPromedioMensual / 1000).toFixed(0)}k</p>
                </div>
              </div>

              {/* Calificación Google Maps */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-lg font-bold text-gray-900">{sucursal.calificacionGoogle}</span>
                  <span className="text-sm text-gray-600">en Google Maps</span>
                </div>
              </div>

              {/* Botón de Administrar */}
              <Link
                href={`/dashboard/sucursales/${sucursal.id}`}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
              >
                <Edit2 className="w-4 h-4" />
                Administrar
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Resumen de Sucursales */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4">Resumen de Red de Sucursales</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-700 font-medium mb-2">Sucursal con Mayor Venta</p>
            <p className="text-xl font-bold text-emerald-600">
              {sucursales.reduce((max, s) => s.ventaPromedioMensual > max.ventaPromedioMensual ? s : max).nombre}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-700 font-medium mb-2">Sucursal Mejor Calificada</p>
            <p className="text-xl font-bold text-yellow-600">
              {sucursales.reduce((max, s) => s.calificacionGoogle > max.calificacionGoogle ? s : max).nombre}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-700 font-medium mb-2">Mayor Equipo de Operarios</p>
            <p className="text-xl font-bold text-purple-600">
              {sucursales.reduce((max, s) => s.usuariosOperaciones > max.usuariosOperaciones ? s : max).nombre}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
