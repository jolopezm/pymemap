# PymeMap

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
- # **SSL**: Certificados SSL con certifi

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

## � Prerrequisitos

### Para todos los sistemas operativos:

- **Python 3.8+** (Backend)
- **Node.js 18+** (Frontend)
- **Git** (Control de versiones)

---

## �🚀 Instalación y Configuración

### 🔧 **Variables de Entorno (IMPORTANTE - Hacer primero)**

Crear archivo `.env` en el directorio `backend/`:

```env
MONGO_URI=mongodb+srv://tu-conexion-mongodb
JWT_SECRET_KEY=tu-clave-secreta
```

---

## 🖥️ **Instrucciones por Sistema Operativo**

### **🐧 Linux / 🍎 macOS**

#### **Backend:**

```bash
cd backend

# Crear entorno virtual
python3 -m venv venv

# Activar entorno virtual
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

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

## � **Troubleshooting**

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

### **Backend (Railway):**

- El archivo `start.sh` maneja el despliegue automáticamente
- Variables de entorno configuradas en Railway dashboard

### **Frontend:**

- Compatible con Vercel, Netlify para web
- Expo Application Services (EAS) para apps móviles

---

## �📞 Contacto

Para más información sobre el proyecto PymeMap, no dudes en contactarnos.

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.
