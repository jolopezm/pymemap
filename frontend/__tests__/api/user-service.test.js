import AsyncStorage from '@react-native-async-storage/async-storage'
import axiosInstance from '../../api/axios-instance'
import * as userService from '../../api/user-service'
import { API_URL } from '../../config/api'

jest.mock('../../api/axios-instance', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}))
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}))
jest.mock('../../config/api', () => ({
  API_URL: 'https://pymemap-production-306f.up.railway.app',
}))
jest.mock('../../utils/logger', () => ({
  log: jest.fn(),
  error: jest.fn(),
}))

global.fetch = jest.fn()
global.FormData = jest.fn(() => ({
  append: jest.fn(),
}))

describe('user-service', () => {
  const mockToken = 'mock-token-123'

  beforeEach(() => {
    jest.clearAllMocks()
    AsyncStorage.getItem.mockResolvedValue(mockToken)
  })

  describe('getUsers', () => {
    it('fetches all users', async () => {
      const mockUsers = [
        { _id: 'user1', name: 'John Doe', email: 'john@example.com' },
        { _id: 'user2', name: 'Jane Smith', email: 'jane@example.com' },
      ]

      axiosInstance.get.mockResolvedValue({ data: mockUsers })

      const result = await userService.getUsers()

      expect(axiosInstance.get).toHaveBeenCalledWith('/users')
      expect(result).toEqual(mockUsers)
    })
  })

  describe('createUser', () => {
    it('creates a new user', async () => {
      const userData = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
      }
      const mockResponse = {
        _id: 'user123',
        ...userData,
      }

      axiosInstance.post.mockResolvedValue({ data: mockResponse })

      const result = await userService.createUser(userData)

      expect(axiosInstance.post).toHaveBeenCalledWith('/users', userData)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('updateUser', () => {
    it('updates user data', async () => {
      const userId = 'user123'
      const userData = {
        name: 'Updated Name',
        phone: '555-1234',
      }
      const mockResponse = {
        _id: userId,
        ...userData,
      }

      axiosInstance.put.mockResolvedValue({ data: mockResponse })

      const result = await userService.updateUser(userId, userData)

      expect(axiosInstance.put).toHaveBeenCalledWith(
        `/users/${userId}`,
        userData
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('changePassword', () => {
    it('changes user password', async () => {
      const userId = 'user123'
      const passwords = {
        currentPassword: 'oldpass',
        newPassword: 'newpass',
      }
      const mockResponse = {
        message: 'Password changed successfully',
      }

      axiosInstance.post.mockResolvedValue({ data: mockResponse })

      const result = await userService.changePassword(userId, passwords)

      expect(axiosInstance.post).toHaveBeenCalledWith(
        `/users/${userId}/change-password`,
        passwords
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('resetPassword', () => {
    it('resets user password', async () => {
      const data = {
        email: 'user@example.com',
        token: 'reset-token',
        newPassword: 'newpass123',
      }
      const mockResponse = {
        message: 'Password reset successfully',
      }

      axiosInstance.post.mockResolvedValue({ data: mockResponse })

      const result = await userService.resetPassword(data)

      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/users/reset-password',
        data
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('deleteUser', () => {
    it('deletes a user', async () => {
      const userId = 'user123'
      const mockResponse = {
        message: 'User deleted successfully',
      }

      axiosInstance.delete.mockResolvedValue({ data: mockResponse })

      const result = await userService.deleteUser(userId)

      expect(axiosInstance.delete).toHaveBeenCalledWith(`/users/${userId}`)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('updateBalance', () => {
    it('updates user balance with positive amount', async () => {
      const mockResponse = {
        balance: 150,
      }

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const result = await userService.updateBalance('user123', 50, true)

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_URL}/users/user123/update-balance`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: 50, isPositive: true }),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('updates user balance with negative amount', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ balance: 50 }),
      })

      await userService.updateBalance('user123', 50, false)

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_URL}/users/user123/update-balance`,
        expect.objectContaining({
          body: JSON.stringify({ amount: 50, isPositive: false }),
        })
      )
    })

    it('throws error when response is not ok', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 400,
      })

      await expect(
        userService.updateBalance('user123', 50, true)
      ).rejects.toThrow('Error updating balance')
    })
  })

  describe('uploadProfilePicture', () => {
    it('uploads a profile picture', async () => {
      const userId = 'user123'
      const imageUri = 'file:///path/to/image.jpg'
      const filename = 'profile.jpg'

      const mockBlob = new Blob(['image data'], { type: 'image/jpeg' })
      global.fetch
        .mockResolvedValueOnce({ blob: () => Promise.resolve(mockBlob) })
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              picture_url: 'https://cdn.example.com/profile.jpg',
            }),
        })

      const result = await userService.uploadProfilePicture(
        userId,
        imageUri,
        filename
      )

      expect(global.fetch).toHaveBeenCalledWith(imageUri)
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_URL}/users/upload-profile-picture/${userId}`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      )
      expect(result).toEqual({
        picture_url: 'https://cdn.example.com/profile.jpg',
      })
    })

    it('throws error on upload failure', async () => {
      const mockBlob = new Blob(['image data'])
      global.fetch
        .mockResolvedValueOnce({ blob: () => Promise.resolve(mockBlob) })
        .mockResolvedValueOnce({
          ok: false,
          status: 413,
          json: () => Promise.resolve({ detail: 'File too large' }),
        })

      await expect(
        userService.uploadProfilePicture('user123', 'file://img.jpg', 'img.jpg')
      ).rejects.toThrow('File too large')
    })

    it('handles fetch blob failure', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'))

      await expect(
        userService.uploadProfilePicture('user123', 'file://img.jpg', 'img.jpg')
      ).rejects.toThrow('Network error')
    })
  })

  describe('getUserById', () => {
    it('fetches a user by ID', async () => {
      const userId = 'user123'
      const mockUser = {
        _id: userId,
        name: 'John Doe',
        email: 'john@example.com',
      }

      axiosInstance.get.mockResolvedValue({ data: mockUser })

      const result = await userService.getUserById(userId)

      expect(axiosInstance.get).toHaveBeenCalledWith(`/users/${userId}`)
      expect(result).toEqual(mockUser)
    })

    it('throws error when user not found', async () => {
      axiosInstance.get.mockRejectedValue({
        response: {
          status: 404,
          data: { message: 'User not found' },
        },
      })

      await expect(userService.getUserById('nonexistent')).rejects.toMatchObject(
        {
          response: { status: 404 },
        }
      )
    })
  })
})
