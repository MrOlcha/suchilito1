/**
 * Librería para imprimir en impresora térmica POS-5890A
 * Formato: 58mm de ancho, ESC/POS
 */

export interface TicketData {
  numeroTicket: string;
  nombreNegocio: string;
  mesa?: string;
  mesero?: string;
  items: Array<{
    nombre: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
    notas?: string;
  }>;
  subtotal: number;
  impuesto?: number;
  total: number;
  metodo_pago?: string;
  observaciones?: string;
  fecha: string;
  hora: string;
}

/**
 * Genera el comando ESC/POS para la impresora térmica
 */
export function generarComandoESCPOS(data: TicketData): Uint8Array {
  const lines: string[] = [];
  const lineWidth = 32; // Optimizado para 58mm: 32 caracteres de ancho

  // Función auxiliar para centrar texto
  const center = (text: string): string => {
    const spaces = Math.max(0, Math.floor((lineWidth - text.length) / 2));
    return ' '.repeat(spaces) + text;
  };

  // Función auxiliar para separadores
  const separator = (): string => '-'.repeat(lineWidth);

  // INICIO: Reset de la impresora
  lines.push('\x1B\x40'); // ESC @

  // Reducir altura de línea
  lines.push('\x1B\x33\x18'); // ESC 3 24 - Altura de línea reducida

  // TAMAÑO NORMAL - MÁS PEQUEÑO
  lines.push('\x1B\x21\x00'); // ESC ! 0

  // Encabezado - ULTRA COMPACTO
  lines.push(center(data.nombreNegocio?.substring(0, 18) || 'MAZUHI'));
  lines.push(center('='.repeat(16)));

  // Información del ticket - UNA SOLA LÍNEA
  lines.push(`Ticket: ${data.numeroTicket} | ${data.fecha.substring(5)}`);
  if (data.mesa || data.mesero) {
    let infoLine = '';
    if (data.mesa) infoLine += `Mesa: ${data.mesa} `;
    if (data.mesero) infoLine += `${data.mesero}`;
    lines.push(infoLine);
  }
  lines.push(separator());

  // Items - COMPACTO AL MÁXIMO
  lines.push('DESC       CT PRECIO');
  lines.push(separator());

  data.items.forEach((item) => {
    const itemName = item.nombre.substring(0, 11).padEnd(11, ' ');
    const qty = item.cantidad.toString().padStart(2, ' ');
    const price = `$${item.subtotal.toFixed(2)}`.padStart(8, ' ');
    lines.push(`${itemName} ${qty} ${price}`);

    // Notas INLINE si existen
    if (item.notas && item.notas.length > 0) {
      const nota = `*${item.notas}`.substring(0, 31);
      lines.push(nota);
    }
  });

  lines.push(separator());

  // Observaciones - SOLO SI SON CORTAS
  if (data.observaciones && data.observaciones.trim().length > 0 && data.observaciones.length < 50) {
    lines.push(`NOTAS: ${data.observaciones.substring(0, 28)}`);
    lines.push(separator());
  }

  // Totales - UNA LÍNEA CADA UNO
  lines.push(`Subtotal: $${data.subtotal.toFixed(2)}`.padStart(lineWidth, ' '));

  if (data.impuesto && data.impuesto > 0) {
    lines.push(`Impuesto: $${data.impuesto.toFixed(2)}`.padStart(lineWidth, ' '));
  }

  lines.push(separator());

  // TOTAL EN GRANDE - PERO COMPACTO
  lines.push('\x1B\x21\x20'); // ESC ! 32 - Doble altura
  lines.push(center(`TOTAL: $${data.total.toFixed(2)}`));
  lines.push('\x1B\x21\x00'); // Volver a normal

  // Método de pago - UNA LÍNEA
  if (data.metodo_pago) {
    lines.push(center(`Pago: ${data.metodo_pago}`));
  }

  // Footer MINIMALISTICO
  lines.push('');
  lines.push(center('¡Gracias!'));

  // APENAS saltos de línea finales
  lines.push('\n');

  // Corte de papel
  lines.push('\x1D\x56\x00'); // GS V 0

  return new TextEncoder().encode(lines.join('\n'));
}

