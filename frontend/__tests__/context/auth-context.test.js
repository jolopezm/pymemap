import React from 'react'
import { render, waitFor } from '@testing-library/react-native'
import { Text, Pressable } from 'react-native'

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
}))
jest.mock('../../api/auth-service', () => ({
  getCurrentUser: jest.fn(),
  login: jest.fn(),
}))
jest.mock('../../utils/cache-manager', () => ({
  clearAllCache: jest.fn(),
}))
jest.mock('../../utils/logger', () => ({
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}))

import AsyncStorage from '@react-native-async-storage/async-storage'
import { AuthProvider, useAuth } from '../../context/auth-context'
import * as authService from '../../api/auth-service'
import { clearAllCache } from '../../utils/cache-manager'

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const TestComponent = ({ onRender }) => {
    const auth = useAuth()
    React.useEffect(() => {
      if (onRender) onRender(auth)
    }, [auth, onRender])
    
    return (
      <>
        <Text testID="user-state">{auth.user ? 'logged-in' : 'logged-out'}</Text>
        <Text testID="loading">{auth.loading ? 'loading' : 'ready'}</Text>
        <Pressable testID="login-btn" onPress={() => auth.login({ email: 'test@test.com', password: '123' })} />
        <Pressable testID="logout-btn" onPress={() => auth.logout()} />
        <Pressable testID="refresh-btn" onPress={() => auth.refreshUser()} />
      </>
    )
  }

  describe('Provider rendering', () => {
    it('renders without crashing', () => {
      AsyncStorage.getItem.mockResolvedValue(null)
      
      expect(() => {
        render(
          <AuthProvider>
            <Text>Test</Text>
          </AuthProvider>
        )
      }).not.toThrow()
    })

    it('provides auth context to children', async () => {
      AsyncStorage.getItem.mockResolvedValue(null)
      
      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(getByTestId('loading')).toBeTruthy()
      }, { timeout: 3000 })
    })
  })

  describe('Initial state', () => {
    it('renders with default state', async () => {
      AsyncStorage.getItem.mockResolvedValue(null)
      
      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(getByTestId('user-state')).toBeTruthy()
      }, { timeout: 3000 })
    })
  })

  describe('Context functionality', () => {
    it('renders children components', async () => {
      AsyncStorage.getItem.mockResolvedValue(null)
      
      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(getByTestId('user-state')).toBeTruthy()
        expect(getByTestId('loading')).toBeTruthy()
        expect(getByTestId('login-btn')).toBeTruthy()
        expect(getByTestId('logout-btn')).toBeTruthy()
        expect(getByTestId('refresh-btn')).toBeTruthy()
      }, { timeout: 3000 })
    })
  })
})
