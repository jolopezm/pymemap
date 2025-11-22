# 📋 Changelog - PymeMap

Historial de cambios y reestructuraciones del proyecto.

---

## [Reorganización de Documentación] - 24 Octubre 2025

### 🎯 Objetivo

Reorganizar la documentación para hacerla más profesional, accesible y menos confusa para nuevos contribuidores.

### ✨ Added

#### Nueva Estructura de Documentación

- **`docs/QUICKSTART.md`**: Guía de inicio rápido (5 minutos)
  - Para usuarios que solo quieren ver el proyecto funcionando
  - Enfoque en frontend con backend ya desplegado
  - Instrucciones para web y móvil
  - Troubleshooting básico
- **`docs/DEVELOPMENT.md`**: Guía completa para desarrolladores
  - Estrategias de desarrollo (Railway vs local)
  - Setup completo paso a paso
  - Flujos de trabajo
  - Testing
  - Comandos útiles
  - Troubleshooting avanzado

### 🔧 Changed

#### README.md Principal

- **Antes**: Guía extensa con todas las instrucciones mezcladas
- **Ahora**: Overview conciso con enlaces a documentación específica
  - Intro breve del proyecto
  - Enlaces claros a cada guía
  - Stack tecnológico resumido
  - Arquitectura simplificada
  - Instalación reducida a 2 opciones claras

#### Mejoras

- Eliminada duplicación de contenido
- Estructura actualizada a tipo "landing page"
- Más fácil de navegar

### 📚 Estructura Final

```
docs/
├── QUICKSTART.md          # Inicio rápido (5 min)
├── DEVELOPMENT.md         # Guía para desarrolladores
├── DEPLOYMENT.md          # Despliegue a Railway
└── CHANGELOG.md           # Este archivo

README.md                  # Overview + enlaces
backend/README.md          # Docs técnicas de la API
```

### 💡 Beneficios

- ✅ Más fácil para nuevos contribuidores
- ✅ Separación clara entre "ver el proyecto" y "desarrollar"
- ✅ Menos confusión con instrucciones duplicadas
- ✅ Documentación más profesional y mantenible
- ✅ README conciso y enfocado

---

## [Mejoras de Deployment y Frontend] - 24 Octubre 2025

### 🎯 Objetivo

Optimización del flujo de desarrollo y corrección de bugs en producción.

### ✅ Fixed

#### Backend

- **CORS mejorado en producción**: Implementada configuración flexible que permite:
  - Variable `ALLOWED_ORIGINS` para dominios específicos
  - Soporte automático para URLs de Railway (`*.up.railway.app`)
  - Regex mejorado para localhost y dominios personalizados

#### Frontend

- **Error VirtualizedList**: Corregido error de React Native al anidar FlatList dentro de ScrollView
  - Reemplazado FlatList con map() en perfil
  - Agregado ScrollView manual con `scroll={false}` en Screen
  - Eliminada advertencia de consola

### 🔧 Changed

#### Configuración de API del Frontend

- **Estrategia por defecto**: Frontend local ahora se conecta a backend de Railway
- **Configuración flexible**: Agregado soporte para variable `EXPO_PUBLIC_API_ENV`
  - `production`: Usa backend de Railway (default)
  - `local`: Usa backend local en localhost:8000
- **Logging mejorado**: Consola muestra claramente a qué backend se conecta

### 💡 Mejoras de Workflow

**Nuevo flujo:**

```bash
# Solo levantar frontend (más rápido)
cd frontend
npm run web:dev
# Se conecta automáticamente a Railway
```

**Beneficios:**

- ✅ Desarrollo más rápido del frontend
- ✅ Sin necesidad de configurar MongoDB local
- ✅ Backend siempre disponible para móvil y demos
- ✅ Ideal para proyectos tipo capstone

### 📚 Documentación Actualizada

- Explicación clara de estrategias de desarrollo
- Guía de configuración flexible del frontend
- Documentación del backend desplegado
- Troubleshooting mejorado

### 🧪 Testing

- ✅ Login probado exitosamente en producción
- ✅ Creación de usuario funcionando
- ✅ Endpoints protegidos con JWT validados
- ✅ CORS funcionando correctamente

---

## [Reestructuración] - Octubre 2025

### 🎯 Objetivo

Optimizacion del proyecto para despliegue en Railway y documentación completa.

### ✅ Archivos Eliminados

Limpieza de archivos redundantes e innecesarios:

- `backend/app/models.py` - Duplicado de `backend/app/models/`
- `backend/app/schemas.py` - Archivo vacío sin uso
- `backend/app/api_handler.py` - Para AWS Lambda, no necesario para Railway
- `backend/playground-1.mongodb.js` - Playground de MongoDB
- `backend/app/test_mongo_connection.py` - Movido a `backend/tests/`

