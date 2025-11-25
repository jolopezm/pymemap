# 🔄 Servicios de Autenticación - Comparación

## 📁 Estructura Actual

```
frontend/
├── api/
│   └── auth-service.js          # ❌ Solo React Native (axios + AsyncStorage)
├── webadmin/
│   └── js/
│       └── auth-service.js      # ❌ Solo Web (fetch + localStorage)
└── shared/                       # ✨ NUEVO
    └── auth-service-unified.js  # ✅ Funciona en ambos
```

## 🎯 ¿Cuál usar?

### Opción 1: Mantener separados (ACTUAL) ✅

**Ventajas:**

- Más simple
- Sin dependencias compartidas
- Optimizado para cada plataforma
- Ya funciona

**Desventajas:**

- Código duplicado
- Dos lugares para hacer cambios

### Opción 2: Usar servicio unificado (PROPUESTO) 🔄

**Ventajas:**

- DRY (Don't Repeat Yourself)
- Un solo lugar para cambios
- Lógica compartida

**Desventajas:**

- Más complejo
- Requiere configuración inicial

## 📊 Comparación de Código

### React Native (App móvil)

```javascript
// /frontend/api/auth-service.js
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

export async function login({ email, password }) {
    const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
    })

    if (response.data.access_token) {
        await AsyncStorage.setItem('token', response.data.access_token)
    }

    return response.data
}
```

### Web Admin (Panel web)

```javascript
// /frontend/webadmin/js/auth-service.js
export async function login({ email, password }) {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (data.access_token) {
        localStorage.setItem('token', data.access_token)
    }

    return data
}
```

### Versión Unificada (Propuesta)

```javascript
// /frontend/shared/auth-service-unified.js

// En React Native:
import AsyncStorage from '@react-native-async-storage/async-storage'
import { setStorage, login } from '../shared/auth-service-unified'

setStorage(AsyncStorage)
await login({ email, password })

// En Web:
import { login } from '../shared/auth-service-unified'

// No necesita configuración extra, usa localStorage automáticamente
await login({ email, password })
```

## 🚀 Migración (Si decides unificar)

### Paso 1: Web Admin

```javascript
// Reemplazar en /frontend/webadmin/js/auth-service.js
// De:
export async function login({ email, password }) { ... }

// A:
export { login, logout, getCurrentUser, ... } from '../../shared/auth-service-unified.js'
```

### Paso 2: React Native

```javascript
// Modificar /frontend/api/auth-service.js
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
    setStorage,
    login,
    logout,
    getCurrentUser
} from '../shared/auth-service-unified'

// Configurar storage una sola vez
setStorage(AsyncStorage)

// Re-exportar para compatibilidad
export { login, logout, getCurrentUser, ... }
```

## 💡 Recomendación

**Para tu caso actual:** ✅ **Mantener separados**

**¿Por qué?**

1. Ya funcionan ambos
2. Son simples y mantenibles
3. La duplicación es mínima
4. No hay necesidad urgente de unificar

**Cuándo unificar:**

- Si agregas mucha lógica compleja de auth
- Si necesitas sincronizar comportamiento entre plataformas
- Si planeas agregar más funcionalidades compartidas

## 🔧 Si decides mantener separados

Solo documenta las diferencias:

```javascript
// /frontend/api/auth-service.js
/**
 * Servicio de autenticación para React Native
 * Usa: axios + AsyncStorage
 * Para: App móvil
 */

// /frontend/webadmin/js/auth-service.js
/**
 * Servicio de autenticación para Web
 * Usa: fetch + localStorage
 * Para: Panel administrativo web
 */
```

## 📝 Resumen

| Aspecto            | Actual (Separados) | Unificado      |
| ------------------ | ------------------ | -------------- |
| **Complejidad**    | Baja ⭐            | Media ⭐⭐     |
| **Mantenibilidad** | Media ⭐⭐         | Alta ⭐⭐⭐    |
| **Configuración**  | Ninguna ✅         | Requiere setup |
| **Dependencias**   | Independientes ✅  | Compartidas    |
| **Optimización**   | Por plataforma ✅  | Genérica       |

---

**Mi recomendación:** Deja como está. Funciona bien y es más simple. La unificación sería una optimización prematura en este caso.

¿Prefieres mantenerlo así o quieres que unifiquemos los servicios?
