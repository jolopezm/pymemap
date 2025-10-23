# PymeMap

Una aplicación móvil y web diseñada para conectar usuarios con pequeñas y medianas empresas (PYMEs) cercanas, facilitando la búsqueda, calificación y contratación de servicios locales con un sistema de pagos integrado.

## � Documentación

- 📖 **[Backend Documentation](backend/README.md)** - Guía técnica completa del backend
- 🚀 **[Deployment Guide](docs/DEPLOYMENT.md)** - Cómo desplegar en Railway
- 📋 **[Changelog](docs/CHANGELOG.md)** - Historial de cambios

---

## �📱 Funcionalidades Principales

- **Geolocalización**: Encuentra PYMEs cercanas basándose en tu ubicación actual
- **Motor de búsqueda**: Busca servicios específicos por categorías y filtros
- **Sistema de calificaciones**: Califica y consulta reseñas de otros usuarios
- **Solicitud de servicios**: Contrata servicios directamente desde la app
- **Wallet integrada**: Sistema de pagos propio para transacciones seguras
- **Multi-plataforma**: Disponible en iOS, Android y web

## 🛠️ Stack Tecnológico

### Backend

- **Framework**: FastAPI 0.111.0
- **Base de datos**: MongoDB con Motor 3.7.1 (driver asíncrono)
- **Autenticación**: JWT con python-jose 3.3.0
- **Seguridad**: Bcrypt 3.2.2 para hashing de contraseñas
- **Variables de entorno**: python-dotenv 1.0.1
- **Servidor**: Uvicorn 0.29.0
- **Validación**: Pydantic 2.11.9 para validación de datos

### Frontend (Mobile & Web)

- **Framework**: Expo 54.0.7 con React Native 0.81.4
- **Lenguaje**: JavaScript
- **React**: 19.1.0
- **Routing**: Expo Router 5.1.6
- **Navegación**: React Navigation (screens 4.11.1 & safe-area-context 5.6.1)
- **HTTP Client**: Axios 1.12.2
- **Storage**: AsyncStorage 2.2.0 para persistencia local

### DevOps & Tools

- **Linting**: ESLint con configuración Expo y Prettier
- **Formateo**: Prettier
- **CORS**: Configurado para desarrollo cross-origin
- **SSL**: Certificados SSL con certifi

## 🏗️ Arquitectura del Proyecto

```
pymemap/
├── backend/                    # API REST con FastAPI
│   ├── app/                   # Código fuente de la API
│   │   ├── main.py           # Punto de entrada de la API
│   │   ├── db.py             # Configuración de MongoDB
│   │   ├── auth.py           # Lógica de autenticación JWT
│   │   │
│   │   ├── models/           # Modelos de datos Pydantic
│   │   │   ├── users.py      # Modelos de usuarios
│   │   │   ├── sellers.py    # Modelos de negocios/servicios
│   │   │   ├── token.py      # Modelos de tokens
│   │   │   └── utility_classes.py # Notificaciones, Chat
│   │   │
│   │   ├── routers/          # Endpoints modulares
│   │   │   ├── auth.py       # Rutas de autenticación
│   │   │   ├── users.py      # Gestión de usuarios
│   │   │   ├── business.py   # Gestión de negocios
│   │   │   ├── gmaps.py      # Google Maps API
│   │   │   ├── notifications.py # Notificaciones
│   │   │   └── chat.py       # Sistema de mensajería
│   │   │
│   │   ├── services/         # Lógica de negocio
│   │   │   └── auth_code.py  # Códigos de autenticación
│   │   │
│   │   └── utils/            # Utilidades
│   │       └── password_validator.py # Validación
│   │
│   ├── tests/                # Tests del backend
│   │   ├── test_backend_multiplataforma.py
│   │   ├── test_mongo_connection.py
│   │   └── test_send_email.py
│   │
│   ├── requirements.txt      # Dependencias de Python
│   ├── .env.example         # Template de variables
│   ├── .dockerignore        # Optimización de Docker
│   ├── railway.json         # Configuración de Railway
│   ├── Procfile             # Despliegue
│   ├── setup.sh             # Setup automático
│   ├── start.sh             # Inicio para producción
│   ├── run_server.sh        # Desarrollo (Linux/macOS)
│   └── run_server.bat       # Desarrollo (Windows)
│
├── frontend/                 # App móvil con Expo/React Native
│   ├── app/                 # Páginas (Expo Router)
│   │   ├── _layout.js       # Layout principal
│   │   ├── index.js         # Redirección inicial
│   │   ├── login.js         # Autenticación
│   │   ├── sign-in.js       # Registro
│   │   ├── new-business.js  # Registro de negocios
│   │   └── (tabs)/          # Tabs de navegación
│   │       ├── home.js      # Página principal
│   │       ├── search.js    # Búsqueda de negocios
│   │       ├── profile.js   # Perfil de usuario
│   │       ├── notifications.js # Notificaciones
│   │       ├── chat.js      # Mensajería
│   │       └── wallet.js    # Billetera
│   │
│   ├── api/                 # Servicios de API
│   │   ├── auth-service.js
│   │   ├── user-service.js
│   │   ├── business-service.js
│   │   ├── gmaps-service.js
│   │   ├── chat-service.js
│   │   └── notifications-service.js
│   │
│   ├── components/          # Componentes reutilizables
│   ├── context/             # Estado global (Context API)
│   │   └── auth-context.js
│   ├── config/              # Configuraciones
│   │   └── api.js          # URL del backend
│   ├── styles/              # Estilos globales
│   ├── utils/               # Utilidades
│   ├── assets/              # Recursos (imágenes, iconos)
│   └── package.json         # Dependencias de Node.js
│
├── RAILWAY_DEPLOYMENT.md    # Guía de despliegue
└── README.md                # Este archivo
```

