'use client';

import { useState } from 'react';

export default function TestSheetsPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setResult('Probando conexión...');
    
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
        setResult(`✅ Conexión exitosa!\n\nDocumento: ${data.sheetInfo?.title}\nHojas disponibles: ${data.sheetInfo?.sheets?.join(', ') || 'N/A'}\nTotal de hojas: ${data.sheetInfo?.sheetCount || 0}`);
      } else {
        setResult(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      setResult(`❌ Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const testMenuData = async () => {
    setLoading(true);
    setResult('Obteniendo datos del menú...');
    
    try {
      const response = await fetch('/api/menu');
      const data = await response.json();
      
      if (data.success) {
        const summary = data.menu.map((category: any) => 
          `${category.nombre}: ${category.items.length} items`
        ).join('\n');
        
        setResult(`✅ Datos del menú obtenidos exitosamente!\n\nCategorías encontradas:\n${summary}\n\nTotal de categorías: ${data.menu.length}`);
      } else {
        setResult(`❌ Error obteniendo menú: ${data.message}`);
      }
    } catch (error) {
      setResult(`❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          Prueba de Conexión Google Sheets
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="space-y-4 mb-6">
            <button
              onClick={testConnection}
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              {loading ? 'Probando...' : 'Probar Conexión'}
            </button>
            
            <button
              onClick={testMenuData}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              {loading ? 'Cargando...' : 'Cargar Datos del Menú'}
            </button>
          </div>
          
          {result && (
            <div className="bg-gray-100 rounded-lg p-4">
              <h3 className="font-bold mb-2">Resultado:</h3>
              <pre className="whitespace-pre-wrap text-sm text-gray-800">
                {result}
              </pre>
            </div>
          )}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Variables de Entorno</h2>
          <div className="space-y-2 text-sm">
            <div>
              <strong>GOOGLE_SERVICE_ACCOUNT_EMAIL:</strong> 
              <span className={process.env.NEXT_PUBLIC_TEST_EMAIL ? 'text-green-600' : 'text-red-600'}>
                {process.env.NEXT_PUBLIC_TEST_EMAIL || ' No configurado'}
              </span>
            </div>
            <div>
              <strong>GOOGLE_SHEET_ID:</strong> 
              <span className={process.env.NEXT_PUBLIC_TEST_SHEET_ID ? 'text-green-600' : 'text-red-600'}>
                {process.env.NEXT_PUBLIC_TEST_SHEET_ID || ' No configurado (normal en cliente)'}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Nota: Las variables de entorno del servidor no son visibles en el cliente por seguridad.
          </p>
        </div>
      </div>
    </div>
  );
}