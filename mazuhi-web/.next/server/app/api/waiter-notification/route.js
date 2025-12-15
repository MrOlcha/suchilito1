"use strict";(()=>{var e={};e.id=6458,e.ids=[6458],e.modules={30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},3266:(e,t,i)=>{i.r(t),i.d(t,{headerHooks:()=>d,originalPathname:()=>g,requestAsyncStorage:()=>l,routeModule:()=>c,serverHooks:()=>p,staticGenerationAsyncStorage:()=>u,staticGenerationBailout:()=>m});var o={};i.r(o),i.d(o,{POST:()=>POST});var a=i(10884),n=i(16132),r=i(95798);let s=["-4993108536","@frreeemaan"];async function POST(e){try{let{cart:t,tableNumber:i,isParaLlevar:o,isWaiterOrder:a}=await e.json();console.log("\uD83D\uDCE5 Recibida solicitud de notificaci\xf3n de mesero:",{tableNumber:i,isParaLlevar:o,itemCount:t.itemCount});let n=a?generateWaiterOrderMessage(t,i,o):generateWaiterMessage(t);console.log("\uD83D\uDCDD Mensaje generado, enviando a",s.length,"destinatarios");let c=await Promise.all(s.map(e=>(console.log(`📤 Enviando a destinatario: ${e}`),sendTelegramMessage(n,e)))),l=c.filter(e=>e.ok).length;if(console.log(`✅ Env\xedo completado: ${l}/${s.length} exitosos`),l>0)return r.Z.json({success:!0,message:"Notificaci\xf3n de mesero enviada exitosamente",recipientsNotified:l});throw Error("Failed to send message to any Telegram recipient")}catch(e){return console.error("❌ Error sending waiter notification:",e),r.Z.json({success:!1,message:String(e)||"Error al enviar notificaci\xf3n"},{status:500})}}function generateWaiterOrderMessage(e,t,i){let o=new Date,a=o.toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit",hour12:!0,timeZone:"America/Mexico_City"}),n=`🍽️ *PEDIDO DE MESERO*

`;return n+=`⏰ *Hora:* ${a}
📍 *Mesa:* ${t||"Sin especificar"}
`,i&&(n+=`🛍️ *PARA LLEVAR*
`),n+=`
🍱 *PRODUCTOS*
━━━━━━━━━━━━━━━━━━━━
`,e.items.forEach((e,t)=>{if(n+=`${t+1}. *${e.menuItem.nombre}* x${e.quantity}
`,e.specialOptions){let t=[];e.specialOptions.conChile&&t.push("Con Chile"),e.specialOptions.picosillo&&t.push("Picosillo"),e.specialOptions.notar&&t.push(`Nota: ${e.specialOptions.notar}`),t.length>0&&(n+=`   📝 ${t.join(" • ")}
`)}n+=`   💵 $${e.subtotal.toFixed(2)}
`}),n+=`━━━━━━━━━━━━━━━━━━━━
💰 *TOTAL: $${e.total.toFixed(2)}*
📦 *Productos: ${e.itemCount}*

✅ *PREPARAR PEDIDO*`}function generateWaiterMessage(e){let t=new Date,i=t.toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit",hour12:!0,timeZone:"America/Mexico_City"}),o=`🚨 *NOTIFICACI\xd3N PARA MESERO*

`;return o+=`⏰ *Hora:* ${i}

🍱 *PRODUCTOS EN CARRITO*
`,e.items.forEach((e,t)=>{if(o+=`${t+1}. *${e.menuItem.nombre}*
   • Cantidad: ${e.quantity}
   • Precio: $${e.menuItem.precio.toFixed(2)} c/u
`,e.specialOptions){let t=[];e.specialOptions.conChile&&t.push("Con Chile"),e.specialOptions.picosillo&&t.push("Picosillo"),e.specialOptions.notar&&t.push(`Nota: ${e.specialOptions.notar}`),t.length>0&&(o+=`   • Opciones: ${t.join(", ")}
`)}o+=`
`}),o+=`💰 *TOTAL: $${e.total.toFixed(2)}*

⚠️ *CLIENTE EST\xc1 EN EL MOSTRADOR - COMPLETAR COMPRA*`}async function sendTelegramMessage(e,t){try{let i=await fetch("https://api.telegram.org/bot8512401816:AAEeo4ZWu8NL2AvNrz18U8OUNPU1v8eOWuU/sendMessage",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:t,text:e,parse_mode:"Markdown"})});return console.log(`📨 Respuesta de Telegram para ${t}:`,i.status,i.statusText),i}catch(e){return console.error(`❌ Error enviando a ${t}:`,e),new Response(null,{status:500})}}let c=new a.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/api/waiter-notification/route",pathname:"/api/waiter-notification",filename:"route",bundlePath:"app/api/waiter-notification/route"},resolvedPagePath:"/var/www/mazuhi-web/src/app/api/waiter-notification/route.ts",nextConfigOutput:"",userland:o}),{requestAsyncStorage:l,staticGenerationAsyncStorage:u,serverHooks:p,headerHooks:d,staticGenerationBailout:m}=c,g="/api/waiter-notification/route"}};var t=require("../../../webpack-runtime.js");t.C(e);var __webpack_exec__=e=>t(t.s=e),i=t.X(0,[1997],()=>__webpack_exec__(3266));module.exports=i})();