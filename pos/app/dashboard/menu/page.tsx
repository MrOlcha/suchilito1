'use client';

import { useState, useEffect } from 'react';
import { Utensils, Plus, RefreshCw, AlertCircle, CheckCircle, Edit2, Save, X, Trash2, Folder } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { formatDateMexico } from '@/lib/dateUtils';
import { API, IMAGES, getMenuImageUrl } from '@/lib/config';
import AddItemModal from '@/components/dashboard/AddItemModal';
import EditItemModal from '@/components/dashboard/EditItemModal';
import { AddCategoryModal } from '@/components/dashboard/AddCategoryModal';
import { PromocionModal } from '@/components/dashboard/PromocionModal';

interface MenuItem {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url?: string;
  vegetariano?: boolean;
  picante?: boolean;
  favorito?: boolean;
  destacado?: boolean;
  categoria_id?: number;
  categoria?: string;
}

interface MenuCategory {
  nombre: string;
  items: MenuItem[];
}

export default function MenuPage() {
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [menuAdminItems, setMenuAdminItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [syncing, setSyncing] = useState(false);
  const [productosSinStock, setProductosSinStock] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stockUpdating, setStockUpdating] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<MenuItem>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'menu' | 'categories' | 'promociones'>('menu');
  const [promociones, setPromociones] = useState<any[]>([]);
  const [showAddPromocionModal, setShowAddPromocionModal] = useState(false);
  const [editingPromocion, setEditingPromocion] = useState<any | null>(null);

  useEffect(() => {
    fetchMenu();
    fetchMenuAdmin();
    checkAdmin();
    fetchCategories();
    fetchAreas();
    fetchPromociones();
  }, []);

  const checkAdmin = async () => {
    try {
      // Obtener datos del usuario del token (asumimos que está en el cliente)
      const response = await fetch(API.AUTH, { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        setIsAdmin(data.rol === 'admin');
      }
    } catch (error) {
      console.error('Error verificando rol:', error);
    }
  };

  const fetchPromociones = async () => {
    try {
      const response = await fetch(API.PROMOCIONES);
      if (response.ok) {
        const data = await response.json();
        setPromociones(data);
      }
    } catch (error) {
      console.error('Error fetching promociones:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(API.MENU_CATEGORIES);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchAreas = async () => {
    try {
      const response = await fetch('/pos/api/areas');
      if (response.ok) {
        const data = await response.json();
        setAreas(data);
      }
    } catch (error) {
      console.error('Error fetching areas:', error);
    }
  };

  const fetchMenuAdmin = async () => {
    try {
      const response = await fetch(API.MENU_ADMIN);
      if (response.ok) {
        const data = await response.json();
        setMenuAdminItems(data);
      }
    } catch (error) {
      console.error('Error fetching menu admin:', error);
    }
  };

  const fetchMenu = async () => {
    try {
      const response = await fetch(API.MENU);
      if (response.ok) {
        const data = await response.json();
        setMenu(data);
        if (data.length > 0 && !selectedCategory) {
          setSelectedCategory(data[0].nombre);
        }
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncMenu = async () => {
    setSyncing(true);
    try {
      const response = await fetch(API.MENU_SYNC, {
        method: 'POST',
      });

      if (response.ok) {
        await fetchMenu(); // Recargar el menú después de sincronizar
        alert('Menú sincronizado exitosamente');
      } else {
        const data = await response.json();
        alert(`Error sincronizando: ${data.message}`);
      }
    } catch (error) {
      console.error('Error syncing menu:', error);
      alert('Error de conexión al sincronizar');
    } finally {
      setSyncing(false);
    }
  };

  const handleDeleteCategory = async (categoryId: number, categoryName: string) => {
    if (!confirm(`¿Eliminar la categoría "${categoryName}"?`)) {
      return;
    }

    try {
      const response = await fetch(API.MENU_CATEGORIES_MANAGE, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: categoryId })
      });

      if (response.ok) {
        alert('Categoría eliminada exitosamente');
        await fetchCategories();
      } else {
        const data = await response.json();
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error al eliminar la categoría');
    }
  };

  const handleDeletePromocion = async (promocionId: number, promocionName: string) => {
    if (!confirm(`¿Eliminar la promoción "${promocionName}"?`)) {
      return;
    }

    try {
      const response = await fetch(API.PROMOCION_BY_ID(promocionId), {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Promoción eliminada exitosamente');
        await fetchPromociones();
      } else {
        const data = await response.json();
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error deleting promocion:', error);
      alert('Error al eliminar la promoción');
    }
  };

  const handleUpdateCategory = async (categoryId: number, updatedData: any) => {
    try {
      const response = await fetch(API.MENU_CATEGORIES_MANAGE, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: categoryId,
          nombre: updatedData.nombre,
          orden: updatedData.orden,
          activo: updatedData.activo
        })
      });

      if (response.ok) {
        alert('Categoría actualizada exitosamente');
        setEditingCategory(null);
        await fetchCategories();
      } else {
        const data = await response.json();
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Error al actualizar la categoría');
    }
  };

  const marcarSinStock = async (itemId: number, nombre: string, razonParam?: string, duracionParam?: number) => {
    const razon = razonParam || prompt('¿Razón? (opcional - máximo 24 horas)', 'Se agotó');
    const duracion = duracionParam || parseInt(prompt('¿Duración en horas?', '24') || '24');
    
    if (razon === null) return;

    setStockUpdating(itemId);
    try {
      const response = await fetch(API.STOCK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accion: 'marcar-sin-stock',
          menu_item_id: itemId,
          razon: razon || 'Temporalmente no disponible',
          duracion_horas: duracion
        })
      });

      if (response.ok) {
        alert(`${nombre} marcado como sin stock`);
        await cargarProductosSinStock();
      } else {
        const data = await response.json();
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error marcando sin stock:', error);
      alert('Error al marcar como sin stock');
    } finally {
      setStockUpdating(null);
    }
  };

  const restaurarStock = async (itemId: number, nombre: string) => {
    setStockUpdating(itemId);
    try {
      const response = await fetch(API.STOCK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accion: 'restaurar-stock',
          menu_item_id: itemId
        })
      });

      if (response.ok) {
        alert(`${nombre} restaurado a disponible`);
        await cargarProductosSinStock();
      } else {
        const data = await response.json();
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error restaurando stock:', error);
      alert('Error al restaurar stock');
    } finally {
      setStockUpdating(null);
    }
  };

  const cargarProductosSinStock = async () => {
    try {
      const response = await fetch(`${API.STOCK}?tipo=lista`);
      if (response.ok) {
        const data = await response.json();
        setProductosSinStock(data.data || []);
      }
    } catch (error) {
      console.error('Error cargando productos sin stock:', error);
    }
  };

  const handleEdit = (item: MenuItem) => {
    // Enriquecer el item con la información de la categoría actual
    const categoryItem = {
      ...item,
      categoria: selectedCategory, // Asignar la categoría actual
      categoria_id: categories.find(c => c.nombre === selectedCategory)?.id // Obtener el ID de la categoría
    };
    setEditingItem(categoryItem);
    setShowEditModal(true);
  };

  const handleSave = async () => {
    if (!editingId) return;

    setSaving(true);
    try {
      const response = await fetch(API.MENU_ADMIN, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, ...editData }),
      });

      if (response.ok) {
        setMenuAdminItems(menuAdminItems.map(item => 
          item.id === editingId ? { ...item, ...editData } : item
        ));
        setEditingId(null);
        setEditData({});
        alert('✅ Item actualizado exitosamente');
      } else {
        alert('❌ Error al actualizar');
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('❌ Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este item?')) return;

    setDeleting(id);
    try {
      const response = await fetch(`${API.MENU_ADMIN}/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        alert('✅ Item eliminado exitosamente');
        await fetchMenu();
        await fetchMenuAdmin();
      } else {
        const data = await response.json();
        alert('❌ ' + (data.message || 'Error al eliminar'));
      }
    } catch (error) {
      console.error('Error deleting:', error);
      alert('❌ Error al eliminar');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const selectedCategoryData = menu.find(cat => cat.nombre === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header con Botones */}
      <div className="flex justify-end gap-3 sm:gap-4">
        <button
          onClick={() => {
            const modes: ('menu' | 'categories' | 'promociones')[] = ['menu', 'categories', 'promociones'];
            const currentIndex = modes.indexOf(viewMode);
            const nextIndex = (currentIndex + 1) % modes.length;
            setViewMode(modes[nextIndex]);
          }}
          className="flex items-center gap-2 sm:gap-3 bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-sm sm:text-base"
        >
          <Folder className="h-5 w-5 sm:h-6 sm:w-6" />
          <span className="font-medium hidden sm:inline">
            {viewMode === 'menu' ? 'Ver Categorías' : viewMode === 'categories' ? 'Ver Promociones' : 'Ver Menú'}
          </span>
          <span className="font-medium sm:hidden">
            {viewMode === 'menu' ? 'Cat.' : viewMode === 'categories' ? 'Promo' : 'Menú'}
          </span>
        </button>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 sm:gap-3 bg-primary hover:bg-primary/90 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-sm sm:text-base"
        >
          <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
          <span className="font-medium">Agregar</span>
        </button>
      </div>

      {/* Vista del Menú */}
      {viewMode === 'menu' && (
        <>
          {/* Selector de categoría - Desktop */}
          <div className="hidden md:block bg-white p-4 rounded-lg shadow-md">
            <div className="flex flex-wrap gap-2">
              {menu.map((category) => (
                <button
                  key={category.nombre}
                  onClick={() => setSelectedCategory(category.nombre)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category.nombre
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.nombre} ({category.items.length})
                </button>
              ))}
            </div>
          </div>

          {/* Selector de categoría - Mobile (Horizontal Scroll) */}
          <div className="md:hidden">
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 pb-2 px-4 min-w-min">
                {menu.map((category) => (
                  <button
                    key={category.nombre}
                    onClick={() => setSelectedCategory(category.nombre)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                      selectedCategory === category.nombre
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.nombre} ({category.items.length})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Panel de control de stock para admin */}
          {isAdmin && productosSinStock.length > 0 && (
            <div className="bg-yellow-50 border-2 border-yellow-300 p-6 rounded-lg shadow-md">
              <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
            <h2 className="text-lg font-bold text-yellow-800">
              Productos Sin Stock ({productosSinStock.length})
            </h2>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {productosSinStock.map((item) => (
              <div
                key={item.menu_item_id}
                className="bg-white p-3 rounded-lg flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-gray-900">{item.nombre}</p>
                  <p className="text-sm text-gray-600">
                    {item.categoria} - Razón: {item.razon}
                  </p>
                  <p className="text-xs text-gray-500">
                    Hasta: {formatDateMexico(item.fecha_expiracion)}
                  </p>
                </div>
                <button
                  onClick={() => restaurarStock(item.menu_item_id, item.nombre)}
                  disabled={stockUpdating === item.menu_item_id}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  ✓ Restaurar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabla de items */}
      {selectedCategoryData && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Utensils className="h-5 w-5 mr-2 text-primary" />
              {selectedCategoryData.nombre} ({selectedCategoryData.items.length} items)
            </h2>
          </div>

          {/* Items - Desktop Table */}
          <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Imagen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    {isAdmin && (
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedCategoryData.items.map((item, index) => {
                    const itemStock = productosSinStock.find(
                      (s) => s.menu_item_id === item.id
                    );
                    const isEditing = editingId === item.id;

                    if (isEditing) {
                      return (
                        <tr key={index} className="bg-orange-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              placeholder="URL imagen"
                              value={editData.imagen_url || ''}
                              onChange={(e) => setEditData({ ...editData, imagen_url: e.target.value })}
                              className="w-24 px-2 py-1 border border-gray-300 rounded text-xs"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              value={editData.nombre || ''}
                              onChange={(e) => setEditData({ ...editData, nombre: e.target.value })}
                              className="w-32 px-2 py-1 border border-gray-300 rounded text-sm font-medium"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <textarea
                              value={editData.descripcion || ''}
                              onChange={(e) => setEditData({ ...editData, descripcion: e.target.value })}
                              rows={2}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              step="0.01"
                              value={editData.precio || ''}
                              onChange={(e) => setEditData({ ...editData, precio: parseFloat(e.target.value) })}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm font-bold"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex gap-1 justify-center">
                              <label className="flex items-center gap-1">
                                <input
                                  type="checkbox"
                                  checked={editData.vegetariano || false}
                                  onChange={(e) => setEditData({ ...editData, vegetariano: e.target.checked })}
                                  className="w-3 h-3"
                                />
                                <span className="text-xs">Veg</span>
                              </label>
                              <label className="flex items-center gap-1">
                                <input
                                  type="checkbox"
                                  checked={editData.picante || false}
                                  onChange={(e) => setEditData({ ...editData, picante: e.target.checked })}
                                  className="w-3 h-3"
                                />
                                <span className="text-xs">Pic</span>
                              </label>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-sm font-medium inline-flex items-center gap-1 disabled:opacity-50"
                              >
                                <Save className="h-4 w-4" />
                                {saving ? 'Guardando' : 'Guardar'}
                              </button>
                              <button
                                onClick={handleCancel}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded text-sm font-medium inline-flex items-center gap-1"
                              >
                                <X className="h-4 w-4" />
                                Cancelar
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr
                        key={index}
                        className={`hover:bg-gray-50 ${itemStock ? 'bg-red-50' : ''}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.imagen_url ? (
                            <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                              <Image
                                src={getMenuImageUrl(item.imagen_url)}
                                alt={item.nombre}
                                fill
                                sizes="48px"
                                className="object-cover"
                                onError={(e) => {
                                  console.error(
                                    `Error cargando imagen de ${item.nombre}:`,
                                    item.imagen_url
                                  );
                                  (e.target as any).src = IMAGES.PLACEHOLDER_MENU;
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <span className="text-xs text-gray-400">Sin imagen</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                            {item.nombre}
                            {itemStock && (
                              <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                                Sin stock
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 max-w-xs truncate">
                            {item.descripcion}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-primary">
                            ${item.precio.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {itemStock ? (
                            <span className="text-red-600 font-semibold text-sm">
                              No disponible
                            </span>
                          ) : (
                            <span className="text-green-600 font-semibold text-sm">
                              Disponible
                            </span>
                          )}
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => handleEdit(item)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-sm font-medium transition-colors inline-flex items-center gap-1"
                              >
                                <Edit2 className="h-4 w-4" />
                                Editar
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                disabled={deleting === item.id}
                                className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                              >
                                <Trash2 className="h-4 w-4" />
                                {deleting === item.id ? 'Eliminando...' : 'Eliminar'}
                              </button>
                              {itemStock ? (
                                <button
                                  onClick={() =>
                                    restaurarStock(item.id, item.nombre)
                                  }
                                  disabled={stockUpdating === item.id}
                                  className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  Restaurar
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    const razon = prompt(
                                      'Motivo de falta de stock (opcional):'
                                    );
                                    const duracion = prompt(
                                      'Duración en horas (default: 24):'
                                    );
                                    marcarSinStock(
                                      item.id,
                                      item.nombre,
                                      razon || 'Stock agotado',
                                      duracion ? parseInt(duracion) : 24
                                    );
                                  }}
                                  disabled={stockUpdating === item.id}
                                  className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                                >
                                  <AlertCircle className="h-4 w-4" />
                                  Sin stock
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Items - Mobile Card View */}
          <div className="md:hidden space-y-3">
            {selectedCategoryData.items.map((item, index) => {
              const itemStock = productosSinStock.find(
                (s) => s.menu_item_id === item.id
              );
              const isEditing = editingId === item.id;

              if (isEditing) {
                return (
                  <div key={index} className="bg-orange-50 border-2 border-orange-300 p-4 rounded-lg">
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Nombre"
                        value={editData.nombre || ''}
                        onChange={(e) => setEditData({ ...editData, nombre: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-medium"
                      />
                      <textarea
                        placeholder="Descripción"
                        value={editData.descripcion || ''}
                        onChange={(e) => setEditData({ ...editData, descripcion: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Precio"
                        value={editData.precio || ''}
                        onChange={(e) => setEditData({ ...editData, precio: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-bold"
                      />
                      <input
                        type="text"
                        placeholder="URL imagen"
                        value={editData.imagen_url || ''}
                        onChange={(e) => setEditData({ ...editData, imagen_url: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <Save className="h-4 w-4" />
                          Guardar
                        </button>
                        <button
                          onClick={handleCancel}
                          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <X className="h-4 w-4" />
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={index}
                  className={`flex gap-4 p-4 rounded-lg border ${
                    itemStock
                      ? 'bg-red-50 border-red-300'
                      : 'bg-white border-gray-200'
                  } shadow-sm`}
                >
                  {/* Imagen */}
                  <div className="flex-shrink-0">
                    {item.imagen_url ? (
                      <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        <Image
                          src={getMenuImageUrl(item.imagen_url)}
                          alt={item.nombre}
                          fill
                          sizes="80px"
                          className="object-cover"
                          onError={(e) => {
                            console.error(
                              `Error cargando imagen de ${item.nombre}:`,
                              item.imagen_url
                            );
                            (e.target as any).src = IMAGES.PLACEHOLDER_MENU;
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-xs text-gray-400 text-center px-1">Sin imagen</span>
                      </div>
                    )}
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-sm font-bold text-gray-900 truncate">
                        {item.nombre}
                      </h3>
                      {itemStock && (
                        <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full flex-shrink-0">
                          Sin stock
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                      {item.descripcion}
                    </p>
                    <div className="text-sm font-bold text-primary mb-3">
                      ${item.precio.toFixed(2)}
                    </div>
                  </div>

                  {/* Botones de Acción */}
                  {isAdmin && (
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(item)}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded text-sm font-medium transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deleting === item.id}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal para agregar items */}
      <AddItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          fetchMenu();
          fetchMenuAdmin();
        }}
        categories={categories}
        areas={areas}
      />

      <EditItemModal
        isOpen={showEditModal}
        item={editingItem}
        onClose={() => {
          setShowEditModal(false);
          setEditingItem(null);
        }}
        onSuccess={() => {
          fetchMenu();
          fetchMenuAdmin();
        }}
        categories={categories}
        areas={areas}
      />
        </>
      )}

      {/* Vista de Categorías */}
      {viewMode === 'categories' && isAdmin && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mt-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Folder className="h-8 w-8 text-primary" />
              <h2 className="text-2xl font-bold text-gray-900">Gestionar Categorías</h2>
            </div>
            <button
              onClick={() => setShowAddCategoryModal(true)}
              className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="h-5 w-5" />
              Nueva Categoría
            </button>
          </div>

          {categories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No hay categorías disponibles</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Nombre</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Orden</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Estado</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {editingCategory?.id === category.id ? (
                          <input
                            type="text"
                            value={editingCategory.nombre}
                            onChange={(e) =>
                              setEditingCategory({
                                ...editingCategory,
                                nombre: e.target.value
                              })
                            }
                            className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                          />
                        ) : (
                          <span className="font-medium text-gray-900">{category.nombre}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {editingCategory?.id === category.id ? (
                          <input
                            type="number"
                            value={editingCategory.orden}
                            onChange={(e) =>
                              setEditingCategory({
                                ...editingCategory,
                                orden: parseInt(e.target.value)
                              })
                            }
                            className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary w-20"
                          />
                        ) : (
                          <span className="text-gray-600">{category.orden}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {editingCategory?.id === category.id ? (
                          <input
                            type="checkbox"
                            checked={editingCategory.activo}
                            onChange={(e) =>
                              setEditingCategory({
                                ...editingCategory,
                                activo: e.target.checked
                              })
                            }
                            className="h-5 w-5 rounded border-gray-300"
                          />
                        ) : (
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              category.activo
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {category.activo ? 'Activa' : 'Inactiva'}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {editingCategory?.id === category.id ? (
                            <>
                              <button
                                onClick={() =>
                                  handleUpdateCategory(category.id, editingCategory)
                                }
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center gap-1"
                              >
                                <Save className="h-4 w-4" />
                                Guardar
                              </button>
                              <button
                                onClick={() => setEditingCategory(null)}
                                className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center gap-1"
                              >
                                <X className="h-4 w-4" />
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => setEditingCategory(category)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center gap-1"
                              >
                                <Edit2 className="h-4 w-4" />
                                Editar
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteCategory(category.id, category.nombre)
                                }
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center gap-1"
                              >
                                <Trash2 className="h-4 w-4" />
                                Eliminar
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Vista de Promociones */}
      {viewMode === 'promociones' && isAdmin && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mt-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎁</span>
              <h2 className="text-2xl font-bold text-gray-900">Gestionar Promociones</h2>
            </div>
            <button
              onClick={() => setShowAddPromocionModal(true)}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="h-5 w-5" />
              Nueva Promoción
            </button>
          </div>

          {promociones.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No hay promociones disponibles</p>
              <p className="text-sm mt-2">Crea tu primera promoción para ofrecer descuentos automáticos</p>
            </div>
          ) : (
            <div className="space-y-4">
              {promociones.map((promocion) => (
                <div key={promocion.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{promocion.nombre}</h3>
                      {promocion.descripcion && (
                        <p className="text-gray-600 mt-1">{promocion.descripcion}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          promocion.activa
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {promocion.activa ? 'Activa' : 'Inactiva'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {promocion.total_items} items participantes
                        </span>
                        <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium">
                          {promocion.itemsRequeridos}x{promocion.itemsGratis}
                        </span>
                        {promocion.aplicarACategoria && (
                          <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-medium">
                            {promocion.aplicarACategoria}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingPromocion(promocion)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-1"
                      >
                        <Edit2 className="h-4 w-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeletePromocion(promocion.id, promocion.nombre)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </button>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Items Participantes:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {promocion.items.map((item: any) => (
                        <div key={item.id} className="bg-white p-3 rounded border border-blue-300">
                          <div className="font-medium text-gray-900">{item.nombre}</div>
                          <div className="text-sm text-gray-600">{item.categoria}</div>
                          <div className="text-sm font-semibold text-green-600">${item.precio}</div>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-blue-700 mt-3 font-medium">
                      🎁 {promocion.itemsRequeridos}x{promocion.itemsGratis}: Compra {promocion.itemsRequeridos} item{promocion.itemsRequeridos > 1 ? 's' : ''} y obtén {promocion.itemsGratis} item{promocion.itemsGratis > 1 ? 's' : ''} gratis {promocion.aplicarACategoria ? `(solo en ${promocion.aplicarACategoria})` : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal para agregar categoría */}
      <AddCategoryModal
        isOpen={showAddCategoryModal}
        onClose={() => setShowAddCategoryModal(false)}
        onSuccess={() => fetchCategories()}
      />

      {/* Modal para agregar/editar promoción */}
      <PromocionModal
        isOpen={showAddPromocionModal || !!editingPromocion}
        onClose={() => {
          setShowAddPromocionModal(false);
          setEditingPromocion(null);
        }}
        onSuccess={() => {
          fetchPromociones();
          setShowAddPromocionModal(false);
          setEditingPromocion(null);
        }}
        promocion={editingPromocion}
      />
    </div>
  );
}