## 🎯 Plataformas Objetivo

### Móvil (Clientes y Negocios)

- **iOS**: App nativa via Expo
- **Android**: App nativa via Expo
- Funcionalidades completas de búsqueda, contratación y pagos

### Web

- **Clientes**: Página informativa
- **Negocios**: Panel de administración completo

## 📢 Prerrequisitos

### Para todos los sistemas operativos:

- **Python 3.8+** (Backend)
- **Node.js 18+** (Frontend)
- **Git** (Control de versiones)

---

## 🚀 Instalación y Configuración

### 🔧 **Variables de Entorno (IMPORTANTE - Hacer primero)**

### Backend

Crear archivo `.env` en el directorio `backend/`:

```bash
# Opción 1: Copiar desde el template
cp backend/.env.example backend/.env

# Opción 2: Crear manualmente
nano backend/.env
```

Variables requeridas:

```env
MONGO_URI=mongodb+srv://tu-usuario:tu-password@cluster.mongodb.net/
MONGO_DB_NAME=pymemap_db
JWT_SECRET_KEY=tu-clave-secreta-muy-segura
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALLOWED_ORIGINS=http://localhost:8081
ENVIRONMENT=development
```

**💡 Tip**: Genera una `JWT_SECRET_KEY` segura con:

```bash
openssl rand -hex 32
```

---

## 🖥️ **Instrucciones por Sistema Operativo**

### **🐧 Linux / 🍎 macOS**

#### **Backend:**

```bash
cd backend

# Opción A: Setup automático (recomendado)
./setup.sh

# Opción B: Setup manual
# 1. Crear entorno virtual
python3 -m venv venv

# 2. Activar entorno virtual
source venv/bin/activate

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Configurar .env
cp .env.example .env
nano .env  # Editar con tus valores

# Ejecutar servidor (opción 1 - script automatizado)
./run_server.sh

# Ejecutar servidor (opción 2 - manual)
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### **Frontend:**

```bash
cd frontend

# Instalar dependencias
npm install

# Para desarrollo web
npx expo start --web

# Para desarrollo móvil (escanear QR con Expo Go)
npx expo start
```

---

### **🪟 Windows**

#### **Backend:**

```cmd
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
venv\Scripts\activate.bat

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar servidor (opción 1 - script automatizado)
run_server.bat

# Ejecutar servidor (opción 2 - manual)
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### **Frontend:**

```cmd
cd frontend

# Instalar dependencias
npm install

# Para desarrollo web
npx expo start --web

# Para desarrollo móvil (escanear QR con Expo Go)
npx expo start
```

---

## 🌐 **URLs de Desarrollo**

Una vez que ambos servicios estén corriendo:

- **🖥️ Frontend Web:** http://localhost:8081
- **⚡ Backend API:** http://localhost:8000
- **📚 Documentación API:** http://localhost:8000/docs
- **📱 Móvil:** Escanear QR code con Expo Go

---

## 📱 **Desarrollo Móvil**

