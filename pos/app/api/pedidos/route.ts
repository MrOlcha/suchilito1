import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';
import { getMonitoringService } from '../../../lib/monitoring';
import { verifyToken } from '../../../lib/auth';
import { getPromocionesActivas, calcularDescuentoPromocion } from '../../../lib/promociones';

// Obtener fecha en zona horaria de México (Querétaro)
function getMexicoDate(): Date {
  const now = new Date();
  return new Date(now.toLocaleString('en-US', { timeZone: 'America/Mexico_City' }));
}

// Obtener fecha y hora actual en zona horaria de México
// Devuelve string en formato "YYYY-MM-DD HH:MM:SS" SIN timezone info
// (se interpreta como local time en el cliente)
function getMexicoDateTime(): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  
  const parts = formatter.formatToParts(now);
  const values: { [key: string]: string } = {};
  parts.forEach((p) => {
    if (p.type !== 'literal') values[p.type] = p.value;
  });
  
  return `${values.year}-${values.month}-${values.day} ${values.hour}:${values.minute}:${values.second}`;
}

function generateNumeroPedido(): string {
  const db = getDb();
  const mexicoDate = getMexicoDate();
  const today = mexicoDate.toISOString().split('T')[0];

  // Contar pedidos de hoy
  const result = db.prepare(`
    SELECT COUNT(*) as count FROM pedidos
    WHERE DATE(creado_en) = DATE(?)
  `).get(today) as { count: number };

  let nextNumber = (result.count || 0) + 1;
  let numeroPedido = `Pedido ${nextNumber.toString().padStart(3, '0')}`;

  // Verificar si el número ya existe y encontrar uno único
  while (true) {
    const existing = db.prepare(`
      SELECT id FROM pedidos WHERE numero_pedido = ?
    `).get(numeroPedido);

    if (!existing) {
      return numeroPedido;
    }

    nextNumber++;
    numeroPedido = `Pedido ${nextNumber.toString().padStart(3, '0')}`;
  }
}

function generateNumeroPedidoParaLlevar(): string {
  const db = getDb();

  // Usar transacción para asegurar atomicidad
  const transaction = db.transaction(() => {
    const mexicoDate = getMexicoDate();
    const today = mexicoDate.toISOString().split('T')[0];

    // Contar pedidos para llevar de hoy dentro de la transacción
    const result = db.prepare(`
      SELECT COUNT(*) as count FROM pedidos
      WHERE DATE(creado_en) = DATE(?)
        AND es_para_llevar = 1
    `).get(today) as { count: number };

    let nextNumber = (result.count || 0) + 1;
    let numeroPedido = `PL${nextNumber.toString().padStart(4, '0')}`;

    // Verificar si el número ya existe y encontrar uno único
    while (true) {
      const existing = db.prepare(`
        SELECT id FROM pedidos WHERE numero_pedido = ?
      `).get(numeroPedido);

      if (!existing) {
        return numeroPedido;
      }

      nextNumber++;
      numeroPedido = `PL${nextNumber.toString().padStart(4, '0')}`;
    }
  });

  return transaction();
}

// Obtener o crear cuenta para una mesa
function getOrCreateCuenta(db: any, mesa_numero: string, mesero_id: number): number {
  const mexicoDate = getMexicoDate();
  const today = mexicoDate.toISOString().split('T')[0];

  // Buscar cuenta abierta para esta mesa hoy
  const cuentaExistente = db.prepare(`
    SELECT id FROM cuentas
    WHERE mesa_numero = ?
      AND estado = 'abierta'
      AND DATE(fecha_apertura) = DATE(?)
  `).get(mesa_numero, today);

  if (cuentaExistente) {
    return cuentaExistente.id;
  }

  // Usar transacción para asegurar atomicidad
  const transaction = db.transaction(() => {
    // Contar cuentas del día actual dentro de la transacción
    const countResult = db.prepare(`
      SELECT COUNT(*) as count FROM cuentas
      WHERE DATE(fecha_apertura) = DATE(?)
    `).get(today);

    let nextNumber = (countResult?.count || 0) + 1;
    let inserted = false;
    let result;
    let attempts = 0;

    // Intentar insertar, si falla por UNIQUE constraint, reintentar con número incrementado
    while (!inserted && attempts < 100) {
      try {
        const numeroCuenta = `Cuenta ${String(nextNumber + attempts).padStart(3, '0')}`;
        result = db.prepare(`
          INSERT INTO cuentas (numero_cuenta, mesa_numero, mesero_id, estado, total, fecha_apertura)
          VALUES (?, ?, ?, 'abierta', 0, ?)
        `).run(numeroCuenta, mesa_numero, mesero_id, getMexicoDateTime());
        inserted = true;
      } catch (error: any) {
        if (error.message.includes('UNIQUE constraint failed')) {
          attempts++;
        } else {
          throw error;
        }
      }
    }

    if (!inserted) {
      throw new Error('No se pudo generar un número de cuenta único después de 100 intentos');
    }

    return result.lastInsertRowid as number;
  });

  return transaction();
}

