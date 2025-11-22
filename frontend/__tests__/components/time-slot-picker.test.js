import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import { TimeSlotPicker } from '../../components/time-slot-picker'

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => 
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
)

// Mock booking-service
jest.mock('../../api/booking-service', () => ({
    getAvailableSlots: jest.fn()
}))

// Mock logger
jest.mock('../../utils/logger', () => ({
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn()
}))

const bookingService = require('../../api/booking-service')

describe('TimeSlotPicker', () => {
    const mockOnSlotSelect = jest.fn()
    const mockSlots = [
        { id: '1', start_time: '09:00', end_time: '10:00', is_available: true },
        { id: '2', start_time: '10:00', end_time: '11:00', is_available: true },
        { id: '3', start_time: '11:00', end_time: '12:00', is_available: false },
    ]

    beforeEach(() => {
        jest.clearAllMocks()
        bookingService.getAvailableSlots.mockResolvedValue(mockSlots)
    })

    describe('Rendering', () => {
        it('renders loading state initially', () => {
            const { getByText } = render(
                <TimeSlotPicker
                    businessId="123"
                    date="2024-01-01"
                    onSlotSelect={mockOnSlotSelect}
                />
            )

            expect(getByText(/Cargando horarios/i)).toBeTruthy()
        })

        it('renders slots after loading', async () => {
            const { getByText } = render(
                <TimeSlotPicker
                    businessId="123"
                    date="2024-01-01"
                    onSlotSelect={mockOnSlotSelect}
                />
            )

            await waitFor(() => {
                expect(getByText('09:00')).toBeTruthy()
                expect(getByText('10:00')).toBeTruthy()
                expect(getByText('11:00')).toBeTruthy()
            })
        })

        it('renders empty state when no slots available', async () => {
            bookingService.getAvailableSlots.mockResolvedValue([])

            const { getByText } = render(
                <TimeSlotPicker
                    businessId="123"
                    date="2024-01-01"
                    onSlotSelect={mockOnSlotSelect}
                />
            )

            await waitFor(() => {
                expect(getByText(/No hay horarios disponibles/i)).toBeTruthy()
            })
        })
    })

    describe('Slot selection', () => {
        it('calls onSlotSelect when available slot is pressed', async () => {
            const { getByText } = render(
                <TimeSlotPicker
                    businessId="123"
                    date="2024-01-01"
                    onSlotSelect={mockOnSlotSelect}
                />
            )

            await waitFor(() => {
                expect(getByText('09:00')).toBeTruthy()
            })

            fireEvent.press(getByText('09:00'))

            expect(mockOnSlotSelect).toHaveBeenCalledWith(mockSlots[0])
        })

        it('does not call onSlotSelect when unavailable slot is pressed', async () => {
            const { getByText } = render(
                <TimeSlotPicker
                    businessId="123"
                    date="2024-01-01"
                    onSlotSelect={mockOnSlotSelect}
                />
            )

            await waitFor(() => {
                expect(getByText('11:00')).toBeTruthy()
            })

            fireEvent.press(getByText('11:00'))

            expect(mockOnSlotSelect).not.toHaveBeenCalled()
        })
    })

    describe('Error handling', () => {
        it('displays error message when fetch fails', async () => {
            bookingService.getAvailableSlots.mockRejectedValue(new Error('Network error'))

            const { getByText } = render(
                <TimeSlotPicker
                    businessId="123"
                    date="2024-01-01"
                    onSlotSelect={mockOnSlotSelect}
                />
            )

            await waitFor(() => {
                expect(getByText(/Error al cargar horarios/i)).toBeTruthy()
            })
        })

        it('displays 404 error message appropriately', async () => {
            const error = new Error('Not found')
            error.response = { status: 404 }
            bookingService.getAvailableSlots.mockRejectedValue(error)

            const { getByText } = render(
                <TimeSlotPicker
                    businessId="123"
                    date="2024-01-01"
                    onSlotSelect={mockOnSlotSelect}
                />
            )

            await waitFor(() => {
                expect(getByText(/No hay horarios configurados/i)).toBeTruthy()
            })
        })
    })

    describe('Data fetching', () => {
        it('fetches slots when businessId and date are provided', async () => {
            render(
                <TimeSlotPicker
                    businessId="123"
                    date="2024-01-01"
                    onSlotSelect={mockOnSlotSelect}
                />
            )

            await waitFor(() => {
                expect(bookingService.getAvailableSlots).toHaveBeenCalledWith('123', '2024-01-01')
            })
        })

        it('refetches slots when date changes', async () => {
            const { rerender } = render(
                <TimeSlotPicker
                    businessId="123"
                    date="2024-01-01"
                    onSlotSelect={mockOnSlotSelect}
                />
            )

            await waitFor(() => {
                expect(bookingService.getAvailableSlots).toHaveBeenCalledWith('123', '2024-01-01')
            })

            rerender(
                <TimeSlotPicker
                    businessId="123"
                    date="2024-01-02"
                    onSlotSelect={mockOnSlotSelect}
                />
            )

            await waitFor(() => {
                expect(bookingService.getAvailableSlots).toHaveBeenCalledWith('123', '2024-01-02')
            })
        })
    })
})
