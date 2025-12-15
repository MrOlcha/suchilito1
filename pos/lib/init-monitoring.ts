/**
 * Inicializador de monitoreo del servidor
 * Se ejecuta cuando arranca Next.js
 */

let monitoringInitialized = false;

export async function initializeMonitoring() {
  if (monitoringInitialized) {
    return;
  }

  try {
    // Dinámicamente importar solo en el servidor
    if (typeof window === 'undefined') {
      const { iniciarMonitoreoServidor } = await import('../lib/server-health');
      
      // Iniciar monitoreo cada 60 segundos
      iniciarMonitoreoServidor(60000);
      
      console.log('✓ Sistema de monitoreo inicializado');
      monitoringInitialized = true;
    }
  } catch (error) {
    console.error('Error al inicializar monitoreo:', error);
  }
}
