import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { Sucursal } from '@/types/sucursal';
import { Promocion } from '@/types/promocion';

export interface MenuItem {
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url?: string;
  nuevo?: boolean;
  vegetariano?: boolean;
  picante?: boolean;
  favorito?: boolean;
  destacado?: boolean;
  promomiercoles?: boolean;
}

export interface MenuCategory {
  id: string;
  nombre: string;
  items: MenuItem[];
}

// Cache completamente eliminado para actualizaciones en tiempo real

// Función de espera para reintentos
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Función de reintentos con backoff exponencial
async function retryWithBackoff<T>(
  fn: () => Promise<T>, 
  maxRetries: number = 3, 
  baseDelay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const isLastRetry = i === maxRetries - 1;
      
      // Si es error 429 (rate limit), esperamos más tiempo
      if (error.status === 429 || error.code === 429) {
        if (isLastRetry) {
          throw new Error(`API rate limit exceeded. Please try again in a few minutes.`);
        }
        const delayTime = baseDelay * Math.pow(2, i) + Math.random() * 1000; // Backoff exponencial con jitter
        console.log(`⏱️ Rate limit hit, waiting ${delayTime}ms before retry ${i + 1}/${maxRetries}`);
        await delay(delayTime);
        continue;
      }
      
      // Para otros errores, si es el último intento, lanzar el error
      if (isLastRetry) {
        throw error;
      }
      
      // Esperar antes del siguiente intento
      const delayTime = baseDelay * Math.pow(2, i);
      console.log(`🔄 Retrying in ${delayTime}ms (attempt ${i + 1}/${maxRetries})`);
      await delay(delayTime);
    }
  }
  
  throw new Error('Max retries exceeded');
}

class GoogleSheetsService {
  private async initializeAuth() {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const sheetId = process.env.GOOGLE_SHEET_ID;

    console.log('🔍 Checking environment variables:');
    console.log('- Email:', email ? '✓ Set' : '❌ Missing');
    console.log('- Private Key:', privateKey ? '✓ Set' : '❌ Missing');
    console.log('- Sheet ID:', sheetId ? '✓ Set' : '❌ Missing');

    if (!email || !privateKey || !sheetId) {
      throw new Error('Missing required Google Sheets environment variables');
    }

    // Limpiar y formatear la clave privada
    let cleanedKey = privateKey;
    
    // Si la clave viene con comillas, quitarlas
    if (cleanedKey.startsWith('"') && cleanedKey.endsWith('"')) {
      cleanedKey = cleanedKey.slice(1, -1);
    }
    
    // Reemplazar \n literales con saltos de línea reales
    cleanedKey = cleanedKey.replace(/\\n/g, '\n');
    
    console.log('🔑 Private key format check:', {
      startsWithBegin: cleanedKey.includes('-----BEGIN PRIVATE KEY-----'),
      endsWithEnd: cleanedKey.includes('-----END PRIVATE KEY-----'),
      hasNewlines: cleanedKey.includes('\n')
    });

    const serviceAccountAuth = new JWT({
      email: email,
      key: cleanedKey,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets.readonly',
        'https://www.googleapis.com/auth/drive.readonly'
      ],
    });

    const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
    