export async function POST(request: NextRequest) {
  const monitoring = getMonitoringService();
  const startTime = Date.now();
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  
  try {
    // Obtener mesero_id del token JWT, no del cliente
    const token = request.cookies.get('token')?.value;
    let mesero_id_from_token: number | null = null;
    
    if (token) {
      const user = verifyToken(token);
      if (user && user.id) {
        mesero_id_from_token = user.id;
        console.log('Mesero ID obtenido del token:', user.nombre, '(ID:', mesero_id_from_token + ')');
      }
    }
    
    const {
      mesero_id: mesero_id_from_client,
      mesa_numero,
      comensales,
      es_para_llevar,
      items,
      total,
      subtotal,
      total_descuento,
      descuentos,
      estado = 'pendiente',
      cuenta_id: providedCuentaId,
      observaciones
    } = await request.json();
    
    // Usar mesero_id del token (confiable) en lugar del cliente
    const mesero_id = mesero_id_from_token || mesero_id_from_client;
    
    if (!mesero_id) {
      console.error('No se pudo obtener mesero_id del token ni del cliente');
      return NextResponse.json(
        { message: 'No autenticado - No se pudo obtener mesero_id' },
        { status: 401 }
      );
    }

    // Log de inicio
    monitoring.registrarLog({
      nivel: 'info',
      tipo: 'api_call',
      modulo: 'pedidos',
      endpoint: '/api/pedidos',
      metodo_http: 'POST',
      usuario_id: mesero_id,
      mensaje: `Creando nuevo pedido para mesa ${mesa_numero}`,
      ip_cliente: ip,
      detalles: { 
        mesa_numero, 
        es_para_llevar, 
        items_count: items?.length,
        mesero_id_source: mesero_id_from_token ? 'token' : 'client'
      }
    });

    console.log('Datos recibidos:', { 
      mesero_id_final: mesero_id,
      mesero_id_from_token,
      mesero_id_from_client,
      mesa_numero, 
      comensales, 
      es_para_llevar, 
      items_count: items?.length,
      total, 
      estado, 
      observaciones 
    });

    if (!mesero_id || !items || items.length === 0) {
      monitoring.registrarLog({
        nivel: 'warning',
        tipo: 'api_call',
        modulo: 'pedidos',
        endpoint: '/api/pedidos',
        metodo_http: 'POST',
        usuario_id: mesero_id,
        mensaje: 'Datos incompletos en solicitud',
        ip_cliente: ip,
        duracion_ms: Date.now() - startTime,
      });

      return NextResponse.json(
        { message: 'Datos incompletos - Se requiere: mesero_id, items' },
        { status: 400 }
      );
    }

    // Para pedidos para llevar, mesa_numero puede ser null
    if (!es_para_llevar && !mesa_numero) {
      monitoring.registrarLog({
        nivel: 'warning',
        tipo: 'api_call',
        modulo: 'pedidos',
        endpoint: '/api/pedidos',
        metodo_http: 'POST',
        usuario_id: mesero_id,
        mensaje: 'Mesa requerida para pedidos normales',
        ip_cliente: ip,
        duracion_ms: Date.now() - startTime,
      });

      return NextResponse.json(
        { message: 'Se requiere mesa_numero para pedidos normales' },
        { status: 400 }
      );
    }

    const db = getDb();
    
    // Validar que el mesero existe
    const meseroExiste = db.prepare('SELECT id FROM usuarios WHERE id = ?').get(mesero_id);
    if (!meseroExiste) {
      monitoring.registrarLog({
        nivel: 'warning',
        tipo: 'api_call',
        modulo: 'pedidos',
        endpoint: '/api/pedidos',
        metodo_http: 'POST',
        usuario_id: mesero_id,
        mensaje: `Mesero no encontrado: ${mesero_id}`,
        ip_cliente: ip,
        duracion_ms: Date.now() - startTime,
      });

      monitoring.registrarError({
        tipo_error: 'ValidationError',
        mensaje: 'Mesero no existe',
        endpoint: '/api/pedidos',
        usuario_id: mesero_id,
      });

      return NextResponse.json(
        { message: 'El mesero especificado no existe' },
        { status: 400 }
      );
    }

    const numeroPedido = es_para_llevar ? generateNumeroPedidoParaLlevar() : generateNumeroPedido();

    console.log('Creando pedido con número:', numeroPedido, 'es_para_llevar:', es_para_llevar);

    // Determinar el mesa_numero final para la cuenta y el pedido
    const mesaNumeroFinal = es_para_llevar ? numeroPedido : mesa_numero;

    // TODOS los pedidos necesitan una cuenta (llevar o comer aquí)
    let cuentaId: number | null = providedCuentaId || null;
    if (!cuentaId) {
      try {
        console.log('Usando mesa_numero_final:', mesaNumeroFinal, 'para cuenta');

        cuentaId = getOrCreateCuenta(db, mesaNumeroFinal, mesero_id);
        console.log('Cuenta ID creada/obtenida:', cuentaId, 'para mesa_numero:', mesaNumeroFinal);

        monitoring.registrarLog({
          nivel: 'info',
          tipo: 'transaction',
          modulo: 'pedidos',
          endpoint: '/api/pedidos',
          usuario_id: mesero_id,
          mensaje: `Cuenta creada/obtenida: ${cuentaId}`,
          ip_cliente: ip,
          detalles: { cuenta_id: cuentaId, mesa_numero }
        });
      } catch (error: any) {
        console.error('Error creando cuenta:', error);
        
        monitoring.registrarError({
          tipo_error: 'AccountCreationError',
          mensaje: `No se pudo crear la cuenta: ${error.message}`,
          stack_trace: error.stack,
          endpoint: '/api/pedidos',
          usuario_id: mesero_id,
        });

        monitoring.crearAlerta({
          tipo_alerta: 'account_creation_failed',
          severidad: 'alta',
          titulo: 'Error creando cuenta',
          descripcion: `${error.message}`,
        });

        throw new Error(`No se pudo crear la cuenta: ${error}`);
      }
    }

    // Para pedidos para llevar, agregar información adicional en observaciones
    let observacionesFinal = observaciones;
    if (es_para_llevar && !observacionesFinal) {
      observacionesFinal = `Pedido para llevar - Preparar para recoger`;
    }

    // Crear pedido - usuario_id y mesero_id son el mismo en este caso
    const result = db.prepare(
      `INSERT INTO pedidos (numero_pedido, usuario_id, mesa_numero, comensales, es_para_llevar, cuenta_id, subtotal, total_descuento, total, estado, mesero_id, observaciones, descuentos_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(numeroPedido, mesero_id, mesaNumeroFinal, comensales || 1, es_para_llevar ? 1 : 0, cuentaId, subtotal || 0, total_descuento || 0, total, estado, mesero_id, observacionesFinal, descuentos ? JSON.stringify(descuentos) : null);

    const pedidoId = result.lastInsertRowid;
    console.log('Pedido creado con ID:', pedidoId);

    // Obtener promociones activas para aplicar descuentos
    const promocionesActivas = await getPromocionesActivas();
    console.log('Promociones activas:', promocionesActivas.length);

    // Insertar items del pedido con descuentos de promociones
    let totalConDescuentos = 0;
    for (const item of items) {
      console.log('Procesando item:', item);
      
      // Validar que menu_item_id existe si se proporciona
      let validMenuItemId = item.menu_item_id || null;
      if (validMenuItemId) {
        const menuItemExists = db.prepare('SELECT id FROM menu_items WHERE id = ?').get(validMenuItemId);
        if (!menuItemExists) {
          return NextResponse.json(
            { message: `El item de menú con ID ${validMenuItemId} no existe` },
            { status: 400 }
          );
        }
      }
      
      const precioUnitario = item.precio_unitario || 0;
      const cantidad = item.cantidad;
      const subtotalOriginal = precioUnitario * cantidad;
      
      // Calcular descuento por promoción si aplica
      let descuento = 0;
      let promocionAplicada = null;
      
      if (validMenuItemId && promocionesActivas.length > 0) {
        const resultadoPromocion = calcularDescuentoPromocion(
          validMenuItemId,
          cantidad,
          precioUnitario,
          promocionesActivas
        );
        descuento = resultadoPromocion.descuento;
        promocionAplicada = resultadoPromocion.promocionAplicada;
      }
      
      const subtotalFinal = subtotalOriginal - descuento;
      totalConDescuentos += subtotalFinal;
      
      console.log(`Item ${item.producto_nombre}: Original $${subtotalOriginal}, Descuento $${descuento}, Final $${subtotalFinal}`);
      
      db.prepare(
        `INSERT INTO detalle_pedidos (pedido_id, menu_item_id, producto_nombre, cantidad, especificaciones, notas, precio_unitario, subtotal, descuento_aplicado, promocion_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        pedidoId,
        validMenuItemId,
        item.producto_nombre,
        cantidad,
        item.especificaciones || '',
        item.notas || '',
        precioUnitario,
        subtotalFinal,
        descuento,
        promocionAplicada?.id || null
      );
    }

    // Actualizar el total del pedido con descuentos aplicados
    if (totalConDescuentos !== total) {
      console.log(`Actualizando total del pedido: ${total} -> ${totalConDescuentos}`);
      db.prepare('UPDATE pedidos SET total = ? WHERE id = ?').run(totalConDescuentos, pedidoId);
    }

    // Marcar la mesa como ocupada si no es para llevar
    if (!es_para_llevar && mesa_numero) {
      try {
        db.prepare('UPDATE mesas SET estado = ? WHERE numero = ?').run('ocupada', mesa_numero);
        console.log(`Mesa ${mesa_numero} marcada como ocupada`);
      } catch (err) {
        console.log('Tabla mesas no disponible, continuando...');
      }
    }

    // Actualizar total de la cuenta si existe
    if (cuentaId) {
      const totalCuenta = db.prepare(`
        SELECT SUM(total) as total FROM pedidos WHERE cuenta_id = ?
      `).get(cuentaId);
      db.prepare('UPDATE cuentas SET total = ? WHERE id = ?').run(totalCuenta?.total || 0, cuentaId);
    }

    console.log('Pedido creado exitosamente');

    // Log de éxito
    monitoring.registrarLog({
      nivel: 'info',
      tipo: 'transaction',
      modulo: 'pedidos',
      endpoint: '/api/pedidos',
      metodo_http: 'POST',
      usuario_id: mesero_id,
      mensaje: `Pedido creado exitosamente: ${numeroPedido}`,
      duracion_ms: Date.now() - startTime,
      ip_cliente: ip,
      detalles: {
        pedido_id: pedidoId,
        numero_pedido: numeroPedido,
        items_count: items.length,
        total,
      }
    });

    // Registrar métrica
    monitoring.registrarMetrica({
      tipo_metrica: 'pedidos_creados',
      nombre: 'Pedidos por hora',
      valor: 1,
      endpoint: '/api/pedidos',
      usuario_id: mesero_id,
    });

    return NextResponse.json({
      message: 'Pedido creado exitosamente',
      pedido: {
        id: pedidoId,
        numero_pedido: numeroPedido,
        cuenta_id: cuentaId,
        total
      }
    });
  } catch (error: any) {
    console.error('Error creando pedido:', error);
    
    // Registrar error detallado
    monitoring.registrarError({
      tipo_error: error.name || 'PedidoCreationError',
      mensaje: error.message,
      stack_trace: error.stack,
      endpoint: '/api/pedidos',
    });

    monitoring.registrarLog({
      nivel: 'error',
      tipo: 'error',
      modulo: 'pedidos',
      endpoint: '/api/pedidos',
      metodo_http: 'POST',
      mensaje: `Error creando pedido: ${error.message}`,
      duracion_ms: Date.now() - startTime,
      ip_cliente: ip,
    });
    
    // Detalles específicos para FOREIGN KEY errors
    if (error.message?.includes('FOREIGN KEY')) {
      return NextResponse.json(
        { 
          message: 'Error: Referencia inválida en la base de datos',
          details: error.message,
          error: String(error) 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: 'Error interno del servidor', error: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const monitoring = getMonitoringService();
  const startTime = Date.now();
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

  try {
    monitoring.registrarLog({
      nivel: 'info',
      tipo: 'api_call',
      modulo: 'pedidos',
      endpoint: '/api/pedidos',
      metodo_http: 'GET',
      mensaje: 'Obteniendo lista de pedidos',
      ip_cliente: ip,
    });

    const db = getDb();
    const url = new URL(request.url);
    const estado = url.searchParams.get('estado');

    let query = `
      SELECT p.id, p.numero_pedido, p.mesa_numero, p.es_para_llevar, p.estado, p.creado_en, p.total, p.observaciones, u.nombre as mesero_nombre
      FROM pedidos p
      LEFT JOIN usuarios u ON p.mesero_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    // Filtrar por estado si se proporciona
    if (estado) {
      const estados = estado.split(',').map(e => e.trim());
      const placeholders = estados.map(() => '?').join(',');
      query += ` AND p.estado IN (${placeholders})`;
      params.push(...estados);
    } else {
      // Si no se especifica estado, excluir pedidos completamente pagados
      // 'entregado' significa entregado al cliente pero pendiente de pago
      query += ` AND p.estado NOT IN ('completado', 'pagado')`;
    }

    query += ` ORDER BY p.creado_en DESC LIMIT 100`;

    const pedidos = db.prepare(query).all(...params);

    // Obtener items de cada pedido
    const pedidosConItems = pedidos.map((pedido: any) => {
      const items = db.prepare(
        `SELECT dp.*, COALESCE(dp.producto_nombre, mi.nombre, 'Producto sin nombre') as nombre_final
         FROM detalle_pedidos dp
         LEFT JOIN menu_items mi ON dp.menu_item_id = mi.id
         WHERE dp.pedido_id = ?`
      ).all(pedido.id);
      return {
        ...pedido,
        items: items.map((item: any) => ({
          id: item.id,
          nombre: item.nombre_final,
          cantidad: item.cantidad,
          especificaciones: item.especificaciones || '',
          notas: item.notas || '',
          precio_unitario: item.precio_unitario,
          subtotal: item.subtotal
        }))
      };
    });

    monitoring.registrarLog({
      nivel: 'info',
      tipo: 'api_call',
      modulo: 'pedidos',
      endpoint: '/api/pedidos',
      metodo_http: 'GET',
      mensaje: `Pedidos obtenidos: ${pedidosConItems.length}`,
      duracion_ms: Date.now() - startTime,
      ip_cliente: ip,
      detalles: { count: pedidosConItems.length }
    });

    return NextResponse.json(pedidosConItems);
  } catch (error: any) {
    console.error('Error fetching pedidos:', error);

    monitoring.registrarError({
      tipo_error: 'FetchError',
      mensaje: error.message,
      stack_trace: error.stack,
      endpoint: '/api/pedidos',
    });

    monitoring.registrarLog({
      nivel: 'error',
      tipo: 'error',
      modulo: 'pedidos',
      endpoint: '/api/pedidos',
      metodo_http: 'GET',
      mensaje: `Error obteniendo pedidos: ${error.message}`,
      duracion_ms: Date.now() - startTime,
      ip_cliente: ip,
    });

    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}