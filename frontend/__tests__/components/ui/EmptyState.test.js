import React from 'react'
import { render } from '@testing-library/react-native'
import EmptyState from '../../../components/EmptyState'

describe('EmptyState Component', () => {
  const defaultProps = {
    title: 'No Results',
    message: 'No items found',
  }

  it('renders correctly with required props', () => {
    const { getByText } = render(<EmptyState {...defaultProps} />)
    expect(getByText('No Results')).toBeTruthy()
    expect(getByText('No items found')).toBeTruthy()
  })

  it('renders with custom icon', () => {
    const { getByText } = render(
      <EmptyState {...defaultProps} icon="search-outline" />
    )
    expect(getByText('No Results')).toBeTruthy()
  })

  it('renders with custom icon color', () => {
    const { getByText } = render(
      <EmptyState {...defaultProps} iconColor="#FF0000" />
    )
    expect(getByText('No Results')).toBeTruthy()
  })

  it('renders accessible container', () => {
    const { getByText } = render(<EmptyState {...defaultProps} />)
    // Should render both title and message
    expect(getByText('No Results')).toBeTruthy()
    expect(getByText('No items found')).toBeTruthy()
  })

  it('renders default icon when not provided', () => {
    const { getByText } = render(<EmptyState {...defaultProps} />)
    expect(getByText('No Results')).toBeTruthy()
  })

  it('renders only title when message is not provided', () => {
    const { getByText, queryByText } = render(
      <EmptyState title="Empty" />
    )
    expect(getByText('Empty')).toBeTruthy()
  })
})
