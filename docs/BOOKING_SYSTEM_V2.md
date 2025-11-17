# Sistema de Reservas Simplificado - Flujo de Solicitudes

## 🎯 Concepto Principal

**Cambio de paradigma:** De un sistema de "disponibilidad preconfigurada" a un sistema de **"solicitudes de agendamiento"**.

### Antes:

-   Vendedor debía configurar fechas y horarios disponibles semanalmente
-   Cliente solo podía elegir entre opciones preconfiguradas
-   Más rigidez y mantenimiento

### Ahora:

-   Cliente puede solicitar **cualquier fecha y hora**
-   Vendedor **revisa y aprueba/rechaza** cada solicitud
-   Sistema más flexible y menos mantenimiento

---

## 🔄 Flujo del Sistema

### Para el Cliente:

1. **Solicitar servicio** (`/book-a-service`)

    - Selecciona cualquier fecha futura
    - Selecciona hora de inicio con time picker nativo (formato 24h)
    - La duración se acuerda con el vendedor (backend guarda 1h por defecto)
    - Envía solicitud (status: `pending`)
    - Recibe confirmación: "¡Solicitud enviada! El vendedor la revisará pronto"

2. **Ver mis reservas** (`/my-bookings`)
    - Lista todas sus solicitudes
    - Ve el estado: Pendiente ⏳ / Confirmada ✅ / Cancelada ❌
    - Resumen con contadores por estado

### Para el Vendedor (Owner):

1. **Ver solicitudes** (`/bookings-panel`)

    - Panel con todas las solicitudes recibidas
    - Ordenadas: pendientes primero
    - Información visible: cliente, fecha, hora, estado
    - Contadores: total y pendientes

2. **Gestionar solicitudes**

    - Botón "✅ Confirmar" → cambia status a `confirmed`
    - Botón "❌ Rechazar" → cambia status a `cancelled`
    - Pull-to-refresh para actualizar lista

3. **Configurar disponibilidad** (OPCIONAL - código backend preservado)
    - Puede seguir usando `/manage-availavility` si lo desea
    - El código antiguo se mantiene para uso futuro

---

## 📁 Archivos Modificados

### Frontend

#### 1. **`frontend/app/book-a-service.js`** (Reescrito)

**Cambios principales:**

-   ❌ Eliminado: `BookingCalendar` y `TimeSlotPicker`
-   ✅ Agregado: `DateTimePicker` directo (cualquier fecha futura)
-   ✅ Agregado: Time picker nativo (`@react-native-community/datetimepicker`)
-   ✅ Solo solicita hora de inicio (duración flexible)
-   ✅ Backend calcula end_time automáticamente (+1 hora por defecto)
-   ✅ Mensaje claro: "La duración del servicio se acordará con el vendedor"

**Props esperados:**

```javascript
{
    businessId, businessName
}
```

#### 2. **`frontend/app/bookings-panel.js`** (Nuevo)

**Funcionalidad:**

-   Panel exclusivo para vendedores
-   Lista de solicitudes con filtros por estado
-   Acciones: Confirmar / Rechazar
-   Refresh manual con pull-to-refresh
-   Estados visuales con badges de colores

**Props esperados:**

```javascript
{
    businessId, businessName
}
```

#### 3. **`frontend/app/my-bookings.js`** (Nuevo)

**Funcionalidad:**

-   Vista para clientes
-   Lista de sus propias reservas
-   Solo lectura (no puede cancelar desde aquí)
-   Resumen con contadores
-   Mensajes según estado

**Props esperados:**

-   Ninguno (usa el usuario autenticado)

#### 4. **`frontend/app/business-profile.js`** (Actualizado)

**Cambios:**

-   ✅ Botón principal para owner: "Ver Solicitudes de Reserva" → `/bookings-panel`
-   ✅ Botón secundario para owner: "Configurar Disponibilidad" → `/manage-availavility`
-   ✅ Botón para cliente: "Solicitar servicio" → `/book-a-service`

#### 5. **`frontend/api/booking-service.js`** (Actualizado)

**Nueva función:**

```javascript
export async function rejectBooking(bookingId) {
    // PATCH /bookings/{bookingId}/reject
}
```

### Backend

