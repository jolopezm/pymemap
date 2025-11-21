/**
 * Template Includer - Carga templates HTML
 * Simple include sin necesidad de servidor
 */

// Función para incluir un template
async function includeHTML(selector, templatePath) {
    try {
        const response = await fetch(templatePath)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        const html = await response.text()
        const container = document.querySelector(selector)
        if (container) {
            container.innerHTML = html

            // Ejecutar scripts dentro del template
            const scripts = container.querySelectorAll('script')
            scripts.forEach(script => {
                const newScript = document.createElement('script')
                newScript.textContent = script.textContent
                document.body.appendChild(newScript)
            })
        }
    } catch (error) {
        console.error('Error cargando template:', error)
    }
}

// Auto-cargar sidebar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    // Cargar sidebar si existe el contenedor
    const sidebarContainer = document.getElementById('sidebar-container')
    if (sidebarContainer) {
        await includeHTML('#sidebar-container', 'templates/left-sidebar.html')

        // Inicializar funcionalidad del sidebar después de cargar
        initSidebar()
    }
})

// Inicializar funcionalidad del sidebar
function initSidebar() {
    // Manejar logout
    const logoutBtn = document.getElementById('sidebar-logout-btn')
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                // Importar dinámicamente auth-service si existe
                import('./auth-service.js')
                    .then(({ logout }) => {
                        logout()
                        window.location.href = 'login.html'
                    })
                    .catch(() => {
                        // Fallback si no existe auth-service
                        localStorage.clear()
                        window.location.href = 'login.html'
                    })
            }
        })
    }

    // Cargar datos del usuario si está disponible
    loadUserData()
}

// Cargar datos del usuario en el sidebar
async function loadUserData() {
    try {
        const { getCurrentUser } = await import('./auth-service.js')
        const user = await getCurrentUser()

        if (user) {
            // Actualizar avatar
            const avatar = document.getElementById('sidebar-user-avatar')
            if (avatar && user.name) {
                avatar.textContent = user.name.charAt(0).toUpperCase()
            }

            // Actualizar nombre
            const userName = document.getElementById('sidebar-user-name')
            if (userName && user.name) {
                userName.textContent = user.name
            }

            // Actualizar rol
            const userRole = document.getElementById('sidebar-user-role')
            if (userRole && user.role) {
                userRole.textContent =
                    user.role === 'business' ? 'Negocio' : 'Administrador'
            }
        }
    } catch (error) {
        console.log('No se pudo cargar datos del usuario:', error)
    }
}
