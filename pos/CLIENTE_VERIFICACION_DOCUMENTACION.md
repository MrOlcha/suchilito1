# 🎉 Sistema de Registro y Verificación de Clientes - Documentación

## 📋 Resumen Ejecutivo

Se ha implementado un sistema completo de **registro de clientes con verificación de email por SMTP**. Los usuarios deben proporcionar su nombre y verificar su correo electrónico antes de completar el registro.

**Fecha de Implementación**: 14 de Diciembre, 2025
**Estado**: ✅ Producción (Online y Estable)

---

## 🗂️ Cambios en la Base de Datos

### Tabla: `clientes_web`

Se agregaron 4 nuevas columnas:

```sql
ALTER TABLE clientes_web ADD COLUMN nombre TEXT DEFAULT '';
ALTER TABLE clientes_web ADD COLUMN email_verificado INTEGER DEFAULT 0;
ALTER TABLE clientes_web ADD COLUMN codigo_verificacion TEXT;
ALTER TABLE clientes_web ADD COLUMN fecha_verificacion DATETIME;
```

**Campos Completos**:
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INTEGER PRIMARY KEY | ID único |
| `nombre` | TEXT | Nombre completo del cliente |
| `telefono` | TEXT UNIQUE | Teléfono (único) |
| `correo` | TEXT | Email del cliente |
| `fecha_nacimiento` | TEXT | DD/MM (sin año) |
| `email_verificado` | INTEGER | 0=No verificado, 1=Verificado |
| `codigo_verificacion` | TEXT | Código temporal (6 caracteres) |
| `fecha_verificacion` | DATETIME | Fecha de expiración del código |
| `fecha_registro` | DATETIME | Fecha de registro |
| `ultima_orden` | DATETIME | Última orden realizada |

---

## 🔌 Nuevos Endpoints API

### 1. Enviar Código de Verificación

**URL**: `POST /pos/api/clientes/send-verification`

**Descripción**: Envía un código de 6 caracteres por email SMTP

**Parámetros**:
```json
{
  "correo": "usuario@example.com",
  "nombre": "Juan Pérez"
}
```

**Respuesta (200):**
```json
{
  "message": "Código de verificación enviado a tu correo",
  "success": true
}
```

**Proceso**:
1. Genera código aleatorio de 6 dígitos
2. Guarda en BD con expiración de 10 minutos
3. Envía email con código por SMTP (verificacion@mazuhi.com)
4. Email incluye HTML con formato amigable

---

### 2. Verificar Código

**URL**: `POST /pos/api/clientes/verify-code`

**Descripción**: Valida el código y marca email como verificado

**Parámetros**:
```json
{
  "correo": "usuario@example.com",
  "codigo": "ABC123"
}
```

**Respuesta (200):**
```json
{
  "message": "Email verificado exitosamente",
  "success": true,
  "cliente_id": 2
}
```

**Validaciones**:
- Código debe coincidir exactamente
- Código no debe haber expirado
- Cliente debe existir en BD

**Error (400)**:
```json
{
  "message": "El código de verificación ha expirado"
}
```

---

### 3. Registrar/Actualizar Cliente

**URL**: `POST /pos/api/clientes`

**Descripción**: Registra un nuevo cliente en la BD

**Parámetros**:
```json
{
  "nombre": "Juan Pérez",
  "telefono": "5551234567",
  "correo": "juan@example.com",
  "fecha_nacimiento": "15/03"
}
```

**Respuesta (200):**
```json
{
  "message": "Cliente registrado exitosamente",
  "id": 2,
  "success": true
}
```

---

### 4. Obtener, Editar, Eliminar Cliente

**URL**: `GET/PUT/DELETE /pos/api/clientes/[id]`

**GET** - Obtener cliente:
```bash
curl http://localhost:3000/pos/api/clientes/2
```

**PUT** - Actualizar cliente:
```json
{
  "nombre": "Juan Carlos Pérez López",
  "telefono": "5551234567",
  "correo": "juan@example.com",
  "fecha_nacimiento": "15/03"
}
```

**DELETE** - Eliminar cliente:
```bash
curl -X DELETE http://localhost:3000/pos/api/clientes/2
```

