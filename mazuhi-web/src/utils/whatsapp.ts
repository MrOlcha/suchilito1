import { CheckoutData } from '@/types/checkout';
import { CartState } from '@/types/cart';

export const WHATSAPP_NUMBER = '+524421455624';

export const formatPhoneForWhatsApp = (phone: string) => {
  const numbers = phone.replace(/\D/g, '');
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
};

export const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${timestamp}${random}`;
};

export const getEstimatedTime = (deliveryType: 'pickup' | 'delivery') => {
  const now = new Date();
  const minutes = deliveryType === 'pickup' ? 20 : 45;
  const estimatedTime = new Date(now.getTime() + minutes * 60000);
  return estimatedTime.toLocaleTimeString('es-MX', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
};

export const generateWhatsAppMessage = (
  orderData: CheckoutData, 
  cart: CartState, 
  orderNumber: string
): string => {
  const estimatedTime = getEstimatedTime(orderData.delivery.type);
  const formattedPhone = formatPhoneForWhatsApp(orderData.contact.phone);
  
  // Construir lista de productos
  let productsList = '';
  cart.items.forEach((item, index) => {
    productsList += `\n${index + 1}. *${item.menuItem.nombre}* - $${item.subtotal.toFixed(2)}`;
    
    // Agregar opciones si las hay
    if (item.options.complementos && item.options.complementos.length > 0) {
      productsList += `\n   - Complementos: ${item.options.complementos.map(c => c.name).join(', ')}`;
    }
    
    if (item.options.soya) {
      productsList += `\n   - Soya: ${item.options.soya.name}`;
    }
    
    if (item.options.cubiertos) {
      productsList += `\n   - Cubiertos: ${item.options.cubiertos.name}`;
    }
    
    if (item.options.comentarios && item.options.comentarios.trim()) {
      productsList += `\n   - Comentarios: ${item.options.comentarios}`;
    }
  });

  // Construir mensaje completo
  const message = `*NUEVO PEDIDO - SUSHI RESTAURANT*

*Orden #${orderNumber}*
Fecha: ${new Date().toLocaleDateString('es-MX', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}
Hora: ${new Date().toLocaleTimeString('es-MX', { 
  hour: '2-digit', 
  minute: '2-digit',
  hour12: true 
})}

*INFORMACION DEL CLIENTE:*
- Nombre: ${orderData.contact.name}
- Telefono: ${formattedPhone}

*METODO DE ENTREGA:*
- Tipo: ${orderData.delivery.type === 'pickup' ? 'Recoger en Sucursal' : 'Delivery a Domicilio'}${orderData.delivery.address ? `\n- Direccion: ${orderData.delivery.address}` : ''}
- Tiempo estimado: ${orderData.delivery.type === 'pickup' ? '15-20 minutos' : '30-45 minutos'}
- Listo aprox. a las: *${estimatedTime}*

*METODO DE PAGO:*
- ${orderData.payment.method === 'cash' ? (
  `Efectivo${orderData.payment.cashAmount ? ` - Paga con $${orderData.payment.cashAmount.toFixed(2)} - Cambio: $${(orderData.payment.cashAmount - cart.total).toFixed(2)}` : ''}`
) : 'Tarjeta de Credito/Debito'}

*PRODUCTOS ORDENADOS:*${productsList}

*TOTAL: $${cart.total.toFixed(2)}*
${orderData.notes && orderData.notes.trim() ? `\n*Notas adicionales:* ${orderData.notes}` : ''}

Gracias por elegirnos!`;

  return message;
};

export const openWhatsApp = (message: string) => {
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}?text=${encodedMessage}`;
  
  // Abrir en una nueva ventana/pestaña
  window.open(whatsappUrl, '_blank');
};