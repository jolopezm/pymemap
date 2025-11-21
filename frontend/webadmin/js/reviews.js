import { getAllReviews, deleteReview } from './api/reviews.js'
import { TableComponent } from './table-component.js'

let allReviews = []
let table

// Cargar reseñas al iniciar
document.addEventListener('DOMContentLoaded', () => {
    loadReviews()
})

async function loadReviews() {
    try {
        showToast('Cargando reseñas...')

        allReviews = await getAllReviews()

        initTable()
        updateMetrics()
        showToast('Reseñas cargadas correctamente')
    } catch (error) {
        console.error('Error loading reviews:', error)
        showToast('Error al cargar las reseñas', 'error')
    }
}

function initTable() {
    table = new TableComponent({
        containerId: 'reviews-table-container',
        data: allReviews,
        columns: [
            {
                key: 'user_name',
                label: 'Usuario',
                render: (val, item) => `<strong>${val || item.user_id || 'N/A'}</strong>${item.user_email ? `<br><small style="color: var(--muted);">${item.user_email}</small>` : ''}`,
                editable: true,
                searchable: true
            },
            {
                key: 'business_name',
                label: 'Negocio',
                render: val => val || 'N/A',
                editable: true,
                searchable: true
            },
            {
                key: 'rating',
                label: 'Rating',
                render: val => getStars(val),
                filterable: true,
                editable: true
            },
            {
                key: 'comment',
                label: 'Comentario',
                render: val => `<div style="max-width: 300px; overflow: hidden; text-overflow: ellipsis;">${val || '<span style="color: var(--muted);">Sin comentario</span>'}</div>`,
                editable: true,
                searchable: true
            }
        ],
        actions: [
            { key: 'delete', label: 'Eliminar Seleccionadas', multiple: true },
            { key: 'view', label: 'Ver Detalles', multiple: false }
        ],
        onAction: handleAction
    })

    window.tableInstances['reviews-table-container'] = table
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
    if (confirm(`¿Eliminar ${ids.length} reseña(s)?`)) {
        try {
            for (const id of ids) {
                await deleteReview(id)
            }
            showToast(`${ids.length} reseña(s) eliminada(s)`)
            loadReviews()
        } catch (error) {
            console.error('Error deleting reviews:', error)
            showToast('Error al eliminar reseñas', 'error')
        }
    }
}

function handleView(id) {
    const review = allReviews.find(r => r._id === id || r.id === id)
    if (review) {
        alert(
            `Reseña ID: ${id}\n\n` +
                `Usuario: ${review.user_name || 'N/A'}\n` +
                `Negocio: ${review.business_name || 'N/A'}\n` +
                `Calificación: ${getStars(review.rating)}\n` +
                `Fecha: ${formatDate(review.created_at)}\n\n` +
                `Comentario:\n${review.comment || 'Sin comentario'}`
        )
    }
}

function handleSave(id, updates) {
    console.log('Guardar reseña:', id, updates)
    showToast('Reseña actualizada (simulado)')
}

function getStars(rating) {
    if (!rating) return '—'
    const stars = '⭐'.repeat(Math.floor(rating))
    return `<span title="${rating} estrellas">${stars} ${rating.toFixed(1)}</span>`
}

function formatDate(dateString) {
    if (!dateString) return 'N/A'
    try {
        const date = new Date(dateString)
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    } catch {
        return dateString
    }
}

function updateMetrics() {
    const total = allReviews.length
    const totalRating = allReviews.reduce((sum, r) => sum + (r.rating || 0), 0)
    const avgRating = total > 0 ? (totalRating / total).toFixed(1) : '0.0'
    const fiveStars = allReviews.filter(r => r.rating === 5).length
    const lowRatings = allReviews.filter(r => r.rating <= 2).length

    document.getElementById('totalReviews').textContent = total
    document.getElementById('avgRating').textContent = avgRating
    document.getElementById('fiveStars').textContent = fiveStars
    document.getElementById('lowRatings').textContent = lowRatings
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
