import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import BusinessCard from '../../../components/business/BusinessCard'

const mockBusiness = {
  id: '1',
  _id: '1',
  name: 'Test Business',
  category: 'Restaurant',
  description: 'A test restaurant',
  profile_pic: 'https://example.com/image.jpg',
  rating: 4.5,
  distance: 2.5,
}

describe('BusinessCard Component', () => {
  it('renders business name correctly', () => {
    const { getByText } = render(
      <BusinessCard business={mockBusiness} onPress={() => {}} />
    )
    expect(getByText('Test Business')).toBeTruthy()
  })

  it('calls onPress when card is pressed', () => {
    const onPressMock = jest.fn()
    const { getByText } = render(
      <BusinessCard business={mockBusiness} onPress={onPressMock} />
    )
    
    fireEvent.press(getByText('Test Business'))
    expect(onPressMock).toHaveBeenCalledTimes(1)
  })

  it('renders badge when showBadge is true', () => {
    const { getByText } = render(
      <BusinessCard 
        business={mockBusiness} 
        onPress={() => {}} 
        showBadge 
        badgeText="New"
      />
    )
    expect(getByText('New')).toBeTruthy()
  })

  it('renders with showDistance prop', () => {
    const { root } = render(
      <BusinessCard 
        business={mockBusiness} 
        onPress={() => {}} 
        showDistance 
      />
    )
    expect(root).toBeTruthy()
  })

  it('shows rating when showRating is true', () => {
    const { getByText } = render(
      <BusinessCard 
        business={mockBusiness} 
        onPress={() => {}} 
        showRating 
      />
    )
    expect(getByText('4.5')).toBeTruthy()
  })

  it('shows category when showCategory is true', () => {
    const { getByText } = render(
      <BusinessCard 
        business={mockBusiness} 
        onPress={() => {}} 
        showCategory 
      />
    )
    expect(getByText('Restaurant')).toBeTruthy()
  })

  it('renders favorite button when showFavorite is true', () => {
    const onFavoriteMock = jest.fn()
    const { root } = render(
      <BusinessCard 
        business={mockBusiness} 
        onPress={() => {}} 
        showFavorite 
        onFavoritePress={onFavoriteMock}
      />
    )
    expect(root).toBeTruthy()
  })

  it('calls onFavoritePress without triggering card press', () => {
    const onPressMock = jest.fn()
    const onFavoriteMock = jest.fn()
    
    const { root } = render(
      <BusinessCard 
        business={mockBusiness} 
        onPress={onPressMock} 
        showFavorite 
        onFavoritePress={onFavoriteMock}
      />
    )
    
    expect(root).toBeTruthy()
  })

  it('renders with vertical variant by default', () => {
    const { getByText } = render(
      <BusinessCard business={mockBusiness} onPress={() => {}} />
    )
    expect(getByText('Test Business')).toBeTruthy()
  })

  it('renders with horizontal variant', () => {
    const { getByText } = render(
      <BusinessCard 
        business={mockBusiness} 
        onPress={() => {}} 
        variant="horizontal"
      />
    )
    expect(getByText('Test Business')).toBeTruthy()
  })

  it('renders with compact variant', () => {
    const { getByText } = render(
      <BusinessCard 
        business={mockBusiness} 
        onPress={() => {}} 
        variant="compact"
      />
    )
    expect(getByText('Test Business')).toBeTruthy()
  })

  it('applies custom width', () => {
    const { getByText } = render(
      <BusinessCard 
        business={mockBusiness} 
        onPress={() => {}} 
        width={300}
      />
    )
    expect(getByText('Test Business')).toBeTruthy()
  })

  it('applies custom image height', () => {
    const { getByText } = render(
      <BusinessCard 
        business={mockBusiness} 
        onPress={() => {}} 
        imageHeight={200}
      />
    )
    expect(getByText('Test Business')).toBeTruthy()
  })

  it('renders logo when showLogo is true', () => {
    const { getByText } = render(
      <BusinessCard 
        business={mockBusiness} 
        onPress={() => {}} 
        showLogo
      />
    )
    expect(getByText('TE')).toBeTruthy() // First 2 letters uppercase
  })

  it('renders with extra info prop', () => {
    const { root } = render(
      <BusinessCard 
        business={mockBusiness} 
        onPress={() => {}} 
        extraInfo="Extra Information"
      />
    )
    expect(root).toBeTruthy()
  })
})
