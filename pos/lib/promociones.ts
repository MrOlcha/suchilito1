import { getDb } from './db';

export interface Promocion {
  id: number;
  nombre: string;
  descripcion?: string;
  activa: boolean;
  itemsRequeridos: number;
  itemsGratis: number;
  aplicarACategoria?: string;
  diasAplicables?: string;
  horaInicio?: string;
  horaFin?: string;
  items: Array<{
    id: number;
    nombre: string;
    precio: number;
    categoria: string;
  }>;
}

export async function getPromocionesActivas(): Promise<Promocion[]> {
  const db = getDb();

  const promociones = db.prepare(`
    SELECT
      p.id,
      p.nombre,
      p.descripcion,
      p.activa,
      p.items_requeridos as itemsRequeridos,
      p.items_gratis as itemsGratis,
      p.aplicar_a_categoria as aplicarACategoria,
      GROUP_CONCAT(pi.menu_item_id) as item_ids
    FROM promociones p
    JOIN promocion_items pi ON p.id = pi.promocion_id
    WHERE p.activa = 1
    GROUP BY p.id
  `).all();

  // Para cada promoción, obtener los detalles de los items
  const promocionesConItems = promociones.map((promocion: any) => {
    let items = [];
    if (promocion.item_ids) {
      const itemIds = promocion.item_ids.split(',');
      items = db.prepare(`
        SELECT mi.id, mi.nombre, mi.precio, mc.nombre as categoria
        FROM menu_items mi
        JOIN menu_categorias mc ON mi.categoria_id = mc.id
        WHERE mi.id IN (${itemIds.map(() => '?').join(',')})
        ORDER BY mi.precio ASC
      `).all(itemIds);
    }

    return {
      id: promocion.id,
      nombre: promocion.nombre,
      descripcion: promocion.descripcion,
      activa: Boolean(promocion.activa),
      itemsRequeridos: promocion.itemsRequeridos,
      itemsGratis: promocion.itemsGratis,
      aplicarACategoria: promocion.aplicarACategoria,
      items
    };
  });

  return promocionesConItems;
}

export function calcularDescuentoPromocion(
  itemId: number,
  cantidad: number,
  precioUnitario: number,
  promociones: Promocion[]
): { descuento: number; promocionAplicada?: Promocion; detalles?: string } {
  // Buscar promociones que incluyan este item
  const promocionAplicada = promociones.find(promocion =>
    promocion.activa && promocion.items.some(item => item.id === itemId)
  );

  if (!promocionAplicada) {
    return { descuento: 0 };
  }

  // Verificar si aplica a una categoría específica
  if (promocionAplicada.aplicarACategoria) {
    const itemEnPromocion = promocionAplicada.items.find(item => item.id === itemId);
    if (itemEnPromocion?.categoria !== promocionAplicada.aplicarACategoria) {
      return { descuento: 0 };
    }
  }

  // Si se seleccionan MENOS de lo requerido, no aplica
  if (cantidad < promocionAplicada.itemsRequeridos) {
    return {
      descuento: 0,
      detalles: `Selecciona ${promocionAplicada.itemsRequeridos} items para activar`
    };
  }

  // Encontrar los N items más baratos (donde N = itemsGratis)
  const itemsOrdenados = [...promocionAplicada.items].sort((a, b) => a.precio - b.precio);
  const precioGratis = itemsOrdenados
    .slice(0, promocionAplicada.itemsGratis)
    .reduce((sum, item) => sum + item.precio, 0);

  // Si el item actual NO está en los items gratis, no aplicar descuento
  const esItemGratis = itemsOrdenados
    .slice(0, promocionAplicada.itemsGratis)
    .some(item => item.id === itemId);

  if (!esItemGratis) {
    return { descuento: 0, promocionAplicada };
  }

  // Calcular el descuento (precio del item actual si está en los gratuitos)
  const descuentoPorItem = itemsOrdenados.slice(0, promocionAplicada.itemsGratis).find(i => i.id === itemId)?.precio || 0;
  const descuentoTotal = Math.min(descuentoPorItem * cantidad, precioGratis * Math.floor(cantidad / promocionAplicada.itemsRequeridos));

  return {
    descuento: descuentoTotal,
    promocionAplicada,
    detalles: `${promocionAplicada.nombre}: ${promocionAplicada.itemsRequeridos}x${promocionAplicada.itemsGratis} - Descuento $${descuentoTotal}`
  };
}

/**
 * Verifica si una promoción es válida para el día y hora actual
 */
export function esPromocionValidaAhora(promocion: any): boolean {
  const ahora = new Date();
  const diaSemana = ahora.getDay(); // 0 = domingo, 1 = lunes, ...6 = sábado
  const horaActual = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;

  // Verificar día
  if (promocion.diasAplicables) {
    try {
      const dias = JSON.parse(promocion.diasAplicables);
      if (!dias.includes(diaSemana)) {
        return false;
      }
    } catch {
      // Si no se puede parsear, asumir que aplica todos los días
    }
  }

  // Verificar horario
  if (promocion.horaInicio && promocion.horaFin) {
    if (horaActual < promocion.horaInicio || horaActual > promocion.horaFin) {
      return false;
    }
  }

  return true;
}

