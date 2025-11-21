/**
 * Pymap Admin - Auth Guard
 * Script que protege las páginas del admin requiriendo autenticación
 *
 * Uso: Incluir este script al inicio de cada página protegida:
 * <script type="module" src="js/auth-guard.js"></script>
 */

// Detectar si estamos en subcarpeta
const inSubfolder = window.location.pathname.includes('/pages/')
const authServicePath = inSubfolder
    ? './api/auth-service.js'
    : '../js/api/auth-service.js'

const { isAuthenticated, getStoredUser, logout } = await import(authServicePath)

/**
 * Verifica si el usuario está autenticado
 * Si no lo está, redirige a login
 */
function checkAuth() {
    if (!isAuthenticated()) {
        // Guardar la URL actual para redireccionar después del login
        const currentPath = window.location.pathname + window.location.search
        sessionStorage.setItem('redirectAfterLogin', currentPath)

        // Redirigir a login según ubicación
        const loginPath = inSubfolder ? 'login.html' : 'pages/login.html'
        window.location.href = loginPath
        return false
    }
    return true
}

/**
 * Inicializa la información del usuario en la UI
 */
function initUserInfo() {
    const user = getStoredUser()

    if (!user) {
        return
    }

    // Actualizar nombre de usuario en el header (si existe)
    const userNameElement = document.querySelector(
        '.profile .name, .profile div:first-child div:first-child'
    )
    if (userNameElement) {
        userNameElement.textContent = user.name || user.email || 'Usuario'
    }

    // Actualizar avatar con iniciales
    const avatarElement = document.querySelector('.profile .avatar')
    if (avatarElement && user.name) {
        const initials = user.name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2)
        avatarElement.textContent = initials
    }

    // Actualizar nombre del negocio (si existe)
    const bizNameElement = document.querySelector('.biz .name')
    if (bizNameElement && user.business_name) {
        bizNameElement.textContent = user.business_name
    }
}

/**
 * Configura el botón de logout
 */
function setupLogout() {
    // Buscar botón de logout existente o crear uno
    let logoutBtn = document.getElementById('logout-btn')

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                await logout()
                window.location.href = 'login.html'
            }
        })
    }
}

/**
 * Verifica permisos específicos (opcional)
 * @param {string[]} requiredRoles - Roles requeridos para acceder a la página
 */
function checkPermissions(requiredRoles = []) {
    if (requiredRoles.length === 0) {
        return true
    }

    const user = getStoredUser()
    if (!user) {
        return false
    }

    const userRole = user.role || user.user_type

    if (!requiredRoles.includes(userRole)) {
        alert('No tienes permisos para acceder a esta página')
        window.location.href = 'index.html'
        return false
    }

    return true
}

/**
 * Maneja la expiración del token
 */
function handleTokenExpiration() {
    // Verificar token cada 5 minutos
    setInterval(
        () => {
            if (!isAuthenticated()) {
                alert(
                    'Tu sesión ha expirado. Por favor inicia sesión nuevamente.'
                )
                window.location.href = 'login.html'
            }
        },
        5 * 60 * 1000
    ) // 5 minutos
}

/**
 * Inicialización del guard
 */
function init() {
    // Verificar autenticación
    if (!checkAuth()) {
        return
    }

    // Inicializar info del usuario
    initUserInfo()

    // Configurar logout
    setupLogout()

    // Manejar expiración del token
    handleTokenExpiration()

    console.log('✅ Auth Guard: Usuario autenticado')
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
}

// Exportar funciones útiles
export { checkAuth, checkPermissions, initUserInfo, setupLogout }
