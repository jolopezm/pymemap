import React from 'react'
import { renderHook, act, waitFor } from '@testing-library/react-native'
import { useAsyncStorage, useAsyncStorageRead, clearAsyncStorageCache } from '../../hooks/useAsyncStorage'
import AsyncStorage from '@react-native-async-storage/async-storage'

jest.mock('@react-native-async-storage/async-storage', () => 
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
)

jest.mock('../../utils/logger', () => ({
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn()
}))

describe('useAsyncStorage', () => {
    beforeEach(() => {
        AsyncStorage.clear()
        clearAsyncStorageCache()
        jest.clearAllMocks()
    })

    describe('Reading values', () => {
        it('returns default value when key does not exist', async () => {
            const { result } = renderHook(() => useAsyncStorage('test-key', 'default'))
            
            await waitFor(() => {
                expect(result.current[3]).toBe(false) // loading
            })

            expect(result.current[0]).toBe('default')
        })

        it('loads value from AsyncStorage', async () => {
            await AsyncStorage.setItem('test-key', JSON.stringify('stored-value'))

            const { result } = renderHook(() => useAsyncStorage('test-key', 'default'))

            await waitFor(() => {
                expect(result.current[0]).toBe('stored-value')
                expect(result.current[3]).toBe(false) // loading
            })
        })

        it('handles JSON parsing errors', async () => {
            await AsyncStorage.setItem('test-key', 'invalid-json')

            const { result } = renderHook(() => useAsyncStorage('test-key', 'default'))

            await waitFor(() => {
                expect(result.current[0]).toBe('default')
                expect(result.current[4]).toBeTruthy() // error
            })
        })
    })

    describe('Updating values', () => {
        it('updates value in AsyncStorage', async () => {
            const { result } = renderHook(() => useAsyncStorage('test-key', 'default'))

            await waitFor(() => {
                expect(result.current[3]).toBe(false)
            })

            await act(async () => {
                await result.current[1]('new-value') // updateValue
            })

            expect(result.current[0]).toBe('new-value')
            const stored = await AsyncStorage.getItem('test-key')
            expect(JSON.parse(stored)).toBe('new-value')
        })
    })

    describe('Removing values', () => {
        it('removes value from AsyncStorage', async () => {
            await AsyncStorage.setItem('test-key', JSON.stringify('stored-value'))

            const { result } = renderHook(() => useAsyncStorage('test-key', 'default'))

            await waitFor(() => {
                expect(result.current[0]).toBe('stored-value')
            })

            await act(async () => {
                await result.current[2]() // removeValue
            })

            expect(result.current[0]).toBe('default')
            const stored = await AsyncStorage.getItem('test-key')
            expect(stored).toBeNull()
        })
    })
})

describe('useAsyncStorageRead', () => {
    beforeEach(() => {
        AsyncStorage.clear()
        clearAsyncStorageCache()
    })

    it('returns value, loading, and error states', async () => {
        await AsyncStorage.setItem('test-key', JSON.stringify('stored-value'))

        const { result } = renderHook(() => useAsyncStorageRead('test-key', 'default'))

        await waitFor(() => {
            expect(result.current.value).toBe('stored-value')
            expect(result.current.loading).toBe(false)
            expect(result.current.error).toBeNull()
        })
    })
})
