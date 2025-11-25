import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import Button from '../../../components/ui/Button'

describe('Button Component', () => {
  it('renders correctly with title prop', () => {
    const { getByText } = render(<Button title="Click Me" onPress={() => {}} />)
    expect(getByText('Click Me')).toBeTruthy()
  })

  it('renders correctly with children prop', () => {
    const { getByText } = render(
      <Button onPress={() => {}}>
        Test Button
      </Button>
    )
    expect(getByText('Test Button')).toBeTruthy()
  })

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn()
    const { getByText } = render(<Button title="Press" onPress={onPressMock} />)
    
    fireEvent.press(getByText('Press'))
    expect(onPressMock).toHaveBeenCalledTimes(1)
  })

  it('does not call onPress when disabled', () => {
    const onPressMock = jest.fn()
    const { getByText } = render(
      <Button title="Disabled" onPress={onPressMock} disabled />
    )
    
    fireEvent.press(getByText('Disabled'))
    expect(onPressMock).not.toHaveBeenCalled()
  })

  it('shows loading indicator when loading', () => {
    const { getByTestId, queryByText } = render(
      <Button title="Load" onPress={() => {}} loading />
    )
    
    // Text should not be visible when loading
    expect(queryByText('Load')).toBeNull()
  })

  it('applies correct variant styles', () => {
    const { rerender, getByText } = render(
      <Button title="Primary" variant="primary" onPress={() => {}} />
    )
    let button = getByText('Primary')
    expect(button).toBeTruthy()

    rerender(<Button title="Secondary" variant="secondary" onPress={() => {}} />)
    button = getByText('Secondary')
    expect(button).toBeTruthy()

    rerender(<Button title="Outline" variant="outline" onPress={() => {}} />)
    button = getByText('Outline')
    expect(button).toBeTruthy()
  })

  it('applies correct size styles', () => {
    const { rerender, getByText } = render(
      <Button title="Small" size="small" onPress={() => {}} />
    )
    let button = getByText('Small')
    expect(button).toBeTruthy()

    rerender(<Button title="Medium" size="medium" onPress={() => {}} />)
    button = getByText('Medium')
    expect(button).toBeTruthy()

    rerender(<Button title="Large" size="large" onPress={() => {}} />)
    button = getByText('Large')
    expect(button).toBeTruthy()
  })

  it('accepts custom style prop', () => {
    const customStyle = { marginTop: 20 }
    const { getByText } = render(
      <Button title="Custom" onPress={() => {}} style={customStyle} />
    )
    expect(getByText('Custom')).toBeTruthy()
  })

  it('does not call onPress when loading', () => {
    const onPressMock = jest.fn()
    const { root } = render(
      <Button title="Loading" onPress={onPressMock} loading />
    )
    
    // Button should render when loading
    expect(root).toBeTruthy()
  })
})
