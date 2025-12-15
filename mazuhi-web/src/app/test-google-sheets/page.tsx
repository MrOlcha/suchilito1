'use client';

import { useState, useEffect } from 'react';
import { MenuItem, MenuCategory, Sucursal, Promocion } from '@/lib/googleSheets';

export default function TestGoogleSheetsPage() {
  const [connectionStatus, setConnectionStatus] = useState<string>('No probado');
  const [menuData, setMenuData] = useState<MenuCategory[]>([]);
  const [sucursalesData, setSucursalesData] = useState<Sucursal[]>([]);
  const [promocionesData, setPromocionesData] = useState<Promocion[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSucursales, setLoadingSucursales] = useState(false);
  const [loadingPromociones, setLoadingPromociones] = useState(false);
  const [error, setError] = useState<string>('');
  const [sucursalesError, setSucursalesError] = useState<string>('');
  const [promocionesError, setPromocionesError] = useState<string>('');

  const testConnection = async () => {
    setLoading(true);
    setError('');
    setConnectionStatus('Probando...');
    
    try {
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'test' }),
      });

      const data = await response.json();
      
      if (data.success) {
        setConnectionStatus('✅ Conectado exitosamente');
      } else {
        setConnectionStatus(`❌ Error: ${data.message}`);
        setError(data.message);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      setConnectionStatus(`❌ Error de red: ${errorMsg}`);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const loadMenuData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/menu');
      const data = await response.json();
      
      if (data.success) {
        setMenuData(data.menu);
      } else {
        setError(data.message);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const loadSucursalesData = async () => {
    setLoadingSucursales(true);
    setSucursalesError('');
    
    try {
      const response = await fetch('/api/sucursales');
      const data = await response.json();
      
      if (data.success) {
        setSucursalesData(data.data);
      } else {
        setSucursalesError(data.message);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      setSucursalesError(errorMsg);
    } finally {
      setLoadingSucursales(false);
    }
  };

  const loadPromocionesData = async () => {
    setLoadingPromociones(true);
    setPromocionesError('');
    
    try {
      const response = await fetch('/api/promociones');
      const data = await response.json();
      
      if (data.success) {
        setPromocionesData(data.data);
      } else {
        setPromocionesError(data.message);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      setPromocionesError(errorMsg);
    } finally {
      setLoadingPromociones(false);
    }
  };

  // Probar conexión automáticamente al cargar
  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🍣 Integración Google Sheets
          </h1>
          <p className="text-lg text-gray-600">
            Menú dinámico conectado a Google Spreadsheets
          </p>
        </div>

        {/* Panel de Control */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Panel de Control</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={testConnection}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              {loading ? 'Probando...' : 'Probar Conexión'}
            </button>
            
            <button
              onClick={loadMenuData}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              {loading ? 'Cargando...' : 'Cargar Menú'}
            </button>

            <button
              onClick={loadSucursalesData}
              disabled={loadingSucursales}
              className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              {loadingSucursales ? 'Cargando...' : 'Cargar Sucursales'}
            </button>

            <button
              onClick={loadPromocionesData}
              disabled={loadingPromociones}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              {loadingPromociones ? 'Cargando...' : 'Cargar Promociones'}
            </button>
          </div>

          <div className="bg-gray-100 rounded-lg p-4">
            <h3 className="font-bold mb-2">Estado de Conexión:</h3>
            <p className="text-lg">{connectionStatus}</p>
            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                <strong>Error:</strong> {error}
              </div>
            )}
          </div>
        </div>

        {/* Datos del Menú */}
        {menuData.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-center text-gray-900">
              Menú Cargado desde Google Sheets
            </h2>
            
            {menuData.map((category) => (
              <div key={category.id} className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-2xl font-bold mb-4 text-[#E09E7D]">
                  {category.nombre} ({category.items.length} items)
                </h3>
                
                {category.items.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.items.map((item, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-gray-900">{item.nombre}</h4>
                          <span className="text-lg font-bold text-[#E09E7D]">
                            ${item.precio.toLocaleString()}
                          </span>
                        </div>
                        
                        {item.descripcion && (
                          <p className="text-gray-600 text-sm mb-2">{item.descripcion}</p>
                        )}
                        
                        <div className="flex flex-wrap gap-1">
                          {item.nuevo && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                              Nuevo
                            </span>
                          )}
                          {item.vegetariano && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                              🌱 Vegetariano
                            </span>
                          )}
                          {item.picante && (
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                              🌶️ Picante
                            </span>
                          )}
                          {item.favorito && (
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                              ❤️ Favorito
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No hay items en esta categoría</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Datos de Sucursales */}
        {sucursalesData.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-center text-gray-900">
              🏪 Sucursales Cargadas desde Google Sheets
            </h2>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-2xl font-bold mb-4 text-purple-600">
                Sucursales ({sucursalesData.length} encontradas)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sucursalesData.map((sucursal, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-900">{sucursal.nombre}</h4>
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <p><strong>📍 Dirección:</strong> {sucursal.direccion}</p>
                      <p><strong>🏙️ Ciudad:</strong> {sucursal.ciudad}, {sucursal.estado}</p>
                      <p><strong>📞 Teléfono:</strong> {sucursal.telefono}</p>
                      <p><strong>🕐 Horario:</strong> {sucursal.horario}</p>
                      <p><strong>📮 CP:</strong> {sucursal.codigo_postal}</p>
                      <p><strong>🖼️ Imagen:</strong> {sucursal.imagen_url ? '✅ Si' : '❌ No'}</p>
                      <p><strong>✅ Activa:</strong> {sucursal.activa ? 'Si' : 'No'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error de Sucursales */}
        {sucursalesError && (
          <div className="bg-red-50 rounded-lg p-6 mt-8">
            <h2 className="text-xl font-bold mb-4 text-red-900">❌ Error al cargar Sucursales</h2>
            <div className="text-red-800">
              <strong>Error:</strong> {sucursalesError}
            </div>
          </div>
        )}

        {/* Datos de Promociones */}
        {promocionesData.length > 0 && (
          <div className="space-y-6 mt-8">
            <h2 className="text-3xl font-bold text-center text-gray-900">
              🎉 Promociones Cargadas desde Google Sheets
            </h2>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-2xl font-bold mb-4 text-orange-600">
                Promociones ({promocionesData.length} encontradas)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {promocionesData.map((promocion, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-900">{promocion.nombre}</h4>
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <p><strong>📝 Descripción:</strong> {promocion.descripcion}</p>
                      <div className="flex gap-2 mt-2">
                        {promocion.sucursal && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            🏪 Sucursal
                          </span>
                        )}
                        {promocion.domicilio && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                            🚚 Domicilio
                          </span>
                        )}
                      </div>
                      <p><strong>🖼️ Imagen:</strong> {promocion.imagen_url ? '✅ Si' : '❌ No'}</p>
                      <p><strong>✅ Activa:</strong> {promocion.activa ? 'Si' : 'No'}</p>
                      {promocion.imagen_url && (
                        <p className="truncate"><strong>🔗 URL:</strong> <span className="text-xs">{promocion.imagen_url}</span></p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error de Promociones */}
        {promocionesError && (
          <div className="bg-red-50 rounded-lg p-6 mt-8">
            <h2 className="text-xl font-bold mb-4 text-red-900">❌ Error al cargar Promociones</h2>
            <div className="text-red-800">
              <strong>Error:</strong> {promocionesError}
            </div>
          </div>
        )}

        {/* Información Técnica */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
          <h2 className="text-xl font-bold mb-4">📋 Información Técnica</h2>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Spreadsheet ID:</strong> 
              <code className="bg-gray-100 px-2 py-1 rounded ml-2">
                1zQ8GWmW72NrhspyhF93ZKBnD1TSvnm69O2Gv2EECCUY
              </code>
            </div>
            <div>
              <strong>Hojas esperadas:</strong> Entradas, Arroces, Rollos_Naturales, Rollos_Empanizados, Rollos_Especiales, Rollos_Horneados, Bebidas, Postres, Extras, Sucursales, Promociones
            </div>
            <div>
              <strong>Columnas de Menú:</strong> nombre, descripcion, precio, imagen_url, nuevo, vegetariano, picante, favorito
            </div>
            <div>
              <strong>Columnas de Sucursales:</strong> nombre, direccion, telefono, horario, ciudad, estado, codigo_postal, imagen_url, activa
            </div>
            <div>
              <strong>Columnas de Promociones:</strong> nombre, descripcion, imagen_url, activa, sucursal, domicilio
            </div>
          </div>
        </div>

        {/* Instrucciones */}
        <div className="bg-blue-50 rounded-lg p-6 mt-8">
          <h2 className="text-xl font-bold mb-4 text-blue-900">📝 Instrucciones</h2>
          <div className="space-y-2 text-blue-800">
            <p><strong>📋 Para el Menú:</strong></p>
            <p>1. Cada hoja de menú debe tener: nombre, descripcion, precio, imagen_url, nuevo, vegetariano, picante, favorito</p>
            <p>2. Los valores booleanos pueden ser 'true', 'si', o estar vacíos</p>
            <p>3. El precio debe ser un número válido</p>
            
            <p><strong>🏪 Para las Sucursales:</strong></p>
            <p>1. La hoja "Sucursales" debe tener: nombre, direccion, telefono, horario, ciudad, estado, codigo_postal, imagen_url, activa</p>
            <p>2. El campo 'activa' determina si la sucursal se muestra (true/si para mostrar)</p>
            <p>3. imagen_url es opcional para mostrar foto de la sucursal</p>
            
            <p><strong>🎉 Para las Promociones:</strong></p>
            <p>1. La hoja "Promociones" debe tener: nombre, descripcion, imagen_url, activa, sucursal, domicilio</p>
            <p>2. 'activa': si la promoción está disponible (true/si para mostrar)</p>
            <p>3. 'sucursal': si la promoción es válida en sucursal (true/si)</p>
            <p>4. 'domicilio': si la promoción es válida a domicilio (true/si)</p>
            <p>5. imagen_url se usa como fondo degradado de la promoción</p>
            
            <p><strong>⚡ General:</strong></p>
            <p>6. Los cambios en el spreadsheet se reflejan inmediatamente al recargar</p>
          </div>
        </div>
      </div>
    </div>
  );
}