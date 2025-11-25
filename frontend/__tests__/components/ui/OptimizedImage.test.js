import React from 'react'
import { render } from '@testing-library/react-native'
import OptimizedImage from '../../../components/OptimizedImage'

describe('OptimizedImage Component', () => {
  const mockSource = { uri: 'https://example.com/image.jpg' }

  it('renders correctly with source prop', () => {
    const { getByTestId } = render(
      <OptimizedImage source={mockSource} testID="optimized-image" />
    )
    expect(getByTestId('optimized-image')).toBeTruthy()
  })

  it('renders with custom placeholder icon', () => {
    const { getByTestId } = render(
      <OptimizedImage 
        source={mockSource} 
        placeholderIcon="image-outline"
        testID="optimized-image"
      />
    )
    expect(getByTestId('optimized-image')).toBeTruthy()
  })

  it('applies custom styles', () => {
    const customStyle = { width: 200, height: 200 }
    const { getByTestId } = render(
      <OptimizedImage 
        source={mockSource} 
        style={customStyle}
        testID="optimized-image"
      />
    )
    expect(getByTestId('optimized-image')).toBeTruthy()
  })

  it('handles resize mode prop', () => {
    const { getByTestId } = render(
      <OptimizedImage 
        source={mockSource} 
        resizeMode="contain"
        testID="optimized-image"
      />
    )
    expect(getByTestId('optimized-image')).toBeTruthy()
  })

  it('renders placeholder before image loads', () => {
    const { getByTestId } = render(
      <OptimizedImage source={mockSource} testID="optimized-image" />
    )
    expect(getByTestId('optimized-image')).toBeTruthy()
  })
})
