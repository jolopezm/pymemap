# PymeMap 🗺️🏪

Una aplicación móvil y web diseñada para conectar usuarios con pequeñas y medianas empresas (PYMEs) cercanas, facilitando la búsqueda, calificación y contratación de servicios locales con un sistema de pagos integrado.

## 📱 Funcionalidades Principales

- **Geolocalización**: Encuentra PYMEs cercanas basándose en tu ubicación actual
- **Motor de búsqueda**: Busca servicios específicos por categorías y filtros
- **Sistema de calificaciones**: Califica y consulta reseñas de otros usuarios
- **Solicitud de servicios**: Contrata servicios directamente desde la app
- **Wallet integrada**: Sistema de pagos propio para transacciones seguras
- **Multi-plataforma**: Disponible en iOS, Android y web

## 🛠️ Stack Tecnológico

### Backend
- **Framework**: FastAPI 0.116.1
- **Base de datos**: MongoDB con Motor (driver asíncrono)
- **Autenticación**: JWT con python-jose
- **Seguridad**: Bcrypt para hashing de contraseñas
- **Variables de entorno**: python-dotenv
- **Servidor**: Uvicorn
- **ORM**: Pydantic para validación de datos

### Frontend (Mobile & Web)
- **Framework**: Expo ~53.0.20 con React Native 0.79.5
- **Lenguaje**: JavaScript
- **React**: 19.0.0
- **Routing**: Expo Router ~5.1.4
- **Navegación**: React Navigation (screens & safe-area-context)
- **HTTP Client**: Axios 1.11.0
- **Storage**: AsyncStorage para persistencia local

### DevOps & Tools
- **Linting**: ESLint con configuración Expo y Prettier
- **Formateo**: Prettier
- **CORS**: Configurado para desarrollo cross-origin
- **SSL**: Certificados SSL con certifi
=======

## 🏗️ Arquitectura del Proyecto

```
pymemap/
├── backend/                 # API REST con FastAPI
│   ├── app/
│   │   ├── main.py         # Punto de entrada de la API
│   │   ├── db.py           # Configuración de MongoDB
│   │   ├── models.py       # Modelos de datos con Pydantic
│   │   ├── auth.py         # Lógica de autenticación
│   │   ├── routers/        # Endpoints modulares
│   │   │   ├── auth.py     # Rutas de autenticación
│   │   │   ├── users.py    # Gestión de usuarios
│   │   │   └── business.py # Gestión de negocios
│   │   └── services/       # Lógica de negocio
│   └── requirements.txt    # Dependencias de Python
│
└── frontend/               # App móvil con Expo/React Native
    ├── app/               # Páginas de la aplicación
    │   ├── _layout.js     # Layout principal
    │   ├── home.js        # Página principal
    │   ├── login.js       # Autenticación
    │   ├── profile.js     # Perfil de usuario
    │   └── new-business.js # Registro de negocios
    ├── api/               # Servicios de API
    ├── components/        # Componentes reutilizables
    ├── context/           # Context API para estado global
    └── styles/            # Estilos globales
```

## 🎯 Plataformas Objetivo

### Móvil (Clientes y Negocios)
- **iOS**: App nativa via Expo
- **Android**: App nativa via Expo
- Funcionalidades completas de búsqueda, contratación y pagos

### Web
- **Clientes**: Página informativa
- **Negocios**: Panel de administración completo


## 🚀 Instalación y Configuración

### Backend

```bash
cd backend
pip install -r requirements.txt
# Configurar variables de entorno en .env
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
# Para desarrollo móvil
npm run dev
# Para web
npm run web:dev
```

## 🔧 Variables de Entorno

Crear archivo `.env` en el directorio backend:

```env
MONGO_URI=mongodb+srv://tu-conexion-mongodb
JWT_SECRET_KEY=tu-clave-secreta
```

## 📞 Contacto

Para más información sobre el proyecto PymeMap, no dudes en contactarnos.