1. **Instalar Expo Go** en tu dispositivo:

   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Ejecutar proyecto:**

   ```bash
   cd frontend
   npx expo start
   ```

3. **Conectar dispositivo:**
   - Escanear el QR code que aparece en la terminal
   - La app se ejecutará directamente en tu teléfono

---

## 🧪 **Probar la Instalación**

### **Verificar Backend:**

```bash
# Desde el directorio backend
python test_backend_multiplataforma.py
```

### **Verificar Frontend:**

Abrir http://localhost:8081 en tu navegador

---

## 🔄 **Configuración Automática de API**

El frontend detecta automáticamente el entorno:

- **Desarrollo local:** Se conecta a `http://localhost:8000`
- **Producción:** Se conecta a `https://pymemap-production.up.railway.app`

No necesitas cambiar configuraciones manualmente.

## 🔥🧯 **Troubleshooting**

### **Backend no inicia:**

- ✅ Verificar que Python 3.8+ esté instalado: `python --version`
- ✅ Activar entorno virtual antes de instalar dependencias
- ✅ Verificar que el archivo `.env` exista con las variables correctas

### **Frontend no inicia:**

- ✅ Verificar que Node.js 18+ esté instalado: `node --version`
- ✅ Limpiar caché: `npx expo start --clear`
- ✅ Reinstalar dependencias: `rm -rf node_modules && npm install`

### **Problemas de conexión:**

- ✅ Verificar que ambos servicios estén corriendo
- ✅ Backend: http://localhost:8000 debe responder `{"message":"Bienvenido a la API"}`
- ✅ Frontend: http://localhost:8081 debe cargar la interfaz

### **Reiniciar servicios:**

```bash
# Detener procesos
pkill -f uvicorn  # Backend
pkill -f expo     # Frontend (Linux/macOS)
# En Windows usar Task Manager

# Reiniciar backend
cd backend && ./run_server.sh  # Linux/macOS
cd backend && run_server.bat   # Windows

# Reiniciar frontend
cd frontend && npx expo start --web
```

---

## 🎯 **Funcionalidades Disponibles**

### **APIs REST (Backend):**

- 🔐 `POST /login` - Iniciar sesión
- 👤 `GET /users/me` - Perfil usuario actual
- 👥 `POST /users` - Crear usuario
- 🏢 `GET /business` - Listar negocios
- 🏪 `POST /business` - Crear negocio
- 🗺️ `GET /autocomplete/{query}` - Búsqueda de lugares

### **Funcionalidades Frontend:**

- 🔐 Sistema de autenticación completo
- 👥 Gestión de perfiles de usuario
- 🏢 Registro y gestión de negocios
- 🗺️ Integración con mapas y geolocalización
- 📱 Interfaz responsive para web y móvil

---

## 🛠️ **Comandos de Desarrollo Útiles**

### **Backend:**

```bash
# Ver logs en tiempo real
tail -f backend/logs/app.log

# Ejecutar pruebas
python -m pytest backend/tests/

# Verificar sintaxis
python -m flake8 backend/app/
```

### **Frontend:**

```bash
# Limpiar caché de Expo
npx expo start --clear

# Verificar errores de ESLint
npm run lint

# Formatear código
npm run format

# Instalar para iOS específicamente
npx expo start --ios

# Instalar para Android específicamente
npx expo start --android
```

---

## 🚀 **Despliegue a Producción**

### 🎉 Backend Desplegado

El backend de PymeMap está **actualmente desplegado** en Railway:

**🔗 URL Backend**: https://pymemap-production-306f.up.railway.app/  
**📚 Documentación API**: https://pymemap-production-306f.up.railway.app/docs

### **Configuración del Frontend**

El frontend ya está configurado para usar el backend de Railway automáticamente cuando se ejecuta en `localhost`. Ver `frontend/config/api.js`.

### **Desplegar tu propia instancia**

Si quieres desplegar tu propia instancia del backend:

1. Conecta tu repositorio a Railway
2. Selecciona el directorio `backend/`
3. Configura las variables de entorno desde `.env.example`
4. Railway detectará Python y desplegará automáticamente

📖 **Guía completa de despliegue**: Ver **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**  
Incluye: configuración de MongoDB Atlas, variables de entorno, troubleshooting y monitoreo.

---

## 📞 Contacto

Para más información sobre el proyecto PymeMap, no dudes en contactarnos.

---
