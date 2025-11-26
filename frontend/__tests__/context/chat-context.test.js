import React from 'react'
import { render, waitFor } from '@testing-library/react-native'
import { Text } from 'react-native'

// Mocks deben ir ANTES de los imports
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
)
jest.mock('../../api/chat-service', () => ({
    getChats: jest.fn().mockResolvedValue([]),
    getMessages: jest.fn().mockResolvedValue([]),
}))
jest.mock('../../api/user-service', () => ({
    getUserById: jest.fn().mockResolvedValue({}),
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

import { ChatProvider, useChat } from '../../context/chat-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as chatService from '../../api/chat-service'
import * as authContext from '../../context/auth-context'

describe('ChatContext', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        AsyncStorage.multiGet.mockResolvedValue([
            [null, null],
            [null, null],
            [null, null],
        ])
        AsyncStorage.multiSet.mockResolvedValue()
        AsyncStorage.multiRemove.mockResolvedValue()
        chatService.getChats.mockResolvedValue([])
        authContext.useAuth.mockReturnValue({ user: { id: '123' } })
    })

    const TestComponent = () => {
        const chat = useChat()
        return (
            <>
                <Text testID="chats-length">{chat.chats.length}</Text>
                <Text testID="unread">{chat.unreadCount}</Text>
                <Text testID="loading">{chat.loading.toString()}</Text>
            </>
        )
    }

    describe('Provider rendering', () => {
        it('renders without crashing', () => {
            expect(() => {
                render(
                    <ChatProvider>
                        <Text>Test</Text>
                    </ChatProvider>
                )
            }).not.toThrow()
        })

        it('provides chat context to children', async () => {
            const { getByTestId } = render(
                <ChatProvider>
                    <TestComponent />
                </ChatProvider>
            )

            await waitFor(() => {
                expect(getByTestId('loading')).toBeTruthy()
            }, { timeout: 3000 })
        })
    })

    describe('Initial state', () => {
        it('renders with default state', async () => {
            const { getByTestId } = render(
                <ChatProvider>
                    <TestComponent />
                </ChatProvider>
            )

            await waitFor(() => {
                expect(getByTestId('chats-length')).toBeTruthy()
                expect(getByTestId('unread')).toBeTruthy()
            }, { timeout: 3000 })
        })
    })
})
