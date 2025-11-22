import { getUsers, deleteUser, updateUser } from './api/users.js'
import { TableComponent } from './table-component.js'

let allUsers = []
let table

const elements = {
    roleFilter: document.getElementById('roleFilter'),
    searchInput: document.getElementById('searchInput'),
    totalUsers: document.getElementById('total-users'),
    activeUsers: document.getElementById('active-users'),
    authenticatedUsers: document.getElementById('authenticated-users'),
    businessUsers: document.getElementById('business-users'),
    newUsersMonth: document.getElementById('new-users-month'),
    toast: document.getElementById('toast'),
}

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

async function loadUsers() {
    try {
        // Cargar desde localStorage primero para mostrar datos rápidamente
        const cachedUsers = localStorage.getItem('cachedUsers')
        if (cachedUsers) {
            allUsers = JSON.parse(cachedUsers)
            initTable()
            updateMetrics()
        }

        showToast('Cargando usuarios...')

        allUsers = await getUsers()
        console.log('Usuarios cargados:', allUsers)

        // Guardar en localStorage
        localStorage.setItem('cachedUsers', JSON.stringify(allUsers))

        initTable()
        updateMetrics()
        showToast('Usuarios cargados correctamente')
    } catch (error) {
        console.error('Error al cargar usuarios:', error)
        showToast('Error al cargar usuarios', 'error')
        // Si hay error y no hay datos en cache, mostrar mensaje
        if (allUsers.length === 0) {
            showToast('No se pudieron cargar los usuarios', 'error')
        }
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
                render: val => [
                    val ? `<span class="middle-ellipsis">${val}</span>` : 'N/A',
                ],
                searchable: true,
            },
            {
                key: 'name',
                label: 'Nombre',
                render: val => val || 'N/A',
                searchable: true,
            },
            {
                key: 'rut',
                label: 'RUT',
                render: val => val || 'N/A',
                searchable: true,
            },
            {
                key: 'email',
                label: 'Email',
                render: val => val || '',
            },
            {
                key: 'phone',
                label: 'Teléfono',
                render: val => val || 'N/A',
            },
            {
                key: 'role',
                label: 'Rol',
                render: val => getRoleBadge(val),
            },
            {
                key: 'birthdate',
                label: 'Fecha de Nacimiento',
                render: val => val || 'N/A',
            },
            {
                key: 'profile_pic',
                label: 'Foto de Perfil',
                render: val => [
                    val
                        ? `<a href="${val}" target="_blank">Ver Foto</a>`
                        : 'N/A',
                ],
            },
            {
                key: 'registered_at',
                label: 'Creado El',
                render: val => (val ? val : 'N/A'),
            },
            {
                key: 'isAuthenticated',
                label: 'Autenticado',
                render: val => (val ? 'Sí' : 'No'),
            },
            {
                key: 'suspended',
                label: 'Suspendido',
                render: val => (val ? 'Sí' : 'No'),
                editable: true,
            },
        ],
        actions: [
            { key: 'delete', label: 'Eliminar Seleccionados', multiple: true },
            {
                key: 'refresh',
                label: 'Refrescar',
                multiple: false,
                requiresSelection: false,
            },
        ],
        onAction: handleAction,
    })

    window.tableInstances['users-table-container'] = table
}

function handleAction(action, ids, updates) {
    if (action === 'delete') {
        handleDelete(ids)
    } else if (action === 'view') {
        handleView(ids[0])
    } else if (action === 'refresh') {
        handleRefresh()
    } else if (action === 'save') {
        handleSave(ids, updates)
    }
}

async function handleDelete(ids) {
    const names = ids
        .map(id => allUsers.find(u => u._id === id)?.name)
        .filter(Boolean)
    if (confirm(`¿Eliminar ${ids.length} usuario(s): ${names.join(', ')}?`)) {
        console.log('Eliminar usuarios (simulado):', ids)
        showToast(`${ids.length} usuario(s) eliminado(s) (simulado)`)
        // Aquí iría la llamada a la API
        // Por ahora, eliminar localmente
        allUsers = allUsers.filter(u => !ids.includes(u._id))
        localStorage.setItem('cachedUsers', JSON.stringify(allUsers))
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

function handleRefresh() {
    console.log('Refrescando usuarios...')
    loadUsers()
}

async function handleSave(id, updates) {
    console.log('Guardar usuario:', id, updates)

    // Filtrar solo los campos que cambiaron
    const originalUser = allUsers.find(u => u._id === id || u.id === id)
    if (!originalUser) {
        showToast('Usuario no encontrado', 'error')
        return
    }

    const changedUpdates = {}
    for (const [key, value] of Object.entries(updates)) {
        if (originalUser[key] !== value) {
            changedUpdates[key] = value
        }
    }

    if (Object.keys(changedUpdates).length === 0) {
        showToast('No hay cambios para guardar')
        return
    }

    // Enviar el usuario completo con los cambios aplicados
    const fullUserData = { ...originalUser, ...changedUpdates }
    // Asegurar que _id se mapee a id si es necesario
    if (fullUserData._id && !fullUserData.id) {
        fullUserData.id = fullUserData._id
        delete fullUserData._id
    }

    console.log('Datos completos a enviar:', fullUserData)

    try {
        await updateUser(id, fullUserData)
        showToast('Usuario actualizado correctamente')
        loadUsers() // Recargar para reflejar cambios
    } catch (error) {
        console.error('Error al actualizar usuario:', error)
        showToast('Error al actualizar usuario', 'error')
    }
}

function updateMetrics() {
    elements.totalUsers.textContent = allUsers.length
    elements.activeUsers.textContent = allUsers.filter(
        u => u.role === 'user' && !u.suspended
    ).length
    elements.authenticatedUsers.textContent = allUsers.filter(
        u => !u.suspended
    ).length
    elements.businessUsers.textContent = allUsers.filter(
        u => u.role === 'business'
    ).length

    // Calcular usuarios nuevos este mes
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const newUsersThisMonth = allUsers.filter(u => {
        if (!u.registered_at) return false
        // Parsear fecha en formato día/mes/año
        const parts = u.registered_at.split('/')
        if (parts.length !== 3) return false
        const day = parseInt(parts[0])
        const month = parseInt(parts[1]) - 1 // JavaScript months are 0-based
        const year = parseInt(parts[2])
        const regDate = new Date(year, month, day)
        return (
            regDate.getMonth() === currentMonth &&
            regDate.getFullYear() === currentYear
        )
    }).length
    elements.newUsersMonth.textContent = newUsersThisMonth
}

function init() {
    loadUsers()
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
}