/**
 * Imprime en la impresora térmica USB
 */
export async function imprimirEnTérmica(data: TicketData): Promise<boolean> {
  try {
    // Verificar si la API WebUSB está disponible
    // @ts-ignore - WebUSB API no está en tipos estándar
    if (!navigator.usb) {
      throw new Error('La API WebUSB no está disponible en este navegador');
    }

    // Solicitar acceso a dispositivos USB
    // @ts-ignore
    const devices = await navigator.usb.getDevices();
    
    // Buscar la impresora POS-5890A
    // Vendor ID típico: 0x0483 (STMicroelectronics) o 0x1504
    let device = devices.find(
      (d: any) => d.productName?.includes('POS-5890') || d.productName?.includes('Thermal')
    );

    if (!device) {
      // Si no está conectada, pedir que se conecte
      // @ts-ignore
      device = await navigator.usb.requestDevice({
        filters: [{ vendorId: 0x0483 }, { vendorId: 0x1504 }],
      });
    }

    if (!device) {
      throw new Error('No se encontró la impresora térmica');
    }

    // Abrir la conexión
    await device.open();

    // Reclamar la interfaz
    await device.claimInterface(0);

    // Generar comando ESC/POS
    const comando = generarComandoESCPOS(data);

    // Enviar a la impresora
    await device.transferOut(1, comando);

    // Cerrar la conexión
    await device.close();

    return true;
  } catch (error: any) {
    console.error('Error de impresión térmica:', error.message);
    throw error;
  }
}

/**
 * Alternativa: Imprime usando print() del navegador para impresoras instaladas
 */
export function imprimirViaBrowser(data: TicketData): void {
  const html = generarHTMLTicket(data);
  const ventana = window.open('', '_blank');
  if (ventana) {
    ventana.document.write(html);
    ventana.document.close();
    setTimeout(() => {
      ventana.print();
    }, 100);
  }
}

/**
 * Genera HTML para visualización / impresión por navegador
 */
