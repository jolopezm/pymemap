import {
    getAllBookings,
    updateBookingStatus,
    deleteBooking,
} from './api/bookings.js'

let allBookings = []
let filteredBookings = []

// Cargar reservas al iniciar
document.addEventListener('DOMContentLoaded', () => {
    loadBookings()
    setupEventListeners()
})

function setupEventListeners() {
    document
        .getElementById('statusFilter')
        .addEventListener('change', applyFilters)
    document
        .getElementById('searchInput')
        .addEventListener('input', applyFilters)
}

async function loadBookings() {
    try {
        const loading = document.getElementById('loading')
        const table = document.getElementById('bookings-table')
        const emptyState = document.getElementById('empty-state')

        loading.style.display = 'block'
        table.style.display = 'none'
        emptyState.style.display = 'none'

        allBookings = await getAllBookings()
        filteredBookings = [...allBookings]

        loading.style.display = 'none'
        renderBookings()
        updateMetrics()
    } catch (error) {
        console.error('Error loading bookings:', error)
        document.getElementById('loading').style.display = 'none'
        showToast(
            'Error al cargar las reservas. Por favor, intenta de nuevo.',
            'error'
        )
    }
}

function renderBookings() {
    const tbody = document.getElementById('bookings-list')
    const table = document.getElementById('bookings-table')
    const emptyState = document.getElementById('empty-state')

    if (filteredBookings.length === 0) {
        table.style.display = 'none'
        emptyState.style.display = 'block'
        return
    }

    emptyState.style.display = 'none'
    table.style.display = 'block'
    tbody.innerHTML = filteredBookings
        .map(
            booking => `
        <tr style="border-bottom: 1px solid var(--light-gray);">
            <td style="padding: 12px;">
                <strong>${booking.user_name || booking.user_id || 'N/A'}</strong>
                ${booking.user_email ? `<br><small style="color: var(--muted);">${booking.user_email}</small>` : ''}
            </td>
            <td style="padding: 12px;">${booking.business_name || booking.business_id || 'N/A'}</td>
            <td style="padding: 12px;">
                📅 ${formatDate(booking.booking_date)}<br>
                🕐 ${booking.booking_time || 'N/A'}
            </td>
            <td style="padding: 12px;">${getStatusBadge(booking.status)}</td>
            <td style="padding: 12px; text-align: center;">
                <button 
                    onclick="viewBooking('${booking._id || booking.id}')" 
                    style="background: none; border: none; cursor: pointer; font-size: 18px; padding: 4px 8px;" 
                    title="Ver detalles"
                >
                    👁️
                </button>
                ${
                    booking.status === 'pending'
                        ? `
                    <button 
                        onclick="confirmBooking('${booking._id || booking.id}')" 
                        style="background: none; border: none; cursor: pointer; font-size: 18px; padding: 4px 8px; color: #28a745;" 
                        title="Confirmar"
                    >
                        ✓
                    </button>
                `
                        : ''
                }
                <button 
                    onclick="confirmDeleteBooking('${booking._id || booking.id}')" 
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

function getStatusBadge(status) {
    const badges = {
        pending: '<span class="badge badge-warning">Pendiente</span>',
        confirmed: '<span class="badge badge-info">Confirmada</span>',
        completed: '<span class="badge badge-success">Completada</span>',
        cancelled: '<span class="badge badge-gray">Cancelada</span>',
        rejected: '<span class="badge badge-danger">Rechazada</span>',
    }
    return (
        badges[status] ||
        `<span class="badge badge-gray">${status || 'Desconocido'}</span>`
    )
}

function applyFilters() {
    const statusFilter = document
        .getElementById('statusFilter')
        .value.toLowerCase()
    const searchQuery = document
        .getElementById('searchInput')
        .value.toLowerCase()

    filteredBookings = allBookings.filter(booking => {
        const matchesStatus =
            !statusFilter ||
            (booking.status || '').toLowerCase() === statusFilter
        const matchesSearch =
            !searchQuery ||
            (booking.user_name || '').toLowerCase().includes(searchQuery) ||
            (booking.user_email || '').toLowerCase().includes(searchQuery) ||
            (booking.business_name || '').toLowerCase().includes(searchQuery)

        return matchesStatus && matchesSearch
    })

    renderBookings()
    updateMetrics()
}

function updateMetrics() {
    const total = allBookings.length
    const pending = allBookings.filter(b => b.status === 'pending').length
    const confirmed = allBookings.filter(b => b.status === 'confirmed').length
    const completed = allBookings.filter(b => b.status === 'completed').length

    document.getElementById('totalBookings').textContent = total
    document.getElementById('pendingBookings').textContent = pending
    document.getElementById('confirmedBookings').textContent = confirmed
    document.getElementById('completedBookings').textContent = completed
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
window.viewBooking = function (id) {
    const booking = allBookings.find(b => b._id === id || b.id === id)
    if (booking) {
        alert(
            `Reserva ID: ${id}\n` +
                `Usuario: ${booking.user_name || 'N/A'}\n` +
                `Negocio: ${booking.business_name || 'N/A'}\n` +
                `Fecha: ${formatDate(booking.booking_date)}\n` +
                `Hora: ${booking.booking_time || 'N/A'}\n` +
                `Estado: ${booking.status}\n` +
                `Creada: ${formatDate(booking.created_at)}`
        )
    }
}

window.confirmBooking = async function (id) {
    try {
        await updateBookingStatus(id, 'confirmed')
        showToast('Reserva confirmada correctamente')
        loadBookings()
    } catch (error) {
        console.error('Error confirming booking:', error)
        showToast('Error al confirmar la reserva', 'error')
    }
}

window.confirmDeleteBooking = async function (id) {
    if (confirm('¿Estás seguro de que quieres eliminar esta reserva?')) {
        try {
            await deleteBooking(id)
            showToast('Reserva eliminada correctamente')
            loadBookings()
        } catch (error) {
            console.error('Error deleting booking:', error)
            showToast('Error al eliminar la reserva', 'error')
        }
    }
}
