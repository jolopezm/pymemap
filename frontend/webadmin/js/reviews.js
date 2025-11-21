import { getAllReviews, deleteReview } from './api/reviews.js'

let allReviews = []
let filteredReviews = []

// Cargar reseñas al iniciar
document.addEventListener('DOMContentLoaded', () => {
    loadReviews()
    setupEventListeners()
})

function setupEventListeners() {
    document
        .getElementById('ratingFilter')
        .addEventListener('change', applyFilters)
    document
        .getElementById('searchInput')
        .addEventListener('input', applyFilters)
}

async function loadReviews() {
    try {
        const loading = document.getElementById('loading')
        const table = document.getElementById('reviews-table')
        const emptyState = document.getElementById('empty-state')

        loading.style.display = 'block'
        table.style.display = 'none'
        emptyState.style.display = 'none'

        allReviews = await getAllReviews()
        filteredReviews = [...allReviews]

        loading.style.display = 'none'
        renderReviews()
        updateMetrics()
    } catch (error) {
        console.error('Error loading reviews:', error)
        document.getElementById('loading').style.display = 'none'
        showToast(
            'Error al cargar las reseñas. Por favor, intenta de nuevo.',
            'error'
        )
    }
}

function renderReviews() {
    const tbody = document.getElementById('reviews-list')
    const table = document.getElementById('reviews-table')
    const emptyState = document.getElementById('empty-state')

    if (filteredReviews.length === 0) {
        table.style.display = 'none'
        emptyState.style.display = 'block'
        return
    }

    emptyState.style.display = 'none'
    table.style.display = 'block'
    tbody.innerHTML = filteredReviews
        .map(
            review => `
        <tr style="border-bottom: 1px solid var(--light-gray);">
            <td style="padding: 12px;">
                <strong>${review.user_name || review.user_id || 'N/A'}</strong>
                ${review.user_email ? `<br><small style="color: var(--muted);">${review.user_email}</small>` : ''}
            </td>
            <td style="padding: 12px;">${review.business_name || review.business_id || 'N/A'}</td>
            <td style="padding: 12px;">${getStars(review.rating)}</td>
            <td style="padding: 12px;">
                <div style="max-width: 300px; overflow: hidden; text-overflow: ellipsis;">
                    ${review.comment || '<span style="color: var(--muted);">Sin comentario</span>'}
                </div>
            </td>
            <td style="padding: 12px; text-align: center;">
                <button 
                    onclick="viewReview('${review._id || review.id}')" 
                    style="background: none; border: none; cursor: pointer; font-size: 18px; padding: 4px 8px;" 
                    title="Ver completo"
                >
                    👁️
                </button>
                <button 
                    onclick="confirmDeleteReview('${review._id || review.id}')" 
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

function applyFilters() {
    const ratingFilter = document.getElementById('ratingFilter').value
    const searchQuery = document
        .getElementById('searchInput')
        .value.toLowerCase()

    filteredReviews = allReviews.filter(review => {
        const matchesRating =
            !ratingFilter ||
            Math.floor(review.rating) === parseInt(ratingFilter)
        const matchesSearch =
            !searchQuery ||
            (review.user_name || '').toLowerCase().includes(searchQuery) ||
            (review.user_email || '').toLowerCase().includes(searchQuery) ||
            (review.business_name || '').toLowerCase().includes(searchQuery) ||
            (review.comment || '').toLowerCase().includes(searchQuery)

        return matchesRating && matchesSearch
    })

    renderReviews()
    updateMetrics()
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

// Funciones globales para los botones
window.viewReview = function (id) {
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

window.confirmDeleteReview = async function (id) {
    if (confirm('¿Estás seguro de que quieres eliminar esta reseña?')) {
        try {
            await deleteReview(id)
            showToast('Reseña eliminada correctamente')
            loadReviews()
        } catch (error) {
            console.error('Error deleting review:', error)
            showToast('Error al eliminar la reseña', 'error')
        }
    }
}