### 📁 Reorganización

- Consolidación de tests en `backend/tests/`
- Movimiento de archivos de test dispersos a ubicación centralizada
- Eliminación del directorio `backend/app/test/`

### 📄 Archivos Nuevos

#### Configuración:

- `backend/.env.example` - Template de variables de entorno
- `backend/.dockerignore` - Optimización de builds
- `backend/railway.json` - Configuración de Railway
- `backend/setup.sh` - Setup automático (Linux/macOS)
- `backend/setup.bat` - Setup automático (Windows)

#### Documentación:

- `docs/DEPLOYMENT.md` - Guía completa de despliegue
- `backend/README.md` - Documentación técnica mejorada
- `docs/CHANGELOG.md` - Este archivo

### 🔧 Mejoras en Código

#### CORS Configurable

- **Antes**: `allow_origins=["*"]` siempre
- **Ahora**: Configurable por ambiente (desarrollo/producción)

#### Scripts Portables

- **Antes**: Rutas hardcodeadas específicas
- **Ahora**: Scripts genéricos que funcionan en cualquier máquina

#### Documentación

- Consolidación en 3 archivos principales
- Eliminación de redundancia
- Mejor organización con carpeta `docs/`

### 🎯 Resultado

✅ Código limpio y bien organizado  
✅ Sin archivos duplicados  
✅ Documentación profesional  
✅ Production-ready para Railway  
✅ CORS seguro y configurable  
✅ Scripts portables para todos los OS

---

## [Sistema Completo de Reservas y Testing] - 22 Noviembre 2025

### ✨ Added

#### Sistema de Reservas (Bookings)

- **Backend**: Router completo de bookings (`/backend/app/routers/bookings.py`)
  - Gestión de disponibilidad horaria
  - Creación y confirmación de reservas
  - Vista de reservas por negocio y por cliente
  - Estados: pending, confirmed, cancelled
- **Frontend**: Pantallas y componentes de reservas
  - `book-a-service.js` - Reservar servicio
  - `manage-availavility.js` - Gestión de disponibilidad (dueños)
  - `booking-detail.js` - Detalle de reserva
  - `bookings-panel.js` - Panel de gestión
  - `my-bookings.js` - Tab de mis reservas
  - Componentes: `Calendar.js`, `TimeSlotPicker.js`, `BookingCalendar.js`

#### Sistema de Balance (Backend)

- **Backend**: Endpoints de gestión de saldo
  - `POST /users/{user_id}/update-balance` - Actualizar saldo
  - Campo `balance` agregado al modelo User
- **Frontend**: Servicio de balance
  - `api/user-service.js` - Función `updateBalance()`
  - Sin UI dedicada aún (funcionalidad backend preparada para futura implementación)

#### Sistema de Reviews

- **Backend**: Router de reseñas (`/backend/app/routers/reviews.py`)
  - CRUD completo de reseñas
  - Calificaciones por negocio
  - Sistema de puntuación (1-5 estrellas)
- **Frontend**: Pantalla y servicio de reviews
  - `rate-business.js` - Calificar negocio
  - `api/review-service.js` - Servicio de API

#### Sistema de Reportes

- **Backend**: Router de reportes (`/backend/app/routers/reports.py`)
  - Crear reportes de usuarios/negocios
  - Gestión administrativa de reportes
- **Frontend**: Pantalla de reportes
  - `report.js` - Crear reporte
  - `api/report-service.js` - Servicio de API

#### Testing Completo

- **363 tests implementados** (100% passing)
- **41.4% code coverage** (statements)
- **Tests por categoría**:
  - API Services: 9 archivos (88.35% coverage)
  - Contexts: 5 archivos (auth, chat, location, notif, service)
  - Components: 13 archivos (UI, business, home)
  - Hooks: 3 archivos (useAsyncStorage, useRefresh, useResponsiveDimensions)
  - Utils: 4 archivos (cache, cache-manager, geolocation, logger)
  - Integration: 3 archivos
- **Testing tools**: Jest 29.7.0 + React Testing Library

#### Componentes UI Reutilizables

- `components/ui/Button.js` - Botón personalizado
- `components/ui/Card.js` - Tarjeta de contenido
- `components/ui/HapticPressable.js` - Botón con feedback háptico
- `components/ui/LocationHeader.js` - Header con ubicación
- `components/ui/RatingDisplay.js` - Visualización de calificación
- `components/ui/SearchBar.js` - Barra de búsqueda
- `components/ErrorBoundary.js` - Manejo de errores
- `components/LoadingState.js` - Estado de carga
- `components/EmptyState.js` - Estado vacío
- `components/ErrorState.js` - Estado de error

#### Componentes de Business

