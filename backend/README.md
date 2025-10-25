# PymeMap Backend

API REST construida con FastAPI para la plataforma PymeMap.

## 📖 Tabla de Contenidos

- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Inicio Rápido](#-inicio-rápido)
- [Scripts Disponibles](#-scripts-disponibles)
- [Comandos Útiles](#-comandos-útiles)
- [Endpoints de la API](#-endpoints-disponibles)
- [Testing](#-testing)
- [Despliegue](#-despliegue)
- [Troubleshooting](#-troubleshooting)

## 📁 Estructura del Proyecto

```
backend/
├── app/                        # Código fuente de la aplicación
│   ├── __init__.py
│   ├── main.py                # Punto de entrada de la API
│   ├── db.py                  # Configuración de MongoDB
│   ├── auth.py                # Lógica de autenticación JWT
│   │
│   ├── models/                # Modelos de datos Pydantic
│   │   ├── __init__.py
│   │   ├── users.py          # Modelos de usuarios
│   │   ├── sellers.py        # Modelos de negocios y servicios
│   │   ├── token.py          # Modelos de tokens
│   │   └── utility_classes.py # Notificaciones, Chat, Mensajes
│   │
│   ├── routers/               # Endpoints de la API
│   │   ├── __init__.py
│   │   ├── auth.py           # Autenticación y login
│   │   ├── users.py          # Gestión de usuarios
│   │   ├── business.py       # Gestión de negocios
│   │   ├── gmaps.py          # Integración con Google Maps
│   │   ├── notifications.py  # Notificaciones
│   │   └── chat.py           # Sistema de mensajería
│   │
│   ├── services/              # Lógica de negocio
│   │   └── auth_code.py      # Códigos de autenticación
│   │
│   └── utils/                 # Utilidades
│       └── password_validator.py # Validación de contraseñas
│
├── tests/                     # Tests unitarios y de integración
│   ├── test_backend_multiplataforma.py
│   ├── test_mongo_connection.py
│   ├── test_send_email.py
│   └── delete_all_users.py
│
├── requirements.txt           # Dependencias de Python
├── .env.example              # Template de variables de entorno
├── .dockerignore             # Archivos a ignorar en Docker
├── railway.json              # Configuración de Railway
├── Procfile                  # Configuración de despliegue
├── start.sh                  # Script de inicio para producción
├── run_server.sh             # Script de desarrollo (Linux/macOS)
└── run_server.bat            # Script de desarrollo (Windows)
```

## 🚀 Inicio Rápido

### ⚡ Desarrollo sin Backend Local (Recomendado)

**¿Sabías que puedes trabajar sin levantar el backend localmente?**

El backend ya está desplegado en Railway, por lo que el frontend puede conectarse directamente a él. Esto es ideal para:

- ✅ Desarrollo rápido del frontend
- ✅ No preocuparte por configurar MongoDB local
- ✅ Probar en dispositivos móviles reales
- ✅ Compartir con otros desarrolladores/evaluadores

**Solo necesitas:**
```bash
cd frontend
npm run web:dev
# ¡Listo! El frontend se conecta automáticamente a Railway
```

### 🔧 Desarrollo con Backend Local (Opcional)

Si necesitas hacer cambios en el backend o trabajar offline, sigue estos pasos:

### Primera Vez (Setup)

Usa los scripts de setup automático según tu sistema operativo:

#### Linux/macOS:

```bash
cd backend
./setup.sh          # Configura todo automáticamente
nano .env           # Edita las variables de entorno
./run_server.sh     # Inicia el servidor
```

#### Windows:

```cmd
cd backend
setup.bat           # Configura todo automáticamente
notepad .env        # Edita las variables de entorno
run_server.bat      # Inicia el servidor
```

El script `setup.sh`/`setup.bat` hace automáticamente:

- ✅ Crea `.env` desde `.env.example`
- ✅ Crea el entorno virtual (`venv/`)
- ✅ Instala todas las dependencias

### Desarrollo Diario

Cada vez que trabajes en el proyecto:

```bash
# Linux/macOS
./run_server.sh

# Windows
run_server.bat
```

---

## 📜 Scripts Disponibles

### Scripts de Desarrollo (para ti)

| Script           | Sistema     | Propósito         | Cuándo usarlo                |
| ---------------- | ----------- | ----------------- | ---------------------------- |
| `setup.sh`       | Linux/macOS | Setup inicial     | **1 sola vez** (primera vez) |
| `setup.bat`      | Windows     | Setup inicial     | **1 sola vez** (primera vez) |
| `run_server.sh`  | Linux/macOS | Ejecutar servidor | **Cada día** que desarrolles |
| `run_server.bat` | Windows     | Ejecutar servidor | **Cada día** que desarrolles |

### Scripts de Producción (Railway)

| Script     | Propósito             | Quién lo ejecuta        |
| ---------- | --------------------- | ----------------------- |
| `start.sh` | Iniciar en producción | Railway automáticamente |
| `Procfile` | Config de Railway     | Railway automáticamente |

### ¿Por qué .dockerignore?

Railway usa Docker internamente para ejecutar tu app. El `.dockerignore` le dice qué archivos **NO copiar** al contenedor:

- ❌ `venv/` - No copiar entorno virtual local
- ❌ `.env` - No copiar secrets locales
- ❌ `tests/` - No copiar tests
- ✅ `app/` - SÍ copiar código fuente

**Resultado**: Builds más rápidos y contenedores más pequeños.

---

## 🔧 Setup Manual (sin scripts)

Si prefieres hacerlo manualmente:

### 1. Configurar Variables de Entorno

```bash
# Copiar el template de variables de entorno
cp .env.example .env

# Editar .env con tus valores reales
nano .env
```

Variables requeridas:

- `MONGO_URI`: Conexión a MongoDB
- `JWT_SECRET_KEY`: Clave secreta para JWT
- `ALLOWED_ORIGINS`: Orígenes permitidos para CORS

### 2. Instalar Dependencias

#### Linux / macOS:

```bash
# Crear entorno virtual
python3 -m venv venv

# Activar entorno virtual
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

#### Windows:

```cmd
# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
venv\Scripts\activate.bat

# Instalar dependencias
pip install -r requirements.txt
```

### 3. Ejecutar el Servidor

#### Opción 1 - Scripts automatizados:

**Linux/macOS:**

```bash
./run_server.sh
```

**Windows:**

```cmd
run_server.bat
```

#### Opción 2 - Manual:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 📡 Endpoints Disponibles

Una vez que el servidor esté corriendo:

- **API Base**: http://localhost:8000
- **Documentación Interactiva**: http://localhost:8000/docs
- **Documentación Alternativa**: http://localhost:8000/redoc

### Principales Rutas:

#### Autenticación

- `POST /login` - Iniciar sesión
- `POST /register` - Registrar usuario

#### Usuarios

- `GET /users/me` - Obtener usuario actual
- `GET /users` - Listar usuarios
- `POST /users` - Crear usuario
- `PUT /users/{id}` - Actualizar usuario
- `DELETE /users/{id}` - Eliminar usuario
- `POST /users/{id}/change-password` - Cambiar contraseña
- `POST /users/reset-password` - Restablecer contraseña

#### Negocios

- `GET /business` - Listar negocios
- `POST /business` - Crear negocio
- `POST /business/request-service` - Solicitar servicio
- `GET /business/services` - Listar servicios

#### Google Maps

- `GET /autocomplete/{query}` - Autocompletar direcciones

#### Notificaciones

- `GET /notifications/{user_id}` - Obtener notificaciones
- `POST /notifications` - Crear notificación

#### Chat

- `GET /chat/{user_id}` - Obtener chats de un usuario
- `GET /chat/{chat_id}/messages` - Obtener mensajes de un chat

## 🧪 Testing

```bash
# Activar entorno virtual primero
source venv/bin/activate  # Linux/macOS
# o
venv\Scripts\activate.bat  # Windows

# Test de conexión a MongoDB
python tests/test_mongo_connection.py

# Test multiplataforma
python tests/test_backend_multiplataforma.py
```

---

## ⚡ Comandos Útiles

### Desarrollo Local

```bash
# Activar entorno virtual
source venv/bin/activate      # Linux/macOS
venv\Scripts\activate.bat     # Windows

# Ejecutar servidor
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Ejecutar con variables de entorno específicas
PORT=3000 uvicorn app.main:app --reload

# Ver dependencias instaladas
pip list

# Instalar nueva dependencia
pip install nombre-paquete

# Actualizar requirements.txt
pip freeze > requirements.txt
```

### Gestión de Base de Datos

```bash
# Conectar a MongoDB (si tienes mongosh)
mongosh "mongodb+srv://usuario:password@cluster.mongodb.net/"

# Ver bases de datos
show dbs

# Usar base de datos
use pymemap_db

# Ver colecciones
show collections

# Ver usuarios
db.users.find().pretty()

# Contar documentos
db.users.countDocuments()
```

### Debugging

```bash
# Ver puertos en uso
lsof -i :8000              # Linux/macOS
netstat -ano | findstr :8000  # Windows

# Matar proceso en puerto
kill -9 $(lsof -t -i:8000)  # Linux/macOS

# Ver logs del servidor
tail -f logs/app.log        # Si tienes logging a archivo

# Verificar variables de entorno
cat .env                    # Linux/macOS
type .env                   # Windows
```

### Limpieza

```bash
# Limpiar __pycache__
find . -type d -name "__pycache__" -exec rm -rf {} +  # Linux/macOS
find . -type f -name "*.pyc" -delete                  # Linux/macOS

# Reinstalar entorno virtual
rm -rf venv/
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Generar JWT Secret Key

```bash
# Linux/macOS
openssl rand -hex 32

# Python (cualquier OS)
python -c "import secrets; print(secrets.token_hex(32))"

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

---

## 🧪 Testing

```bash
# Activar entorno virtual primero
source venv/bin/activate  # Linux/macOS
# o
venv\Scripts\activate.bat  # Windows

# Ejecutar test de conexión
python tests/test_mongo_connection.py

# Ejecutar test multiplataforma
python tests/test_backend_multiplataforma.py
```

## 🌐 Despliegue

### 🎉 Backend Actualmente Desplegado

El backend de PymeMap ya está desplegado y funcionando en Railway:

**🔗 URL**: https://pymemap-production-306f.up.railway.app  
**📚 Documentación**: https://pymemap-production-306f.up.railway.app/docs  
**✅ Estado**: Activo y funcionando

### 🔄 Flujo de Trabajo con Deployment

Cuando trabajas con el backend desplegado:

**1. Hacer cambios localmente:**
```bash
cd backend
# Editar código...
```

**2. Commitear y pushear:**
```bash
git add .
git commit -m "feat: nuevo endpoint de X"
git push origin issue-despliegue
```

**3. Railway auto-deploya:**
- Detecta el push automáticamente
- Construye la nueva versión (~2-3 minutos)
- Despliega si no hay errores
- Puedes ver el progreso en el dashboard de Railway

**4. Probar los cambios:**
```bash
curl https://pymemap-production-306f.up.railway.app/
```

### 📚 Guía Completa de Despliegue

Para desplegar tu propia instancia o entender la configuración completa:

**👉 [docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md)**

Incluye:

- Setup de MongoDB Atlas paso a paso
- Configuración de Railway desde cero
- Variables de entorno requeridas
- Troubleshooting completo
- Monitoreo y mantenimiento

### Resumen Rápido (Para Nueva Instancia)

1. **Crear cuenta en Railway** → [railway.app](https://railway.app)
2. **Configurar MongoDB Atlas** → [cloud.mongodb.com](https://cloud.mongodb.com)
3. **Conectar repositorio de GitHub** a Railway
4. **Configurar Root Directory** → `backend`
5. **Agregar variables de entorno**:
   ```env
   MONGO_URI=mongodb+srv://...
   MONGO_DB_NAME=pymemap_db
   JWT_SECRET_KEY=clave-super-secreta
   ENVIRONMENT=production
   ALLOWED_ORIGINS=https://tu-frontend.com
   ```
6. **Deploy automático** → Railway despliega automáticamente

### Railway CLI (Opcional)

```bash
# Instalar
npm install -g @railway/cli

# Login
railway login

# Inicializar
railway init

# Ver logs
railway logs --follow

# Desplegar
railway up
```

---

## 🔧 Tecnologías

- **FastAPI 0.111.0** - Framework web moderno y rápido
- **Motor 3.7.1** - Driver asíncrono de MongoDB
- **Pydantic 2.11.9** - Validación de datos
- **python-jose 3.3.0** - Manejo de JWT
- **bcrypt 3.2.2** - Hash de contraseñas
- **Uvicorn 0.29.0** - Servidor ASGI
- **Resend 2.14.0** - Envío de emails

---

## 📝 Notas de Desarrollo

### Estructura de Modelos

Todos los modelos están en `app/models/`:

- **users.py**: User, UserResponse, UserUpdate, ResetPasswordRequest, UpdateBalanceRequest
- **sellers.py**: Business, Service
- **utility_classes.py**: Notification, Chat, Message
- **token.py**: Token, TokenData

### Autenticación

La autenticación usa JWT tokens:

- Los tokens expiran según `ACCESS_TOKEN_EXPIRE_MINUTES`
- Las rutas protegidas requieren el header: `Authorization: Bearer <token>`
- Usa `get_current_user` como dependencia en rutas protegidas

Ejemplo de uso:

```python
from app.auth import get_current_user

@router.get("/protected")
async def protected_route(current_user: UserResponse = Depends(get_current_user)):
    return {"user": current_user}
```

### Base de Datos

MongoDB con Motor (driver asíncrono):

- Conexión configurada en `app/db.py`
- Usa certificados SSL con `certifi`
- Las colecciones se crean automáticamente al insertar documentos

### CORS

Configurado en `app/main.py`:

- **Desarrollo** (`ENVIRONMENT=development`): Permite todos los orígenes (`*`)
- **Producción** (`ENVIRONMENT=production`): Solo dominios en `ALLOWED_ORIGINS`

---

## 🐛 Troubleshooting

### Backend no inicia

**Problema**: Error al ejecutar `./run_server.sh` o `run_server.bat`

**Soluciones**:

1. Verifica que estás en el directorio `backend/`
2. Verifica que `.env` existe: `ls -la .env`
3. Activa el entorno virtual manualmente:
   ```bash
   source venv/bin/activate  # Linux/macOS
   venv\Scripts\activate.bat  # Windows
   ```
4. Verifica dependencias: `pip list | grep fastapi`
5. Reinstala si es necesario: `pip install -r requirements.txt`

### Error: "Could not validate credentials"

**Problema**: Token JWT inválido o expirado

**Soluciones**:

1. Verifica que `JWT_SECRET_KEY` sea la misma en toda la app
2. Genera un nuevo token haciendo login
3. Verifica que el token no haya expirado
4. Formato correcto del header: `Authorization: Bearer <token>`

### Error de conexión a MongoDB

**Problema**: No puede conectar con MongoDB Atlas

**Soluciones**:

1. **Verifica MONGO_URI en .env**:
   ```bash
   cat .env | grep MONGO_URI
   ```
2. **Prueba la conexión manualmente**:
   ```bash
   python tests/test_mongo_connection.py
   ```
3. **Verifica Network Access en MongoDB Atlas**:
   - Debe incluir `0.0.0.0/0` (o tu IP específica)
4. **Verifica credenciales**:
   - Usuario y password correctos
   - Reemplazaste `<password>` en la URI

### Error de CORS

**Problema**: Frontend no puede hacer requests al backend

**Soluciones**:

1. **En desarrollo**: Configura `ENVIRONMENT=development` en `.env`
2. **En producción**: Agrega tu dominio a `ALLOWED_ORIGINS`:
   ```env
   ALLOWED_ORIGINS=https://tu-frontend.vercel.app,https://otro-dominio.com
   ```
3. Reinicia el servidor después de cambiar `.env`

### Puerto ya en uso

**Problema**: Error: "Address already in use"

**Soluciones**:

```bash
# Linux/macOS - Encontrar proceso
lsof -i :8000

# Linux/macOS - Matar proceso
kill -9 $(lsof -t -i:8000)

# Windows - Encontrar proceso
netstat -ano | findstr :8000

# Windows - Matar proceso (como Admin)
taskkill /PID <PID> /F
```

### ModuleNotFoundError

**Problema**: Python no encuentra un módulo

**Soluciones**:

1. Verifica que el entorno virtual esté activado
2. Reinstala dependencias:
   ```bash
   pip install -r requirements.txt
   ```
3. Si agregaste una nueva dependencia, actualiza requirements:
   ```bash
   pip freeze > requirements.txt
   ```

### Problemas con Scripts

**Problema**: `./setup.sh: Permission denied`

**Solución**:

```bash
# Dar permisos de ejecución
chmod +x setup.sh run_server.sh start.sh
```

**Problema**: Scripts de Windows no funcionan

**Solución**:

1. Ejecuta desde CMD (no PowerShell)
2. O usa Git Bash en Windows
3. O ejecuta manualmente los comandos del script

---

## 📚 Recursos Adicionales

- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **Motor Docs**: https://motor.readthedocs.io/
- **Pydantic Docs**: https://docs.pydantic.dev/
- **MongoDB Atlas**: https://docs.atlas.mongodb.com/
- **Railway Docs**: https://docs.railway.app/

---

## 📞 Soporte

Si tienes problemas:

1. 📖 **Lee esta documentación completa**
2. 🚂 **Para deployment**: Ver [docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md)
3. 🐛 **Revisa la sección [Troubleshooting](#-troubleshooting)**
4. 🔍 **Busca el error en Google** (copia el mensaje completo)
5. 💬 **Consulta Stack Overflow**

---
