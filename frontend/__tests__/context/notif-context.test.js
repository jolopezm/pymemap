import React from 'react'
import { render, waitFor } from '@testing-library/react-native'
import { Text } from 'react-native'

// Mocks deben ir ANTES de los imports
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
)
jest.mock('../../api/notifications-service', () => ({
    __esModule: true,
    default: {
        getNotifications: jest.fn().mockResolvedValue([]),
    },
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

import { NotifProvider, useNotif } from '../../context/notif-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import notificationsService from '../../api/notifications-service'
import * as authContext from '../../context/auth-context'

describe('NotifContext', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        AsyncStorage.multiGet.mockResolvedValue([
            [null, null],
            [null, null],
        ])
        AsyncStorage.multiSet.mockResolvedValue()
        AsyncStorage.multiRemove.mockResolvedValue()
        notificationsService.getNotifications = jest.fn().mockResolvedValue([])
        authContext.useAuth.mockReturnValue({ user: { id: '123' } })
    })

    const TestComponent = () => {
        const notif = useNotif()
        return (
            <>
                <Text testID="notif-length">{notif.notifications.length}</Text>
                <Text testID="unread-count">{notif.unreadCount}</Text>
                <Text testID="loading">{notif.loading.toString()}</Text>
            </>
        )
    }

    describe('Provider rendering', () => {
        it('renders without crashing', () => {
            expect(() => {
                render(
                    <NotifProvider>
                        <Text>Test</Text>
                    </NotifProvider>
                )
            }).not.toThrow()
        })

        it('provides notif context to children', async () => {
            const { getByTestId } = render(
                <NotifProvider>
                    <TestComponent />
                </NotifProvider>
            )

            await waitFor(() => {
                expect(getByTestId('loading')).toBeTruthy()
            }, { timeout: 3000 })
        })
    })

    describe('Initial state', () => {
        it('renders with default state', async () => {
            const { getByTestId } = render(
                <NotifProvider>
                    <TestComponent />
                </NotifProvider>
            )

            await waitFor(() => {
                expect(getByTestId('notif-length')).toBeTruthy()
                expect(getByTestId('unread-count')).toBeTruthy()
            }, { timeout: 3000 })
        })
    })
})
