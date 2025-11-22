import { getBusinesses, deleteBusiness } from './api/businesses.js'
import { TableComponent } from './table-component.js'

let allBusinesses = []
let table

// Cargar negocios al iniciar
document.addEventListener('DOMContentLoaded', () => {
    loadBusinesses()
})

async function loadBusinesses() {
    try {
        showToast('Cargando negocios...')

        allBusinesses = await getBusinesses()

        initTable()
        updateMetrics()
        showToast('Negocios cargados correctamente')
    } catch (error) {
        console.error('Error loading businesses:', error)
        showToast('Error al cargar los negocios', 'error')
    }
}

function initTable() {
    table = new TableComponent({
        containerId: 'businesses-table-container',
        data: allBusinesses,
        columns: [
            {
                key: 'name',
                label: 'Nombre',
                render: (val, item) =>
                    `<strong>${val || 'Sin nombre'}</strong>${item.description ? `<br><small style="color: var(--muted);">${item.description.substring(0, 50)}...</small>` : ''}`,
                searchable: true,
            },
            {
                key: 'owner_id',
                label: 'Propietario',
                render: val => val || 'N/A',
            },
            {
                key: 'category',
                label: 'Categoría',
                render: val => getCategoryBadge(val),
                filterable: true,
            },
            {
                key: 'profile_pic',
                label: 'Foto de negocio',
                render: (val, item) =>
                    val
                        ? `<img src="${val}" alt="Foto de ${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">`
                        : 'N/A',
            },
            {},
        ],
        actions: [
            { key: 'delete', label: 'Eliminar Seleccionados', multiple: true },
            {
                key: 'view',
                label: 'Ver Detalles',
                multiple: false,
                requiresSelection: true,
            },
            {
                key: 'refresh',
                label: 'Refrescar',
                multiple: false,
                requiresSelection: false,
            },
        ],
        onAction: handleAction,
    })

    window.tableInstances['businesses-table-container'] = table
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
        .map(id => allBusinesses.find(b => b._id === id || b.id === id)?.name)
        .filter(Boolean)
    if (confirm(`¿Eliminar ${ids.length} negocio(s): ${names.join(', ')}?`)) {
        try {
            for (const id of ids) {
                await deleteBusiness(id)
            }
            showToast(`${ids.length} negocio(s) eliminado(s)`)
            loadBusinesses()
        } catch (error) {
            console.error('Error deleting businesses:', error)
            showToast('Error al eliminar negocios', 'error')
        }
    }
}

function handleView(id) {
    const business = allBusinesses.find(b => b._id === id || b.id === id)
    if (business) {
        alert(
            `Negocio: ${business.name}\n` +
                `Propietario: ${business.owner_name || 'N/A'}\n` +
                `Categoría: ${business.category || 'N/A'}\n` +
                `Rating: ${business.average_rating || 'Sin rating'}\n` +
                `Estado: ${business.is_active ? 'Activo' : 'Inactivo'}\n` +
                `Descripción: ${business.description || 'Sin descripción'}`
        )
    }
}

function handleSave(id, updates) {
    console.log('Guardar negocio:', id, updates)
    // Aquí iría la llamada a la API para actualizar
    showToast('Negocio actualizado (simulado)')
}

function getCategoryBadge(category) {
    const badges = {
        restaurant: '🍽️ Restaurante',
        salon: '💇 Salón',
        gym: '💪 Gimnasio',
        clinic: '🏥 Clínica',
        other: '📦 Otro',
    }
    return badges[category] || '📦 ' + (category || 'Sin categoría')
}

function updateMetrics() {
    const total = allBusinesses.length
    const active = allBusinesses.filter(b => b.is_active).length
    const verified = allBusinesses.filter(b => b.is_verified).length

    const totalRatings = allBusinesses.reduce(
        (sum, b) => sum + (b.average_rating || 0),
        0
    )
    const avgRating = total > 0 ? (totalRatings / total).toFixed(1) : '0.0'

    document.getElementById('totalBusinesses').textContent = total
    document.getElementById('activeBusinesses').textContent = active
    document.getElementById('verifiedBusinesses').textContent = verified
    document.getElementById('avgRating').textContent = avgRating
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast')
    toast.textContent = message
    toast.className = `toast ${type}`
    toast.classList.add('show')

    setTimeout(() => {
        toast.classList.remove('show')
    }, 3000)
}
