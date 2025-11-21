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

            const scripts = container.querySelectorAll('script')
            scripts.forEach(script => {
                const newScript = document.createElement('script')
                newScript.textContent = script.textContent
                document.body.appendChild(newScript)
            })

            // Ajustar rutas de enlaces en el sidebar cuando el template
            // fue incluido desde una subcarpeta (por ejemplo pages/)
            // Evita que hrefs relativos se conviertan en pages/pages/...
            try {
                const inSubfolder = window.location.pathname.includes('/pages/')
                if (inSubfolder) {
                    const links = container.querySelectorAll('.nav a')
                    links.forEach(link => {
                        const href = link.getAttribute('href')
                        if (!href) return

                        // Si el href ya es absoluto o comienza con ../ no tocar
                        if (
                            href.startsWith('http') ||
                            href.startsWith('/') ||
                            href.startsWith('..')
                        )
                            return

                        // Si apunta a index.html (raíz), prefixar con ../
                        if (href === 'index.html') {
                            link.setAttribute('href', '../index.html')
                        }
                        // Si el href comienza con 'pages/' (caso común en template)
                        // debemos prefixarlo con ../ cuando estamos en /pages/
                        else if (href.startsWith('pages/')) {
                            link.setAttribute('href', '../' + href)
                        }
                    })
                }
            } catch (e) {
                console.warn('No se pudo ajustar enlaces del sidebar:', e)
            }
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
        // Detectar si estamos en una subcarpeta (pages/)
        const inSubfolder = window.location.pathname.includes('/pages/')
        const templatePath = inSubfolder
            ? '../templates/left-sidebar.html'
            : 'templates/left-sidebar.html'

        await includeHTML('#sidebar-container', templatePath)

        // Inicializar funcionalidad del sidebar después de cargar
        initSidebar()
    }
})

// Inicializar funcionalidad del sidebar
function initSidebar() {
    // Detectar si estamos en subcarpeta
    const inSubfolder = window.location.pathname.includes('/pages/')

    // Manejar logout
    const logoutBtn = document.getElementById('sidebar-logout-btn')
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                // Importar dinámicamente auth-service si existe
                const authPath = inSubfolder
                    ? '../js/api/auth-service.js'
                    : './js/api/auth-service.js'
                const loginPath = inSubfolder
                    ? '../pages/login.html'
                    : 'pages/login.html'

                import(authPath)
                    .then(({ logout }) => {
                        logout()
                        window.location.href = loginPath
                    })
                    .catch(() => {
                        // Fallback si no existe auth-service
                        localStorage.clear()
                        window.location.href = loginPath
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
        const inSubfolder = window.location.pathname.includes('/pages/')
        const authPath = inSubfolder
            ? '../js/api/auth-service.js'
            : './js/api/auth-service.js'

        const { getCurrentUser } = await import(authPath)
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
