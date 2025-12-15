/**
 * Servicio centralizado para la gestión del menú
 */

import { API } from '@/lib/config';

export interface MenuItem {
  id?: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url: string;
  categoria?: string;
}

export interface MenuCategory {
  id?: string;
  name?: string;
  nombre?: string;
  items: MenuItem[];
}

export class MenuService {
  /**
   * Orden deseado de las categorías del menú
   */
  private static readonly ORDEN_CATEGORIAS = [
    'Entradas',
    'Arroces',
    'Rollos_Naturales',
    'Rollos Naturales',
    'Rollos_Empanizados',
    'Rollos Empanizados',
    'Rollos_Especiales',
    'Rollos Especiales',
    'Rollos_Horneados',
    'Rollos Horneados',
    'Bebidas',
    'Postres',
    'Extras'
  ];

  /**
   * Normaliza el nombre de categoría para comparación
   */
  private static normalizarNombre(nombre: string): string {
    return nombre.replace(/\s+/g, '_').toLowerCase();
  }

  /**
   * Ordena las categorías según el orden predefinido
   */
  private static ordenarCategorias(categorias: MenuCategory[]): MenuCategory[] {
    return categorias.sort((a, b) => {
      const nombreA = a.nombre || a.name || '';
      const nombreB = b.nombre || b.name || '';
      
      // Encontrar índice basado en nombre exacto o normalizado
      let indexA = this.ORDEN_CATEGORIAS.findIndex(cat => 
        cat === nombreA || this.normalizarNombre(cat) === this.normalizarNombre(nombreA)
      );
      let indexB = this.ORDEN_CATEGORIAS.findIndex(cat => 
        cat === nombreB || this.normalizarNombre(cat) === this.normalizarNombre(nombreB)
      );
      
      // Si ambas están en el orden, ordenar por índice
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      
      // Si solo A está en el orden, A va primero
      if (indexA !== -1) return -1;
      
      // Si solo B está en el orden, B va primero
      if (indexB !== -1) return 1;
      
      // Si ninguna está en el orden, mantener orden alfabético
      return nombreA.localeCompare(nombreB);
    });
  }

  /**
   * Obtiene todo el menú agrupado por categorías
   */
  static async obtenerMenu(): Promise<MenuCategory[]> {
    try {
      const response = await fetch(API.MENU);

      if (!response.ok) {
        throw new Error('Error al cargar el menú');
      }

      const data = await response.json();
      // El API devuelve directamente un array de categorías
      const categorias = Array.isArray(data) ? data : (data.categorias || []);
      
      // Aplicar orden personalizado
      return this.ordenarCategorias(categorias);
    } catch (error) {
      console.error('Error en obtenerMenu:', error);
      return [];
    }
  }

  /**
   * Obtiene items de una categoría específica
   */
  static async obtenerCategoria(categoriaId: string): Promise<MenuItem[]> {
    try {
      const menu = await this.obtenerMenu();
      const categoria = menu.find(cat => 
        (cat.id === categoriaId) || 
        (cat.name === categoriaId) || 
        (cat.nombre === categoriaId)
      );

      return categoria?.items || [];
    } catch (error) {
      console.error('Error en obtenerCategoria:', error);
      return [];
    }
  }

  /**
   * Busca un producto por nombre
   */
  static async buscarProducto(nombre: string): Promise<MenuItem | null> {
    try {
      const menu = await this.obtenerMenu();
      
      for (const categoria of menu) {
        const item = categoria.items.find(item => 
          item.nombre.toLowerCase() === nombre.toLowerCase()
        );
        if (item) return item;
      }

      return null;
    } catch (error) {
      console.error('Error en buscarProducto:', error);
      return null;
    }
  }
}
