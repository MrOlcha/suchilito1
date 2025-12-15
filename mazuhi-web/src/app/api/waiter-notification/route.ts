import { NextRequest, NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = '8512401816:AAEeo4ZWu8NL2AvNrz18U8OUNPU1v8eOWuU';

// Lista de usuarios/chats a los que se envían las notificaciones de mesero
const TELEGRAM_RECIPIENTS = [
  '-4993108536',      // Grupo principal de Mazuhi
  '@frreeemaan',      // Usuario individual para Freeman
];

interface MenuItem {
  nombre: string;
  precio: number;
  descripcion?: string;
}

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  subtotal: number;
  specialOptions?: {
    conChile?: boolean;
    picosillo?: boolean;
    notar?: string;
  };
}

interface WaiterNotificationRequest {
  cart: {
    items: CartItem[];
    total: number;
    itemCount: number;
  };
  tableNumber?: string;
  isParaLlevar?: boolean;
  isWaiterOrder?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const { cart, tableNumber, isParaLlevar, isWaiterOrder }: WaiterNotificationRequest = await request.json();
    
    console.log('📥 Recibida solicitud de notificación de mesero:', { tableNumber, isParaLlevar, itemCount: cart.itemCount });
    
    // Generar mensaje para notificación de mesero
    const message = isWaiterOrder 
      ? generateWaiterOrderMessage(cart, tableNumber, isParaLlevar)
      : generateWaiterMessage(cart);
    
    console.log('📝 Mensaje generado, enviando a', TELEGRAM_RECIPIENTS.length, 'destinatarios');
    
    // Enviar mensaje a todos los destinatarios
    const results = await Promise.all(
      TELEGRAM_RECIPIENTS.map(recipient => {
        console.log(`📤 Enviando a destinatario: ${recipient}`);
        return sendTelegramMessage(message, recipient);
      })
    );
    
    // Verificar que al menos uno fue exitoso
    const successCount = results.filter(r => r.ok).length;
    console.log(`✅ Envío completado: ${successCount}/${TELEGRAM_RECIPIENTS.length} exitosos`);
    
    if (successCount > 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Notificación de mesero enviada exitosamente',
        recipientsNotified: successCount
      });
    } else {
      throw new Error('Failed to send message to any Telegram recipient');
    }
    
  } catch (error) {
    console.error('❌ Error sending waiter notification:', error);
    return NextResponse.json(
      { success: false, message: String(error) || 'Error al enviar notificación' },
      { status: 500 }
    );
  }
}

function generateWaiterOrderMessage(cart: { items: CartItem[]; total: number; itemCount: number }, tableNumber?: string, isParaLlevar?: boolean): string {
  const now = new Date();
  const currentTime = now.toLocaleTimeString('es-MX', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Mexico_City'
  });

  let message = `🍽️ *PEDIDO DE MESERO*\n\n`;
  message += `⏰ *Hora:* ${currentTime}\n`;
  message += `📍 *Mesa:* ${tableNumber || 'Sin especificar'}\n`;
  if (isParaLlevar) {
    message += `🛍️ *PARA LLEVAR*\n`;
  }
  message += `\n🍱 *PRODUCTOS*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n`;
  
  cart.items.forEach((item, index) => {
    message += `${index + 1}. *${item.menuItem.nombre}* x${item.quantity}\n`;
    
    // Mostrar opciones especiales si las hay
    if (item.specialOptions) {
      const opts = [];
      if (item.specialOptions.conChile) opts.push('Con Chile');
      if (item.specialOptions.picosillo) opts.push('Picosillo');
      if (item.specialOptions.notar) opts.push(`Nota: ${item.specialOptions.notar}`);
      if (opts.length > 0) {
        message += `   📝 ${opts.join(' • ')}\n`;
      }
    }
    
    message += `   💵 $${item.subtotal.toFixed(2)}\n`;
  });
  
  message += `━━━━━━━━━━━━━━━━━━━━\n`;
  message += `💰 *TOTAL: $${cart.total.toFixed(2)}*\n`;
  message += `📦 *Productos: ${cart.itemCount}*\n\n`;
  message += `✅ *PREPARAR PEDIDO*`;
  
  return message;
}

function generateWaiterMessage(cart: { items: CartItem[]; total: number; itemCount: number }): string {
  const now = new Date();
  const currentTime = now.toLocaleTimeString('es-MX', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Mexico_City'
  });

  let message = `🚨 *NOTIFICACIÓN PARA MESERO*\n\n`;
  message += `⏰ *Hora:* ${currentTime}\n\n`;
  
  message += `🍱 *PRODUCTOS EN CARRITO*\n`;
  cart.items.forEach((item, index) => {
    message += `${index + 1}. *${item.menuItem.nombre}*\n`;
    message += `   • Cantidad: ${item.quantity}\n`;
    message += `   • Precio: $${item.menuItem.precio.toFixed(2)} c/u\n`;
    
    if (item.specialOptions) {
      const opts = [];
      if (item.specialOptions.conChile) opts.push('Con Chile');
      if (item.specialOptions.picosillo) opts.push('Picosillo');
      if (item.specialOptions.notar) opts.push(`Nota: ${item.specialOptions.notar}`);
      if (opts.length > 0) {
        message += `   • Opciones: ${opts.join(', ')}\n`;
      }
    }
    message += `\n`;
  });
  
  message += `💰 *TOTAL: $${cart.total.toFixed(2)}*\n\n`;
  message += `⚠️ *CLIENTE ESTÁ EN EL MOSTRADOR - COMPLETAR COMPRA*`;
  
  return message;
}

async function sendTelegramMessage(message: string, recipient: string) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  try {
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
    
    console.log(`📨 Respuesta de Telegram para ${recipient}:`, response.status, response.statusText);
    return response;
  } catch (error) {
    console.error(`❌ Error enviando a ${recipient}:`, error);
    return new Response(null, { status: 500 });
  }
}