#### 6. **`backend/app/routers/bookings.py`** (Actualizado)

**Nuevo endpoint:**

```python
@router.patch("/{booking_id}/reject")
async def reject_booking(booking_id: str, current_user: TokenData)
```

**Funcionalidad:**

-   Verifica que el usuario sea owner del negocio
-   Cambia status de la reserva a `cancelled`
-   TODO: Enviar notificación al cliente (futuro)

**Endpoints existentes (PRESERVADOS):**

-   `POST /business/{business_id}/availability` - Configurar disponibilidad
-   `GET /business/{business_id}/availability/{year}/{month}` - Obtener disponibilidad
-   `GET /business/{business_id}/availability/date/{date}/slots` - Obtener slots
-   `POST /bookings/` - Crear reserva ✅ **Usado por nuevo flujo**
-   `PATCH /bookings/{booking_id}/confirm` - Confirmar ✅ **Usado por nuevo flujo**
-   `GET /bookings/my-bookings` - Mis reservas ✅ **Usado por nuevo flujo**
-   `GET /business/{business_id}/bookings` - Reservas del negocio ✅ **Usado por nuevo flujo**

---

## 🗄️ Estructura de Datos

### Colección: `bookings`

```javascript
{
  _id: ObjectId,
  business_id: string,
  client_id: string,
  date: string,           // "YYYY-MM-DD"
  start_time: string,     // "HH:MM"
  end_time: string,       // "HH:MM"
  status: string,         // "pending" | "confirmed" | "cancelled"
  created_at: datetime
}
```

### Estados posibles:

-   `pending` ⏳ - Solicitud enviada, esperando aprobación
-   `confirmed` ✅ - Aprobada por el vendedor
-   `cancelled` ❌ - Rechazada por el vendedor

---

## 🚀 Próximos Pasos (Sugerencias)

1. **Sistema de notificaciones**

    - Email/Push cuando solicitud es confirmada/rechazada
    - Email/Push al vendedor cuando recibe nueva solicitud
    - Implementar los TODOs en `bookings.py`

2. **Cancelación por cliente**

    - Agregar endpoint `PATCH /bookings/{booking_id}/cancel-by-client`
    - Botón en `/my-bookings` para cancelar reservas `pending`

3. **Información del negocio en `/my-bookings`**

    - Actualmente solo muestra `business_id`
    - Agregar query para obtener nombre del negocio

4. **Información del cliente en `/bookings-panel`**

    - Actualmente solo muestra `client_id`
    - Agregar query para obtener nombre del cliente

5. **Filtros y búsqueda**

    - En `/bookings-panel`: filtrar por estado, fecha
    - En `/my-bookings`: filtrar por estado

6. **Historial**
    - Archivar reservas antiguas
    - Vista separada de "Completadas"

---

## 💡 Ventajas del Nuevo Flujo

1. ✅ **Menos fricción** - No requiere configuración previa
2. ✅ **Más flexible** - Vendedor decide caso por caso
3. ✅ **Escalable** - Código más simple, menos complejidad
4. ✅ **Familiar** - Similar a WhatsApp Business / citas médicas
5. ✅ **Backend preservado** - Código antiguo disponible para futuro

---

## 📝 Notas de Implementación

-   El backend NO elimina código antiguo, solo agrega nuevo endpoint
-   Los componentes `BookingCalendar` y `TimeSlotPicker` se mantienen en el proyecto
-   La ruta `/manage-availavility` sigue funcionando para configuración avanzada
-   Todos los endpoints antiguos siguen operativos
-   **Nueva dependencia:** `@react-native-community/datetimepicker` para time picker nativo

---

## 🧪 Testing Sugerido

1. Como cliente:

    - Solicitar servicio con time picker nativo
    - Verificar hora se muestra en formato HH:MM
    - Ver mis reservas con hora de inicio clara
    - Confirmar que la duración no se solicita al cliente

2. Como vendedor:

    - Ver panel de solicitudes
    - Confirmar una solicitud
    - Rechazar una solicitud
    - Actualizar lista con pull-to-refresh

3. Edge cases:
    - Negocio sin solicitudes
    - Cliente sin reservas
    - Solicitudes del mismo día a diferentes horas
    - Validar permisos (solo owner puede confirmar/rechazar)
