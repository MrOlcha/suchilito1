/**
 * CONFIGURACIÓN MAESTRA DEL SISTEMA POS
 * =====================================
 * Este archivo centraliza todas las rutas y configuraciones del sistema.
 * SIEMPRE usar estas constantes en lugar de strings hardcodeados.
 * 
 * IMPORTANTE: 
 * - Las rutas de API (fetch) necesitan el basePath completo: /pos/api/...
 * - Las rutas de PAGES (router.push) NO necesitan basePath, Next.js lo agrega automáticamente
 */

// Base path de la aplicación (configurado en next.config.js)
export const BASE_PATH = '/pos';

// ==========================================
// RUTAS DE API (usar en fetch) - NECESITAN /pos
// ==========================================
export const API = {
  // Cuentas
  CUENTAS: `${BASE_PATH}/api/cuentas`,
  CUENTA_BY_ID: (id: number | string) => `${BASE_PATH}/api/cuentas/${id}`,
  
  // Pedidos
  PEDIDOS: `${BASE_PATH}/api/pedidos`,
  PEDIDO_BY_ID: (id: number | string) => `${BASE_PATH}/api/pedidos/${id}`,
  PEDIDO_BY_MESA: (mesa: number | string) => `${BASE_PATH}/api/pedidos/mesa/${mesa}`,
  
  // Modificaciones de pedidos
  MODIFICACIONES: `${BASE_PATH}/api/modificaciones`,
  
  // Mesas
  MESAS: `${BASE_PATH}/api/mesas`,
  MESA_BY_ID: (id: number | string) => `${BASE_PATH}/api/mesas/${id}`,
  
  // Menú
  MENU: `${BASE_PATH}/api/menu`,
  MENU_ADMIN: `${BASE_PATH}/api/menu-admin`,
  MENU_SYNC: `${BASE_PATH}/api/menu/sync`,
  MENU_ITEMS: `${BASE_PATH}/api/menu/items`,
  MENU_CATEGORIES: `${BASE_PATH}/api/menu/categories`,
  MENU_CATEGORIES_MANAGE: `${BASE_PATH}/api/menu/categories/manage`,
  
  // Promociones
  PROMOCIONES: `${BASE_PATH}/api/promociones`,
  PROMOCION_BY_ID: (id: number | string) => `${BASE_PATH}/api/promociones/${id}`,
  
  // Usuarios y Meseros
  USUARIOS: `${BASE_PATH}/api/usuarios`,
  USUARIO_BY_ID: (id: number | string) => `${BASE_PATH}/api/usuarios/${id}`,
  MESEROS: `${BASE_PATH}/api/meseros`,
  MESERO_BY_ID: (id: number | string) => `${BASE_PATH}/api/meseros/${id}`,
  
  // Auth
  AUTH: `${BASE_PATH}/api/auth`,
  AUTH_ME: `${BASE_PATH}/api/auth/me`,
  
  // Caja
  CAJA: `${BASE_PATH}/api/caja`,
  
  // Productos
  PRODUCTOS: `${BASE_PATH}/api/productos`,
  PRODUCTO_BY_ID: (id: number | string) => `${BASE_PATH}/api/productos/${id}`,
  
  // Reportes
  REPORTES: `${BASE_PATH}/api/reportes`,
  
  // Stock
  STOCK: `${BASE_PATH}/api/stock`,
  
  // Areas activas (legacy)
  AREAS_ACTIVAS: `${BASE_PATH}/api/areas-activas`,
} as const;

// ==========================================
// RUTAS DE PÁGINAS (usar en router.push)
// NO incluir /pos - Next.js lo agrega automáticamente
// ==========================================
export const PAGES = {
  // Home
  HOME: '/',
  
  // Login
  LOGIN: '/login',
  
  // Mesero
  MESERO: '/mesero',
  MESERO_LOGIN: '/atiendemesero/login',
  ATIENDEMESERO: '/atiendemesero',
  ATIENDEMESERO_MESAS: '/atiendemesero/mesas',
  ATIENDEMESERO_FINALIZAR: '/atiendemesero/finalizar',
  ATIENDEMESERO_MESA: (id: number | string) => `/atiendemesero/mesa/${id}`,
  
  // Areas activas (cuentas)
  AREAS_ACTIVAS: '/areas-activas',
  
  // Caja
  CAJA: '/dashboard/caja',
  
  // Comanda (cocina)
  COMANDA: '/comanda',
  
  // Admin
  MESAS: '/mesas',
  MENU: '/menu',
  MESEROS: '/meseros',
  PEDIDOS: '/pedidos',
  PEDIDOS_NUEVO: '/pedidos/nuevo',
  PRECIOS: '/precios',
  REPORTES: '/reportes',
  USUARIOS: '/usuarios',
} as const;

