'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { IMAGES } from '@/lib/config';

export default function CajaLoginPage() {
  const router = useRouter();
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/pos/api/caja/validate-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pin: pinInput }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirigir a caja después de validación exitosa
        router.push('/caja');
      } else {
        setError(data.error || 'PIN incorrecto');
        setPinInput('');
      }
    } catch (err) {
      console.error('[Caja Login] Error:', err);
      setError('Error al validar PIN. Intenta de nuevo.');
      setPinInput('');
    } finally {
      setLoading(false);
    }
  };

  const handlePinInput = (value: string) => {
    // Solo permitir números
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue.length <= 4) {
      setPinInput(numericValue);
      setError('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePinSubmit(e as any);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Image
            src={IMAGES.LOGO}
            alt="Logo"
            width={80}
            height={80}
            priority
            className="w-20 h-20 mx-auto mb-4"
          />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Caja</h1>
          <p className="text-gray-600 text-lg">Ingresa el PIN para acceder</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handlePinSubmit} className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          {/* PIN Input */}
          <div className="mb-6">
            <label htmlFor="pin" className="block text-sm font-semibold text-gray-700 mb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                PIN de Caja
              </div>
            </label>
            <input
              id="pin"
              type="password"
              value={pinInput}
              onChange={(e) => handlePinInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="••••"
              autoFocus
              maxLength={4}
              className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || pinInput.length !== 4}
            className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
              pinInput.length === 4 && !loading
                ? 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Verificando...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                Acceder a Caja
              </>
            )}
          </button>
        </form>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>ℹ️ Nota:</strong> Este acceso es solo para el módulo de caja. Usa 4 dígitos numéricos.
          </p>
        </div>
      </div>
    </div>
  );
}
