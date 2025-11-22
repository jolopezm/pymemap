import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import { Text } from 'react-native'
import ErrorBoundary from '../../components/ErrorBoundary'
import logger from '../../utils/logger'

// Mock logger
jest.mock('../../utils/logger')

// Component que lanza un error
const ThrowError = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <Text>Child content</Text>
}

describe('ErrorBoundary', () => {
  // Silenciar console.error en tests
  const originalError = console.error
  beforeAll(() => {
    console.error = jest.fn()
  })
  afterAll(() => {
    console.error = originalError
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders children when no error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <Text>Child content</Text>
      </ErrorBoundary>
    )

    expect(getByText('Child content')).toBeTruthy()
  })

  it('renders error UI when child throws error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(getByText('¡Algo salió mal!')).toBeTruthy()
    expect(getByText(/Lo sentimos, ha ocurrido un error inesperado/)).toBeTruthy()
  })

  it('logs error when caught', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(logger.error).toHaveBeenCalledWith(
      'ErrorBoundary capturó un error:',
      expect.any(Error),
      expect.any(Object)
    )
  })

  it('renders custom message', () => {
    const { getByText } = render(
      <ErrorBoundary 
        message="Mensaje personalizado"
      >
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(getByText('¡Algo salió mal!')).toBeTruthy()
    expect(getByText('Mensaje personalizado')).toBeTruthy()
  })

  it('calls onReset when "Volver al inicio" button pressed', () => {
    const onReset = jest.fn()
    const { getByText } = render(
      <ErrorBoundary onReset={onReset}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    const resetButton = getByText('Volver al inicio')
    fireEvent.press(resetButton)

    expect(onReset).toHaveBeenCalledTimes(1)
  })

  it('shows error UI and has retry button', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    // Verifica que está mostrando error
    expect(getByText('¡Algo salió mal!')).toBeTruthy()
    expect(getByText('Intentar de nuevo')).toBeTruthy()
  })

  it('shows "Volver al inicio" button when onReset provided', () => {
    const onReset = jest.fn()
    const { getByText } = render(
      <ErrorBoundary onReset={onReset}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(getByText('Volver al inicio')).toBeTruthy()
  })

  it('retry button renders with proper structure', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    const retryButton = getByText('Intentar de nuevo')
    expect(retryButton).toBeTruthy()
  })
})
