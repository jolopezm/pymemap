import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import HomeCategories from '../../../components/home/HomeCategories'

describe('HomeCategories Component', () => {
  const mockOnSelectCategory = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all categories', () => {
    const { getByText } = render(
      <HomeCategories 
        selectedCategory={null} 
        onSelectCategory={mockOnSelectCategory}
        categorySize={48}
      />
    )
    
    expect(getByText('Todos')).toBeTruthy()
    expect(getByText('Comida')).toBeTruthy()
    expect(getByText('Servicios')).toBeTruthy()
    expect(getByText('Retail')).toBeTruthy()
    expect(getByText('Salud')).toBeTruthy()
    expect(getByText('Belleza')).toBeTruthy()
    expect(getByText('Educación')).toBeTruthy()
    expect(getByText('Hogar')).toBeTruthy()
  })

  it('calls onSelectCategory when category is pressed', () => {
    const { getByText } = render(
      <HomeCategories 
        selectedCategory={null} 
        onSelectCategory={mockOnSelectCategory}
        categorySize={48}
      />
    )
    
    fireEvent.press(getByText('Comida'))
    expect(mockOnSelectCategory).toHaveBeenCalledWith('Comida')
  })

  it('deselects category when pressed again', () => {
    const { getByText } = render(
      <HomeCategories 
        selectedCategory="Comida" 
        onSelectCategory={mockOnSelectCategory}
        categorySize={48}
      />
    )
    
    fireEvent.press(getByText('Comida'))
    expect(mockOnSelectCategory).toHaveBeenCalledWith(null)
  })

  it('selects new category when different one is pressed', () => {
    const { getByText } = render(
      <HomeCategories 
        selectedCategory="Comida" 
        onSelectCategory={mockOnSelectCategory}
        categorySize={48}
      />
    )
    
    fireEvent.press(getByText('Servicios'))
    expect(mockOnSelectCategory).toHaveBeenCalledWith('Servicios')
  })

  it('renders with custom category size', () => {
    const { getByText } = render(
      <HomeCategories 
        selectedCategory={null} 
        onSelectCategory={mockOnSelectCategory}
        categorySize={60}
      />
    )
    
    expect(getByText('Todos')).toBeTruthy()
  })

  it('highlights selected category', () => {
    const { getByText } = render(
      <HomeCategories 
        selectedCategory="Comida" 
        onSelectCategory={mockOnSelectCategory}
        categorySize={48}
      />
    )
    
    expect(getByText('Comida')).toBeTruthy()
  })

  it('renders without selected category', () => {
    const { getByText } = render(
      <HomeCategories 
        selectedCategory={null} 
        onSelectCategory={mockOnSelectCategory}
        categorySize={48}
      />
    )
    
    expect(getByText('Todos')).toBeTruthy()
    expect(getByText('Comida')).toBeTruthy()
  })
})
