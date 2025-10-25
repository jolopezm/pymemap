# 🚀 Inicio Rápido - PymeMap

¿Quieres ver PymeMap funcionando en **5 minutos**? Esta guía es para ti.

---

## ✅ Prerrequisitos

Antes de empezar, asegúrate de tener instalado:

- **Node.js 18+** → [Descargar aquí](https://nodejs.org/)
- **Git** → [Descargar aquí](https://git-scm.com/)

**Nota:** No necesitas Python, MongoDB ni configurar el backend. Ya está desplegado y funcionando.

---

## 🎯 Opción 1: Solo Ver el Frontend (Más Rápido)

Esta es la forma más rápida de ver PymeMap en acción.

### Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/jolopezm/pymemap.git
cd pymemap/frontend
```

### Paso 2: Instalar Dependencias

```bash
npm install
```

### Paso 3: Ejecutar la Aplicación

```bash
npm run web:dev
```

### Paso 4: Abrir en el Navegador

Abre tu navegador en: **http://localhost:8081**

**¡Listo!** El frontend se conecta automáticamente al backend desplegado en Railway.

---

## 📱 Ver en tu Móvil

### Paso 1: Instalar Expo Go

- **iOS**: [App Store](https://apps.apple.com/app/expo-go/id982107779)
- **Android**: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Paso 2: Escanear el QR

Después de ejecutar `npm run web:dev`, verás un QR code en la terminal.

### Paso 3: Escanear con Expo Go

- **iOS**: Abre la cámara y escanea el QR
- **Android**: Abre Expo Go y escanea el QR

**¡Listo!** La app correrá directamente en tu teléfono.

---

## 🧪 Probar Funcionalidades

### Crear una Cuenta

1. En la app, presiona **"Registrarse"**
2. Completa el formulario
3. Inicia sesión con tus credenciales

### Explorar sin Cuenta

También puedes presionar **"🏠 Explorar sin cuenta"** para ver la app sin registrarte.

### Funcionalidades Disponibles

- 🗺️ Buscar negocios cercanos
- 🔍 Filtrar por categorías
- 👤 Crear y editar perfil
- 🏢 Registrar tu negocio
- 💬 Sistema de chat (próximamente)

---

## 🔗 URLs Importantes

- **Frontend Local**: http://localhost:8081
- **Backend API**: https://pymemap-production-306f.up.railway.app
- **Documentación API**: https://pymemap-production-306f.up.railway.app/docs

---

## 🧯🔥 ¿Problemas?

### El frontend no inicia

```bash
# Limpiar caché
npx expo start --clear

# Reinstalar dependencias
rm -rf node_modules
npm install
```

### No puedo conectarme al backend

El backend está desplegado en Railway y debería estar siempre disponible. Si tienes problemas:

1. Verifica que tienes internet
2. Verifica que la URL del backend responde:
   ```bash
   curl https://pymemap-production-306f.up.railway.app/
   ```
3. Revisa la consola del navegador para ver errores específicos

### Errores en Expo Go (móvil)

- Asegúrate de que tu móvil y PC están en la **misma red WiFi**
- Si el QR no funciona, usa la opción "Enter URL manually" en Expo Go

---

## 📚 Siguiente Paso

¿Quieres contribuir al proyecto o hacer cambios en el backend?

👉 Ve a **[docs/DEVELOPMENT.md](DEVELOPMENT.md)** para la guía completa de desarrollo.

---

## 💡 ¿Por qué no necesito el backend local?

El backend de PymeMap ya está desplegado y funcionando en Railway. Esto significa:

- ✅ No necesitas instalar Python
- ✅ No necesitas configurar MongoDB
- ✅ No necesitas levantar el servidor backend
- ✅ Puedes enfocarte solo en el frontend

El frontend se conecta automáticamente al backend de Railway cuando lo ejecutas en `localhost`.

**¿Quieres cambiar el backend?** Consulta [docs/DEVELOPMENT.md](DEVELOPMENT.md)

---

**¡Disfruta explorando PymeMap! 🎉**
