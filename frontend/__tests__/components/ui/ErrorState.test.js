import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import ErrorState from '../../../components/ErrorState'

describe('ErrorState Component', () => {
  const defaultProps = {
    title: 'Error Title',
    message: 'Error message',
    onRetry: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly with required props', () => {
    const { getByText } = render(<ErrorState {...defaultProps} />)
    expect(getByText('Error Title')).toBeTruthy()
    expect(getByText('Error message')).toBeTruthy()
  })

  it('renders with custom retry text', () => {
    const { getByText } = render(
      <ErrorState {...defaultProps} retryText="Try Again" />
    )
    expect(getByText('Try Again')).toBeTruthy()
  })

  it('renders default retry text when not provided', () => {
    const { getByText } = render(<ErrorState {...defaultProps} />)
    expect(getByText('Reintentar')).toBeTruthy()
  })

  it('calls onRetry when retry button is pressed', () => {
    const onRetryMock = jest.fn()
    const { getByText } = render(
      <ErrorState {...defaultProps} onRetry={onRetryMock} />
    )
    
    fireEvent.press(getByText('Reintentar'))
    expect(onRetryMock).toHaveBeenCalledTimes(1)
  })

  it('renders all required elements', () => {
    const { getByText } = render(<ErrorState {...defaultProps} />)
    
    // Should render title, message, and retry button
    expect(getByText('Error Title')).toBeTruthy()
    expect(getByText('Error message')).toBeTruthy()
    expect(getByText('Reintentar')).toBeTruthy()
  })

  it('renders custom icon when provided', () => {
    const { getByText } = render(
      <ErrorState {...defaultProps} icon="warning-outline" />
    )
    expect(getByText('Error Title')).toBeTruthy()
  })

  it('does not render retry button when onRetry is not provided', () => {
    const { queryByText } = render(
      <ErrorState title="Error" message="Message" />
    )
    expect(queryByText('Reintentar')).toBeNull()
  })
})
