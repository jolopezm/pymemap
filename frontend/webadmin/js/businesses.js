import { getBusinesses, deleteBusiness } from './api/businesses.js'

let allBusinesses = []
let filteredBusinesses = []

// Cargar negocios al iniciar
document.addEventListener('DOMContentLoaded', () => {
    loadBusinesses()
    setupEventListeners()
})

function setupEventListeners() {
    document
        .getElementById('categoryFilter')
        .addEventListener('change', applyFilters)
    document
        .getElementById('searchInput')
        .addEventListener('input', applyFilters)
}

async function loadBusinesses() {
    try {
        const loading = document.getElementById('loading')
        const table = document.getElementById('businesses-table')
        const emptyState = document.getElementById('empty-state')

        loading.style.display = 'block'
        table.style.display = 'none'
        emptyState.style.display = 'none'

        allBusinesses = await getBusinesses()
        filteredBusinesses = [...allBusinesses]

        loading.style.display = 'none'
        renderBusinesses()
        updateMetrics()
    } catch (error) {
        console.error('Error loading businesses:', error)
        document.getElementById('loading').style.display = 'none'
        showToast(
            'Error al cargar los negocios. Por favor, intenta de nuevo.',
            'error'
        )
    }
}

function renderBusinesses() {
    const tbody = document.getElementById('businesses-list')
    const table = document.getElementById('businesses-table')
    const emptyState = document.getElementById('empty-state')

    if (filteredBusinesses.length === 0) {
        table.style.display = 'none'
        emptyState.style.display = 'block'
        return
    }

    emptyState.style.display = 'none'
    table.style.display = 'block'
    tbody.innerHTML = filteredBusinesses
        .map(
            business => `
        <tr style="border-bottom: 1px solid var(--light-gray);">
            <td style="padding: 12px;">
                <strong>${business.name || 'Sin nombre'}</strong>
                ${business.description ? `<br><small style="color: var(--muted);">${business.description.substring(0, 50)}...</small>` : ''}
            </td>
            <td style="padding: 12px;">${business.owner_name || business.owner_id || 'N/A'}</td>
            <td style="padding: 12px;">${getCategoryBadge(business.category)}</td>
            <td style="padding: 12px;">
                ${business.average_rating ? `⭐ ${business.average_rating.toFixed(1)}` : '—'}
                ${business.review_count ? `<br><small style="color: var(--muted);">(${business.review_count} reviews)</small>` : ''}
            </td>
            <td style="padding: 12px; text-align: center;">
                <button 
                    onclick="viewBusiness('${business._id || business.id}')" 
                    style="background: none; border: none; cursor: pointer; font-size: 18px; padding: 4px 8px;" 
                    title="Ver detalles"
                >
                    👁️
                </button>
                <button 
                    onclick="confirmDelete('${business._id || business.id}', '${(business.name || '').replace(/'/g, "\\'")}')" 
                    style="background: none; border: none; cursor: pointer; font-size: 18px; padding: 4px 8px; color: #dc3545;" 
                    title="Eliminar"
                >
                    🗑️
                </button>
            </td>
        </tr>
    `
        )
        .join('')
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

function applyFilters() {
    const categoryFilter = document
        .getElementById('categoryFilter')
        .value.toLowerCase()
    const searchQuery = document
        .getElementById('searchInput')
        .value.toLowerCase()

    filteredBusinesses = allBusinesses.filter(business => {
        const matchesCategory =
            !categoryFilter ||
            (business.category || '').toLowerCase() === categoryFilter
        const matchesSearch =
            !searchQuery ||
            (business.name || '').toLowerCase().includes(searchQuery) ||
            (business.description || '').toLowerCase().includes(searchQuery) ||
            (business.owner_name || '').toLowerCase().includes(searchQuery)

        return matchesCategory && matchesSearch
    })

    renderBusinesses()
    updateMetrics()
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

// Funciones globales para los botones
window.viewBusiness = function (id) {
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

window.confirmDelete = async function (id, name) {
    if (
        confirm(`¿Estás seguro de que quieres eliminar el negocio "${name}"?`)
    ) {
        try {
            await deleteBusiness(id)
            showToast(`Negocio "${name}" eliminado correctamente`)
            loadBusinesses()
        } catch (error) {
            console.error('Error deleting business:', error)
            showToast('Error al eliminar el negocio', 'error')
        }
    }
}
