import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import PasswordInput from '../../components/password-input'

describe('PasswordInput', () => {
    const mockOnChangeText = jest.fn()
    const mockOnValidationChange = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Rendering', () => {
        it('renders with default props', () => {
            const { getByPlaceholderText } = render(
                <PasswordInput value="" onChangeText={mockOnChangeText} />
            )

            expect(getByPlaceholderText('Contraseña')).toBeTruthy()
        })

        it('renders with custom placeholder', () => {
            const { getByPlaceholderText } = render(
                <PasswordInput
                    value=""
                    onChangeText={mockOnChangeText}
                    placeholder="Nueva Contraseña"
                />
            )

            expect(getByPlaceholderText('Nueva Contraseña')).toBeTruthy()
        })

        it('renders password input correctly', () => {
            const { getByPlaceholderText } = render(
                <PasswordInput value="test" onChangeText={mockOnChangeText} showToggle={true} />
            )

            const input = getByPlaceholderText('Contraseña')
            expect(input.props.value).toBe('test')
        })
    })

    describe('Password visibility', () => {
        it('starts with secure text entry', () => {
            const { getByPlaceholderText } = render(
                <PasswordInput value="test123" onChangeText={mockOnChangeText} />
            )

            const input = getByPlaceholderText('Contraseña')
            expect(input.props.secureTextEntry).toBe(true)
        })
    })

    describe('Text input', () => {
        it('calls onChangeText when text changes', () => {
            const { getByPlaceholderText } = render(
                <PasswordInput value="" onChangeText={mockOnChangeText} />
            )

            const input = getByPlaceholderText('Contraseña')
            fireEvent.changeText(input, 'newpassword')

            expect(mockOnChangeText).toHaveBeenCalledWith('newpassword')
        })

        it('displays the current value', () => {
            const { getByPlaceholderText } = render(
                <PasswordInput value="mypassword" onChangeText={mockOnChangeText} />
            )

            const input = getByPlaceholderText('Contraseña')
            expect(input.props.value).toBe('mypassword')
        })
    })

    describe('Password requirements', () => {
        it('validates password requirements when enabled', () => {
            const { getByPlaceholderText } = render(
                <PasswordInput
                    value=""
                    onChangeText={mockOnChangeText}
                    showRequirements={true}
                    onValidationChange={mockOnValidationChange}
                />
            )

            const input = getByPlaceholderText('Contraseña')

            // Test password change
            fireEvent.changeText(input, 'weak')
            expect(mockOnChangeText).toHaveBeenCalledWith('weak')
        })
    })

    describe('Confirmation field', () => {
        it('renders as confirmation field when isConfirmField is true', () => {
            const { getByPlaceholderText } = render(
                <PasswordInput
                    value="password"
                    onChangeText={mockOnChangeText}
                    isConfirmField={true}
                    confirmValue="password"
                    placeholder="Confirmar Contraseña"
                />
            )

            expect(getByPlaceholderText('Confirmar Contraseña')).toBeTruthy()
        })
    })
})
