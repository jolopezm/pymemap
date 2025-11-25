# 🛠️ Guía de Desarrollo - PymeMap

Guía completa para desarrolladores que quieren contribuir al proyecto o hacer cambios en el backend.

---

## 📋 Tabla de Contenidos

- [Estrategias de Desarrollo](#-estrategias-de-desarrollo)
- [Setup Completo](#-setup-completo)
- [Desarrollo Frontend](#-desarrollo-frontend)
- [Desarrollo Backend](#-desarrollo-backend)
- [Flujo de Trabajo](#-flujo-de-trabajo)
- [Testing](#-testing)
- [Despliegue](#-despliegue)
- [Comandos Útiles](#-comandos-útiles)

---

## 🎯 Estrategias de Desarrollo

Antes de empezar, decide qué estrategia de desarrollo usar:

### **Estrategia 1: Backend en Railway + Frontend Local** (Recomendado)

```
Frontend Local (localhost:8081) → Backend Railway → MongoDB Atlas
```

**Cuándo usarla:**

- Solo vas a trabajar en el frontend
- Quieres desarrollo rápido sin configurar el backend
- Necesitas probar en dispositivos móviles
- Vas a mostrar el proyecto a otros

**Ventajas:**

- ✅ No necesitas Python ni MongoDB
- ✅ Más rápido para empezar
- ✅ Backend siempre disponible

**Pasos:**

```bash
cd frontend
npm install
npm run web:dev
```

### **Estrategia 2: Todo Local** (Para cambios en Backend)

```
Frontend Local → Backend Local → MongoDB Atlas
```

**Cuándo usarla:**

- Vas a hacer cambios en el backend
- Necesitas debuggear el backend
- Trabajas sin internet (offline)

**Ventajas:**

- ✅ Control total
- ✅ Testing rápido de cambios en backend
- ✅ No gastas recursos de Railway

**Desventajas:**

- ❌ Requiere Python, MongoDB configurado
- ❌ Más setup inicial

---

## 🔧 Setup Completo

### 📢 Prerrequisitos

- **Python 3.8+** → `python --version`
- **Node.js 18+** → `node --version`
- **Git** → `git --version`

### 1. Clonar el Repositorio

```bash
git clone https://github.com/jolopezm/pymemap.git
cd pymemap
```

### 2. Configurar Backend

#### 🐧Linux/ 🍎macOS:

```bash
cd backend

# Opción A: Setup automático
./setup.sh
nano .env  # Editar variables

# Opción B: Manual
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
nano .env
```

#### 🪟Windows:

```cmd
cd backend

# Opción A: Setup automático
setup.bat
notepad .env

# Opción B: Manual
python -m venv venv
venv\Scripts\activate.bat
pip install -r requirements.txt
copy .env.example .env
notepad .env
```

#### Variables de Entorno (.env)

```env
# MongoDB (usa MongoDB Atlas o local)
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/
MONGO_DB_NAME=pymemap_db

# JWT
JWT_SECRET_KEY=genera-una-clave-segura-aqui
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Entorno
ENVIRONMENT=development

# CORS (opcional en desarrollo)
ALLOWED_ORIGINS=http://localhost:8081
```

**Generar JWT_SECRET_KEY:**

```bash
# Linux/macOS
openssl rand -hex 32

# Python (cualquier OS)
python -c "import secrets; print(secrets.token_hex(32))"
```

### 3. Configurar Frontend

```bash
cd frontend
npm install
```

**Configurar conexión a backend local:**

Crea un archivo `.env` en `frontend/`:

```env
EXPO_PUBLIC_API_ENV=local
```

Para usar Railway (default), simplemente no crees el archivo `.env`.

---

## 💻 Desarrollo Frontend

### Ejecutar en Web

```bash
cd frontend
npm run web:dev
# o
npm run web
```

Abre: http://localhost:8081

### Ejecutar en Móvil

```bash
cd frontend
npm start
```

Escanea el QR code con Expo Go:

- **iOS**: [App Store](https://apps.apple.com/app/expo-go/id982107779)
- **Android**: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Limpiar Caché

```bash
npm run dev
# o manualmente
npx expo start --clear
```

### Linting y Formateo

```bash
npm run lint          # Ver errores
npm run lint:fix      # Corregir automáticamente
npm run format        # Formatear con Prettier
npm run format:check  # Verificar formato
```

---

## ⚙️ Desarrollo Backend

### Ejecutar Servidor Local

#### 🐧Linux/ 🍎macOS:

```bash
cd backend
./run_server.sh
```

#### 🪟Windows:

```cmd
cd backend
run_server.bat
```

#### Manual:

```bash
source venv/bin/activate  # Linux/macOS
# o
venv\Scripts\activate.bat  # Windows

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Documentación API

Una vez que el servidor esté corriendo:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### 🧪Testing

```bash
cd backend
source venv/bin/activate  # o venv\Scripts\activate.bat

# Test de conexión a MongoDB
python tests/test_mongo_connection.py

# Test multiplataforma
python tests/test_backend_multiplataforma.py
```

### Agregar Nuevas Dependencias

```bash
pip install nombre-paquete
pip freeze > requirements.txt
```

---

## 🔄 Flujo de Trabajo

### Desarrollo Diario

#### Solo Frontend:

```bash
# Terminal único
cd frontend
npm run web:dev
```

#### Frontend + Backend Local:

```bash
# Terminal 1: Backend
cd backend
./run_server.sh  # o run_server.bat en Windows

# Terminal 2: Frontend
cd frontend
npm run web:dev
```

### Hacer Cambios en el Backend Desplegado

```bash
# 1. Hacer cambios en backend/
# 2. Commitear
git add backend/
git commit -m "feat: agregar nuevo endpoint"

# 3. Push
git push origin nombre-rama

# 4. Railway auto-deploya (~2-3 minutos)
# 5. Probar
curl https://pymemap-production-306f.up.railway.app/nuevo-endpoint
```

### Crear una Nueva Rama

```bash
git checkout -b feature/nueva-funcionalidad
# ... hacer cambios ...
git add .
git commit -m "feat: descripción del cambio"
git push origin feature/nueva-funcionalidad
```

---

## 🧪 Testing

### Backend

```bash
# Activar entorno virtual
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate.bat  # Windows

# Ejecutar tests
python tests/test_mongo_connection.py
python tests/test_backend_multiplataforma.py
```

### Frontend

```bash
cd frontend

# Ejecutar linter
npm run lint

# Verificar formato
npm run format:check
```

### Testing Manual

**Crear usuario:**

```bash
curl -X POST "http://localhost:8000/users/" \
  -H "Content-Type: application/json" \
  -d '{
    "rut": "12345678-9",
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123!@#",
    "birthdate": "1990-01-01"
  }'
```

**Login:**

```bash
curl -X POST "http://localhost:8000/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#"}'
```

---

## 🚀 Despliegue

### Backend en Railway

El backend ya está desplegado. Para desplegar tu propia instancia:

👉 Ver **[DEPLOYMENT.md](DEPLOYMENT.md)** para la guía completa.

**Resumen rápido:**

1. Crear cuenta en Railway
2. Conectar repo de GitHub
3. Configurar variables de entorno
4. Railway despliega automáticamente

### Frontend (Próximamente)

El frontend se puede desplegar en:

- **Vercel** (recomendado para React/Next.js)
- **Netlify**
- **Expo EAS** (para apps nativas)

---

## ⚡ Comandos Útiles

### Backend

```bash
# Ver puertos en uso
lsof -i :8000              # Linux/macOS
netstat -ano | findstr :8000  # Windows

# Matar proceso en puerto
kill -9 $(lsof -t -i:8000)  # Linux/macOS

# Limpiar __pycache__
find . -type d -name "__pycache__" -exec rm -rf {} +  # Linux/macOS

# Reinstalar entorno virtual
rm -rf venv/
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Frontend

```bash
# Limpiar completamente
rm -rf node_modules
npm install

# Ver qué paquetes están desactualizados
npm outdated

# Actualizar paquetes
npm update

# Ejecutar tests
npm test

# Ejecutar con limpiar caché
npm run dev

# Ejecutar en iOS (requiere macOS)
npm run ios

# Ejecutar en Android
npm run android

# Ejecutar en web
npm run web:dev
```

### Git

```bash
# Ver estado
git status

# Ver diferencias
git diff

# Ver ramas
git branch -a

# Cambiar de rama
git checkout nombre-rama

# Actualizar desde main
git pull origin main

# Ver historial
git log --oneline --graph

# Deshacer último commit (mantener cambios)
git reset --soft HEAD~1

# Deshacer cambios en un archivo
git checkout -- archivo.js
```

---

## 🧯🔥Troubleshooting

### Backend no inicia

**Error: "ModuleNotFoundError"**

```bash
# Verifica que el entorno virtual esté activado
which python  # debe mostrar ruta con 'venv'

# Reinstala dependencias
pip install -r requirements.txt
```

**Error: "Could not connect to MongoDB"**

```bash
# Verifica MONGO_URI en .env
cat .env | grep MONGO_URI

# Prueba la conexión
python tests/test_mongo_connection.py
```

**Error: "Address already in use"**

```bash
# Encuentra el proceso
lsof -i :8000  # Linux/macOS

# Mátalo
kill -9 <PID>
```

### Frontend no inicia

**Error: "expo command not found"**

```bash
# Reinstala Expo CLI
npm install -g expo-cli

# O usa npx
npx expo start
```

**Error: "Unable to resolve module"**

```bash
# Limpia caché
rm -rf node_modules
npm install
npx expo start --clear
```

### CORS Errors

Si ves errores de CORS en la consola del navegador:

**Backend local:**

```env
# En backend/.env
ENVIRONMENT=development  # Permite todos los orígenes
```

**Backend en Railway:**
Agrega tu frontend a `ALLOWED_ORIGINS` en las variables de entorno de Railway.

---

## 📚 Recursos Adicionales

### Documentación Oficial

- **FastAPI**: https://fastapi.tiangolo.com/
- **React Native**: https://reactnative.dev/
- **Expo**: https://docs.expo.dev/
- **MongoDB**: https://docs.mongodb.com/
- **Railway**: https://docs.railway.app/

### Guías del Proyecto

- **[QUICKSTART.md](QUICKSTART.md)** - Inicio rápido (5 minutos)
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Despliegue a Railway
- **[CHANGELOG.md](CHANGELOG.md)** - Historial de cambios
- **[backend/README.md](../backend/README.md)** - Documentación técnica del backend

---

## 💬 ¿Necesitas Ayuda?

1. 📖 Lee esta documentación completa
2. 🔍 Revisa el [Troubleshooting](#-troubleshooting)
3. 🐛 Busca el error en Google
4. 💬 Abre un issue en GitHub
5. 📧 Contacta al equipo

---

**¡Equipo de PymeMap! 💻**
