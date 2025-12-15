'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPinIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';

interface SavedLocation {
  id: string;
  nombre: string;
  direccion: string;
  lat: number;
  lng: number;
  esDefault: boolean;
  createdAt: string;
}

export default function SavedLocations() {
  const { user } = useAuth();
  const [ubicaciones, setUbicaciones] = useState<SavedLocation[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Cargar ubicaciones guardadas del localStorage
  useEffect(() => {
    if (user?.id) {
      const saved = localStorage.getItem(`ubicaciones_${user.id}`);
      if (saved) {
        setUbicaciones(JSON.parse(saved));
      }
    }
  }, [user?.id]);

  const guardarUbicacion = (nombre: string, direccion: string, lat: number, lng: number) => {
    if (!user?.id) {
      alert('Debes estar logueado para guardar ubicaciones');
      return;
    }

    const nuevaUbicacion: SavedLocation = {
      id: `loc_${Date.now()}`,
      nombre,
      direccion,
      lat,
      lng,
      esDefault: ubicaciones.length === 0,
      createdAt: new Date().toISOString(),
    };

    const updated = [...ubicaciones, nuevaUbicacion];
    setUbicaciones(updated);
    localStorage.setItem(`ubicaciones_${user.id}`, JSON.stringify(updated));
  };

  const eliminarUbicacion = (id: string) => {
    const updated = ubicaciones.filter(u => u.id !== id);
    setUbicaciones(updated);
    if (user?.id) {
      localStorage.setItem(`ubicaciones_${user.id}`, JSON.stringify(updated));
    }
  };

  const establecerDefault = (id: string) => {
    const updated = ubicaciones.map(u => ({
      ...u,
      esDefault: u.id === id
    }));
    setUbicaciones(updated);
    if (user?.id) {
      localStorage.setItem(`ubicaciones_${user.id}`, JSON.stringify(updated));
    }
  };

  const getDefaultLocation = () => {
    return ubicaciones.find(u => u.esDefault);
  };

  return (
    <div className="w-full">
      {/* Ubicación por defecto */}
      {getDefaultLocation() && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg"
        >
          <div className="flex items-start gap-3">
            <MapPinIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600">Ubicación por defecto</p>
              <p className="text-base font-semibold text-gray-900 truncate">
                {getDefaultLocation()?.nombre}
              </p>
              <p className="text-sm text-gray-600 truncate">
                {getDefaultLocation()?.direccion}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(true)}
              className="px-3 py-1 text-xs font-medium bg-white text-green-700 border border-green-300 rounded-full hover:bg-green-50 transition-colors whitespace-nowrap"
            >
              Cambiar
            </button>
          </div>
        </motion.div>
      )}

      {/* Modal de ubicaciones guardadas */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ y: 300, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 300, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 space-y-4 max-h-96 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Mis Ubicaciones</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>

              {ubicaciones.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MapPinIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No hay ubicaciones guardadas</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {ubicaciones.map((ubicacion) => (
                    <motion.div
                      key={ubicacion.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        ubicacion.esDefault
                          ? 'border-green-400 bg-green-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                      onClick={() => {
                        if (!ubicacion.esDefault) {
                          establecerDefault(ubicacion.id);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900 truncate">
                              {ubicacion.nombre}
                            </p>
                            {ubicacion.esDefault && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold whitespace-nowrap">
                                <CheckIcon className="w-3 h-3" />
                                Por defecto
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 truncate mt-0.5">
                            {ubicacion.direccion}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            eliminarUbicacion(ubicacion.id);
                          }}
                          className="ml-2 p-1 text-red-500 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setIsOpen(false)}
                className="w-full mt-4 px-4 py-3 bg-[#374058] hover:bg-[#2a2f42] text-white font-medium rounded-full transition-colors"
              >
                Cerrar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
