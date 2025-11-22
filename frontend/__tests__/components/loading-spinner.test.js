import React from 'react'
import { render } from '@testing-library/react-native'
import LoadingSpinner from '../../components/loading-spinner'
import { ActivityIndicator } from 'react-native'

describe('LoadingSpinner', () => {
  it('renders ActivityIndicator with correct props', () => {
    const { UNSAFE_getByType } = render(<LoadingSpinner />)
    
    const activityIndicator = UNSAFE_getByType(ActivityIndicator)
    expect(activityIndicator).toBeTruthy()
    expect(activityIndicator.props.size).toBe('large')
    expect(activityIndicator.props.color).toBe('#9B59B6')
  })

  it('renders without crashing', () => {
    expect(() => {
      render(<LoadingSpinner />)
    }).not.toThrow()
  })

  it('is visible when rendered', () => {
    const { root } = render(<LoadingSpinner />)
    expect(root).toBeTruthy()
  })
})
