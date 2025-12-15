'use client';

import { useState, useRef } from 'react';
import { X, Upload, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { API } from '@/lib/config';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: any[];
  areas?: any[];
}

export default function AddItemModal({
  isOpen,
  onClose,
  onSuccess,
  categories,
  areas = [],
}: AddItemModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoria: '',
    area: '',
    vegetariano: false,
    picante: false,
    favorito: false,
    destacado: false,
    imagen: null as File | null,
  });

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

  const compressImage = (file: File, callback: (compressed: File) => void) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new (window as any).Image();
      img.src = event.target?.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Redimensionar si es muy grande (máximo 1200px de ancho)
        if (width > 1200) {
          height = (height * 1200) / width;
          width = 1200;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              callback(compressedFile);
            }
          },
          'image/jpeg',
          0.8 // Calidad: 80%
        );
      };
    };
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamaño máximo (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen es demasiado grande. Máximo 5MB.');
        return;
      }

      // Comprimir imagen
      compressImage(file, (compressedFile) => {
        setFormData({
          ...formData,
          imagen: compressedFile,
        });

        // Crear preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result as string);
        };
        reader.readAsDataURL(compressedFile);
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar datos
    if (
      !formData.nombre ||
      !formData.descripcion ||
      !formData.precio ||
      !formData.categoria
    ) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);

    try {
      // Encontrar el ID de la categoría
      const category = categories.find(c => c.nombre === formData.categoria);
      if (!category) {
        setError('Categoría seleccionada no válida');
        setLoading(false);
        return;
      }

      const data = new FormData();
      data.append('nombre', formData.nombre);
      data.append('descripcion', formData.descripcion);
      data.append('precio', formData.precio);
      data.append('categoria_id', category.id.toString());
      if (formData.area) {
        data.append('area_id', formData.area);
      }
      data.append('vegetariano', String(formData.vegetariano));
      data.append('picante', String(formData.picante));
      data.append('favorito', String(formData.favorito));
      data.append('destacado', String(formData.destacado));

      if (formData.imagen) {
        data.append('imagen', formData.imagen);
      }

      console.log('📤 Enviando item a:', API.MENU_ADMIN);
      const response = await fetch(API.MENU_ADMIN, {
        method: 'POST',
        body: data,
      });

      console.log('📥 Respuesta del servidor:', response.status, response.statusText);

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Item creado exitosamente. ID:', responseData.id);
        alert('✅ Item agregado exitosamente');
        setFormData({
          nombre: '',
          descripcion: '',
          precio: '',
          categoria: '',
          area: '',
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
        const errorData = await response.json();
        console.error('❌ Error del servidor:', errorData);
        setError(errorData.message || 'Error al agregar item');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error de conexión al agregar item');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary to-primary/90 text-white p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Agregar Nuevo Item</h2>
            <button
              onClick={onClose}
              className="hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-300 rounded-lg p-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            {/* Nombre */}
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

            {/* Precio */}
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
                name="categoria"
                value={formData.categoria}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.nombre}>
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
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Sin área asignada</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.nombre}
                  </option>
                ))}
              </select>
            </div>            {/* Imagen */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Imagen del Item
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  <span className="text-sm">
                    {formData.imagen ? 'Cambiar imagen' : 'Seleccionar imagen'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Preview de Imagen */}
          {previewImage && (
            <div className="border-2 border-gray-300 rounded-lg p-4 flex gap-4">
              <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={previewImage}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  {formData.imagen?.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Tamaño: {(formData.imagen?.size || 0) / 1024 > 1024
                    ? `${((formData.imagen?.size || 0) / 1024 / 1024).toFixed(2)} MB`
                    : `${((formData.imagen?.size || 0) / 1024).toFixed(2)} KB`}
                </p>
              </div>
            </div>
          )}

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
              {loading ? 'Agregando...' : 'Agregar Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
