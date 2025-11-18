# 🎯 Guía de Configuración del Sistema de Reservas

## ✅ Componentes ya implementados

### Backend

-   ✅ Router de bookings (`/backend/app/routers/bookings.py`)
-   ✅ Modelos de datos (`/backend/app/models/sellers.py`)
-   ✅ Endpoints configurados en `main.py`

### Frontend

-   ✅ Servicio de booking (`/frontend/api/booking-service.js`)
-   ✅ Pantalla de reservas para clientes (`/frontend/app/book-a-service.js`)
-   ✅ Pantalla de gestión para dueños (`/frontend/app/manage-availavility.js`)
-   ✅ Componente Calendar (`/frontend/components/calendar.js`)
-   ✅ Componente TimeSlotPicker (`/frontend/components/time-slot-picker.js`)
-   ✅ Botón condicional en perfil de negocio

## 📝 Pasos para probar el sistema

### 1. Verifica que el backend esté corriendo

```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

### 2. Verifica que el frontend esté corriendo

```bash
cd frontend
npm start
# o
npx expo start
```

### 3. Configurar disponibilidad (como dueño de negocio)

1. **Inicia sesión** con tu usuario dueño de negocio
2. **Ve a tu perfil** y selecciona uno de tus negocios
3. **Presiona "Gestionar Disponibilidad"** (botón rojo)
4. **Presiona "Agregar Disponibilidad"**
5. **Selecciona una fecha** en el calendario
6. **Agrega horarios:**
    - Ejemplo: 09:00 a 12:00
    - Ejemplo: 14:00 a 18:00
7. **Presiona "Guardar Disponibilidad"**

### 4. Hacer una reserva (como cliente)

1. **Inicia sesión** con otro usuario (cliente)
2. **Busca el negocio** que configuraste
3. **Abre el perfil del negocio**
4. **Presiona "Reservar servicio"** (botón verde)
5. **Selecciona una fecha disponible** (aparecerá en verde)
6. **Selecciona un horario disponible**
7. **Confirma la reserva**

### 5. Confirmar reserva (como dueño)

1. **Vuelve como dueño** del negocio
2. **Ve a "Gestionar Disponibilidad"**
3. **Verás la reserva en estado "Pendiente"**
4. **Presiona "Confirmar Reserva"**

## 🔍 Verificar en la base de datos

### Colecciones creadas automáticamente:

1. **`availability`** - Días y horarios disponibles

    ```json
    {
        "_id": "...",
        "business_id": "123",
        "date": "2025-11-20",
        "time_slots": [
            {
                "start_time": "09:00",
                "end_time": "12:00",
                "is_available": true
            }
        ],
        "max_concurrent_bookings": 1
    }
    ```

2. **`bookings`** - Reservas de clientes
    ```json
    {
        "_id": "...",
        "business_id": "123",
        "client_id": "456",
        "date": "2025-11-20",
        "start_time": "09:00",
        "end_time": "10:00",
        "status": "pending",
        "created_at": "2025-11-16T..."
    }
    ```

## 🐛 Problemas comunes

### "No hay días disponibles"

-   ✅ **Solución**: El dueño del negocio debe configurar disponibilidad primero
-   Ve a "Gestionar Disponibilidad" → "Agregar Disponibilidad"

### "No hay horarios disponibles"

-   ✅ **Solución**: El dueño debe agregar horarios específicos para esa fecha
-   Asegúrate de agregar al menos un slot de tiempo

### Error 404 en API

-   ✅ **Solución**: Verifica que el backend esté corriendo en el puerto correcto
-   Revisa `frontend/config/api.js` para la URL correcta

### Error de autenticación

-   ✅ **Solución**: Asegúrate de estar logueado
-   El token debe estar guardado en AsyncStorage

## 📊 Endpoints disponibles

### Para dueños de negocio:

-   `POST /bookings/business/{business_id}/availability` - Configurar disponibilidad
-   `GET /bookings/business/{business_id}/bookings` - Ver reservas
-   `PATCH /bookings/{booking_id}/confirm` - Confirmar reserva

### Para clientes:

-   `GET /bookings/business/{business_id}/availability/{year}/{month}` - Ver días disponibles
-   `GET /bookings/business/{business_id}/availability/{date}/slots` - Ver horarios
-   `POST /bookings` - Crear reserva
-   `GET /bookings/my-bookings` - Ver mis reservas

## 🎨 Flujo visual

```
DUEÑO DE NEGOCIO
├── Perfil del negocio
│   └── "Gestionar Disponibilidad" (botón rojo)
│       ├── "Agregar Disponibilidad"
│       │   ├── Seleccionar fecha
│       │   ├── Agregar horarios
│       │   └── Guardar
│       └── Ver reservas pendientes
│           └── Confirmar/Rechazar

CLIENTE
├── Perfil del negocio
│   └── "Reservar servicio" (botón verde)
│       ├── Ver calendario (días verdes = disponibles)
│       ├── Seleccionar fecha
│       ├── Ver horarios disponibles
│       ├── Seleccionar horario
│       └── Confirmar reserva
└── Mis reservas
    └── Ver estado (pendiente/confirmada)
```

## ✨ Próximas mejoras sugeridas

-   [ ] Notificaciones push cuando se confirma una reserva
-   [ ] Recordatorios 24h antes
-   [ ] Sistema de cancelación
-   [ ] Múltiples reservas simultáneas
-   [ ] Duración variable de servicios
-   [ ] Integración con calendario del dispositivo
-   [ ] Historial de reservas completadas
-   [ ] Sistema de calificación post-servicio

---

¡El sistema está listo para usar! 🎉