function generarHTMLTicket(data: TicketData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Ticket ${data.numeroTicket}</title>
      <style>
        @page {
          size: 58mm auto;
          margin: 0;
          padding: 0;
        }
        
        * { 
          margin: 0; 
          padding: 0; 
          box-sizing: border-box; 
        }
        
        html, body {
          width: 58mm;
          margin: 0;
          padding: 0;
          background: white;
        }
        
        body {
          font-family: 'Courier New', monospace;
          font-size: 5px;
          line-height: 0.8;
          padding: 0;
        }
        
        .ticket {
          width: 58mm;
          padding: 0.3mm;
          background: white;
          color: black;
        }
        
        .logo {
          text-align: center;
          margin: 0;
          padding: 0;
          line-height: 0;
        }
        
        .logo img {
          width: 30mm;
          height: auto;
          display: block;
          margin: 0 auto;
        }
        
        .footer-img {
          text-align: center;
          margin: 0.2mm 0 0 0;
          padding: 0;
          line-height: 0;
        }
        
        .footer-img img {
          width: 50mm;
          height: auto;
          display: block;
          margin: 0 auto;
        }
        
        h2 {
          text-align: center;
          font-size: 7px;
          margin: 0;
          padding: 0;
          font-weight: bold;
        }
        
        .header {
          text-align: center;
          font-size: 8px;
          font-weight: bold;
          margin: 0.2mm 0;
          padding: 0;
          line-height: 0.9;
        }
        
        .line {
          text-align: center;
          font-size: 6px;
          margin: 0;
          padding: 0;
          line-height: 0.8;
        }
        
        .separator {
          border-bottom: 1px solid #000;
          margin: 0;
          padding: 0;
        }
        
        .info {
          font-size: 6px;
          margin: 0;
          padding: 0;
          line-height: 0.8;
        }
        
        .items-header {
          display: grid;
          grid-template-columns: 1fr 15px 30px;
          gap: 1px;
          font-size: 5px;
          font-weight: bold;
          border-bottom: 1px solid #000;
          margin: 0;
          padding: 0.1mm 0;
          line-height: 0.8;
        }
        
        .item-row {
          display: grid;
          grid-template-columns: 1fr 15px 30px;
          gap: 1px;
          font-size: 5px;
          margin: 0;
          padding: 0;
          line-height: 0.75;
        }
        
        .item-name {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: clip;
          max-width: 100%;
        }
        
        .item-qty {
          text-align: center;
        }
        
        .item-price {
          text-align: right;
        }
        
        .item-note {
          font-size: 5px;
          margin: 0;
          padding: 0;
          line-height: 0.75;
          grid-column: 1 / -1;
        }
        
        .totals {
          margin: 0;
          font-size: 6px;
          text-align: right;
          padding: 0;
          line-height: 0.8;
        }
        
        .total-amount {
          font-size: 9px;
          border-top: 1px solid #000;
          border-bottom: 1px solid #000;
          padding: 0.2mm 0;
          margin: 0;
          font-weight: bold;
          text-align: center;
          line-height: 0.9;
        }
        
        .footer {
          text-align: center;
          font-size: 7px;
          margin-top: 0.5mm;
          padding: 0;
        }
        
        .footer-text {
          text-align: center;
          font-size: 6px;
          margin: 0.1mm 0;
          padding: 0;
          font-style: normal;
        }
        
        @media print {
          @page {
            size: 58mm auto;
            margin: 0;
            padding: 0;
          }
          
          body {
            margin: 0;
            padding: 0;
            width: 58mm;
          }
          
          .ticket {
            page-break-after: avoid;
            margin: 0;
            padding: 1.5mm;
          }
        }
      </style>
    </head>
    <body>
      <div class="ticket">
        <div class="logo"><img src="https://operacion.mazuhi.com/pos/imagenes-ticket/headerticket-small.png" alt="Logo"></div>
        <div class="line">Ticket: ${data.numeroTicket}</div>
        <div class="line">${data.fecha}</div>
        
        ${data.mesa || data.mesero ? `<div class="info">${data.mesa ? `Mesa: ${data.mesa}` : ''} ${data.mesero ? `${data.mesero}` : ''}</div>` : ''}
        
        <div class="separator"></div>
        
        <div class="items-header">
          <span>DESC</span>
          <span>CT</span>
          <span>PRECIO</span>
        </div>
        
        ${data.items
          .map((item) => {
            const itemLine = `
        <div class="item-row">
          <span class="item-name">${item.nombre.substring(0, 12)}</span>
          <span class="item-qty">${item.cantidad}</span>
          <span class="item-price">$${item.subtotal.toFixed(2)}</span>
        </div>`;
            const notaLine = item.notas ? `
        <div class="item-note">*${item.notas.substring(0, 25)}</div>` : '';
            return itemLine + notaLine;
          })
          .join('')}
        
        <div class="separator"></div>
        
        <div class="totals">
          <div>Subtotal: $${data.subtotal.toFixed(2)}</div>
          ${data.impuesto && data.impuesto > 0 ? `<div>Impuesto: $${data.impuesto.toFixed(2)}</div>` : ''}
        </div>
        
        <div class="total-amount">
          TOTAL: $${data.total.toFixed(2)}
        </div>
        <div class="footer-img"><img src="https://operacion.mazuhi.com/pos/imagenes-ticket/footerticket-small.png" alt="Footer"></div>
        <div class="footer-text">www.mazuhi.com</div>
      </div>
    </body>
    </html>
  `;
}
