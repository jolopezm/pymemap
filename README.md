# PymeMap

Una aplicación móvil y web diseñada para conectar usuarios con pequeñas y medianas empresas (PYMEs) cercanas, facilitando la búsqueda, calificación y contratación de servicios locales con un sistema de pagos integrado.

---

## 🚀 Inicio Rápido

¿Quieres ver PymeMap funcionando en 5 minutos?

**👉 Ve a [docs/QUICKSTART.md](docs/QUICKSTART.md)**

---

## 📖 Documentación

- **⚡[Inicio Rápido](docs/QUICKSTART.md)** - Comienza en 5 minutos
- **🛠️ [Guía de Desarrollo](docs/DEVELOPMENT.md)** - Para desarrolladores y contribuidores
- **📡 [API Backend](backend/README.md)** - Documentación técnica de la API
- **🚂 [Guía de Despliegue](docs/DEPLOYMENT.md)** - Desplegar en Railway
- **📋 [Changelog](docs/CHANGELOG.md)** - Historial de cambios

---

## 📱 Funcionalidades Principales

- **Geolocalización**: Encuentra PYMEs cercanas basándose en tu ubicación actual
- **Motor de búsqueda**: Busca servicios específicos por categorías y filtros con autocomplete de Google Maps
- **Sistema de reseñas**: Califica y consulta opiniones de otros usuarios sobre negocios
- **Sistema de reservas (Bookings)**: Reserva servicios con gestión de disponibilidad horaria
- **Gestión de usuarios**: Sistema de balance en backend (sin UI dedicada aún)
- **Chat en tiempo real**: Mensajería entre clientes y dueños de negocios
- **Notificaciones**: Sistema de alertas para reservas, mensajes y actualizaciones
- **Reportes**: Sistema de reportes de usuarios y negocios
- **Multi-plataforma**: Disponible en iOS, Android y web

## 🛠️ Stack Tecnológico

### 🛡️Backend

- **Framework**: FastAPI 0.111.0
- **Base de datos**: MongoDB con Motor 3.7.1 (driver asíncrono)
- **Autenticación**: JWT con python-jose 3.3.0
- **Seguridad**: Bcrypt 3.2.2 para hashing de contraseñas
- **Variables de entorno**: python-dotenv 1.0.1
- **Servidor**: Uvicorn 0.29.0
- **Validación**: Pydantic 2.11.9 para validación de datos

### 🖥️📱Frontend (Mobile & Web)

- **Framework**: Expo 54.0.7 con React Native 0.81.4
- **Lenguaje**: JavaScript
- **React**: 19.1.0
- **Routing**: Expo Router 5.1.6
- **Navegación**: React Navigation (screens 4.11.1 & safe-area-context 5.6.1)
- **HTTP Client**: Axios 1.12.2
- **Storage**: AsyncStorage 2.2.0 para persistencia local

### ⚙️DevOps & Tools

- **Testing**: Jest 29.7.0 con React Testing Library
- **Cobertura**: 41.4% statements (363 tests pasando)
- **Linting**: ESLint con configuración Expo y Prettier
- **Formateo**: Prettier
- **CORS**: Configurado para desarrollo cross-origin
- **SSL**: Certificados SSL con certifi

## 🏗️ Arquitectura del Proyecto

```
pymemap/
├── backend/          # API REST con FastAPI
├── frontend/         # App móvil con Expo/React Native
└── docs/            # Documentación del proyecto
```

### Backend (FastAPI + MongoDB)

```
backend/
├── app/
│   ├── main.py              # Punto de entrada
│   ├── models/              # Modelos de datos
│   ├── routers/             # Endpoints de la API
│   └── services/            # Lógica de negocio
├── tests/                   # Tests
└── requirements.txt         # Dependencias
```

### Frontend (React Native + Expo)

```
frontend/
├── app/                     # Páginas (Expo Router)
│   ├── (tabs)/             # Navegación principal (6 tabs)
│   │   ├── home.js        # Pantalla principal
│   │   ├── stores.js      # Listado de negocios
│   │   ├── chat.js        # Mensajería
│   │   ├── my-bookings.js # Mis reservas
│   │   ├── notifications.js # Notificaciones
│   │   └── profile.js     # Perfil de usuario
│   └── ...                 # Otras pantallas
├── api/                     # Servicios de API
│   ├── auth-service.js    # Autenticación
│   ├── user-service.js    # Usuarios y balance
│   ├── business-service.js # Negocios
│   ├── booking-service.js # Reservas
│   ├── chat-service.js    # Chat
│   ├── review-service.js  # Reseñas
│   └── notifications-service.js # Notificaciones
├── components/              # Componentes reutilizables
│   ├── business/          # Componentes de negocios
│   ├── home/              # Componentes del home
│   ├── search/            # Componentes de búsqueda
│   ├── stores/            # Componentes de tiendas
│   └── ui/                # Componentes UI reutilizables
├── context/                 # Contextos de React
│   ├── auth-context.js    # Autenticación global
│   ├── chat-context.js    # Estado del chat
│   ├── location-context.js # Geolocalización
│   ├── notif-context.js   # Notificaciones
│   └── service-context.js # Servicios
├── hooks/                   # Custom hooks
│   ├── useAsyncStorage.js # Hook de almacenamiento
│   ├── useBusinessData.js # Hook de negocios
│   └── useRefresh.js      # Hook de refresco
├── utils/                   # Utilidades
│   ├── cache-manager.js   # Gestión de caché
│   ├── geolocation.js     # Utilidades de ubicación
│   └── logger.js          # Sistema de logging
├── __tests__/               # Tests (363 tests, 41.4% coverage)
└── config/                  # Configuraciones
    └── api.js             # Config de API (Railway/Local)
```

Para más detalles, ver [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)

---

## 📣 Instalación

### Opción 1: Solo ver el proyecto (Recomendado)

```bash
git clone https://github.com/jolopezm/pymemap.git
cd pymemap/frontend
npm install
npm run web:dev
```

Abre http://localhost:8081 - ¡Listo!

### Opción 2: Desarrollo completo (Backend + Frontend)

Ver guía completa en **[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)**

---

## 🚀 Despliegue

### Backend Desplegado

El backend está actualmente funcionando en Railway:

**🔗 URL**: https://pymemap-production-306f.up.railway.app  
**📚 Docs**: https://pymemap-production-306f.up.railway.app/docs

### Desplegar tu propia instancia

Para desplegar tu propia versión del backend en Railway:

**👉 Ver [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** para la guía completa paso a paso.

---

## ☎️📞 Contacto

Para más información sobre el proyecto PymeMap, no dudes en contactarnos.

---
