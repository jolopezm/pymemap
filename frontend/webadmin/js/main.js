/**
 * Pymap Admin Dashboard - Main JavaScript
 * Gestión de comentarios y solicitudes de usuarios
 */

// ============================================
// CONFIGURACIÓN Y DATOS
// ============================================

// Datos de ejemplo (en producción estos vendrían de API)
const comments = [
    {
        id: 1,
        user: 'Ana Ruiz',
        date: '2025-10-28T09:12:00Z',
        rating: 5,
        text: 'Excelente atención, producto como se describe. ¡Gracias!',
        status: 'Pendiente',
        response: null,
        responseDate: null,
    },
    {
        id: 2,
        user: 'Carlos M.',
        date: '2025-10-27T15:40:00Z',
        rating: 2,
        text: 'Producto llegó con retraso y sin embalaje adecuado.',
        status: 'En proceso',
        response: 'Hola Carlos, lo sentimos. Revisaremos el envío.',
        responseDate: '2025-10-27T17:00:00Z',
    },
    {
        id: 3,
        user: 'Lucía P',
        date: '2025-10-26T12:00:00Z',
        rating: 1,
        text: 'No recibí soporte después de la compra.',
        status: 'Pendiente',
        response: null,
        responseDate: null,
    },
    {
        id: 4,
        user: 'Diego L',
        date: '2025-10-24T08:20:00Z',
        rating: 4,
        text: 'Buen servicio, aunque la entrega tardó un poco.',
        status: 'Resuelto',
        response: 'Gracias por tu feedback, trabajaremos en mejorar tiempos.',
        responseDate: '2025-10-24T09:30:00Z',
    },
    {
        id: 5,
        user: 'María S',
        date: '2025-10-20T18:05:00Z',
        rating: 3,
        text: 'Producto correcto pero faltó un accesorio.',
        status: 'Resuelto',
        response: 'Ya te enviamos el accesorio faltante.',
        responseDate: '2025-10-21T10:00:00Z',
    },
    {
        id: 6,
        user: 'Paulo V',
        date: '2025-10-29T11:22:00Z',
        rating: 5,
        text: 'Recomendado, muy buen precio.',
        status: 'Pendiente',
        response: null,
        responseDate: null,
    },
    {
        id: 7,
        user: 'Sofia R',
        date: '2025-10-30T07:50:00Z',
        rating: 4,
        text: 'Atención rápida por chat.',
        status: 'En proceso',
        response: null,
        responseDate: null,
    },
    {
        id: 8,
        user: 'Miguel G',
        date: '2025-10-31T10:10:00Z',
        rating: 2,
        text: 'Falla técnica en el primer uso.',
        status: 'Pendiente',
        response: null,
        responseDate: null,
    },
    {
        id: 9,
        user: 'Valeria Q',
        date: '2025-10-18T09:00:00Z',
        rating: 5,
        text: 'Todo perfecto.',
        status: 'Resuelto',
        response: 'Gracias por tu reseña.',
        responseDate: '2025-10-18T09:10:00Z',
    },
    {
        id: 10,
        user: 'Roberto Z',
        date: '2025-10-15T14:44:00Z',
        rating: 1,
        text: 'Producto defectuoso, pido devolución.',
        status: 'Pendiente',
        response: null,
        responseDate: null,
    },
]

// Estado de la UI
let state = {
    page: 1,
    perPage: 10,
    statusFilter: 'all',
    ratingFilter: 'all',
    search: '',
}

// Variable global para el chart
let chart
let toastTimeout

// ============================================
// HELPERS Y UTILIDADES
// ============================================

/**
 * Shorthand para getElementById
 */
const $ = id => document.getElementById(id)

/**
 * Formatea una fecha ISO a formato legible
 */
function formatDate(iso) {
    const d = new Date(iso)
    return d.toLocaleString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

/**
 * Genera estrellas de rating en HTML
 */
function renderStars(n) {
    let out = ''
    for (let i = 1; i <= 5; i++) {
        out += i <= n ? '★' : '☆'
    }
    return out
}

/**
 * Escapa HTML para prevenir XSS
 */
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
}

// ============================================
// FILTRADO Y PAGINACIÓN
// ============================================

/**
 * Filtra comentarios según los filtros activos
 */
function filteredComments() {
    return comments
        .filter(c => {
            // Filtro por estado
            if (state.statusFilter !== 'all' && c.status !== state.statusFilter)
                return false

            // Filtro por rating
            if (state.ratingFilter !== 'all') {
                const ratingNum = parseInt(state.ratingFilter)
                if (c.rating !== ratingNum) return false
            }

            // Búsqueda por texto
            if (
                state.search &&
                !c.text.toLowerCase().includes(state.search.toLowerCase()) &&
                !c.user.toLowerCase().includes(state.search.toLowerCase())
            ) {
                return false
            }

            return true
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date))
}

