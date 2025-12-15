'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Search } from 'lucide-react';
import { API } from '@/lib/config';

interface MenuItem {
  id: number;
  nombre: string;
  precio: number;
  categoria: string;
}

interface PromocionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  promocion?: any; // Para editar
}

export function PromocionModal({ isOpen, onClose, onSuccess, promocion }: PromocionModalProps) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [itemsRequeridos, setItemsRequeridos] = useState(2);
  const [itemsGratis, setItemsGratis] = useState(1);
  const [aplicarACategoria, setAplicarACategoria] = useState('');
  const [selectedItems, setSelectedItems] = useState<MenuItem[]>([]);
  const [availableItems, setAvailableItems] = useState<MenuItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingItems, setLoadingItems] = useState(true);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [diasAplicables, setDiasAplicables] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]); // Todos los días por defecto
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadAvailableItems();
      if (promocion) {
        setNombre(promocion.nombre || '');
        setDescripcion(promocion.descripcion || '');
        setItemsRequeridos(promocion.itemsRequeridos || 2);
        setItemsGratis(promocion.itemsGratis || 1);
        setAplicarACategoria(promocion.aplicarACategoria || '');
        setSelectedItems(promocion.items || []);
        setDiasAplicables(promocion.diasAplicables ? JSON.parse(promocion.diasAplicables) : [0, 1, 2, 3, 4, 5, 6]);
        setHoraInicio(promocion.horaInicio || '');
        setHoraFin(promocion.horaFin || '');
      } else {
        setNombre('');
        setDescripcion('');
        setItemsRequeridos(2);
        setItemsGratis(1);
        setAplicarACategoria('');
        setSelectedItems([]);
        setDiasAplicables([0, 1, 2, 3, 4, 5, 6]);
        setHoraInicio('');
        setHoraFin('');
      }
    }
  }, [isOpen, promocion]);

  const loadAvailableItems = async () => {
    try {
      setLoadingItems(true);
      const response = await fetch(API.MENU_ADMIN);
      if (response.ok) {
        const data = await response.json();
        setAvailableItems(data);
        // Extraer categorías únicas
        const categoriasUnicas = Array.from(new Set(data.map((item: any) => item.categoria))) as string[];
        setCategorias(categoriasUnicas.sort());
      }
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoadingItems(false);
    }
  };

  const filteredItems = availableItems.filter(item =>
    item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleItemToggle = (item: MenuItem) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(selected => selected.id === item.id);
      if (isSelected) {
        return prev.filter(selected => selected.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nombre.trim()) {
      setError('El nombre de la promoción es requerido');
      return;
    }

    if (selectedItems.length < 2) {
      setError('Debe seleccionar al menos 2 items para la promoción');
      return;
    }

    setLoading(true);
    try {
      const itemIds = selectedItems.map(item => item.id);
      const data = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        itemIds,
        itemsRequeridos,
        itemsGratis,
        aplicarACategoria: aplicarACategoria || null,
        diasAplicables: JSON.stringify(diasAplicables),
        horaInicio: horaInicio || null,
        horaFin: horaFin || null
      };

      const url = promocion ? API.PROMOCION_BY_ID(promocion.id) : API.PROMOCIONES;
      const method = promocion ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al guardar la promoción');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {promocion ? 'Editar Promoción' : 'Nueva Promoción'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la promoción *
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: 2x1 en Rollos Especiales"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={loading}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción (opcional)
              </label>
              <input
                type="text"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Ej: Lleva 2 rollos, paga 1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={loading}
              />
            </div>
          </div>

          {/* Configuración de la promoción */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Configurar Promoción</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Items Requeridos
                </label>
                <select
                  value={itemsRequeridos}
                  onChange={(e) => setItemsRequeridos(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={loading}
                >
                  {[2, 3, 4, 5].map(n => (
                    <option key={n} value={n}>{n} items</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Items Gratis
                </label>
                <select
                  value={itemsGratis}
                  onChange={(e) => setItemsGratis(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={loading}
                >
                  {[1, 2, 3].map(n => (
                    <option key={n} value={n}>{n} item{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aplica Solo a (Opcional)
                </label>
                <select
                  value={aplicarACategoria}
                  onChange={(e) => setAplicarACategoria(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={loading}
                >
                  <option value="">Todos los items</option>
                  {categorias.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

          {/* Sección de Horarios y Días */}
          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ⏰ Días y Horarios de Aplicación
            </h3>

            {/* Selector de días */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Aplica en estos días:
              </label>
              <div className="grid grid-cols-7 gap-2">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((dia, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setDiasAplicables(prev =>
                        prev.includes(idx)
                          ? prev.filter(d => d !== idx)
                          : [...prev, idx]
                      );
                    }}
                    className={`py-2 px-1 sm:px-2 rounded text-xs sm:text-sm font-semibold transition-colors ${
                      diasAplicables.includes(idx)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {dia}
                  </button>
                ))}
              </div>
            </div>

            {/* Selector de horarios */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora Inicio (Opcional)
                </label>
                <input
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora Fin (Opcional)
                </label>
                <input
                  type="time"
                  value={horaFin}
                  onChange={(e) => setHoraFin(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

            </div>
            <p className="text-sm text-blue-700 mt-3">
              📝 Ejemplo: {itemsRequeridos}x{itemsGratis} significa comprar {itemsRequeridos} items y obtener {itemsGratis} gratis
            </p>
          </div>

          {/* Items seleccionados */}
          {selectedItems.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Items Seleccionados ({selectedItems.length})
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {selectedItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between bg-white p-2 rounded border">
                      <div>
                        <span className="font-medium text-sm">{item.nombre}</span>
                        <span className="text-xs text-gray-500 ml-2">(${item.precio})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleItemToggle(item)}
                        className="text-red-500 hover:text-red-700 text-sm"
                        disabled={loading}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-blue-700 mt-2">
                  ℹ️ El item más barato será gratuito cuando se seleccione cualquiera de los items participantes.
                </p>
              </div>
            </div>
          )}

          {/* Selector de items */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Seleccionar Items Participantes
            </h3>

            {/* Buscador */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar items..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Lista de items disponibles */}
            <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
              {loadingItems ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  Cargando items...
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No se encontraron items
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredItems.map(item => {
                    const isSelected = selectedItems.some(selected => selected.id === item.id);
                    return (
                      <div
                        key={item.id}
                        className={`p-4 hover:bg-gray-50 cursor-pointer ${
                          isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                        onClick={() => handleItemToggle(item)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-gray-900">{item.nombre}</span>
                              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {item.categoria}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              Precio: ${item.precio}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isSelected && (
                              <span className="text-blue-600 font-medium text-sm">Seleccionado</span>
                            )}
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}} // Handle onClick above
                              className="h-5 w-5 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={loading || selectedItems.length < 2}
            >
              <Plus className="h-5 w-5" />
              {loading ? 'Guardando...' : (promocion ? 'Actualizar' : 'Crear')} Promoción
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}