/**
 * Obtiene solo las promociones activas y válidas para el horario/día actual
 */
export async function getPromocionesValidasAhora(): Promise<Promocion[]> {
  const todasLasPromociones = await getPromocionesActivas();
  return todasLasPromociones.filter(esPromocionValidaAhora);
}

/**
 * Detecta qué promociones aplican a un conjunto de items del carrito
 */
export function detectarPromocionesPara(
  itemsEnCarrito: Array<{ id: number; cantidad: number; categoria?: string }>,
  promociones: Promocion[]
): Array<{ promocion: Promocion; itemsQueCumplen: number[] }> {
  const promocionesDetectadas: Array<{ promocion: Promocion; itemsQueCumplen: number[] }> = [];

  for (const promocion of promociones) {
    // Filtrar items que son parte de esta promoción
    let itemsDePromocion = promocion.items.map(item => item.id);

    // Si aplica a una categoría específica, filtrar solo esos
    if (promocion.aplicarACategoria) {
      itemsDePromocion = itemsDePromocion.filter(itemId => {
        const item = promocion.items.find(i => i.id === itemId);
        return item?.categoria === promocion.aplicarACategoria;
      });
    }

    // Verificar si el carrito tiene estos items
    const itemsQueCumplen = itemsEnCarrito
      .filter(cartItem => itemsDePromocion.includes(cartItem.id))
      .map(cartItem => cartItem.id);

    // Si cumple el requisito mínimo de items
    if (itemsQueCumplen.length >= promocion.itemsRequeridos) {
      promocionesDetectadas.push({ promocion, itemsQueCumplen });
    }
  }

  return promocionesDetectadas;
}

/**
 * Calcula el descuento automático en el carrito
 * Para cada promoción, identifica el item más barato y lo descuenta
 */
export interface DescuentoAplicado {
  promocionId: number;
  promocionNombre: string;
  descuentoTotal: number;
  cantidadItems: number;
  precioItemGratis: number;
}

export function calcularDescuentosDelCarrito(
  cartItems: Array<{
    id: string;
    item: { id?: number; nombre: string; precio: number; categoria?: string };
    quantity: number;
  }>,
  promociones: Promocion[]
): { descuentos: DescuentoAplicado[]; descuentoTotal: number } {
  const descuentos: DescuentoAplicado[] = [];

  // Solo considerar promociones activas y válidas en este momento
  const promocionesValidas = promociones.filter(p => p.activa && esPromocionValidaAhora(p));

  for (const promo of promocionesValidas) {
    // Obtener IDs de items en la promoción
    const idsEnPromo = new Set(promo.items.map(item => item.id));

    // Obtener items del carrito que están en la promoción
    const itemsEnPromo = cartItems.filter(
      cartItem => cartItem.item.id !== undefined && idsEnPromo.has(cartItem.item.id)
    );

    if (itemsEnPromo.length === 0) continue;

    // Calcular cantidad total de items de esta promoción
    const cantidadTotal = itemsEnPromo.reduce((sum, item) => sum + item.quantity, 0);

    // Calcular cuántas veces completa se la promoción
    const vecesQueAplica = Math.floor(cantidadTotal / promo.itemsRequeridos);

    if (vecesQueAplica > 0) {
      // Crear un array plano con todos los items (repetidos según cantidad)
      const itemsPlanos = itemsEnPromo.flatMap(cartItem =>
        Array(cartItem.quantity)
          .fill(null)
          .map(() => ({
            id: cartItem.item.id!,
            nombre: cartItem.item.nombre,
            precio: cartItem.item.precio
          }))
      );

      // Ordenar por precio (menor a mayor) para aplicar descuento al más barato
      itemsPlanos.sort((a, b) => a.precio - b.precio);

      // Aplicar descuentos
      let descuentoTotal = 0;
      let itemsGratis = 0;

      for (let i = 0; i < vecesQueAplica; i++) {
        // En cada aplicación de la promoción, el item más barato es gratis
        // Dentro de cada grupo de itemsRequeridos, el último (más barato) es gratis
        const indiceGratis = i * promo.itemsRequeridos + (promo.itemsRequeridos - 1);

        if (indiceGratis < itemsPlanos.length) {
          const itemGratis = itemsPlanos[indiceGratis];
          descuentoTotal += itemGratis.precio;
          itemsGratis++;
        }
      }

      if (descuentoTotal > 0) {
        const precioItemGratis = itemsPlanos[promo.itemsRequeridos - 1]?.precio || 0;
        descuentos.push({
          promocionId: promo.id,
          promocionNombre: promo.nombre,
          descuentoTotal,
          cantidadItems: itemsGratis,
          precioItemGratis
        });
      }
    }
  }

  const descuentoTotal = descuentos.reduce((sum, d) => sum + d.descuentoTotal, 0);

  return { descuentos, descuentoTotal };
}
