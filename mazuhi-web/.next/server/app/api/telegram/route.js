"use strict";(()=>{var e={};e.id=5490,e.ids=[5490],e.modules={30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},52310:(e,t,o)=>{o.r(t),o.d(t,{headerHooks:()=>p,originalPathname:()=>g,requestAsyncStorage:()=>d,routeModule:()=>m,serverHooks:()=>l,staticGenerationAsyncStorage:()=>c,staticGenerationBailout:()=>u});var a={};o.r(a),o.d(a,{POST:()=>POST});var r=o(10884),i=o(16132),n=o(95798);let s=["-4993108536","@frreeemaan"];async function POST(e){try{let t=await e.json(),o=generateTelegramMessage(t),a=await Promise.all(s.map(e=>sendTelegramMessage(o,e)));await savePedidoToDatabase(t),a.every(e=>e.ok);let r=a.some(e=>e.ok);if(r)return console.log(`✅ Notificaci\xf3n enviada a ${a.filter(e=>e.ok).length}/${s.length} destinatarios`),n.Z.json({success:!0,message:"Pedido enviado exitosamente",orderNumber:t.orderNumber,recipientsNotified:a.filter(e=>e.ok).length});throw Error("Failed to send message to any Telegram recipient")}catch(e){return console.error("Error sending order to Telegram:",e),n.Z.json({success:!1,message:"Error al enviar el pedido"},{status:500})}}function generateTelegramMessage(e){let{orderNumber:t,checkoutData:o,cart:a}=e,r="delivery"===o.delivery.type?30:0,i=a.total+r,n=(e=>{let t=new Date,o=new Date(t.getTime()+6e4*("pickup"===e?30:45));return o.toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit",hour12:!0,timeZone:"America/Mexico_City"})})(o.delivery.type),s=new Date,m=s.toLocaleString("es-MX",{year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit",hour12:!0,timeZone:"America/Mexico_City"}),d=`🍣 *NUEVO PEDIDO - MAZUHI SUSHI*

`;return d+=`📋 *N\xfamero de Orden:* ${t}
📅 *Fecha:* ${m}

👤 *DATOS DEL CLIENTE*
• Nombre: ${o.contact.name}
• Tel\xe9fono: ${o.contact.phone}

🚚 *ENTREGA*
`,"pickup"===o.delivery.type?d+=`• Tipo: Recojo en tienda
• Tiempo estimado: ${n}
`:d+=`• Tipo: Delivery
• Direcci\xf3n: ${o.delivery.address||"No especificada"}
• Tiempo estimado: ${n}
`,d+=`
💳 *PAGO*
`,"cash"===o.payment.method?(d+=`• M\xe9todo: Efectivo
`,o.payment.exactChange?d+=`• ✅ Pago exacto: $${i.toFixed(2)}
`:o.payment.cashAmount&&(d+=`• Paga con: $${o.payment.cashAmount.toFixed(2)}
• Cambio: $${(o.payment.cashAmount-i).toFixed(2)}
`)):d+=`• M\xe9todo: Tarjeta
`,d+=`
🍱 *PRODUCTOS ORDENADOS*
`,a.items.forEach((e,t)=>{d+=`${t+1}. *${e.menuItem.nombre}*
   • Cantidad: ${e.quantity}
   • Precio unitario: $${e.menuItem.precio.toFixed(2)}
   • Subtotal: $${e.subtotal.toFixed(2)}
`,e.options.complementos&&e.options.complementos.length>0&&(d+=`   • Complementos: ${e.options.complementos.map(e=>e.name).join(", ")}
`),e.options.soya&&(d+=`   • Soya: ${e.options.soya.name}
`),e.options.comentarios&&(d+=`   • Comentarios: ${e.options.comentarios}
`),d+=`
`}),d+=`💰 *RESUMEN*
• Subtotal: $${a.total.toFixed(2)}
`,r>0&&(d+=`• Env\xedo a domicilio: $${r.toFixed(2)}
`),d+=`• *Total: $${i.toFixed(2)}*

`,o.notes&&(d+=`📝 *NOTAS ADICIONALES*
${o.notes}

`),d+=`⏰ *Tiempo estimado de entrega: ${n}*`}async function sendTelegramMessage(e,t){let o=await fetch("https://api.telegram.org/bot8512401816:AAEeo4ZWu8NL2AvNrz18U8OUNPU1v8eOWuU/sendMessage",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:t,text:e,parse_mode:"Markdown"})});return o}async function savePedidoToDatabase(e){try{let t=await fetch("http://localhost:3000/pos/api/pedidos-web",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({orderNumber:e.orderNumber,clientName:e.checkoutData.contact.name,clientPhone:e.checkoutData.contact.phone,deliveryType:e.checkoutData.delivery.type,address:e.checkoutData.delivery.address,paymentMethod:e.checkoutData.payment.method,items:e.cart.items.map(e=>({nombre:e.menuItem.nombre,cantidad:e.quantity,precio:e.menuItem.precio,subtotal:e.subtotal,complementos:e.options.complementos?.map(e=>e.name),soya:e.options.soya?.name,comentarios:e.options.comentarios})),total:e.cart.total,notes:e.checkoutData.notes})});if(t.ok){let e=await t.json();console.log(`✅ Pedido guardado en BD: ${e.orderNumber}`)}else console.error("Error guardando pedido en BD:",await t.text())}catch(e){console.error("Error al guardar pedido en BD:",e)}}let m=new r.AppRouteRouteModule({definition:{kind:i.x.APP_ROUTE,page:"/api/telegram/route",pathname:"/api/telegram",filename:"route",bundlePath:"app/api/telegram/route"},resolvedPagePath:"/var/www/mazuhi-web/src/app/api/telegram/route.ts",nextConfigOutput:"",userland:a}),{requestAsyncStorage:d,staticGenerationAsyncStorage:c,serverHooks:l,headerHooks:p,staticGenerationBailout:u}=m,g="/api/telegram/route"}};var t=require("../../../webpack-runtime.js");t.C(e);var __webpack_exec__=e=>t(t.s=e),o=t.X(0,[1997],()=>__webpack_exec__(52310));module.exports=o})();