---

## 🎨 Frontend - Cambios en Registro

### RegisterModal.tsx - Nuevo Flujo de 3 Pasos

#### **Paso 1: Registro**
Formulario con 4 campos obligatorios:
- **Nombre Completo** (Nuevo)
- **Teléfono**
- **Correo Electrónico**
- **Fecha de Nacimiento** (DD/MM)

**Validaciones**:
- Todos los campos son obligatorios
- Email debe contener @
- Día 1-31
- Mes 1-12

#### **Paso 2: Verificación**
- Usuario recibe código en su email
- Ingresa código de 6 caracteres
- Auto-mayúsculas
- Mensajes de error si código es inválido/expirado

#### **Paso 3: Éxito**
- Mensaje "¡Email Verificado! 🎉"
- Redirección automática al carrito

---

## 📧 Configuración SMTP

**Proveedor**: Hostinger

```
Host:        smtp.hostinger.com
Puerto:      465
Encriptación: SSL/TLS
Usuario:     verificacion@mazuhi.com
Contraseña:  MrOlcha12#01
```

**Email de Verificación**:
- Remitente: verificacion@mazuhi.com
- Asunto: "Verifica tu correo - Mazuhi Sushi"
- Formato: HTML personalizado con logo y código grande
- Código expira en 10 minutos

---

## 📊 Dashboard de Clientes

**URL**: `https://beta.mazuhi.com/pos/dashboard/clientes`

### Características

1. **Tabla Editable**
   - Columnas: Nombre, Teléfono, Correo, F. Nacimiento, Verificado, Registro
   - Modo vista normal
   - Modo edición en línea con botones Guardar/Cancelar

2. **Búsqueda**
   - Busca en: nombre, teléfono, correo
   - Búsqueda en tiempo real
   - Muestra cantidad de resultados

3. **Acciones**
   - ✏️ **Editar**: Modo edición en línea
   - 🗑️ **Eliminar**: Con confirmación
   - Indicador de verificación: ✓ Verificado / ⏳ Pendiente

4. **Estadísticas**
   - Total de clientes
   - Nuevos (últimos 7 días)
   - Nuevos (últimos 30 días)
   - Cumpleaños próximos (30 días)

---

## 🔄 Flujo Completo de Registro

```
┌─────────────────────────────────────┐
│ 1. Usuario abre modal de registro   │
└────────────────┬────────────────────┘
                 │
                 ▼
    ┌────────────────────────────┐
    │ 2. Ingresa datos:          │
    │    - Nombre                │
    │    - Teléfono              │
    │    - Email                 │
    │    - Cumpleaños            │
    └────────────┬───────────────┘
                 │
                 ▼
   ┌──────────────────────────────────┐
   │ 3. Sistema valida datos          │
   │    ✓ Campos completos            │
   │    ✓ Email válido                │
   │    ✓ Fecha válida                │
   └───────────┬──────────────────────┘
               │
               ▼
  ┌────────────────────────────────────┐
  │ 4. Guarda cliente en BD            │
  │    - clientes_web table            │
  │    - email_verificado = 0          │
  │    - Genera código random (6 dígitos)│
  └──────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ 5. Envía email con código SMTP       │
│    - De: verificacion@mazuhi.com     │
│    - A: correo del usuario           │
│    - Código expira en 10 minutos     │
└─────────────┬──────────────────────┘
              │
              ▼
 ┌──────────────────────────────────┐
 │ 6. Usuario recibe email y entra  │
 │    al Paso 2: Verificación       │
 │    - Ingresa código              │
 │    - Sistema valida              │
 │    - ¿Correcto? SÍ / NO          │
 └────────┬─────────────────────────┘
          │
  ┌───────┴────────┐
  │                │
  ▼                ▼
ÉXITO           ERROR
  │                │
  │ 7. Marca      │ Muestra
  │  email_       │ error
  │  verificado=1 │
  │                │
  ▼                │
PASO 3             │
Éxito             │
  │                │
  ▼                ▼
Usuario          Intenta
registrado       nuevamente
y verificado
```

---

## 🧪 Pruebas Realizadas

