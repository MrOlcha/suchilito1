'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Gift, Users, Calendar, Loader } from 'lucide-react';
import ClientesTable from './clientes-table';

interface Cliente {
  id: number;
  nombre: string;
  telefono: string;
  correo: string;
  fecha_nacimiento: string;
  email_verificado: number;
  fecha_registro: string;
  ultima_orden?: string | null;
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/pos/api/clientes');
      
      if (!response.ok) {
        throw new Error('Error al cargar clientes');
      }
      
      const data = await response.json();
      setClientes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error fetching clientes:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatBirthday = (dateString: string) => {
    if (!dateString) return '-';
    // dateString es DD/MM (sin año), convertir a formato legible
    return dateString;
  };

  const getDaysSinceBirthday = (birthDate: string) => {
    if (!birthDate) return null;
    
    const [day, month] = birthDate.split('/').map(Number);
    const today = new Date();
    const thisYearBirthday = new Date(today.getFullYear(), month - 1, day);
    
    if (thisYearBirthday < today) {
      thisYearBirthday.setFullYear(today.getFullYear() + 1);
    }
    
    const daysUntil = Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil;
  };

  const upcomingBirthdays = clientes.filter(c => {
    const daysUntil = getDaysSinceBirthday(c.fecha_nacimiento);
    return daysUntil !== null && daysUntil <= 30;
  });

  const getRegisteredInDays = (dateString: string, days: number) => {
    if (!dateString) return 0;
    const regDate = new Date(dateString);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return clientes.filter(c => new Date(c.fecha_registro) >= cutoffDate).length;
  };

  const filteredClientes = clientes.filter(c => 
    c.telefono.includes(searchTerm) || 
    c.correo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes Web</h1>
          <p className="text-gray-600 mt-1">Registrados desde la plataforma pública</p>
        </div>
        <button 
          onClick={fetchClientes}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          🔄 Actualizar
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      )}

      {/* Cumpleaños Cercanos */}
      {upcomingBirthdays.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-pink-50 to-red-50 border-2 border-pink-200 rounded-lg p-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <Gift className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-red-900">Cumpleaños Próximos (próximos 30 días)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            {upcomingBirthdays.map(cliente => (
              <div key={cliente.id} className="bg-white rounded-lg p-3 border border-pink-100">
                <p className="font-semibold text-gray-900 text-sm truncate">{cliente.telefono}</p>
                <p className="text-xs text-red-600">{formatBirthday(cliente.fecha_nacimiento)}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-600" />
            <p className="text-gray-600 text-sm font-medium">Total de Clientes</p>
          </div>
          <p className="text-3xl font-bold text-blue-600">{clientes.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <p className="text-gray-600 text-sm font-medium">Nuevos (7 días)</p>
          </div>
          <p className="text-3xl font-bold text-emerald-600">{getRegisteredInDays(clientes[0]?.fecha_registro, 7)}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-purple-600" />
            <p className="text-gray-600 text-sm font-medium">Nuevos (30 días)</p>
          </div>
          <p className="text-3xl font-bold text-purple-600">{getRegisteredInDays(clientes[0]?.fecha_registro, 30)}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-5 h-5 text-red-600" />
            <p className="text-gray-600 text-sm font-medium">Cumpleaños Este Mes</p>
          </div>
          <p className="text-3xl font-bold text-red-600">{upcomingBirthdays.length}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <input
          type="text"
          placeholder="Buscar por nombre, teléfono o correo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tabla de Clientes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <ClientesTable 
          clientes={clientes} 
          searchTerm={searchTerm}
          onUpdate={fetchClientes}
        />
      </div>

      {clientes.length === 0 && !loading && (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 text-lg">No hay clientes registrados</p>
          <p className="text-gray-500 text-sm mt-1">Los usuarios que se registren en la plataforma pública aparecerán aquí</p>
        </div>
      )}
    </div>
  );
}
