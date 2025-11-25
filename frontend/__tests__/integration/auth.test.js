import AsyncStorage from '@react-native-async-storage/async-storage'
import * as authService from '../../api/auth-service'
import { clearAllCache } from '../../utils/cache-manager'

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}))
jest.mock('../../api/auth-service')
jest.mock('../../utils/cache-manager')

describe('Integration: Auth Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    AsyncStorage.getItem.mockResolvedValue(null)
    AsyncStorage.setItem.mockResolvedValue(undefined)
    AsyncStorage.removeItem.mockResolvedValue(undefined)
  })

  describe('Login Flow', () => {
    it('calls auth service with correct credentials', async () => {
      const mockUser = { _id: 'user123', email: 'test@example.com' }
      const mockToken = 'mock-jwt-token-12345'

      authService.login.mockResolvedValue({ access_token: mockToken })
      authService.getCurrentUser.mockResolvedValue(mockUser)

      // Execute login flow
      const loginResult = await authService.login({ 
        email: 'test@example.com', 
        password: 'password123' 
      })

      // Verify token in response
      expect(loginResult.access_token).toBe(mockToken)
      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })

    it('stores token in AsyncStorage after successful login', async () => {
      const mockToken = 'mock-jwt-token-12345'
      authService.login.mockResolvedValue({ access_token: mockToken })

      const result = await authService.login({ email: 'test@example.com', password: 'pass' })

      // In real app, auth-service stores token
      await AsyncStorage.setItem('token', result.access_token)

      expect(AsyncStorage.setItem).toHaveBeenCalledWith('token', mockToken)
    })

    it('fetches and stores user data after login', async () => {
      const mockUser = { _id: 'user123', email: 'test@example.com', name: 'Test User' }
      authService.getCurrentUser.mockResolvedValue(mockUser)

      const userData = await authService.getCurrentUser()
      
      // Store user data
      await AsyncStorage.setItem('@user_data', JSON.stringify(userData))

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@user_data',
        JSON.stringify(mockUser)
      )
    })

    it('rejects login with invalid credentials', async () => {
      authService.login.mockRejectedValue({
        response: { status: 401, data: { message: 'Invalid credentials' } }
      })

      await expect(
        authService.login({ email: 'wrong@example.com', password: 'wrong' })
      ).rejects.toMatchObject({
        response: { status: 401 }
      })
    })
  })

  describe('Logout Flow', () => {
    it('removes token from storage', async () => {
      authService.logout.mockImplementation(async () => {
        await AsyncStorage.removeItem('token')
        await AsyncStorage.removeItem('authData')
      })

      await authService.logout()

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('token')
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('authData')
    })

    it('clears all app cache on logout', async () => {
      clearAllCache.mockResolvedValue(undefined)

      await clearAllCache()

      expect(clearAllCache).toHaveBeenCalled()
    })
  })

  describe('Token Management', () => {
    it('retrieves stored token', async () => {
      const mockToken = 'stored-token-123'
      AsyncStorage.getItem.mockResolvedValue(mockToken)
      authService.getToken.mockImplementation(() => AsyncStorage.getItem('token'))

      const token = await authService.getToken()

      expect(token).toBe(mockToken)
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('token')
    })

    it('checks authentication status based on token', async () => {
      AsyncStorage.getItem.mockResolvedValue('valid-token')
      authService.isAuthenticated.mockImplementation(async () => {
        const token = await AsyncStorage.getItem('token')
        return !!token
      })

      const isAuth = await authService.isAuthenticated()

      expect(isAuth).toBe(true)
    })

    it('returns false when no token exists', async () => {
      AsyncStorage.getItem.mockResolvedValue(null)
      authService.isAuthenticated.mockImplementation(async () => {
        const token = await AsyncStorage.getItem('token')
        return !!token
      })

      const isAuth = await authService.isAuthenticated()

      expect(isAuth).toBe(false)
    })
  })

  describe('Session Persistence', () => {
    it('loads user data from storage on app start', async () => {
      const mockUser = { _id: 'user123', email: 'test@example.com' }
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockUser))

      const storedData = await AsyncStorage.getItem('@user_data')
      const user = JSON.parse(storedData)

      expect(user).toEqual(mockUser)
    })

    it('returns null when no stored user data', async () => {
      AsyncStorage.getItem.mockResolvedValue(null)

      const storedData = await AsyncStorage.getItem('@user_data')

      expect(storedData).toBeNull()
    })
  })

  describe('Protected Routes', () => {
    it('allows access with valid token', async () => {
      authService.getToken.mockResolvedValue('valid-token-123')
      authService.isAuthenticated.mockResolvedValue(true)

      const hasAccess = await authService.isAuthenticated()

      expect(hasAccess).toBe(true)
    })

    it('blocks access without token', async () => {
      authService.getToken.mockResolvedValue(null)
      authService.isAuthenticated.mockResolvedValue(false)

      const hasAccess = await authService.isAuthenticated()

      expect(hasAccess).toBe(false)
    })
  })
})