- `components/business/BusinessCard.js` - Tarjeta de negocio
- `components/business/BusinessList.js` - Lista de negocios
- `components/business/BusinessHeader.js` - Header del perfil
- `components/business/BusinessActions.js` - Acciones del negocio
- `components/business/BusinessLocation.js` - Ubicación del negocio
- `components/business/BusinessReviews.js` - Reseñas del negocio
- `components/business/BusinessChat.js` - Chat del negocio
- `components/business/FilterChips.js` - Chips de filtro

#### Componentes de Home

- `components/home/HomeCategories.js` - Categorías principales
- `components/home/HomeFeaturedBrands.js` - Marcas destacadas
- `components/home/HomeNearbyStores.js` - Tiendas cercanas
- `components/home/HomeNewBusinesses.js` - Negocios nuevos
- `components/home/HomePromoBanner.js` - Banner promocional

#### Componentes de Stores

- `components/stores/StoresHeader.js` - Header de tiendas
- `components/stores/StoresList.js` - Lista de tiendas
- `components/stores/StoresMap.js` - Mapa de tiendas
- `components/stores/StoresFilterModals.js` - Modales de filtro

#### Componentes de Search

- `components/search/SearchInput.js` - Input de búsqueda
- `components/search/SearchFilters.js` - Filtros de búsqueda
- `components/search/SearchResults.js` - Resultados
- `components/search/RecentSearches.js` - Búsquedas recientes

#### Custom Hooks

- `hooks/useAsyncStorage.js` - Hook de almacenamiento async
- `hooks/useBusinessData.js` - Hook de datos de negocios
- `hooks/useBusinessFilters.js` - Hook de filtros
- `hooks/useRefresh.js` - Hook de refresco
- `hooks/useResponsiveDimensions.js` - Hook de dimensiones responsivas

### 🔧 Changed

#### Sistema de Logging

- Reemplazados todos los `console.log/warn/error` con sistema centralizado `logger.js`
- Eliminados emojis de depuración del código de producción
- Preparado para integración con servicios de monitoreo (Sentry/Bugsnag)

#### Mejoras de Cache

- Sistema de cache con AsyncStorage para todos los contextos
- Cache-first strategy con actualización en segundo plano
- Tiempos configurables por tipo de dato
- `utils/cache-manager.js` - Gestor centralizado de caché
- Documento `CACHE_STRATEGY.md` con estrategia completa

#### Reorganización de Tabs

- **Eliminados**: `search` (búsqueda ahora integrada en home)
- **Agregados**: `stores` (lista de negocios), `chat`, `my-bookings`, `notifications`
- Tabs actuales: home, stores, chat, my-bookings, notifications, profile (6 tabs)

#### Estructura de Proyecto

- Componentes organizados por feature (business/, home/, search/, stores/, ui/)
- Tests organizados por tipo (api/, components/, context/, hooks/, utils/, integration/)
- Documentación centralizada en `docs/`

### 🐛 Fixed

#### Producción

- CORS configurado correctamente para Railway y dominios personalizados
- Manejo de errores mejorado en todas las APIs
- Validación de contraseñas con mensajes claros
- Fix de VirtualizedList en perfil (FlatList → map())

#### Testing

- Mocks de AsyncStorage implementados correctamente
- Tests de contextos con enfoque component-based
- Eliminados timeouts y warnings de tests

### 📚 Documentation

#### Archivos Actualizados

- `README.md` - Funcionalidades reales, estructura actualizada
- `backend/README.md` - Todos los endpoints documentados
- `CACHE_STRATEGY.md` - Sistema de logging actualizado
- `CHANGELOG.md` - Este archivo (historial completo)
- `SETUP_RESERVAS.md` - Guía del sistema de reservas

#### Nuevas Guías

- Testing documentado con ejemplos
- Sistema de balance backend explicado
- Sistema de reservas paso a paso
- Componentes UI documentados

### 🔒 Security

- Sin credenciales hardcodeadas
- `.env` protegido en `.gitignore`
- Sistema de validación de contraseñas robusto

### 📊 Métricas Finales

```
Tests:       363 passing (100%)
Coverage:    41.4% statements
             27.87% branches
             41.03% functions
             41.74% lines
Archivos:    160+ archivos procesados
Backend:     10 routers implementados
Frontend:    7 tabs + 40+ pantallas
Componentes: 60+ componentes reutilizables
```

---

## Formato del Changelog

Este changelog sigue el formato [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

### Tipos de cambios:

- **Added** - Nuevas funcionalidades
- **Changed** - Cambios en funcionalidades existentes
- **Deprecated** - Funcionalidades próximas a ser removidas
- **Removed** - Funcionalidades eliminadas
- **Fixed** - Corrección de bugs
- **Security** - Mejoras de seguridad
