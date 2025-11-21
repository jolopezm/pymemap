import { getUsers } from './api/users.js'
import { renderTemplate } from './utils/renderer.js'
import { TableComponent } from './table-component.js'

let allUsers = []
let table

// ============================================
// ELEMENTOS DEL DOM
// ============================================

const elements = {
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
// CARGA DE DATOS
// ============================================

async function loadUsers() {
    try {
        showToast('Cargando usuarios...')

        allUsers = await getUsers()

        initTable()
        updateMetrics()
        showToast('Usuarios cargados correctamente')
    } catch (error) {
        console.error('Error al cargar usuarios:', error)
        showToast('Error al cargar usuarios', 'error')
    }
}

function initTable() {
    table = new TableComponent({
        containerId: 'users-table-container',
        data: allUsers,
        columns: [
            {
                key: '_id',
                label: 'ID',
                render: val => [val ? `<span class="middle-ellipsis">${val}</span>` : 'N/A'],
                editable: false,
                searchable: true
            },
            {
                key: 'name',
                label: 'Nombre',
                render: val => val || 'N/A',
                editable: true,
                searchable: true
            },
            {
                key: 'rut',
                label: 'RUT',
                render: val => val || 'N/A',
                editable: false,
                searchable: true
            },
            {
                key: 'email',
                label: 'Email',
                render: val => val || '',
                editable: true,
                searchable: true
            },
            {
                key: 'phone',
                label: 'Teléfono',
                render: val => val || 'N/A',
                editable: true,
                searchable: true
            },
            {
                key: 'role',
                label: 'Rol',
                render: val => getRoleBadge(val),
                filterable: true,
                editable: true
            },
            {
                key: 'birthdate',
                label: 'Fecha de Nacimiento',
                render: val => val || 'N/A',
                editable: false,
                searchable: true
            },
            {
                key: 'profile_pic',
                label: 'Foto de Perfil',
                render: val => [val ? `<a href="${val}" target="_blank">Ver Foto</a>` : 'N/A'],
                editable: false,
                searchable: true
            },
            {
                key: 'registered_at',
                label: 'Creado El',
                render: val => val ? val : 'N/A',
                editable: false,
                searchable: true
            },
            {
                key: 'suspended',
                label: 'Suspendido',
                render: val => val ? 'Sí' : 'No',
                editable: true,
                searchable: true
            }
        ],
        actions: [
            { key: 'delete', label: 'Eliminar Seleccionados', multiple: true },
            { key: 'view', label: 'Ver Detalles', multiple: false }
        ],
        onAction: handleAction
    })

    window.tableInstances['users-table-container'] = table
}

function handleAction(action, ids, updates) {
    if (action === 'delete') {
        handleDelete(ids)
    } else if (action === 'view') {
        handleView(ids[0])
    } else if (action === 'save') {
        handleSave(ids, updates)
    }
}

async function handleDelete(ids) {
    const names = ids.map(id => allUsers.find(u => u._id === id)?.name).filter(Boolean)
    if (confirm(`¿Eliminar ${ids.length} usuario(s): ${names.join(', ')}?`)) {
        console.log('Eliminar usuarios (simulado):', ids)
        showToast(`${ids.length} usuario(s) eliminado(s) (simulado)`)
        // Aquí iría la llamada a la API
        // Por ahora, eliminar localmente
        allUsers = allUsers.filter(u => !ids.includes(u._id))
        table.updateData(allUsers)
        updateMetrics()
    }
}

function handleView(id) {
    const user = allUsers.find(u => u._id === id)
    if (user) {
        alert(`Usuario: ${user.name}\nEmail: ${user.email}\nRol: ${user.role}`)
    }
}

function handleSave(id, updates) {
    console.log('Guardar usuario:', id, updates)
    showToast('Usuario actualizado (simulado)')
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
// INICIALIZACIÓN
// ============================================

function init() {
    loadUsers()
}

// Iniciar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
}