    return doc;
  }

  async testConnection(): Promise<{ success: boolean; message: string; sheetInfo?: any }> {
    try {
      const doc = await this.initializeAuth();
      
      console.log('🔗 Attempting to connect to Google Sheets...');
      await doc.loadInfo();
      
      const sheetInfo = {
        title: doc.title,
        sheetCount: doc.sheetCount,
        sheets: doc.sheetsByIndex.map((sheet: any) => sheet.title)
      };

      console.log('✅ Connection successful! Sheet info:', sheetInfo);

      return {
        success: true,
        message: 'Connection successful!',
        sheetInfo
      };
    } catch (error) {
      console.error('❌ Google Sheets connection error:', error);
      
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      return {
        success: false,
        message: `Connection failed: ${errorMessage}`
      };
    }
  }

  async getMenuData(): Promise<MenuCategory[]> {
    try {
      // Sin caché - siempre obtener datos frescos de Google Sheets
      console.log('🔄 Fetching fresh data from Google Sheets...');
      
      const doc = await this.initializeAuth();
      
      console.log('📊 Loading spreadsheet info...');
      await doc.loadInfo();
      console.log('✅ Document loaded:', doc.title);
      
      const categories: MenuCategory[] = [];
      
      // Lista de categorías en orden
      const categoryNames = [
        { id: 'entradas', name: 'Entradas', sheet: 'Entradas' },
        { id: 'arroces', name: 'Arroces', sheet: 'Arroces' },
        { id: 'rollos-naturales', name: 'Rollos Naturales', sheet: 'Rollos_Naturales' },
        { id: 'rollos-empanizados', name: 'Rollos Empanizados', sheet: 'Rollos_Empanizados' },
        { id: 'rollos-especiales', name: 'Rollos Especiales', sheet: 'Rollos_Especiales' },
        { id: 'rollos-horneados', name: 'Rollos Horneados', sheet: 'Rollos_Horneados' },
        { id: 'bebidas', name: 'Bebidas', sheet: 'Bebidas' },
        { id: 'postres', name: 'Postres', sheet: 'Postres' },
        { id: 'extras', name: 'Extras', sheet: 'Extras' }
      ];

      for (const category of categoryNames) {
        const sheet = doc.sheetsByTitle[category.sheet];
        if (sheet) {
          try {
            console.log(`📋 Processing sheet: ${category.sheet}`);
            await sheet.loadHeaderRow(); // <-- Forzar carga de encabezados
            const rows = await sheet.getRows();

            const items: MenuItem[] = rows.map((row: any) => {
              const favoritoRaw = row.get('favorito');
              const esFavorito = favoritoRaw?.toLowerCase() === 'true' || favoritoRaw?.toLowerCase() === 'si' || favoritoRaw === true;

              const destacadoRaw = row.get('destacado');
              const esDestacado = destacadoRaw?.toLowerCase() === 'true' || destacadoRaw?.toLowerCase() === 'si' || destacadoRaw === true;

              const promoRaw = row.get('promomiercoles');
              const esPromoMiercoles = promoRaw?.toLowerCase() === 'true' || promoRaw?.toLowerCase() === 'si' || promoRaw === true;

              const item = {
                nombre: row.get('nombre') || '',
                descripcion: row.get('descripcion') || '',
                precio: parseFloat(row.get('precio')) || 0,
                imagen_url: row.get('imagen_url') || undefined,
                nuevo: row.get('nuevo')?.toLowerCase() === 'true' || row.get('nuevo')?.toLowerCase() === 'si',
                vegetariano: row.get('vegetariano')?.toLowerCase() === 'true' || row.get('vegetariano')?.toLowerCase() === 'si',
                picante: row.get('picante')?.toLowerCase() === 'true' || row.get('picante')?.toLowerCase() === 'si',
                favorito: esFavorito,
                destacado: esDestacado,
                promomiercoles: esPromoMiercoles
              };

              // Debug: log valores de favorito, destacado y promomiercoles
              if (item.nombre) {
                console.log(`📌 ${item.nombre}: favorito='${favoritoRaw}' -> ${esFavorito}, destacado='${destacadoRaw}' -> ${esDestacado}, promomiercoles='${promoRaw}' -> ${esPromoMiercoles}`);
              }

              return item;
            }).filter((item: MenuItem) => item.nombre.trim() !== '');

            console.log(`✅ Found ${items.length} items in ${category.sheet}`);

            categories.push({
              id: category.id,
              nombre: category.name,
              items: items
            });
          } catch (sheetError) {
            console.warn(`⚠️ Error reading sheet ${category.sheet}:`, sheetError);
            // Continuar con la siguiente categoría
            categories.push({
              id: category.id,
              nombre: category.name,
              items: []
            });
          }
        } else {
          console.warn(`⚠️ Sheet ${category.sheet} not found`);
          categories.push({
            id: category.id,
            nombre: category.name,
            items: []
          });
        }
      }

      console.log(`🎉 Menu data loaded successfully! Total categories: ${categories.length}`);
      
      // Sin caché - siempre datos frescos
      console.log('� Returning fresh data without caching');
      
      return categories;
    } catch (error) {
      console.error('❌ Error fetching menu data:', error);
      throw new Error(`Failed to fetch menu data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getCategoryData(categorySheet: string): Promise<MenuItem[]> {
    try {
      const doc = await this.initializeAuth();
      
      await doc.loadInfo();
      const sheet = doc.sheetsByTitle[categorySheet];
      
      if (!sheet) {
        throw new Error(`Sheet ${categorySheet} not found`);
      }

      const rows = await sheet.getRows();
      
      return rows.map((row: any) => ({
        nombre: row.get('nombre') || '',
        descripcion: row.get('descripcion') || '',
        precio: parseFloat(row.get('precio')) || 0,
        imagen_url: row.get('imagen_url') || undefined,
        nuevo: row.get('nuevo')?.toLowerCase() === 'true' || row.get('nuevo')?.toLowerCase() === 'si',
        vegetariano: row.get('vegetariano')?.toLowerCase() === 'true' || row.get('vegetariano')?.toLowerCase() === 'si',
        picante: row.get('picante')?.toLowerCase() === 'true' || row.get('picante')?.toLowerCase() === 'si',
        favorito: row.get('favorito')?.toLowerCase() === 'true' || row.get('favorito')?.toLowerCase() === 'si' || row.get('favorito') === true
      })).filter((item: MenuItem) => item.nombre && item.nombre.trim() !== '');
    } catch (error) {
      console.error('❌ Error fetching category data:', error);
      throw new Error('Failed to fetch category data');
    }
  }

  async getSucursales(): Promise<Sucursal[]> {
    try {
      const doc = await this.initializeAuth();

      await doc.loadInfo();
      console.log('📊 Available sheets:', doc.sheetsByTitle);
      
      const sheet = doc.sheetsByTitle['Sucursales'];
      if (!sheet) {
        console.warn('⚠️ Sheet "Sucursales" not found. Available sheets:', Object.keys(doc.sheetsByTitle));
        return [];
      }

      // Cargar los encabezados de la hoja
      await sheet.loadHeaderRow();
      console.log('📊 Sucursales sheet columns:', sheet.headerValues);

      const rows = await sheet.getRows();
      console.log(`📋 Processing ${rows.length} rows from Sucursales sheet`);
      
      const sucursales: Sucursal[] = rows.map((row: any, index: number) => {
        const sucursal = {
          id: `sucursal-${index + 1}`,
          nombre: row.get('nombre') || '',
          direccion: row.get('direccion') || '',
          telefono: row.get('telefono') || '',
          horario: row.get('horario') || '',
          ciudad: row.get('ciudad') || '',
          estado: row.get('estado') || '',
          codigo_postal: row.get('codigo_postal') || '',
          imagen_url: row.get('imagen_url') || undefined,
          activa: row.get('activa')?.toLowerCase() === 'true' || row.get('activa')?.toLowerCase() === 'si'
        };
        
        console.log(`🏪 Sucursal ${index + 1}: ${sucursal.nombre}, imagen: ${sucursal.imagen_url ? '✅ Si' : '❌ No'}, activa: ${sucursal.activa}`);
        
        return sucursal;
      }).filter((sucursal: Sucursal) => sucursal.nombre.trim() !== '' && sucursal.activa);

      console.log(`✅ Total sucursales activas cargadas: ${sucursales.length}`);
      return sucursales;
    } catch (error) {
      console.error('❌ Error fetching sucursales data:', error);
      throw new Error(`Failed to fetch sucursales data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getSucursalesByCity(ciudad: string): Promise<Sucursal[]> {
    const allSucursales = await this.getSucursales();
    return allSucursales.filter(sucursal => 
      sucursal.ciudad.toLowerCase().includes(ciudad.toLowerCase())
    );
  }

  async getPromociones(): Promise<Promocion[]> {
    try {
      console.log('🎁 Promociones API called');
      console.log('🔍 Checking environment variables:');
      console.log(`- Email: ${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? '✓ Set' : '❌ Missing'}`);
      console.log(`- Private Key: ${process.env.GOOGLE_PRIVATE_KEY ? '✓ Set' : '❌ Missing'}`);
      console.log(`- Sheet ID: ${process.env.GOOGLE_SHEET_ID ? '✓ Set' : '❌ Missing'}`);

      const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '';
      console.log('🔑 Private key format check:', {
        startsWithBegin: privateKey.startsWith('-----BEGIN'),
        endsWithEnd: privateKey.endsWith('-----'),
        hasNewlines: privateKey.includes('\n')
      });

      const doc = await this.initializeAuth();

      await doc.loadInfo();
      console.log('📊 Available sheets:', Object.keys(doc.sheetsByTitle));
      
      const sheet = doc.sheetsByTitle['Promociones'];
      if (!sheet) {
        console.warn('⚠️ Sheet "Promociones" not found. Available sheets:', Object.keys(doc.sheetsByTitle));
        return [];
      }

      // Cargar los encabezados de la hoja
      await sheet.loadHeaderRow();
      console.log('📊 Promociones sheet columns:', sheet.headerValues);

      const rows = await sheet.getRows();
      console.log(`📋 Processing ${rows.length} rows from Promociones sheet`);
      
      const promociones: Promocion[] = rows.map((row: any, index: number) => {
        const promocion = {
          id: `promocion-${index + 1}`,
          nombre: row.get('nombre') || '',
          descripcion: row.get('descripcion') || '',
          imagen_url: row.get('imagen_url') || undefined,
          activa: row.get('activa')?.toLowerCase() === 'true' || row.get('activa')?.toLowerCase() === 'si',
          sucursal: row.get('sucursal')?.toLowerCase() === 'true' || row.get('sucursal')?.toLowerCase() === 'si',
          domicilio: row.get('domicilio')?.toLowerCase() === 'true' || row.get('domicilio')?.toLowerCase() === 'si'
        };
        
        console.log(`🎁 Promocion ${index + 1}: ${promocion.nombre}, imagen: ${promocion.imagen_url ? '✅ Si' : '❌ No'}, activa: ${promocion.activa}, sucursal: ${promocion.sucursal}, domicilio: ${promocion.domicilio}`);
        
        return promocion;
      }).filter((promocion: Promocion) => promocion.nombre.trim() !== '' && promocion.activa);

      console.log(`✅ Total promociones activas cargadas: ${promociones.length}`);
      return promociones;
    } catch (error) {
      console.error('❌ Error fetching promociones data:', error);
      throw new Error(`Failed to fetch promociones data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getPromocionesByType(tipo: 'sucursal' | 'domicilio'): Promise<Promocion[]> {
    const allPromociones = await this.getPromociones();
    return allPromociones.filter(promocion => promocion[tipo] === true);
  }

  async getPlatillosDestacados(): Promise<MenuItem[]> {
    console.log('⭐ Fetching platillos destacados');
    
    try {
      const allCategories = await this.getMenuData();
      const platillosDestacados: MenuItem[] = [];

      // Recorrer todas las categorías y sus items
      allCategories.forEach(category => {
        category.items.forEach(item => {
          // Considerar tanto 'destacado' como 'favorito' para compatibilidad con diferentes columnas
          if (item.destacado || item.favorito) {
            platillosDestacados.push({
              ...item,
              categoria: category.nombre // Agregar la categoría para referencia
            } as MenuItem & { categoria: string });
          }
        });
      });

      console.log(`✅ Found ${platillosDestacados.length} platillos destacados`);
      return platillosDestacados;
    } catch (error) {
      console.error('❌ Error fetching platillos destacados:', error);
      throw new Error(`Failed to fetch platillos destacados: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();
export type { Sucursal, Promocion };