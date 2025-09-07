// Validaciones individuales
export function validateEmail(email) {
    if (!email) {
        return { valid: false, error: 'El email es requerido' }
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
        return { valid: false, error: 'Formato de email inválido' }
    }
    return { valid: true }
}

export function validatePassword(password) {
    if (!password) {
        return { valid: false, error: 'La contraseña es requerida' }
    }
    if (password.length < 6) {
        return {
            valid: false,
            error: 'La contraseña debe tener al menos 6 caracteres',
        }
    }
    return { valid: true }
}

export function validatePasswordMatch(password, confirmPassword) {
    if (password !== confirmPassword) {
        return { valid: false, error: 'Las contraseñas no coinciden' }
    }
    return { valid: true }
}

export function validateRequiredField(value, fieldName) {
    if (!value || value.trim() === '') {
        return { valid: false, error: `${fieldName} es requerido` }
    }
    return { valid: true }
}

export function validateBirthdate(birthdate) {
    if (!birthdate) {
        return { valid: false, error: 'La fecha de nacimiento es requerida' }
    }

    // Verificar formatos aceptados: DD/MM/YYYY, DD-MM-YYYY o YYYY-MM-DD
    const ddmmyyyyRegex = /^\d{2}\/\d{2}\/\d{4}$/
    const ddmmyyyyDashRegex = /^\d{2}-\d{2}-\d{4}$/
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/

    if (
        !ddmmyyyyRegex.test(birthdate) &&
        !ddmmyyyyDashRegex.test(birthdate) &&
        !isoDateRegex.test(birthdate)
    ) {
        return {
            valid: false,
            error: 'Formato de fecha inválido. Use DD/MM/YYYY',
        }
    }

    // Convertir a objeto Date para validación
    let dateToCheck
    if (ddmmyyyyRegex.test(birthdate) || ddmmyyyyDashRegex.test(birthdate)) {
        const parts = birthdate.split(/[\/\-]/)
        dateToCheck = new Date(parts[2], parts[1] - 1, parts[0]) // año, mes-1, día
    } else {
        dateToCheck = new Date(birthdate) // formato ISO
    }

    if (isNaN(dateToCheck.getTime())) {
        return { valid: false, error: 'Fecha inválida' }
    }

    if (dateToCheck > new Date()) {
        return {
            valid: false,
            error: 'La fecha de nacimiento no puede ser futura',
        }
    }

    // Verificar edad mínima (13 años)
    const minDate = new Date()
    minDate.setFullYear(minDate.getFullYear() - 13)
    if (dateToCheck > minDate) {
        return { valid: false, error: 'Debes tener al menos 13 años' }
    }

    return { valid: true }
}

// Función genérica para ejecutar múltiples validaciones
export function runValidations(validations) {
    for (const validation of validations) {
        const result = validation()
        if (!result.valid) {
            return result
        }
    }
    return { valid: true }
}

// Validaciones específicas para cada caso
export function validateLoginData(email, password) {
    return runValidations([
        () => validateEmail(email),
        () => validatePassword(password),
    ])
}

export function validateSignUpData({
    rut,
    name,
    email,
    password,
    confirmPassword,
    birthdate,
}) {
    return runValidations([
        () => validateRequiredField(rut, 'RUT'),
        () => validateRequiredField(name, 'Nombre'),
        () => validateBirthdate(birthdate),
        () => validateEmail(email),
        () => validatePassword(password),
        () => validatePasswordMatch(password, confirmPassword),
    ])
}
