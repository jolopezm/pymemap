import {
    getAllBookings,
    updateBookingStatus,
    deleteBooking,
} from './api/bookings.js'
import { TableComponent } from './table-component.js'

let allBookings = []
let table

// Cargar reservas al iniciar
document.addEventListener('DOMContentLoaded', () => {
    loadBookings()
})

async function loadBookings() {
    try {
        showToast('Cargando reservas...')

        allBookings = await getAllBookings()

        initTable()
        updateMetrics()
        showToast('Reservas cargadas correctamente')
    } catch (error) {
        console.error('Error loading bookings:', error)
        showToast('Error al cargar las reservas', 'error')
    }
}

function initTable() {
    table = new TableComponent({
        containerId: 'bookings-table-container',
        data: allBookings,
        columns: [
            {
                key: '_id',
                label: 'ID',
                render: (val, item) =>
                    `<strong class='middle-ellipsis'>${val || item._id || 'N/A'}</strong>`,
                searchable: true,
            },
            {
                key: 'user_name',
                label: 'Usuario',
                render: (val, item) =>
                    `<strong>${val || item.user_id || 'N/A'}</strong>${item.user_email ? `<br><small style="color: var(--muted);">${item.user_email}</small>` : ''}`,
                searchable: true,
            },
            {
                key: 'business_name',
                label: 'Negocio',
                render: val => val || 'N/A',
                searchable: true,
            },
            {
                key: 'date',
                label: 'Fecha/Hora',
                render: (val, item) =>
                    `${formatDate(val)}<br>${item.start_time || 'N/A'}`,
            },
            {
                key: 'status',
                label: 'Estado',
                render: val => getStatusBadge(val),
                filterable: true,
            },
        ],
        actions: [
            {
                key: 'confirm',
                label: 'Confirmar Seleccionadas',
                multiple: true,
            },
            { key: 'delete', label: 'Eliminar Seleccionadas', multiple: true },
            {
                key: 'view',
                label: 'Ver Detalles',
                multiple: false,
                requiresSelection: true,
            },
        ],
        onAction: handleAction,
    })

    window.tableInstances['bookings-table-container'] = table
}

function handleAction(action, ids, updates) {
    if (action === 'delete') {
        handleDelete(ids)
    } else if (action === 'confirm') {
        handleConfirm(ids)
    } else if (action === 'view') {
        handleView(ids[0])
    } else if (action === 'save') {
        handleSave(ids, updates)
    }
}

async function handleDelete(ids) {
    if (confirm(`¿Eliminar ${ids.length} reserva(s)?`)) {
        try {
            for (const id of ids) {
                await deleteBooking(id)
            }
            showToast(`${ids.length} reserva(s) eliminada(s)`)
            loadBookings()
        } catch (error) {
            console.error('Error deleting bookings:', error)
            showToast('Error al eliminar reservas', 'error')
        }
    }
}

async function handleConfirm(ids) {
    try {
        for (const id of ids) {
            await updateBookingStatus(id, 'confirmed')
        }
        showToast(`${ids.length} reserva(s) confirmada(s)`)
        loadBookings()
    } catch (error) {
        console.error('Error confirming bookings:', error)
        showToast('Error al confirmar reservas', 'error')
    }
}

function handleView(id) {
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

function handleSave(id, updates) {
    console.log('Guardar reserva:', id, updates)
    showToast('Reserva actualizada (simulado)')
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
