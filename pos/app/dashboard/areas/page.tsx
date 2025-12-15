'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';

interface Area {
  id: number;
  nombre: string;
  descripcion: string | null;
  color: string;
  icono: string;
  activo: boolean;
  orden: number;
}

export default function AreasPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    color: '#3b82f6',
    icono: 'ChefHat',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const colores = [
    '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e',
    '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6',
    '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
  ];

  const iconos = [
    'ChefHat', 'Utensils', 'Wine', 'DollarSign', 'Coffee',
    'Flame', 'Package', 'Truck', 'Settings'
  ];

  // Cargar áreas
  useEffect(() => {
    cargarAreas();
  }, []);

  const cargarAreas = async () => {
    try {
      setLoading(true);
      const response = await fetch('/pos/api/areas');
      if (!response.ok) throw new Error('Error al cargar áreas');
      const data = await response.json();
      setAreas(data);
    } catch (err) {
      setError('Error al cargar las áreas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.nombre.trim()) {
      setError('El nombre del área es requerido');
      return;
    }

    try {
      const url = editingId ? `/pos/api/areas/${editingId}` : '/pos/api/areas';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al guardar área');
      }

      setSuccess(editingId ? 'Área actualizada' : 'Área creada');
      setFormData({ nombre: '', descripcion: '', color: '#3b82f6', icono: 'ChefHat' });
      setEditingId(null);
      setShowForm(false);
      cargarAreas();
    } catch (err: any) {
      setError(err.message || 'Error al guardar área');
    }
  };

  const handleEdit = (area: Area) => {
    setFormData({
      nombre: area.nombre,
      descripcion: area.descripcion || '',
      color: area.color,
      icono: area.icono,
    });
    setEditingId(area.id);
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro que desea eliminar esta área?')) return;

    try {
      const response = await fetch(`/pos/api/areas/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Error al eliminar área');
      setSuccess('Área eliminada');
      cargarAreas();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar área');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ nombre: '', descripcion: '', color: '#3b82f6', icono: 'ChefHat' });
    setError('');
    setSuccess('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark">Áreas de Trabajo</h1>
          <p className="text-gray-600 mt-1">Gestiona las divisiones del restaurante</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-all"
        >
          <Plus className="w-5 h-5" />
          Nueva Área
        </button>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          {success}
        </div>
      )}

      {/* Formulario */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold mb-4">
            {editingId ? 'Editar Área' : 'Nueva Área'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="ej: Cocina, Barra, Bebidas"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex gap-2 flex-wrap">
                  {colores.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        formData.color === color ? 'border-dark scale-110' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Descripción */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  placeholder="Descripción del área (opcional)"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Ícono */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ícono
                </label>
                <select
                  name="icono"
                  value={formData.icono}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {iconos.map(icon => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all"
              >
                <Check className="w-4 h-4" />
                {editingId ? 'Actualizar' : 'Crear'} Área
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla de Áreas */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : areas.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600 text-lg">No hay áreas creadas aún</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {areas.map(area => (
            <div
              key={area.id}
              className="bg-white rounded-lg shadow-lg p-6 border-l-4 hover:shadow-xl transition-all"
              style={{ borderLeftColor: area.color }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl"
                  style={{ backgroundColor: area.color }}
                >
                  {area.icono[0]}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(area)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(area.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-dark mb-1">{area.nombre}</h3>
              {area.descripcion && (
                <p className="text-sm text-gray-600 mb-3">{area.descripcion}</p>
              )}

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: area.color }}
                />
                <span>{area.color}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
