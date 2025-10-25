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
- Estructura más profesional tipo "landing page"
- Enlaces directos a documentación específica
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

## Formato del Changelog

Este changelog sigue el formato [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

### Tipos de cambios:

- **Added** - Nuevas funcionalidades
- **Changed** - Cambios en funcionalidades existentes
- **Deprecated** - Funcionalidades próximas a ser removidas
- **Removed** - Funcionalidades eliminadas
- **Fixed** - Corrección de bugs
- **Security** - Mejoras de seguridad
