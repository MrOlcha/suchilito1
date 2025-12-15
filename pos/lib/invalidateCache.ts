/**
 * Función para invalidar el cache del menú en mazuhi-web
 * Se llama después de cualquier cambio en el menú del POS
 */
export async function invalidateMazuhiWebCache(): Promise<boolean> {
  try {
    const cacheToken = process.env.CACHE_INVALIDATION_TOKEN || 'secret-cache-key-2024';
    
    // Llamar al endpoint de invalidación en mazuhi-web
    const response = await fetch('http://localhost:3001/api/menu/invalidate-cache', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-cache-token': cacheToken,
      },
    });
    
    if (response.ok) {
      console.log('✅ Cache de mazuhi-web invalidado exitosamente');
      return true;
    } else {
      const errorText = await response.text();
      console.error('⚠️ Error invalidando cache de mazuhi-web:', response.status, errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ Error al llamar webhook de invalidación:', error);
    // No lanzar error, solo loguear para no romper la operación
    return false;
  }
}
