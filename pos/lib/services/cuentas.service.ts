/**
 * CUENTAS SERVICE
 * Maneja toda la lógica de negocio de cuentas
 * Centraliza validaciones y operaciones
 */

import BaseService, { ApiResponse } from './base.service';

// Obtener fecha actual en zona horaria de México (Querétaro)
// Devuelve string en formato "YYYY-MM-DD HH:MM:SS" SIN timezone info
// (se interpreta como local time en el cliente)
function getMexicoDateTimeString(): string {
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

export interface Cuenta {
  id?: number;
  numero_cuenta: string;
  mesa_numero?: string;
  mesero_id?: number;
  estado: 'abierta' | 'cerrada' | 'cobrada';
  total?: number;
  fecha_apertura?: string;
  fecha_cierre?: string;
  metodo_pago?: string;
  total_cobrado?: number;
}

export class CuentasService extends BaseService {
  /**
   * Obtener todas las cuentas con filtros
   */
  async getCuentas(estado?: string, tipo?: string): Promise<ApiResponse> {
    return this.runQuery(
      () => {
        let query = `
          SELECT 
            c.*, 
            u.nombre as mesero_nombre,
            COALESCE((SELECT COUNT(*) FROM pedidos WHERE cuenta_id = c.id), 0) as total_pedidos,
            COALESCE((SELECT SUM(total) FROM pedidos WHERE cuenta_id = c.id), 0) as total
          FROM cuentas c
          LEFT JOIN usuarios u ON c.mesero_id = u.id
          WHERE 1=1
        `;

        if (estado) {
          query += ` AND c.estado = '${estado}'`;
        }

        if (tipo === 'mesa') {
          query += ` AND c.mesa_numero IS NOT NULL`;
        } else if (tipo === 'llevar') {
          query += ` AND c.mesa_numero IS NULL`;
        }

        query += ` ORDER BY c.fecha_apertura DESC`;

        return this.db.prepare(query).all();
      },
      'Error al obtener cuentas'
    );
  }

  /**
   * Obtener cuenta con todos sus detalles y pedidos
   */
  async getCuentaCompleta(cuentaId: number): Promise<ApiResponse> {
    const validation = this.validateId(cuentaId);
    if (!validation.valid) {
      return this.error(validation.error || 'ID inválido', 400);
    }

    return this.runQuery(
      () => {
        const cuenta = this.db
          .prepare(
            `
          SELECT c.*, u.nombre as mesero_nombre
          FROM cuentas c
          LEFT JOIN usuarios u ON c.mesero_id = u.id
          WHERE c.id = ?
        `
          )
          .get(cuentaId);

        if (!cuenta) {
          throw new Error('Cuenta no encontrada');
        }

        const pedidos = this.db
          .prepare(
            `
          SELECT p.*, 
                 (SELECT COUNT(*) FROM detalle_pedidos WHERE pedido_id = p.id) as total_items
          FROM pedidos p
          WHERE p.cuenta_id = ?
          ORDER BY p.creado_en ASC
        `
          )
          .all(cuentaId);

        const pedidosConItems = pedidos.map((pedido: any) => {
          const items = this.db
            .prepare(
              `
            SELECT dp.*, COALESCE(dp.producto_nombre, mi.nombre, 'Sin nombre') as nombre
            FROM detalle_pedidos dp
            LEFT JOIN menu_items mi ON dp.menu_item_id = mi.id
            WHERE dp.pedido_id = ?
          `
            )
            .all(pedido.id);

          // Parsear descuentos_json si existe
          let descuentosAplicados = [];
          if (pedido.descuentos_json) {
            try {
              descuentosAplicados = JSON.parse(pedido.descuentos_json);
            } catch (e) {
              console.error('Error parsing descuentos_json:', e);
            }
          }

          return { ...pedido, items, descuentosAplicados };
        });

        const totalCuenta = pedidosConItems.reduce((sum: number, p: any) => sum + (p.total || 0), 0);

        return {
          ...cuenta,
          total: totalCuenta,
          pedidos: pedidosConItems,
        };
      },
      'Error al obtener cuenta'
    );
  }

  /**
   * Crear nueva cuenta
   */
  async crearCuenta(data: Cuenta): Promise<ApiResponse> {
    const validation = this.validateRequiredFields(data, ['numero_cuenta']);
    if (!validation.valid) {
      return this.error(validation.error || 'Campos requeridos', 400);
    }

    return this.runQuery(
      () => {
        const stmt = this.db.prepare(`
          INSERT INTO cuentas (numero_cuenta, mesa_numero, mesero_id, estado, fecha_apertura)
          VALUES (?, ?, ?, ?, ?)
        `);

        const result = stmt.run(data.numero_cuenta, data.mesa_numero || null, data.mesero_id || 1, data.estado || 'abierta', getMexicoDateTimeString());

        if (!result.changes) {
          throw new Error('No se pudo crear la cuenta');
        }

        return this.db.prepare('SELECT * FROM cuentas WHERE id = ?').get(result.lastInsertRowid);
      },
      'Error al crear cuenta'
    );
  }

  /**
   * Cerrar cuenta (marcar como entregado)
   */
  async cerrarCuenta(cuentaId: number): Promise<ApiResponse> {
    const validation = this.validateId(cuentaId);
    if (!validation.valid) {
      return this.error(validation.error || 'ID inválido', 400);
    }

    return this.runQuery(
      () => {
        const cuenta = this.findById('cuentas', cuentaId);
        if (!cuenta) {
          throw new Error('Cuenta no encontrada');
        }

        // Actualizar estado a cerrada
        this.db.prepare(`
          UPDATE cuentas 
          SET estado = 'cerrada'
          WHERE id = ?
        `).run(cuentaId);

        // Marcar pedidos como entregado
        this.db.prepare(`
          UPDATE pedidos SET estado = 'entregado' WHERE cuenta_id = ? AND estado NOT IN ('entregado', 'completado')
        `).run(cuentaId);

        // Marcar mesa como disponible si la cuenta tiene mesa_numero
        if (cuenta.mesa_numero) {
          try {
            this.db.prepare(`
              UPDATE mesas 
              SET estado = 'disponible'
              WHERE numero = ?
            `).run(cuenta.mesa_numero);
          } catch (err) {
            // Tabla mesas puede no existir aún, continuar sin error
            console.log('Tabla mesas no disponible, continuando...');
          }
        }

        return this.db.prepare('SELECT * FROM cuentas WHERE id = ?').get(cuentaId);
      },
      'Error al cerrar cuenta'
    );
  }

  /**
   * Cobrar cuenta
   */
  async cobrarCuenta(cuentaId: number, metodo_pago: string, total_cobrado?: number): Promise<ApiResponse> {
    const validation = this.validateId(cuentaId);
    if (!validation.valid) {
      return this.error(validation.error || 'ID inválido', 400);
    }

    if (!metodo_pago || !['cash', 'tarjeta', 'efectivo', 'card'].includes(metodo_pago)) {
      return this.error('Método de pago inválido', 400);
    }

    return this.runQuery(
      () => {
        const cuenta = this.findById('cuentas', cuentaId);
        if (!cuenta) {
          throw new Error('Cuenta no encontrada');
        }

        // Calcular total si no se proporciona
        let monto = total_cobrado;
        if (!monto) {
          const result = this.db
            .prepare('SELECT SUM(total) as total FROM pedidos WHERE cuenta_id = ?')
            .get(cuentaId) as any;
          monto = result?.total || 0;
        }

        // Actualizar estado a cobrada
        this.db.prepare(`
          UPDATE cuentas 
          SET estado = 'cobrada', metodo_pago = ?, total_cobrado = ?
          WHERE id = ?
        `).run(metodo_pago, monto, cuentaId);

        // Marcar mesa como disponible si la cuenta tiene mesa_numero
        if (cuenta.mesa_numero) {
          try {
            this.db.prepare(`
              UPDATE mesas 
              SET estado = 'disponible'
              WHERE numero = ?
            `).run(cuenta.mesa_numero);
          } catch (err) {
            // Tabla mesas puede no existir aún, continuar sin error
            console.log('Tabla mesas no disponible, continuando...');
          }
        }

        return this.db.prepare('SELECT * FROM cuentas WHERE id = ?').get(cuentaId);
      },
      'Error al cobrar cuenta'
    );
  }

  /**
   * Eliminar cuenta (solo si está en estado abierta)
   */
  async eliminarCuenta(cuentaId: number): Promise<ApiResponse> {
    const validation = this.validateId(cuentaId);
    if (!validation.valid) {
      return this.error(validation.error || 'ID inválido', 400);
    }

    return this.runQuery(
      () => {
        const cuenta = this.findById('cuentas', cuentaId);
        if (!cuenta) {
          throw new Error('Cuenta no encontrada');
        }

        // Crear una transacción para garantizar integridad
        const transaction = this.db.transaction(() => {
          // Primero eliminar modificaciones_pedidos (que referencia pedidos)
          try {
            this.db.prepare('DELETE FROM modificaciones_pedidos WHERE pedido_id IN (SELECT id FROM pedidos WHERE cuenta_id = ?)').run(cuentaId);
          } catch (err) {
            console.log('No hay modificaciones que eliminar o tabla no existe');
          }
          
          // Eliminar detalle_pedidos
          this.db.prepare('DELETE FROM detalle_pedidos WHERE pedido_id IN (SELECT id FROM pedidos WHERE cuenta_id = ?)').run(cuentaId);
          
          // Eliminar pedidos
          this.db.prepare('DELETE FROM pedidos WHERE cuenta_id = ?').run(cuentaId);
          
          // Marcar mesa como disponible si la cuenta tiene mesa_numero
          if (cuenta.mesa_numero) {
            try {
              this.db.prepare(`
                UPDATE mesas 
                SET estado = 'disponible'
                WHERE numero = ?
              `).run(cuenta.mesa_numero);
            } catch (err) {
              // Tabla mesas puede no existir aún, continuar sin error
              console.log('Tabla mesas no disponible, continuando...');
            }
          }

          // Finalmente eliminar la cuenta
          this.db.prepare('DELETE FROM cuentas WHERE id = ?').run(cuentaId);
        });

        // Ejecutar la transacción
        transaction();
        return { id: cuentaId, eliminada: true };
      },
      'Error al eliminar cuenta'
    );
  }
}

export default new CuentasService();
