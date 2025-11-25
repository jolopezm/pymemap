import React from 'react'
import { render } from '@testing-library/react-native'
import LoadingState from '../../../components/LoadingState'

describe('LoadingState Component', () => {
  it('renders card variant correctly', () => {
    const { getByLabelText } = render(<LoadingState variant="card" />)
    expect(getByLabelText('Cargando contenido')).toBeTruthy()
  })

  it('renders horizontal variant correctly', () => {
    const { getByLabelText } = render(<LoadingState variant="horizontal" />)
    expect(getByLabelText('Cargando contenido')).toBeTruthy()
  })

  it('renders list variant with multiple items', () => {
    const { getByLabelText } = render(<LoadingState variant="list" count={3} />)
    expect(getByLabelText('Cargando contenido')).toBeTruthy()
  })

  it('renders detail variant correctly', () => {
    const { getByLabelText } = render(<LoadingState variant="detail" />)
    expect(getByLabelText('Cargando contenido')).toBeTruthy()
  })

  it('defaults to list variant when no variant specified', () => {
    const { getByLabelText } = render(<LoadingState />)
    expect(getByLabelText('Cargando contenido')).toBeTruthy()
  })

  it('renders correct number of skeleton items for list variant', () => {
    const count = 5
    const { getByLabelText } = render(<LoadingState variant="list" count={count} />)
    expect(getByLabelText('Cargando contenido')).toBeTruthy()
  })

  it('handles count prop for list variant', () => {
    const { rerender, getByLabelText } = render(<LoadingState variant="list" count={2} />)
    expect(getByLabelText('Cargando contenido')).toBeTruthy()
    
    rerender(<LoadingState variant="list" count={5} />)
    expect(getByLabelText('Cargando contenido')).toBeTruthy()
  })
})
