import { NextRequest, NextResponse } from 'next/server';
import { CheckoutData } from '@/types/checkout';
import { CartState } from '@/types/cart';

const TELEGRAM_BOT_TOKEN = '8512401816:AAEeo4ZWu8NL2AvNrz18U8OUNPU1v8eOWuU';

// Lista de usuarios/chats a los que se envían las notificaciones
const TELEGRAM_RECIPIENTS = [
  '-4993108536',      // Grupo principal de Mazuhi
  '@frreeemaan'       // Usuario frreeemaan
];

interface OrderData {
  orderNumber: string;
  checkoutData: CheckoutData;
  cart: CartState;
}

export async function POST(request: NextRequest) {
  try {
    const orderData: OrderData = await request.json();
    
    // Generar mensaje para Telegram
    const message = generateTelegramMessage(orderData);
    
    // Enviar mensaje a todos los destinatarios
    const results = await Promise.all(
      TELEGRAM_RECIPIENTS.map(recipient => sendTelegramMessage(message, recipient))
    );
    
    // Guardar pedido en la base de datos del POS
    await savePedidoToDatabase(orderData);

    // Verificar que al menos uno fue exitoso
    const allSuccessful = results.every(response => response.ok);
    const anySuccessful = results.some(response => response.ok);
    
    if (anySuccessful) {
      console.log(`✅ Notificación enviada a ${results.filter(r => r.ok).length}/${TELEGRAM_RECIPIENTS.length} destinatarios`);
      return NextResponse.json({ 
        success: true, 
        message: 'Pedido enviado exitosamente',
        orderNumber: orderData.orderNumber,
        recipientsNotified: results.filter(r => r.ok).length
      });
    } else {
      throw new Error('Failed to send message to any Telegram recipient');
    }
    
  } catch (error) {
    console.error('Error sending order to Telegram:', error);
    return NextResponse.json(
      { success: false, message: 'Error al enviar el pedido' },
      { status: 500 }
    );
  }
}

function generateTelegramMessage(orderData: OrderData): string {
  const { orderNumber, checkoutData, cart } = orderData;
  
  // Calcular costo de envío
  const shippingCost = checkoutData.delivery.type === 'delivery' ? 30 : 0;
  const totalWithShipping = cart.total + shippingCost;
  
  // Obtener tiempo estimado usando zona horaria de CDMX
  const getEstimatedTime = (deliveryType: 'pickup' | 'delivery') => {
    const now = new Date();
    const minutes = deliveryType === 'pickup' ? 30 : 45; // 30 min para pickup, 45 min para delivery
    const estimatedTime = new Date(now.getTime() + minutes * 60000);
    return estimatedTime.toLocaleTimeString('es-MX', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/Mexico_City'
    });
  };

  const estimatedTime = getEstimatedTime(checkoutData.delivery.type);
  
  // Obtener fecha y hora actual en zona horaria de CDMX
  const now = new Date();
  const orderDateTime = now.toLocaleString('es-MX', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Mexico_City'
  });
  
  let message = `🍣 *NUEVO PEDIDO - MAZUHI SUSHI*\n\n`;
  message += `📋 *Número de Orden:* ${orderNumber}\n`;
  message += `📅 *Fecha:* ${orderDateTime}\n\n`;
  
  // Información del cliente
  message += `👤 *DATOS DEL CLIENTE*\n`;
  message += `• Nombre: ${checkoutData.contact.name}\n`;
  message += `• Teléfono: ${checkoutData.contact.phone}\n\n`;
  
  // Tipo de entrega
  message += `🚚 *ENTREGA*\n`;
  if (checkoutData.delivery.type === 'pickup') {
    message += `• Tipo: Recojo en tienda\n`;
    message += `• Tiempo estimado: ${estimatedTime}\n`;
  } else {
    message += `• Tipo: Delivery\n`;
    message += `• Dirección: ${checkoutData.delivery.address || 'No especificada'}\n`;
    // message += `• Referencias: ${checkoutData.delivery.references || 'Ninguna'}\n`;
    message += `• Tiempo estimado: ${estimatedTime}\n`;
  }
  message += `\n`;
  
  // Método de pago
  message += `💳 *PAGO*\n`;
  if (checkoutData.payment.method === 'cash') {
    message += `• Método: Efectivo\n`;
    if (checkoutData.payment.exactChange) {
      message += `• ✅ Pago exacto: $${totalWithShipping.toFixed(2)}\n`;
    } else if (checkoutData.payment.cashAmount) {
      message += `• Paga con: $${checkoutData.payment.cashAmount.toFixed(2)}\n`;
      message += `• Cambio: $${(checkoutData.payment.cashAmount - totalWithShipping).toFixed(2)}\n`;
    }
  } else {
    message += `• Método: Tarjeta\n`;
  }
  message += `\n`;
  
  // Lista de productos
  message += `🍱 *PRODUCTOS ORDENADOS*\n`;
  cart.items.forEach((item, index) => {
    message += `${index + 1}. *${item.menuItem.nombre}*\n`;
    message += `   • Cantidad: ${item.quantity}\n`;
    message += `   • Precio unitario: $${item.menuItem.precio.toFixed(2)}\n`;
    message += `   • Subtotal: $${item.subtotal.toFixed(2)}\n`;
    
    // Agregar opciones si las hay
    if (item.options.complementos && item.options.complementos.length > 0) {
      message += `   • Complementos: ${item.options.complementos.map(c => c.name).join(', ')}\n`;
    }
    
    if (item.options.soya) {
      message += `   • Soya: ${item.options.soya.name}\n`;
    }
    
    if (item.options.comentarios) {
      message += `   • Comentarios: ${item.options.comentarios}\n`;
    }
    message += `\n`;
  });
  
  // Totales
  message += `💰 *RESUMEN*\n`;
  message += `• Subtotal: $${cart.total.toFixed(2)}\n`;
  if (shippingCost > 0) {
    message += `• Envío a domicilio: $${shippingCost.toFixed(2)}\n`;
  }
  message += `• *Total: $${totalWithShipping.toFixed(2)}*\n\n`;
  
  // Notas adicionales
  if (checkoutData.notes) {
    message += `📝 *NOTAS ADICIONALES*\n${checkoutData.notes}\n\n`;
  }
  
  message += `⏰ *Tiempo estimado de entrega: ${estimatedTime}*`;
  
  return message;
}

async function sendTelegramMessage(message: string, recipient: string) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: recipient,
      text: message,
      parse_mode: 'Markdown'
    }),
  });
  
  return response;
}

async function savePedidoToDatabase(orderData: OrderData) {
  try {
    const response = await fetch('http://localhost:3000/api/pedidos-web', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderNumber: orderData.orderNumber,
        clientName: orderData.checkoutData.contact.name,
        clientPhone: orderData.checkoutData.contact.phone,
        deliveryType: orderData.checkoutData.delivery.type,
        address: orderData.checkoutData.delivery.address,
        paymentMethod: orderData.checkoutData.payment.method,
        items: orderData.cart.items.map(item => ({
          nombre: item.menuItem.nombre,
          cantidad: item.quantity,
          precio: item.menuItem.precio,
          subtotal: item.subtotal,
          complementos: item.options.complementos?.map(c => c.name),
          soya: item.options.soya?.name,
          comentarios: item.options.comentarios
        })),
        total: orderData.cart.total,
        notes: orderData.checkoutData.notes
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Pedido guardado en BD: ${result.orderNumber}`);
    } else {
      console.error('Error guardando pedido en BD:', await response.text());
    }
  } catch (error) {
    console.error('Error al guardar pedido en BD:', error);
  }
}