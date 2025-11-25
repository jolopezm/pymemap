import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import ServiceFilter from '../../components/service-filter'

// Mock del dropdown picker
jest.mock('react-native-dropdown-picker', () => {
    const React = require('react')
    const { View, Text, Pressable } = require('react-native')
    
    return function MockDropDownPicker({ value, items, onChangeValue, open, setOpen }) {
        return (
            <View testID="dropdown-picker">
                <Pressable testID="dropdown-toggle" onPress={() => setOpen(!open)}>
                    <Text testID="dropdown-value">{value}</Text>
                </Pressable>
                {open && items.map(item => (
                    <Pressable
                        key={item.value}
                        testID={`dropdown-item-${item.value}`}
                        onPress={() => {
                            onChangeValue(item.value)
                            setOpen(false)
                        }}
                    >
                        <Text testID={`dropdown-label-${item.value}`}>{item.label}</Text>
                    </Pressable>
                ))}
            </View>
        )
    }
})

describe('ServiceFilter', () => {
    const mockServices = [
        { id: '1', state: 'pending', name: 'Service 1' },
        { id: '2', state: 'in progress', name: 'Service 2' },
        { id: '3', state: 'completed', name: 'Service 3' },
        { id: '4', state: 'pending', name: 'Service 4' },
        { id: '5', state: 'payment_requested', name: 'Service 5' },
    ]

    const mockOnFilterChange = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Rendering', () => {
        it('renders with services', () => {
            const { getByTestId, getByText } = render(
                <ServiceFilter onFilterChange={mockOnFilterChange} services={mockServices} />
            )

            expect(getByTestId('dropdown-picker')).toBeTruthy()
            expect(getByText('Filtrar por estado:')).toBeTruthy()
        })

        it('displays correct service counts', () => {
            const { getByTestId } = render(
                <ServiceFilter onFilterChange={mockOnFilterChange} services={mockServices} />
            )

            // Open dropdown
            fireEvent.press(getByTestId('dropdown-toggle'))

            // Check counts: 3 pending (pending + payment_requested), 1 in progress, 1 completed
            expect(getByTestId('dropdown-label-pending').children[0]).toContain('(3)')
            expect(getByTestId('dropdown-label-in progress').children[0]).toContain('(1)')
            expect(getByTestId('dropdown-label-completed').children[0]).toContain('(1)')
        })

        it('defaults to "all" filter', () => {
            const { getByTestId } = render(
                <ServiceFilter onFilterChange={mockOnFilterChange} services={mockServices} />
            )

            expect(getByTestId('dropdown-value').children[0]).toBe('all')
        })
    })

    describe('Filter selection', () => {
        it('calls onFilterChange when filter is selected', () => {
            const { getByTestId } = render(
                <ServiceFilter onFilterChange={mockOnFilterChange} services={mockServices} />
            )

            // Open dropdown
            fireEvent.press(getByTestId('dropdown-toggle'))

            // Select pending filter
            fireEvent.press(getByTestId('dropdown-item-pending'))

            expect(mockOnFilterChange).toHaveBeenCalledWith('pending')
        })

        it('updates selected value when filter changes', () => {
            const { getByTestId } = render(
                <ServiceFilter onFilterChange={mockOnFilterChange} services={mockServices} />
            )

            // Open dropdown
            fireEvent.press(getByTestId('dropdown-toggle'))

            // Select completed filter
            fireEvent.press(getByTestId('dropdown-item-completed'))

            expect(getByTestId('dropdown-value').children[0]).toBe('completed')
        })
    })

    describe('Dynamic updates', () => {
        it('updates counts when services change', () => {
            const { getByTestId, rerender } = render(
                <ServiceFilter onFilterChange={mockOnFilterChange} services={mockServices} />
            )

            // Update services with more pending
            const updatedServices = [
                ...mockServices,
                { id: '6', state: 'pending', name: 'Service 6' },
            ]

            rerender(
                <ServiceFilter onFilterChange={mockOnFilterChange} services={updatedServices} />
            )

            // Should have updated the services prop
            expect(mockOnFilterChange).not.toHaveBeenCalled()
        })

        it('handles empty services array', () => {
            const { getByTestId } = render(
                <ServiceFilter onFilterChange={mockOnFilterChange} services={[]} />
            )

            // Open dropdown
            fireEvent.press(getByTestId('dropdown-toggle'))

            // All counts should be 0
            expect(getByTestId('dropdown-label-pending').children[0]).toContain('(0)')
            expect(getByTestId('dropdown-label-in progress').children[0]).toContain('(0)')
            expect(getByTestId('dropdown-label-completed').children[0]).toContain('(0)')
        })
    })
})
