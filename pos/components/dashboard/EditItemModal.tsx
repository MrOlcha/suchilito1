'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Upload, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { API } from '@/lib/config';

interface EditItemModalProps {
  isOpen: boolean;
  item?: any;
  onClose: () => void;
  onSuccess: () => void;
  categories: any[];
  areas?: any[];
}

export default function EditItemModal({
  isOpen,
  item,
  onClose,
  onSuccess,
  categories,
  areas = [],
}: EditItemModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoria_id: '',
    area_id: '',
    vegetariano: false,
    picante: false,
    favorito: false,
    destacado: false,
    imagen: null as File | null,
  });

  // Actualizar formData cuando cambia el item
  useEffect(() => {
    if (isOpen && item) {
      console.log('🔍 Item recibido en EditItemModal:', item);
      
      // Buscar la categoría por ID primero, luego por nombre si es necesario
      let categoria = null;
      if (item.categoria_id) {
        categoria = categories.find(c => c.id === item.categoria_id);
      } else if (item.categoria) {
        categoria = categories.find(c => c.nombre === item.categoria);
      }
      
      const categoriaId = categoria?.id?.toString() || item.categoria_id?.toString() || '';
      
      setFormData({
        nombre: item.nombre || '',
        descripcion: item.descripcion || '',
        precio: item.precio || '',
        categoria_id: categoriaId,
        area_id: item.area_id?.toString() || '',
        vegetariano: item.vegetariano ? true : false,
        picante: item.picante ? true : false,
        favorito: item.favorito ? true : false,
        destacado: item.destacado ? true : false,
        imagen: null,
      });
      setPreviewImage(item.imagen_url || null);
    }
  }, [isOpen, item, categories]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen es demasiado grande. Máximo 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        setFormData({ ...formData, imagen: file });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.nombre || !formData.descripcion || !formData.precio || !formData.categoria_id) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    if (!item || !item.id) {
      setError('Error: No se pudo identificar el item a actualizar');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('nombre', formData.nombre);
      data.append('descripcion', formData.descripcion);
      data.append('precio', formData.precio);
      data.append('categoria_id', formData.categoria_id);
      if (formData.area_id) {
        data.append('area_id', formData.area_id);
      }
      data.append('vegetariano', String(formData.vegetariano));
      data.append('picante', String(formData.picante));
      data.append('favorito', String(formData.favorito));
      data.append('destacado', String(formData.destacado));

      if (formData.imagen) {
        data.append('imagen', formData.imagen);
      }

      const url = `${API.MENU_ADMIN}/${item.id}`;
      console.log('Actualizando item en:', url);
      
      const response = await fetch(url, {
        method: 'PUT',
        body: data,
      });

      console.log('Respuesta del servidor:', response.status, response.statusText);

      if (response.ok) {
        alert('✅ Item actualizado exitosamente');
        setFormData({
          nombre: '',
          descripcion: '',
          precio: '',
          categoria_id: '',
          area_id: '',
          vegetariano: false,
          picante: false,
          favorito: false,
          destacado: false,
          imagen: null,
        });
        setPreviewImage(null);
        onSuccess();
        onClose();
      } else {
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // No se pudo parsear como JSON
        }
        setError(errorMessage);
        console.error('Error actualizando item:', errorMessage);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al actualizar item: ${errorMsg}`);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary to-primary/80 text-white p-6 flex items-center justify-between border-b border-primary/20">
          <div>
            <h2 className="text-2xl font-bold">Editar Item</h2>
            <p className="text-primary-light text-sm">{item?.nombre}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-300 rounded-lg p-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Nombre y Precio */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre del Item *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Ej: Sushi Roll California"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Precio *
              </label>
              <input
                type="number"
                name="precio"
                step="0.01"
                min="0"
                value={formData.precio}
                onChange={handleInputChange}
                placeholder="0.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Categoría *
              </label>
              <select
                name="categoria_id"
                value={formData.categoria_id}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id.toString()}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Área */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Área de Preparación
              </label>
              <select
                name="area_id"
                value={formData.area_id}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Sin área asignada</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id.toString()}>
                    {area.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Descripción *
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              placeholder="Describe el item: ingredientes, preparación, etc."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              required
            />
          </div>

          {/* Imagen */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Imagen del Item
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary transition-colors text-gray-600 hover:text-primary font-medium"
            >
              <Upload className="h-5 w-5 inline mr-2" />
              Seleccionar imagen
            </button>

            {previewImage && (
              <div className="mt-4 flex gap-4 items-start">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={previewImage}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    {formData.imagen?.name || 'Imagen actual'}
                  </p>
                  {formData.imagen && (
                    <p className="text-xs text-gray-500 mt-1">
                      Tamaño: {(formData.imagen?.size || 0) / 1024 > 1024
                        ? `${((formData.imagen?.size || 0) / 1024 / 1024).toFixed(2)} MB`
                        : `${((formData.imagen?.size || 0) / 1024).toFixed(2)} KB`}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Atributos */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Atributos
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="vegetariano"
                  checked={formData.vegetariano}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-gray-300 text-primary"
                />
                <span className="text-sm font-medium text-gray-700">
                  Vegetariano
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="picante"
                  checked={formData.picante}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-gray-300 text-primary"
                />
                <span className="text-sm font-medium text-gray-700">
                  Picante
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="favorito"
                  checked={formData.favorito}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-gray-300 text-primary"
                />
                <span className="text-sm font-medium text-gray-700">
                  Favorito
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="destacado"
                  checked={formData.destacado}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-gray-300 text-primary"
                />
                <span className="text-sm font-medium text-gray-700">
                  Destacado
                </span>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 sticky bottom-0 bg-white pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Actualizando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
