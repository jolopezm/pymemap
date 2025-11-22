# 🚀 Estrategia de Caché con AsyncStorage

## 📋 Resumen

Se implementó una estrategia **cache-first** con AsyncStorage en **todos los contextos** de la aplicación para mejorar:

- ✅ **Rendimiento**: Carga instantánea con datos cacheados
- ✅ **Experiencia offline**: Funciona sin conexión
- ✅ **Reducción de llamadas API**: Menos carga en el servidor
- ✅ **Estabilidad**: Menos errores por problemas de red

---

## 🗂️ Contextos Actualizados

### 1️⃣ **AuthContext** (`/context/auth-context.js`)

- Caché de datos del usuario
- Actualización en segundo plano al inicio
- Limpieza total del caché al hacer logout

**Datos guardados:**

- `@user_data`: Información del usuario
- `@auth_token`: Token de autenticación
- `@auth_data`: Datos de sesión

### 2️⃣ **ChatContext** (`/context/chat-context.js`)

- Caché de chats y usuarios relacionados
- Tiempo de caché: **5 minutos**
- Sincronización automática en segundo plano

**Datos guardados:**

- `@chats_data`: Lista de chats
- `@other_users_data`: Información de usuarios en chats
- `@chats_cache_timestamp`: Timestamp del caché

**Nuevas propiedades:**

```javascript
const {
    chats,
    isFromCache, // ← Nuevo: indica si viene del caché
    refreshChats, // ← Forzar actualización
    clearCache, // ← Limpiar caché
} = useChat()
```

### 3️⃣ **ServiceContext** (`/context/service-context.js`)

- Caché de servicios disponibles
- Tiempo de caché: **10 minutos**
- Actualización automática en segundo plano

**Datos guardados:**

- `@services_data`: Lista de servicios
- `@services_cache_timestamp`: Timestamp del caché

### 4️⃣ **NotifContext** (`/context/notif-context.js`)

- Caché de notificaciones
- Tiempo de caché: **3 minutos**
- Actualización del caché al marcar como leída

**Datos guardados:**

- `@notifications_data`: Lista de notificaciones
- `@notifications_cache_timestamp`: Timestamp del caché

### 5️⃣ **LocationContext** (`/context/location-context.js`)

- Caché de ubicación del usuario
- Tiempo de caché: **15 minutos**
- Carga automática al iniciar la app

**Datos guardados:**

- `@user_location`: Dirección del usuario
- `@user_coords`: Coordenadas (lat/lng)
- `@location_cache_timestamp`: Timestamp del caché

---

## 🛠️ Utilidades

### **CacheManager** (`/utils/cache-manager.js`)

Gestor centralizado de caché con funciones útiles:

```javascript
import {
    clearAllCache, // Limpia TODO el caché
    clearAuthCache, // Solo caché de autenticación
    clearDataCache, // Solo datos (chats, servicios, etc.)
    getCacheInfo, // Información del caché
    getCacheStatus, // Estado de una key específica
} from '../utils/cache-manager'

// Ejemplo: Limpiar todo al cerrar sesión
await clearAllCache()

// Ejemplo: Obtener info del caché
const info = await getCacheInfo()
console.log(`Total: ${info.totalSizeKB} KB`)
```

### **CacheDebugger** (`/components/cache-debugger.js`)

Componente de debugging para visualizar y gestionar el caché:

```javascript
import CacheDebugger from '../components/cache-debugger'

// Agregar en Settings o pantalla de desarrollo
;<CacheDebugger />
```

---

## 📊 Flujo de Caché

```
┌─────────────────────────────────────────────────┐
│ 1. Usuario abre la app                          │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│ 2. Cargar datos del caché (si existen)          │
│    └─ Mostrar INMEDIATAMENTE al usuario         │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│ 3. Verificar si el caché es reciente            │
│    └─ ¿Menos de X minutos de antigüedad?        │
└────────────────┬────────────────────────────────┘
                 │
         ┌───────┴───────┐
         │               │
    SÍ   │               │  NO
         ▼               ▼
┌────────────────┐  ┌───────────────────────┐
│ 4a. Actualizar │  │ 4b. Usar caché        │
│ en segundo     │  │ mientras se obtienen  │
│ plano          │  │ datos frescos         │
└────────────────┘  └───────────────────────┘
         │               │
         └───────┬───────┘
                 ▼
┌─────────────────────────────────────────────────┐
│ 5. Obtener datos frescos del servidor           │
└────────────────┬────────────────────────────────┘
                 │
         ┌───────┴───────┐
         │               │
    OK   │               │  ERROR
         ▼               ▼
┌────────────────┐  ┌───────────────────────┐
│ 6a. Actualizar │  │ 6b. Mantener caché    │
│ UI y caché     │  │ (modo offline)        │
└────────────────┘  └───────────────────────┘
```

---

## 💡 Mejores Prácticas

### ✅ Usar `forceRefresh` cuando sea necesario

```javascript
// Pull-to-Refresh
<ScrollView
    refreshControl={
        <RefreshControl
            refreshing={loading}
            onRefresh={() => refreshChats()}
        />
    }
>
```

### ✅ Mostrar indicadores de caché

```javascript
const { isFromCache } = useChat()

{
    isFromCache && (
        <View style={styles.cacheIndicator}>
            <Text>📦 Datos guardados</Text>
        </View>
    )
}
```

### ✅ Limpiar caché al cerrar sesión

```javascript
const logout = async () => {
    await clearAllCache() // Limpia todo
    // ... resto del logout
}
```

---

## 🔧 Configuración de Tiempos de Caché

Puedes ajustar los tiempos en cada contexto:

```javascript
// En cada contexto:
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

// Valores recomendados:
// - Auth: Sin expiración (hasta logout)
// - Chats: 3-5 minutos
// - Services: 10-15 minutos
// - Notifications: 2-3 minutos
// - Location: 15-30 minutos
```

---

## 📱 Uso en Componentes

### Ejemplo: ChatContext

```javascript
import { useChat } from '../context/chat-context'

function ChatsScreen() {
    const { chats, loading, isFromCache, refreshChats } = useChat()

    return (
        <ScrollView
            refreshControl={
                <RefreshControl
                    refreshing={loading && !isFromCache}
                    onRefresh={refreshChats}
                />
            }
        >
            {isFromCache && <Text>Mostrando datos guardados</Text>}
            {chats.map(chat => (
                <ChatItem key={chat.id} chat={chat} />
            ))}
        </ScrollView>
    )
}
```

---

## 🐛 Debugging

Para ver logs del caché, utiliza el sistema de logging centralizado:

```javascript
import logger from '../utils/logger'

// Los logs de caché se registran automáticamente
// En desarrollo: Visibles en consola
// En producción: Integrados con servicio de monitoreo
```

---

## 🚀 Próximos Pasos (Opcional)

1. **Caché de imágenes**: Implementar caché de avatares/fotos
2. **Sincronización**: Queue de acciones offline
3. **Compresión**: Comprimir datos grandes antes de guardar
4. **Encriptación**: Encriptar datos sensibles en caché

---

## 📝 Notas

- AsyncStorage tiene límite de ~6MB en Android, ~10MB en iOS
- Los datos se guardan como strings (JSON.stringify)
- El caché persiste entre sesiones de la app
- Se limpia automáticamente al hacer logout

---

**¿Preguntas?** Revisa el código o los comentarios en cada contexto.