// ==========================================
// RUTAS CON PARÁMETROS DE QUERY
// NO incluir /pos - Next.js lo agrega automáticamente
// ==========================================
export const ROUTES = {
  // Atiendemesero con cuenta existente
  atiendemeseroConCuenta: (cuentaId: number | string) => 
    `/atiendemesero?cuenta=${cuentaId}`,
  
  // Atiendemesero para llevar con cuenta
  atiendemeseroParaLlevar: (cuentaId: number | string) => 
    `/atiendemesero/para-llevar?cuenta=${cuentaId}`,
  
  // Atiendemesero con mesa
  atiendemeseroConMesa: (mesaNumero: number | string) => 
    `/atiendemesero?mesa=${mesaNumero}`,
} as const;

// ==========================================
// ESTADOS DEL SISTEMA
// ==========================================
export const ESTADOS = {
  // Estados de cuenta
  CUENTA: {
    ABIERTA: 'abierta',
    CERRADA: 'cerrada',
    COBRADA: 'cobrada',
  },
  
  // Estados de pedido
  PEDIDO: {
    PENDIENTE: 'pendiente',
    PREPARANDO: 'preparando',
    LISTO: 'listo',
    ENTREGADO: 'entregado',
    COMPLETADO: 'completado',
    PAGADO: 'pagado',
  },
  
  // Estados de mesa
  MESA: {
    DISPONIBLE: 'disponible',
    OCUPADA: 'ocupada',
    RESERVADA: 'reservada',
  },
} as const;

// ==========================================
// CONFIGURACIÓN DE ZONA HORARIA
// ==========================================
export const TIMEZONE = {
  MEXICO: 'America/Mexico_City',
  OFFSET_HOURS: -6, // UTC-6 para Querétaro
} as const;

// ==========================================
// RUTAS DE IMÁGENES
// ==========================================
export const IMAGES = {
  LOGO: `${BASE_PATH}/images/iconologo.svg`,
  LOGO_NEGRO: `${BASE_PATH}/images/logonegro.svg`,
  DEFAULT_PRODUCT: `${BASE_PATH}/images/default-product.png`,
  PLACEHOLDER_MENU: `${BASE_PATH}/images/menu/placeholder.svg`,
  MENU_IMAGES_DIR: `${BASE_PATH}/menu-images`,
} as const;

// Helper para construir rutas de imágenes de menú
export const getMenuImageUrl = (imagenLocal: string | null, imagenUrl?: string | null): string => {
  if (imagenLocal) {
    // Si ya contiene basePath, devolverlo tal cual
    if (imagenLocal.startsWith(`${BASE_PATH}/`)) {
      return imagenLocal;
    }
    // Si es ruta de API, devolverlo tal cual
    if (imagenLocal.startsWith('/api/menu-images/')) {
      return `${BASE_PATH}${imagenLocal}`;
    }
    // Si es ruta relativa de menu-images, agregar basePath con ruta de API
    if (imagenLocal.startsWith('/menu-images')) {
      const filename = imagenLocal.split('/').pop();
      return `${BASE_PATH}/api/menu-images/${filename}`;
    }
    return imagenLocal;
  }
  if (imagenUrl) {
    // Si ya contiene basePath, devolverlo tal cual
    if (imagenUrl.startsWith(`${BASE_PATH}/`)) {
      return imagenUrl;
    }
    // Si es ruta relativa de menu-images, agregar basePath con ruta de API
    if (imagenUrl.startsWith('/menu-images')) {
      const filename = imagenUrl.split('/').pop();
      return `${BASE_PATH}/api/menu-images/${filename}`;
    }
    return imagenUrl;
  }
  return IMAGES.PLACEHOLDER_MENU;
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Construye URL de API con query params
 */
export function buildApiUrl(baseUrl: string, params?: Record<string, string | number | boolean | undefined>): string {
  if (!params) return baseUrl;
  
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Fetch wrapper que usa las rutas correctas
 */
export async function apiFetch<T>(
  url: string, 
  options?: RequestInit
): Promise<{ data: T | null; error: string | null; status: number }> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return { 
        data: null, 
        error: data.message || 'Error en la solicitud', 
        status: response.status 
      };
    }
    
    return { data, error: null, status: response.status };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Error de conexión', 
      status: 0 
    };
  }
}

export default {
  BASE_PATH,
  API,
  PAGES,
  ROUTES,
  ESTADOS,
  TIMEZONE,
  IMAGES,
  getMenuImageUrl,
  buildApiUrl,
  apiFetch,
};
