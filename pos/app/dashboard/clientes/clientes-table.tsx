'use client';

import { useState } from 'react';
import { Loader, Trash2, Edit2, X, Check, Key } from 'lucide-react';
import { motion } from 'framer-motion';

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

interface ClientesTableProps {
  clientes: Cliente[];
  searchTerm: string;
  onUpdate: () => void;
}

export default function ClientesTable({ clientes, searchTerm, onUpdate }: ClientesTableProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Cliente>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);
  const [changingPassword, setChangingPassword] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const filteredClientes = clientes.filter(c => 
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.telefono.includes(searchTerm) || 
    c.correo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startEdit = (cliente: Cliente) => {
    setEditingId(cliente.id);
    setEditData(cliente);
    setError('');
  };

  const handleInputChange = (field: keyof Cliente, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (id: number) => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`/pos/api/clientes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al actualizar');
      }

      setEditingId(null);
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este cliente?')) return;

    setDeleting(id);
    try {
      const response = await fetch(`/pos/api/clientes/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Error al eliminar');
      }

      onUpdate();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar');
    } finally {
      setDeleting(null);
    }
  };

  const handleChangePassword = async (id: number) => {
    if (!newPassword || newPassword.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!confirm('¿Estás seguro de cambiar la contraseña de este cliente?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/pos/api/clientes/${id}/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al cambiar contraseña');
      }

      alert('✅ Contraseña cambiada exitosamente');
      setChangingPassword(null);
      setNewPassword('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al cambiar contraseña');
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

  if (filteredClientes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No hay clientes que coincidan con tu búsqueda</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Teléfono</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Correo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">F. Nacimiento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Verificado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Registro</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredClientes.map((cliente) => (
              <motion.tr
                key={cliente.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hover:bg-gray-50 transition-colors"
              >
                {editingId === cliente.id ? (
                  // Edit Mode
                  <>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={editData.nombre || ''}
                        onChange={(e) => handleInputChange('nombre', e.target.value)}
                        className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                        disabled={loading}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={editData.telefono || ''}
                        onChange={(e) => handleInputChange('telefono', e.target.value)}
                        className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                        disabled={loading}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="email"
                        value={editData.correo || ''}
                        onChange={(e) => handleInputChange('correo', e.target.value)}
                        className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                        disabled={loading}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={editData.fecha_nacimiento || ''}
                        placeholder="DD/MM"
                        className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                        disabled={loading}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        cliente.email_verificado 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {cliente.email_verificado ? '✓ Sí' : '✗ No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(cliente.fecha_registro)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleSave(cliente.id)}
                          disabled={loading}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50"
                          title="Guardar"
                        >
                          {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          disabled={loading}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                          title="Cancelar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  // View Mode
                  <>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {cliente.nombre || <span className="text-gray-400 italic">Sin nombre</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{cliente.telefono}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{cliente.correo}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{cliente.fecha_nacimiento || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        cliente.email_verificado 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {cliente.email_verificado ? '✓ Verificado' : '⏳ Pendiente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(cliente.fecha_registro)}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => startEdit(cliente)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setChangingPassword(cliente.id)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                          title="Cambiar Contraseña"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cliente.id)}
                          disabled={deleting === cliente.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                          title="Eliminar"
                        >
                          {deleting === cliente.id ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-sm text-gray-600 text-center">
        Mostrando {filteredClientes.length} de {clientes.length} clientes
      </div>

      {/* Modal de Cambio de Contraseña */}
      {changingPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Key className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Cambiar Contraseña
              </h3>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nueva Contraseña
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Ingresa la nueva contraseña para este cliente
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setChangingPassword(null);
                  setNewPassword('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleChangePassword(changingPassword)}
                disabled={loading || !newPassword}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? 'Cambiando...' : 'Cambiar'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
