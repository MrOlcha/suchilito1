'use client'

import { useState } from 'react'
import { useConnectionTest, useMenuData } from '@/hooks/useMenuData'

export default function TestConnectionPage() {
  const { testConnection, testing, result } = useConnectionTest()
  const { menuData, loading, error, refetch, lastUpdated, stats } = useMenuData()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🧪 Google Sheets Connection Test
        </h1>

        {/* Test Connection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">1. Test Connection</h2>
          
          <button
            onClick={testConnection}
            disabled={testing}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50"
          >
            {testing ? '🔄 Testing...' : '🔗 Test Connection'}
          </button>

          {result && (
            <div className={`mt-4 p-4 rounded-lg ${
              result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                {result.success ? '✅ Success!' : '❌ Failed'}
              </div>
              <div className={`text-sm mt-1 ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                {result.message}
              </div>
            </div>
          )}
        </div>

        {/* Load Menu Data */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">2. Load Menu Data</h2>
          
          <div className="flex gap-4 mb-4">
            <button
              onClick={refetch}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? '🔄 Loading...' : '📊 Load Menu Data'}
            </button>
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Loading menu data...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <div className="font-medium text-red-800">❌ Error</div>
              <div className="text-sm text-red-600 mt-1">{error}</div>
            </div>
          )}

          {!loading && !error && menuData.length > 0 && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <div className="font-medium text-green-800">✅ Menu Data Loaded Successfully!</div>
              <div className="text-sm text-green-600 mt-2">
                <div>📊 Categories: {stats.categories}</div>
                <div>🍽️ Total Items: {stats.totalItems}</div>
                <div>🕒 Last Updated: {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'N/A'}</div>
              </div>
            </div>
          )}
        </div>

        {/* Menu Data Preview */}
        {menuData.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">3. Menu Data Preview</h2>
            
            <div className="space-y-4">
              {menuData.map((category) => (
                <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    📂 {category.nombre} ({category.items.length} items)
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {category.items.slice(0, 6).map((item, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded border">
                        <div className="font-medium text-sm text-gray-900">{item.nombre}</div>
                        <div className="text-xs text-gray-600 mt-1 line-clamp-2">{item.descripcion}</div>
                        <div className="text-sm font-medium text-green-600 mt-1">${item.precio}</div>
                        
                        <div className="flex gap-1 mt-2">
                          {item.nuevo && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Nuevo</span>
                          )}
                          {item.vegetariano && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">🌱</span>
                          )}
                          {item.picante && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">🌶️</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {category.items.length > 6 && (
                    <div className="text-sm text-gray-500 mt-2">
                      ... and {category.items.length - 6} more items
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">📋 Instructions</h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <div>1. First, test the connection to make sure credentials are working</div>
            <div>2. Then load the menu data to see if it's reading from your spreadsheet</div>
            <div>3. Check the preview to make sure your data is formatted correctly</div>
            <div>4. If everything looks good, the menu page will work automatically!</div>
          </div>
        </div>
      </div>
    </div>
  )
}