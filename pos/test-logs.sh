#!/bin/bash

# Script para generar logs y errores de prueba en Jhaycorp Logs
# Ejecutar: bash test-logs.sh

API_URL="http://localhost:3000/pos/api"
MESERO_ID=1

echo "🚀 Iniciando pruebas de logs para Jhaycorp Logs..."
echo ""

# Test 1: Pedido válido
echo "1️⃣ Creando pedido válido..."
curl -X POST "$API_URL/pedidos" \
  -H "Content-Type: application/json" \
  -d '{
    "mesero_id": 1,
    "mesa_numero": "1",
    "comensales": 2,
    "es_para_llevar": false,
    "items": [
      {
        "producto_nombre": "Hamburguesa",
        "cantidad": 2,
        "precio_unitario": 150,
        "especificaciones": "Sin cebolla"
      }
    ],
    "total": 300
  }' 2>/dev/null | jq '.'
echo ""

# Test 2: Pedido con datos incompletos (error)
echo "2️⃣ Intentando crear pedido sin mesa (debe fallar)..."
curl -X POST "$API_URL/pedidos" \
  -H "Content-Type: application/json" \
  -d '{
    "mesero_id": 1,
    "comensales": 2,
    "items": [
      {"producto_nombre": "Pizza", "cantidad": 1, "precio_unitario": 200}
    ],
    "total": 200
  }' 2>/dev/null | jq '.'
echo ""

# Test 3: Pedido con mesero inválido (error)
echo "3️⃣ Intentando crear pedido con mesero inexistente (debe fallar)..."
curl -X POST "$API_URL/pedidos" \
  -H "Content-Type: application/json" \
  -d '{
    "mesero_id": 99999,
    "mesa_numero": "5",
    "comensales": 1,
    "items": [
      {"producto_nombre": "Ensalada", "cantidad": 1, "precio_unitario": 100}
    ],
    "total": 100
  }' 2>/dev/null | jq '.'
echo ""

# Test 4: Obtener pedidos (debería mostrar los creados)
echo "4️⃣ Obteniendo lista de pedidos..."
curl -X GET "$API_URL/pedidos" 2>/dev/null | jq '.[] | {id, numero_pedido, mesa_numero, total}'
echo ""

# Test 5: Crear para llevar
echo "5️⃣ Creando pedido para llevar..."
curl -X POST "$API_URL/pedidos" \
  -H "Content-Type: application/json" \
  -d '{
    "mesero_id": 1,
    "mesa_numero": "PL-'$(date +%s)'",
    "comensales": 1,
    "es_para_llevar": true,
    "items": [
      {
        "producto_nombre": "Pollo frito",
        "cantidad": 1,
        "precio_unitario": 250
      }
    ],
    "total": 250
  }' 2>/dev/null | jq '.'
echo ""

echo "✅ Pruebas completadas!"
echo ""
echo "📊 Para ver los logs en Jhaycorp Logs, accede a:"
echo "   https://operacion.mazuhi.com/pos/monitoring"
echo ""