/**
 * Pagina una lista de comentarios
 */
function paginate(list) {
    const start = (state.page - 1) * state.perPage
    return list.slice(start, start + state.perPage)
}

// ============================================
// RENDERIZADO DE COMPONENTES
// ============================================

/**
 * Renderiza la lista de comentarios
 */
function renderComments() {
    const list = filteredComments()
    const pageItems = paginate(list)
    const $list = $('commentsList')

    $list.innerHTML = ''

    if (pageItems.length === 0) {
        $list.innerHTML =
            '<div style="text-align:center;padding:40px;color:var(--muted)">No hay comentarios que mostrar.</div>'
        renderPagination(0)
        updateSummary()
        updateChart()
        return
    }

    pageItems.forEach(c => {
        const commentDiv = document.createElement('div')
        commentDiv.className = 'comment'
        commentDiv.dataset.commentId = c.id

        commentDiv.innerHTML = `
            <div class="meta">
                <div class="user">${escapeHtml(c.user)}</div>
                <div style="font-size:11px;margin-top:4px">${formatDate(c.date)}</div>
            </div>
            <div class="body">
                <div>
                    <span class="rating">${renderStars(c.rating)}</span>
                    <span class="status">${escapeHtml(c.status)}</span>
                </div>
                <div class="text">${escapeHtml(c.text)}</div>
                
                ${
                    c.response
                        ? `
                <div class="response-container">
                    <div style="padding:10px;background:#f9f9f9;border-radius:6px;border-left:3px solid var(--purple)">
                        <strong style="color:var(--purple);font-size:12px">Respuesta:</strong>
                        <div class="small" style="margin-top:4px">${escapeHtml(c.response)}</div>
                        <div class="small" style="margin-top:4px;color:var(--muted)">${formatDate(c.responseDate)}</div>
                    </div>
                </div>
                `
                        : ''
                }
                
                <div class="actions">
                    <button class="btn ghost" data-action="reply" data-comment-id="${c.id}">Responder</button>
                    <button class="btn ghost" data-action="resolve" data-comment-id="${c.id}">Marcar resuelto</button>
                </div>
            </div>
        `

        $list.appendChild(commentDiv)

        // Event listeners para botones
        commentDiv
            .querySelector('[data-action="reply"]')
            .addEventListener('click', () => {
                openReplyBox(commentDiv, c)
            })

        commentDiv
            .querySelector('[data-action="resolve"]')
            .addEventListener('click', () => {
                markResolved(c.id)
            })
    })

    renderPagination(list.length)
    updateSummary()
    updateChart()
}

/**
 * Abre el formulario de respuesta
 */
function openReplyBox(container, comment) {
    // Prevenir duplicados
    if (container.querySelector('.reply-box')) return

    const box = document.createElement('div')
    box.className = 'reply-box'
    box.innerHTML = `
        <textarea placeholder="Escribe tu respuesta aquí..."></textarea>
        <div style="display:flex;flex-direction:column;gap:6px">
            <button class="btn" data-action="send">Enviar</button>
            <button class="btn ghost" data-action="cancel">Cancelar</button>
        </div>
    `

    container.querySelector('.body').appendChild(box)

    const ta = box.querySelector('textarea')
    ta.focus()

    box.querySelector('[data-action="cancel"]').addEventListener('click', () =>
        box.remove()
    )
    box.querySelector('[data-action="send"]').addEventListener('click', () => {
        const text = ta.value.trim()
        if (!text) {
            alert('Por favor escribe una respuesta.')
            return
        }

        // Guardar respuesta
        comment.response = text
        comment.responseDate = new Date().toISOString()
        comment.status = 'Resuelto'

        // Re-renderizar
        renderComments()
        showToast('Respuesta enviada al usuario (simulado).')
    })
}

/**
 * Marca un comentario como resuelto
 */
function markResolved(id) {
    const c = comments.find(x => x.id === id)
    if (!c) return

    c.status = 'Resuelto'

    // Si no tenía respuesta, genera mensaje automático
    if (!c.response) {
        c.response =
            'Gracias por tu comentario. Hemos revisado tu solicitud y la hemos marcado como resuelta.'
        c.responseDate = new Date().toISOString()
        showToast(
            'Se marcó como resuelto y se envió un mensaje automático al usuario (simulado).'
        )
    } else {
        showToast('Se marcó como resuelto.')
    }

    renderComments()
}

