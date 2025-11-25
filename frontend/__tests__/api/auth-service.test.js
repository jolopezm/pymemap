import AsyncStorage from '@react-native-async-storage/async-storage'
import axiosInstance from '../../api/axios-instance'
import * as authService from '../../api/auth-service'
import { API_URL } from '../../config/api'

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}))

jest.mock('../../api/axios-instance', () => ({
  get: jest.fn(),
  post: jest.fn(),
}))

jest.mock('../../config/api', () => ({
  API_URL: 'https://pymemap-production-306f.up.railway.app',
}))

describe('auth-service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('login', () => {
    it('makes POST request with email and password', async () => {
      const mockResponse = {
        data: {
          access_token: 'mock-token-123',
          user: { id: '1', email: 'test@example.com' },
        },
      }

      axiosInstance.post.mockResolvedValue(mockResponse)
      AsyncStorage.setItem.mockResolvedValue(undefined)

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(axiosInstance.post).toHaveBeenCalledWith('/login', {
        email: 'test@example.com',
        password: 'password123',
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('stores access token in AsyncStorage', async () => {
      const mockToken = 'mock-token-456'
      const mockResponse = {
        data: {
          access_token: mockToken,
        },
      }

      axiosInstance.post.mockResolvedValue(mockResponse)

      await authService.login({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(AsyncStorage.setItem).toHaveBeenCalledWith('token', mockToken)
    })

    it('does not store token if not provided', async () => {
      const mockResponse = {
        data: {
          // No access_token
        },
      }

      axiosInstance.post.mockResolvedValue(mockResponse)

      await authService.login({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(AsyncStorage.setItem).not.toHaveBeenCalled()
    })

    it('throws error on invalid credentials', async () => {
      axiosInstance.post.mockRejectedValue({
        response: {
          status: 401,
          data: { message: 'Invalid credentials' },
        },
      })

      await expect(
        authService.login({
          email: 'wrong@example.com',
          password: 'wrong',
        })
      ).rejects.toMatchObject({
        response: { status: 401 },
      })
    })
  })

  describe('logout', () => {
    it('removes token from AsyncStorage', async () => {
      AsyncStorage.removeItem.mockResolvedValue(undefined)

      await authService.logout()

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('token')
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('authData')
    })

    it('removes both token and authData', async () => {
      await authService.logout()

      expect(AsyncStorage.removeItem).toHaveBeenCalledTimes(2)
    })
  })

  describe('getCurrentUser', () => {
    it('fetches user data when token exists', async () => {
      const mockToken = 'valid-token'
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      }

      AsyncStorage.getItem.mockResolvedValue(mockToken)
      axiosInstance.get.mockResolvedValue({ data: mockUser })
      AsyncStorage.setItem.mockResolvedValue(undefined)

      const result = await authService.getCurrentUser()

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('token')
      expect(axiosInstance.get).toHaveBeenCalledWith('/users/me')
      expect(result).toEqual(mockUser)
    })

    it('stores user data in AsyncStorage', async () => {
      const mockUser = { id: '1', email: 'test@example.com' }

      AsyncStorage.getItem.mockResolvedValue('token')
      axiosInstance.get.mockResolvedValue({ data: mockUser })

      await authService.getCurrentUser()

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify(mockUser)
      )
    })

    it('returns null when no token exists', async () => {
      AsyncStorage.getItem.mockResolvedValue(null)

      const result = await authService.getCurrentUser()

      expect(result).toBeNull()
      expect(axiosInstance.get).not.toHaveBeenCalled()
    })

    it('calls logout on 401 error', async () => {
      AsyncStorage.getItem.mockResolvedValue('expired-token')
      AsyncStorage.removeItem.mockResolvedValue(undefined)
      
      axiosInstance.get.mockRejectedValue({
        response: { status: 401 },
      })

      await expect(authService.getCurrentUser()).rejects.toMatchObject({
        response: { status: 401 },
      })

      // Verify logout was called
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('token')
    })

    it('throws error on network failure', async () => {
      AsyncStorage.getItem.mockResolvedValue('token')
      axiosInstance.get.mockRejectedValue(new Error('Network error'))

      await expect(authService.getCurrentUser()).rejects.toThrow(
        'Network error'
      )
    })
  })

  describe('isAuthenticated', () => {
    it('returns true when token exists', async () => {
      AsyncStorage.getItem.mockResolvedValue('valid-token')

      const result = await authService.isAuthenticated()

      expect(result).toBe(true)
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('token')
    })

    it('returns false when token does not exist', async () => {
      AsyncStorage.getItem.mockResolvedValue(null)

      const result = await authService.isAuthenticated()

      expect(result).toBe(false)
    })

    it('returns false for empty string token', async () => {
      AsyncStorage.getItem.mockResolvedValue('')

      const result = await authService.isAuthenticated()

      expect(result).toBe(false)
    })
  })

  describe('getToken', () => {
    it('retrieves token from AsyncStorage', async () => {
      const mockToken = 'stored-token-789'
      AsyncStorage.getItem.mockResolvedValue(mockToken)

      const result = await authService.getToken()

      expect(result).toBe(mockToken)
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('token')
    })

    it('returns null when no token stored', async () => {
      AsyncStorage.getItem.mockResolvedValue(null)

      const result = await authService.getToken()

      expect(result).toBeNull()
    })
  })

  describe('sendAuthCode', () => {
    it('sends auth code to email', async () => {
      const mockResponse = {
        data: { success: true, message: 'Code sent' },
      }

      axiosInstance.post.mockResolvedValue(mockResponse)

      const result = await authService.sendAuthCode('test@example.com')

      expect(axiosInstance.post).toHaveBeenCalledWith('/send-auth-code', {
        email: 'test@example.com',
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('throws error on invalid email', async () => {
      axiosInstance.post.mockRejectedValue({
        response: {
          status: 400,
          data: { message: 'Invalid email' },
        },
      })

      await expect(
        authService.sendAuthCode('invalid-email')
      ).rejects.toMatchObject({
        response: { status: 400 },
      })
    })
  })

  describe('verifyAuthCode', () => {
    it('verifies auth code successfully', async () => {
      const authData = {
        email: 'test@example.com',
        code: '123456',
      }

      const mockResponse = {
        data: {
          access_token: 'new-token',
          user: { id: '1', email: 'test@example.com' },
        },
      }

      axiosInstance.post.mockResolvedValue(mockResponse)

      const result = await authService.verifyAuthCode(authData)

      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/verify-auth-code',
        authData
      )
      expect(result).toEqual(mockResponse.data)
    })

    it('throws error on invalid code', async () => {
      const authData = {
        email: 'test@example.com',
        code: 'wrong-code',
      }

      axiosInstance.post.mockRejectedValue({
        response: {
          status: 401,
          data: { message: 'Invalid code' },
        },
      })

      await expect(
        authService.verifyAuthCode(authData)
      ).rejects.toMatchObject({
        response: { status: 401 },
      })
    })
  })
})
