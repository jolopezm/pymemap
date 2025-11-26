import React from 'react'
import { render, waitFor } from '@testing-library/react-native'
import { Text } from 'react-native'

// Mocks deben ir ANTES de los imports
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
)
jest.mock('../../api/business-service', () => ({
    getServices: jest.fn().mockResolvedValue([]),
    getBusinesses: jest.fn().mockResolvedValue([]),
}))
jest.mock('../../utils/logger', () => ({
    __esModule: true,
    default: {
        log: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
    },
}))
jest.mock('../../context/auth-context', () => ({
    useAuth: jest.fn(),
}))

import { ServiceProvider, useService } from '../../context/service-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as businessService from '../../api/business-service'
import * as authContext from '../../context/auth-context'

describe('ServiceContext', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        AsyncStorage.multiGet.mockResolvedValue([
            [null, null],
            [null, null],
        ])
        AsyncStorage.multiSet.mockResolvedValue()
        AsyncStorage.multiRemove.mockResolvedValue()
        businessService.getServices = jest.fn().mockResolvedValue([])
        authContext.useAuth.mockReturnValue({ user: { id: '123' } })
    })

    const TestComponent = () => {
        const service = useService()
        return (
            <>
                <Text testID="services-length">{service.services.length}</Text>
                <Text testID="loading">{service.loading.toString()}</Text>
            </>
        )
    }

    describe('Provider rendering', () => {
        it('renders without crashing', () => {
            expect(() => {
                render(
                    <ServiceProvider>
                        <Text>Test</Text>
                    </ServiceProvider>
                )
            }).not.toThrow()
        })

        it('provides service context to children', async () => {
            const { getByTestId } = render(
                <ServiceProvider>
                    <TestComponent />
                </ServiceProvider>
            )

            await waitFor(() => {
                expect(getByTestId('loading')).toBeTruthy()
            }, { timeout: 3000 })
        })
    })

    describe('Initial state', () => {
        it('renders with default state', async () => {
            const { getByTestId } = render(
                <ServiceProvider>
                    <TestComponent />
                </ServiceProvider>
            )

            await waitFor(() => {
                expect(getByTestId('services-length')).toBeTruthy()
            }, { timeout: 3000 })
        })
    })
})