### ✅ Registro de Cliente
```bash
curl -X POST http://localhost:3000/pos/api/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "nombre":"Juan Pérez",
    "telefono":"5551234567",
    "correo":"juan@example.com",
    "fecha_nacimiento":"15/03"
  }'
```
**Resultado**: ✅ Cliente registrado exitosamente (id: 2)

### ✅ Envío de Código SMTP
```bash
curl -X POST http://localhost:3000/pos/api/clientes/send-verification \
  -H "Content-Type: application/json" \
  -d '{
    "correo":"juan@example.com",
    "nombre":"Juan Pérez"
  }'
```
**Resultado**: ✅ Código enviado (MTPKHU)

### ✅ Verificación de Código
```bash
curl -X POST http://localhost:3000/pos/api/clientes/verify-code \
  -H "Content-Type: application/json" \
  -d '{
    "correo":"juan@example.com",
    "codigo":"MTPKHU"
  }'
```
**Resultado**: ✅ Email verificado exitosamente

### ✅ Edición de Cliente
```bash
curl -X PUT http://localhost:3000/pos/api/clientes/2 \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Juan Carlos Pérez López"}'
```
**Resultado**: ✅ Cliente actualizado exitosamente

### ✅ Obtención de Clientes
```bash
curl http://localhost:3000/pos/api/clientes | jq .
```
**Resultado**: ✅ Retorna clientes con campo 'nombre' y 'email_verificado'

---

## 📦 Archivos Modificados/Creados

### Backend (POS)

#### Creados
- `/pos/app/api/clientes/[id]/route.ts` - CRUD individual
- `/pos/app/api/clientes/send-verification/route.ts` - Envío SMTP
- `/pos/app/api/clientes/verify-code/route.ts` - Verificación
- `/pos/app/dashboard/clientes/clientes-table.tsx` - Componente tabla

#### Actualizados
- `/pos/app/api/clientes/route.ts` - Incluye nombre en POST/GET
- `/pos/app/dashboard/clientes/page.tsx` - Integra nueva tabla

### Frontend (Web)

#### Refactorizados
- `/mazuhi-web/src/components/RegisterModal.tsx` - Nuevo flujo 3 pasos
- `/mazuhi-web/src/contexts/AuthContext.tsx` - Interface User + nombre

---

## 🔐 Seguridad

- ✅ Validación de entrada en todos los endpoints
- ✅ Códigos de verificación aleatorios (no predecibles)
- ✅ Expiración de códigos (10 minutos)
- ✅ HTTPS/SSL para SMTP
- ✅ Validación de teléfono duplicado
- ✅ Confirmación antes de eliminar

---

## 📈 Métricas de Éxito

| Métrica | Valor |
|---------|-------|
| Compilación POS | ✓ Exitosa |
| Compilación Web | ✓ Exitosa |
| Endpoints SMTP | ✓ 2/2 Funcionales |
| Dashboard Clientes | ✓ Completamente funcional |
| Edición en línea | ✓ Operativa |
| Búsqueda/Filtrado | ✓ Funcional |
| Memoria POS | 103.3 MB |
| Memoria Web | 11.3 MB |
| Uptime | ✓ Estable |

---

## 🚀 Próximos Pasos (Opcionales)

1. **Agregar confirmación de registro**
   - Enviar email de bienvenida después de verificar
   - Mostrar mensaje "Te has registrado exitosamente"

2. **Recuperar contraseña por email**
   - Implementar reset de password
   - Usar el mismo sistema SMTP

3. **Notificaciones por email**
   - Cuando se realiza una orden
   - Cuando se cambia el estado del pedido

4. **Analytics**
   - Rastrear tasa de conversión de registro
   - Tasa de verificación exitosa
   - Tiempo promedio entre registro y verificación

5. **Two-Factor Authentication (2FA)**
   - Usar el código de verificación existente
   - Implementar autenticación de dos factores

---

## 📞 Soporte Técnico

**Cualquier duda o reporte de bugs contactar a:**
- Email de sistema: verificacion@mazuhi.com
- Dashboard: https://beta.mazuhi.com/pos/dashboard/clientes

---

**Documentación actualizada**: 14 de Diciembre, 2025  
**Versión**: 1.0  
**Estado**: ✅ Producción
