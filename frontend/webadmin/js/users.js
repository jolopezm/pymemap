import { getUsers } from './api/users.js'

// ============================================
// ESTADO GLOBAL
// ============================================

let allUsers = []
let filteredUsers = []

// ============================================
// ELEMENTOS DEL DOM
// ============================================

const elements = {
    loading: document.getElementById('loading'),
    usersTable: document.getElementById('users-table'),
    usersList: document.getElementById('users-list'),
    emptyState: document.getElementById('empty-state'),
    roleFilter: document.getElementById('roleFilter'),
    searchInput: document.getElementById('searchInput'),
    totalUsers: document.getElementById('total-users'),
    activeUsers: document.getElementById('active-users'),
    businessUsers: document.getElementById('business-users'),
    toast: document.getElementById('toast'),
}

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

function showToast(message, type = 'info') {
    const toast = elements.toast
    toast.textContent = message
    toast.className = `toast show ${type}`

    setTimeout(() => {
        toast.classList.remove('show')
    }, 3000)
}

function getRoleBadge(role) {
    const badges = {
        client: '<span style="background: #e3f2fd; color: #1976d2; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Cliente</span>',
        business:
            '<span style="background: #f3e5f5; color: #7b1fa2; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Negocio</span>',
        admin: '<span style="background: #fff3e0; color: #e65100; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Admin</span>',
    }
    return badges[role] || role
}

// ============================================
// FILTRADO
// ============================================

function applyFilters() {
    const roleFilter = elements.roleFilter.value
    const searchTerm = elements.searchInput.value.toLowerCase()

    filteredUsers = allUsers.filter(user => {
        // Filtro por rol
        const matchesRole = roleFilter === 'all' || user.role === roleFilter

        // Filtro por búsqueda
        const matchesSearch =
            user.name.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm)

        return matchesRole && matchesSearch
    })

    renderUsers()
}

// ============================================
// RENDERIZADO
// ============================================

function renderUsers() {
    const tbody = elements.usersList

    if (filteredUsers.length === 0) {
        elements.usersTable.style.display = 'none'
        elements.emptyState.style.display = 'block'
        return
    }

    elements.usersTable.style.display = 'block'
    elements.emptyState.style.display = 'none'

    tbody.innerHTML = filteredUsers
        .map(
            user => `
        <tr style="border-bottom: 1px solid var(--light-gray);">
            <td style="padding: 12px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--purple); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600;">
                        ${user.name.charAt(0).toUpperCase()}
                    </div>
                    <span>${user.name}</span>
                </div>
            </td>
            <td style="padding: 12px;">${user.email}</td>
            <td style="padding: 12px;">${getRoleBadge(user.role)}</td>
            <td style="padding: 12px;">${user.phone || 'N/A'}</td>
            <td style="padding: 12px; text-align: center;">
                <button 
                    onclick="window.viewUser('${user._id}')"
                    style="padding: 6px 12px; background: var(--purple); color: white; border: none; border-radius: 4px; cursor: pointer;"
                >
                    Ver detalles
                </button>
            </td>
        </tr>
    `
        )
        .join('')
}

function updateMetrics() {
    elements.totalUsers.textContent = allUsers.length
    elements.activeUsers.textContent = allUsers.filter(
        u => u.role === 'client'
    ).length
    elements.businessUsers.textContent = allUsers.filter(
        u => u.role === 'business'
    ).length
}

// ============================================
// CARGA DE DATOS
// ============================================

async function loadUsers() {
    try {
        elements.loading.style.display = 'block'
        elements.usersTable.style.display = 'none'
        elements.emptyState.style.display = 'none'

        // Llamar a la API
        allUsers = await getUsers()
        filteredUsers = [...allUsers]

        // Actualizar UI
        updateMetrics()
        renderUsers()

        showToast('Usuarios cargados correctamente', 'success')
    } catch (error) {
        console.error('Error al cargar usuarios:', error)
        showToast('Error al cargar usuarios', 'error')
        elements.emptyState.style.display = 'block'
        elements.emptyState.innerHTML =
            '<p>Error al cargar los usuarios. Por favor, intenta nuevamente.</p>'
    } finally {
        elements.loading.style.display = 'none'
    }
}

// ============================================
// ACCIONES DE USUARIO
// ============================================

window.viewUser = function (userId) {
    const user = allUsers.find(u => u._id === userId)
    if (user) {
        alert(`Usuario: ${user.name}\nEmail: ${user.email}\nRol: ${user.role}`)
        // Aquí podrías abrir un modal con más detalles
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    elements.roleFilter.addEventListener('change', applyFilters)
    elements.searchInput.addEventListener('input', applyFilters)
}

// ============================================
// INICIALIZACIÓN
// ============================================

function init() {
    setupEventListeners()
    loadUsers()
}

// Iniciar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
}
