/**
 * Script para generar logs y errores de prueba en Jhaycorp Logs
 * Ejecutar: node generate-test-logs.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000/pos/api';

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(responseData),
          });
        } catch {
          resolve({
            status: res.statusCode,
            data: responseData,
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function generateTestLogs() {
  console.log('🚀 Iniciando generación de logs de prueba...\n');

  try {
    // Test 1: Crear pedidos exitosos
    console.log('📝 Test 1: Creando pedidos exitosos...');
    for (let i = 1; i <= 3; i++) {
      const result = await makeRequest('POST', '/pedidos', {
        mesero_id: 1,
        mesa_numero: `Mesa-${i}`,
        comensales: Math.floor(Math.random() * 4) + 1,
        es_para_llevar: i % 2 === 0,
        items: [
          {
            producto_nombre: `Producto Test ${i}`,
            cantidad: i,
            precio_unitario: 100 * i,
            especificaciones: i === 2 ? 'Sin cebolla' : '',
          },
        ],
        total: 100 * i,
      });

      console.log(`   ✅ Pedido ${i}: ${result.data.pedido?.numero_pedido || 'Error'}`);
      await new Promise((r) => setTimeout(r, 500));
    }

    // Test 2: Error - Datos incompletos
    console.log('\n⚠️ Test 2: Intentando crear pedido sin mesa (error esperado)...');
    const errorTest1 = await makeRequest('POST', '/pedidos', {
      mesero_id: 1,
      comensales: 2,
      items: [{ producto_nombre: 'Test', cantidad: 1, precio_unitario: 100 }],
      total: 100,
    });
    console.log(`   ❌ Resultado: ${errorTest1.data.message}`);
    await new Promise((r) => setTimeout(r, 500));

    // Test 3: Error - Mesero inválido
    console.log('\n⚠️ Test 3: Intentando crear pedido con mesero inexistente...');
    const errorTest2 = await makeRequest('POST', '/pedidos', {
      mesero_id: 99999,
      mesa_numero: 'Error-Mesa',
      items: [{ producto_nombre: 'Test', cantidad: 1, precio_unitario: 100 }],
      total: 100,
    });
    console.log(`   ❌ Resultado: ${errorTest2.data.message}`);
    await new Promise((r) => setTimeout(r, 500));

    // Test 4: Obtener lista de pedidos
    console.log('\n📋 Test 4: Obteniendo lista de pedidos...');
    const listResult = await makeRequest('GET', '/pedidos');
    console.log(`   ✅ Total de pedidos obtenidos: ${listResult.data.length || 0}`);

    // Test 5: Crear pedido para llevar
    console.log('\n📦 Test 5: Creando pedido para llevar...');
    const takeawayResult = await makeRequest('POST', '/pedidos', {
      mesero_id: 1,
      mesa_numero: `PL-${Date.now()}`,
      comensales: 1,
      es_para_llevar: true,
      items: [
        {
          producto_nombre: 'Pollo frito para llevar',
          cantidad: 2,
          precio_unitario: 250,
        },
      ],
      total: 500,
    });
    console.log(`   ✅ Pedido para llevar: ${takeawayResult.data.pedido?.numero_pedido || 'Error'}`);

    console.log('\n✅ Generación de logs completada!\n');
    console.log(
      '📊 Accede a Jhaycorp Logs para ver los logs y errores:\n' +
        '   🌐 https://operacion.mazuhi.com/pos/monitoring\n' +
        '   🌐 https://operacion.mazuhi.com/pos/reports\n'
    );
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Ejecutar
generateTestLogs().then(() => {
  process.exit(0);
});
