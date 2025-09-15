import React from 'react'
import { useState } from 'react'
import { verifyAuthCode } from '../api/auth-service'
import { useRouter, useLocalSearchParams } from 'expo-router'

export default function AuthCodeForm() {
    const [code, setCode] = useState('')
    const params = useLocalSearchParams()
    const router = useRouter()

    console.log(params)
    const handleSubmit = e => {
        e.preventDefault()
        verifyAuthCode({ email: params.email, auth_code: code })
            .then(response => {
                console.log('Código verificado:', response)

                // Redirigimos a login, pasando de nuevo el email y la contraseña
                router.push({
                    pathname: '/login',
                    params: {
                        email: params.email,
                        password: params.password, // Reenviamos la contraseña que recibimos
                    },
                })
            })
            .catch(error => {
                console.error('Error al verificar el código:', error)
            })
    }

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Código de Autenticación:</label>
                <input
                    type="text"
                    id="code"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    required
                />
            </div>
            <button type="submit">Verificar Código</button>
        </form>
    )
}
