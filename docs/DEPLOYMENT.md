# 🚀 Guía de Despliegue - PymeMap

Documentación completa para desplegar PymeMap Backend en Railway.

---

## 📋 Tabla de Contenidos

- [Pre-requisitos](#-pre-requisitos)
- [MongoDB Atlas Setup](#-mongodb-atlas-setup)
- [Railway Deployment](#-railway-deployment)
- [Variables de Entorno](#-variables-de-entorno)
- [Verificación](#-verificación)
- [Troubleshooting](#-troubleshooting)
- [Monitoreo](#-monitoreo)

---

## ✅ Pre-requisitos

Antes de empezar, asegúrate de tener:

- [ ] Cuenta en [Railway.app](https://railway.app)
- [ ] Cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [ ] Repositorio en GitHub actualizado
- [ ] Python 3.8+ instalado localmente
- [ ] Git configurado

---

## 🗄️ MongoDB Atlas Setup

### Paso 1: Crear Cluster

1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Inicia sesión o crea una cuenta
3. Click en **"Create"** para crear un nuevo cluster
4. Selecciona **Free Tier (M0)** - suficiente para empezar
5. Elige la región más cercana a tus usuarios
6. Click en **"Create Cluster"** (toma 1-3 minutos)

### Paso 2: Configurar Database Access

1. En el menú lateral, ve a **"Database Access"**
2. Click en **"Add New Database User"**
3. Crea un usuario:
   - **Username**: `pymemap_user` (o el que prefieras)
   - **Password**: Genera una contraseña segura y **guárdala**
   - **Database User Privileges**: `Read and write to any database`
4. Click en **"Add User"**

### Paso 3: Configurar Network Access

1. En el menú lateral, ve a **"Network Access"**
2. Click en **"Add IP Address"**
3. Selecciona **"Allow Access from Anywhere"**
   - IP: `0.0.0.0/0`
   - Descripción: `Railway Access`
4. Click en **"Confirm"**

> ⚠️ **Nota**: En producción real, deberías restringir las IPs permitidas.

### Paso 4: Obtener Connection String

1. Ve a **"Database"** en el menú lateral
2. Click en **"Connect"** en tu cluster
3. Selecciona **"Connect your application"**
4. Copia la **Connection String**, se verá así:
   ```
   mongodb+srv://pymemap_user:<password>@cluster0.xxxxx.mongodb.net/
   ```
5. **Reemplaza** `<password>` con tu contraseña real
6. **Guarda** esta URI completa - la necesitarás para Railway

**Ejemplo de URI completa**:
```
mongodb+srv://pymemap_user:MiPassword123@cluster0.xxxxx.mongodb.net/
```

---

## 🔐 Generar JWT Secret Key

Antes de desplegar, necesitas una clave secreta segura para JWT.

### Linux/macOS:
```bash
openssl rand -hex 32
```

### Windows (PowerShell):
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### Alternativa (Online):
Visita https://randomkeygen.com/ y copia una **Fort Knox Password**

**Guarda esta clave** - la usarás en Railway.

---

## 🚂 Railway Deployment

### Paso 1: Crear Proyecto en Railway

1. Ve a [Railway.app](https://railway.app)
2. Inicia sesión con GitHub
3. Click en **"New Project"**
4. Selecciona **"Deploy from GitHub repo"**
5. Si es la primera vez, autoriza Railway a acceder a tus repos
6. Busca y selecciona el repositorio **`pymemap`**
7. Railway detectará automáticamente que es un proyecto Python

### Paso 2: Configurar Root Directory (Importante)

Por defecto, Railway desplegará desde la raíz del repo. Como nuestro backend está en `/backend`, necesitamos configurarlo:

1. En el proyecto de Railway, ve a **"Settings"**
2. Busca **"Root Directory"**
3. Configúralo como: `backend`
4. Click en **"Save"**

### Paso 3: Configurar Variables de Entorno

Ve a la pestaña **"Variables"** y agrega estas variables:

#### Variables Obligatorias:

```env
MONGO_URI=mongodb+srv://tu-usuario:tu-password@cluster.mongodb.net/
MONGO_DB_NAME=pymemap_db
JWT_SECRET_KEY=tu-clave-secreta-generada-anteriormente
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ENVIRONMENT=production
```

#### Variables Opcionales:

```env
ALLOWED_ORIGINS=https://tu-frontend.vercel.app,https://tu-dominio.com
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

**Cómo agregar variables**:
1. Click en **"+ New Variable"**
2. Escribe el nombre (ej: `MONGO_URI`)
3. Pega el valor
4. Click en **"Add"**
5. Repite para cada variable

### Paso 4: Verificar Configuración de Build

Railway debería detectar automáticamente:

- **Builder**: NIXPACKS o Python
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: Desde `Procfile`: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

Si ves algo diferente:
1. Ve a **"Settings"** → **"Deploy"**
2. Verifica que el **Start Command** sea correcto
3. Railway usa el archivo `Procfile` o `railway.json` automáticamente

### Paso 5: Deploy

1. Una vez configurado todo, Railway **desplegará automáticamente**
2. Ve a la pestaña **"Deployments"** para ver el progreso
3. El build tarda ~2-5 minutos la primera vez
4. Observa los logs en tiempo real

**Estados del deployment**:
- 🟡 **Building**: Instalando dependencias
- 🟢 **Active**: ¡Funcionando correctamente!
- 🔴 **Failed**: Revisa los logs para ver el error

### Paso 6: Obtener tu URL

1. Una vez desplegado, ve a **"Settings"**
2. En la sección **"Domains"**, Railway genera una URL automática:
   ```
   https://pymemap-production.up.railway.app
   ```
3. También puedes agregar un dominio custom si lo deseas

---

## 📊 Variables de Entorno

### Resumen de Variables

| Variable | Requerida | Ejemplo | Descripción |
|----------|-----------|---------|-------------|
| `MONGO_URI` | ✅ Sí | `mongodb+srv://user:pass@...` | Connection string de MongoDB Atlas |
| `MONGO_DB_NAME` | ✅ Sí | `pymemap_db` | Nombre de la base de datos |
| `JWT_SECRET_KEY` | ✅ Sí | `abc123...` (32+ chars) | Clave secreta para JWT |
| `JWT_ALGORITHM` | ✅ Sí | `HS256` | Algoritmo de encriptación JWT |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | ✅ Sí | `30` | Tiempo de expiración de tokens |
| `ENVIRONMENT` | ✅ Sí | `production` | Entorno actual |
| `ALLOWED_ORIGINS` | ⚠️ Recomendada | `https://frontend.com` | Dominios permitidos (CORS) |
| `RESEND_API_KEY` | ❌ Opcional | `re_...` | API key para emails |

### ⚠️ Importante sobre ALLOWED_ORIGINS

En desarrollo local, `ENVIRONMENT=development` permite todos los orígenes (`*`).

En producción, **debes configurar** `ALLOWED_ORIGINS` con tus dominios reales:

```env
# Un solo dominio
ALLOWED_ORIGINS=https://pymemap.vercel.app

# Múltiples dominios (separados por coma, sin espacios)
ALLOWED_ORIGINS=https://pymemap.vercel.app,https://www.pymemap.com
```

---

## ✅ Verificación

### Verificar que el deployment funcionó:

#### 1. Verificar Endpoint Principal
```bash
curl https://tu-app.up.railway.app/
```

**Respuesta esperada**:
```json
{"message":"Bienvenido a la API"}
```

#### 2. Verificar Documentación
Visita en tu navegador:
```
https://tu-app.up.railway.app/docs
```

Deberías ver la interfaz de **Swagger UI** con todos tus endpoints.

#### 3. Probar Autenticación

**Crear un usuario** (POST /users):
```bash
curl -X POST "https://tu-app.up.railway.app/users" \
  -H "Content-Type: application/json" \
  -d '{
    "rut": "12345678-9",
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123!@#",
    "birthdate": "1990-01-01"
  }'
```

**Login** (POST /login):
```bash
curl -X POST "https://tu-app.up.railway.app/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=Test123!@#"
```

Deberías recibir un **token JWT**.

---

## 🐛 Troubleshooting

### Error: "Application failed to respond"

**Causa**: El servidor no responde en el puerto correcto.

**Solución**:
1. Verifica que tu `Procfile` use `$PORT`:
   ```
   web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
2. Railway asigna el puerto automáticamente via `$PORT`
3. Revisa los logs en Railway para ver errores específicos

### Error: "Could not connect to MongoDB"

**Causa**: Problema de conexión con MongoDB Atlas.

**Soluciones**:
1. **Verifica MONGO_URI**:
   - Ve a Railway → Variables
   - Asegúrate de que `MONGO_URI` esté correcta
   - Verifica que no haya espacios extra
   - Confirma que reemplazaste `<password>` con tu contraseña real

2. **Verifica Network Access en MongoDB**:
   - MongoDB Atlas → Network Access
   - Debe incluir `0.0.0.0/0`

3. **Verifica Database User**:
   - MongoDB Atlas → Database Access
   - Usuario debe tener permisos de lectura/escritura

4. **Test de conexión**:
   - Usa MongoDB Compass o mongosh para probar la URI localmente

### Error: "Module not found" o Import Error

**Causa**: Dependencia faltante en `requirements.txt`.

**Solución**:
1. Verifica que `requirements.txt` esté completo:
   ```bash
   cd backend
   pip freeze > requirements.txt
   ```
2. Haz commit y push:
   ```bash
   git add requirements.txt
   git commit -m "Update dependencies"
   git push
   ```
3. Railway re-desplegará automáticamente

### Error: "Invalid JWT" o Authentication Failed

**Causa**: Problema con JWT_SECRET_KEY.

**Solución**:
1. Verifica que `JWT_SECRET_KEY` esté configurada en Railway
2. Debe ser la **misma clave** que usas localmente (si migras datos)
3. Debe tener **mínimo 32 caracteres**
4. No debe tener espacios ni caracteres especiales extraños

### Los logs muestran errores

**Ver logs en Railway**:
1. Ve a tu proyecto en Railway
2. Pestaña **"Deployments"**
3. Click en el deployment actual
4. **"View Logs"** para ver en tiempo real

**Comandos útiles**:
```bash
# Si instalaste Railway CLI
railway logs
railway logs --follow  # Logs en tiempo real
```

### Error 500 - Internal Server Error

**Causa**: Error en el código o configuración.

**Solución**:
1. **Revisa los logs de Railway**
2. Busca el stack trace completo
3. Verifica que todas las variables de entorno estén configuradas
4. Prueba localmente con `ENVIRONMENT=production` para replicar

### CORS Error en Frontend

**Causa**: Frontend no está en `ALLOWED_ORIGINS`.

**Solución**:
1. Ve a Railway → Variables
2. Actualiza `ALLOWED_ORIGINS`:
   ```env
   ALLOWED_ORIGINS=https://tu-frontend.vercel.app
   ```
3. Railway re-desplegará automáticamente
4. Verifica que el dominio esté **sin trailing slash**

---

## 📊 Monitoreo y Mantenimiento

### Métricas en Railway

Railway proporciona métricas en tiempo real:

1. **CPU Usage**: Uso de procesador
2. **Memory Usage**: Uso de memoria RAM
3. **Network**: Tráfico entrante/saliente
4. **Disk**: Uso de almacenamiento

**Ver métricas**:
- Ve a tu proyecto
- Pestaña **"Metrics"**

### Health Checks

Railway hace health checks automáticos:
- **Endpoint**: Tu ruta raíz `/`
- **Frecuencia**: Cada 30 segundos
- **Acción si falla**: Reinicia después de 3 fallas consecutivas

Configurado en `railway.json`:
```json
{
  "deploy": {
    "healthcheckPath": "/",
    "healthcheckTimeout": 100
  }
}
```

### Ver Logs en Tiempo Real

**Opción 1: Dashboard Web**
1. Railway → Deployments → View Logs

**Opción 2: CLI**
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Ver logs
railway logs
railway logs --follow  # Tiempo real
```

### Alertas y Notificaciones

Railway puede notificarte sobre:
- Deployments exitosos/fallidos
- Errores en runtime
- Uso de recursos

**Configurar**:
1. Settings → Notifications
2. Conecta Slack, Discord, o email

---

## 💰 Costos

### Railway Pricing

**Free Tier**:
- **$5 de crédito gratis** por mes
- ~500 horas de ejecución
- Suficiente para proyectos pequeños/MVP

**Después del Free Tier**:
- **$0.000231 por GB-hora** de memoria
- **$0.10 por GB** de transferencia de datos

**Ejemplo**: Una app con 512MB RAM corriendo 24/7:
```
512MB * 730 horas * $0.000231 = ~$86/mes
```

### MongoDB Atlas Pricing

**Free Tier (M0)**:
- **512 MB de almacenamiento** gratis
- **500 conexiones simultáneas**
- Suficiente para desarrollo y apps pequeñas

**Después del Free Tier**:
- M10 (Shared): ~$25/mes
- M20 (Dedicated): ~$50/mes

---

## 🔒 Checklist de Seguridad

Antes de lanzar a producción:

- [ ] `JWT_SECRET_KEY` es única y segura (mínimo 32 caracteres)
- [ ] `ENVIRONMENT=production` está configurado
- [ ] `ALLOWED_ORIGINS` solo incluye dominios confiables
- [ ] MongoDB Atlas tiene Network Access configurado
- [ ] No hay claves secretas en el código fuente
- [ ] HTTPS está habilitado (Railway lo hace automáticamente)
- [ ] Contraseñas de MongoDB son fuertes
- [ ] `.env` está en `.gitignore` (no se sube al repo)
- [ ] Variables sensibles solo en Railway dashboard
- [ ] Rate limiting configurado (opcional, pero recomendado)

---

## 🔗 Actualizar Frontend

Una vez desplegado el backend, actualiza tu frontend:

**`frontend/config/api.js`**:
```javascript
const API_URLS = {
  local: 'http://localhost:8000',
  production: 'https://pymemap-production.up.railway.app'  // ← Tu URL de Railway
}

export const API_URL = isLocalhost ? API_URLS.local : API_URLS.production
```

---

## 🔄 Continuous Deployment

Railway se conecta a tu repositorio de GitHub:

**Flujo automático**:
```
1. Haces cambios en tu código
2. git add, commit, push
3. Railway detecta el push
4. Inicia build automáticamente
5. Si el build pasa → Deploy
6. Si falla → Mantiene versión anterior
```

**Configurar branch de deploy**:
1. Railway → Settings → Deploy
2. **Watch Paths**: `backend/**` (solo re-deploya si cambió backend)
3. **Branch**: `main` o `production`

---

## 📚 Enlaces Útiles

- [Documentación de Railway](https://docs.railway.app/)
- [Documentación de MongoDB Atlas](https://docs.atlas.mongodb.com/)
- [FastAPI Deployment Guide](https://fastapi.tiangolo.com/deployment/)
- [Documentación de Uvicorn](https://www.uvicorn.org/)
- [Railway CLI](https://docs.railway.app/develop/cli)

---

## 📞 Soporte

**Si tienes problemas**:

1. 📖 **Revisa esta guía completa**
2. 🔍 **Revisa los logs de Railway**
3. ✅ **Verifica todas las variables de entorno**
4. 🗄️ **Prueba tu MONGO_URI localmente**
5. 💬 **Consulta la documentación de Railway**
6. 🐛 **Busca el error específico en Google**

**Recursos adicionales**:
- [Railway Discord](https://discord.gg/railway)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/railway)
- Backend README: `backend/README.md`
- Quick Commands: Ver sección de comandos en `backend/README.md`

---

¡Listo! Tu API debería estar funcionando en Railway 🎉

**Próximos pasos**:
1. ✅ Probar todos los endpoints desde `/docs`
2. ✅ Configurar el frontend con la nueva URL
3. ✅ Monitorear logs y métricas
4. ✅ Configurar alertas
5. ✅ Planificar backups de MongoDB
