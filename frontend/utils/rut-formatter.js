export const rutFormatter = rut => {
    // 1. Limpiar el RUT de todo lo que no sea número o K.
    const cleanRut = rut.replace(/[^0-9kK]/g, '').toUpperCase()
    const len = cleanRut.length

    // 2. Si no hay nada, devolver vacío.
    if (len === 0) {
        return ''
    }

    // 3. Si hay solo un caracter, devolverlo (el dígito verificador no se ha escrito).
    if (len === 1) {
        return cleanRut
    }

    // 4. Separar cuerpo y dígito verificador.
    let body = cleanRut.slice(0, len - 1)
    const verifier = cleanRut.slice(-1)

    // 5. Formatear el cuerpo con puntos.
    body = new Intl.NumberFormat('es-CL').format(body)

    // 6. Unir cuerpo y dígito verificador.
    return `${body}-${verifier}`
}