/**
 * Marca todos los comentarios como resueltos
 */
function markAllResolved() {
    comments.forEach(c => {
        if (c.status !== 'Resuelto') {
            c.status = 'Resuelto'
            if (!c.response) {
                c.response =
                    'Gracias por tu comentario. Tu solicitud ha sido atendida.'
                c.responseDate = new Date().toISOString()
            }
        }
    })
    renderComments()
    showToast('Se marcaron todos los comentarios como resueltos (simulado).')
}

/**
 * Renderiza los controles de paginación
 */
function renderPagination(total) {
    const $p = $('pagination')
    $p.innerHTML = ''

    const pages = Math.max(1, Math.ceil(total / state.perPage))

    for (let i = 1; i <= pages; i++) {
        const btn = document.createElement('button')
        btn.className = 'page-btn'
        btn.textContent = i
        btn.style.fontWeight = i === state.page ? '700' : '400'
        btn.style.background = i === state.page ? 'var(--purple)' : 'white'
        btn.style.color = i === state.page ? 'white' : '#333'

        btn.addEventListener('click', () => {
            state.page = i
            renderComments()
        })

        $p.appendChild(btn)
    }
}

// ============================================
// GRÁFICOS Y ESTADÍSTICAS
// ============================================

/**
 * Actualiza el gráfico de satisfacción
 */
function updateChart() {
    const counts = { positive: 0, neutral: 0, negative: 0 }

    comments.forEach(c => {
        if (c.rating >= 4) counts.positive++
        else if (c.rating === 3) counts.neutral++
        else counts.negative++
    })

    const ctx = document.getElementById('satisfactionChart').getContext('2d')

    if (chart) chart.destroy()

    chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Positivos (4-5★)', 'Neutrales (3★)', 'Negativos (1-2★)'],
            datasets: [
                {
                    data: [counts.positive, counts.neutral, counts.negative],
                    backgroundColor: ['#4CAF50', '#FFC107', '#F44336'],
                    borderWidth: 0,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { family: 'Poppins', size: 11 },
                        padding: 12,
                    },
                },
            },
        },
    })
}

/**
 * Actualiza el resumen de métricas
 */
function updateSummary() {
    const total = comments.length
    $('total-comments').textContent = total

    // Promedio de estrellas
    const avg =
        comments.reduce((s, c) => s + c.rating, 0) / comments.length || 0
    $('avg-stars').textContent = avg.toFixed(1) + ' ★'

    // Tiempo promedio de respuesta
    const responded = comments.filter(c => c.responseDate)

    if (responded.length) {
        const totalMs = responded.reduce((sum, c) => {
            const start = new Date(c.date)
            const end = new Date(c.responseDate)
            return sum + (end - start)
        }, 0)

        const avgMs = totalMs / responded.length
        const hours = Math.floor(avgMs / (1000 * 60 * 60))
        const mins = Math.floor((avgMs % (1000 * 60 * 60)) / (1000 * 60))

        $('avgTimeSmall').textContent = `${hours}h ${mins}m`
    } else {
        $('avgTimeSmall').textContent = 'N/A'
    }
}

// ============================================
// NOTIFICACIONES
// ============================================

/**
 * Muestra un mensaje toast
 */
function showToast(msg) {
    const t = $('toast')
    t.textContent = msg
    t.style.display = 'block'

    clearTimeout(toastTimeout)
    toastTimeout = setTimeout(() => (t.style.display = 'none'), 3600)
}

// ============================================
// INICIALIZACIÓN
// ============================================

/**
 * Configura todos los event listeners
 */
function setupEventListeners() {
    // Filtro de estado
    $('statusFilter').addEventListener('change', e => {
        state.statusFilter = e.target.value
        state.page = 1
        renderComments()
    })

    // Filtro de rating
    $('ratingFilter').addEventListener('change', e => {
        state.ratingFilter = e.target.value
        state.page = 1
        renderComments()
    })

    // Búsqueda
    $('search').addEventListener('input', e => {
        state.search = e.target.value
        state.page = 1
        renderComments()
    })

    // Items por página
    $('perPage').addEventListener('change', e => {
        state.perPage = parseInt(e.target.value)
        state.page = 1
        renderComments()
    })

    // Botón refresh
    $('refresh-btn').addEventListener('click', () => {
        showToast('Actualizando...')
        renderComments()
    })

    // Botón marcar todos como resueltos
    $('mark-all-resolved').addEventListener('click', markAllResolved)
}

/**
 * Inicializa la aplicación
 */
function init() {
    setupEventListeners()
    renderComments()
    updateChart()
}

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init)
