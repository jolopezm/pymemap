function renderTemplate(templateOrId, context = {}) {
    // Si existe un elemento con ese id, usar su innerHTML.
    // Si no existe, tratar el primer argumento como cadena HTML directa.
    let template = ''
    const el = typeof window !== 'undefined' ? document.getElementById(templateOrId) : null
    if (el) {
        template = el.innerHTML
    } else if (typeof templateOrId === 'string') {
        template = templateOrId
    }

    return template.replace(/\{\{(.*?)\}\}/g, (match, key) => {
        const k = key.trim()
        // Soporte para valores falsy como 0
        return Object.prototype.hasOwnProperty.call(context, k) && context[k] !== undefined
            ? context[k]
            : ''
    })
}

export { renderTemplate };