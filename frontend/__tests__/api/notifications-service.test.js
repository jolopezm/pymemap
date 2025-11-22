import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as notificationsService from '../../api/notifications-service'
import { API_URL } from '../../config/api'

jest.mock('axios')
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}))
jest.mock('../../config/api', () => ({
  API_URL: 'https://pymemap-production-306f.up.railway.app',
}))
jest.mock('../../utils/logger', () => ({
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}))

describe('notifications-service', () => {
  const mockToken = 'mock-token-123'

  beforeEach(() => {
    jest.clearAllMocks()
    AsyncStorage.getItem.mockResolvedValue(mockToken)
  })

  describe('createNotification', () => {
    it('creates a new notification', async () => {
      const notificationData = {
        userId: 'user123',
        type: 'booking',
        message: 'New booking confirmed',
      }
      const mockResponse = {
        _id: 'notif123',
        ...notificationData,
        createdAt: '2025-11-22T10:00:00Z',
      }

      axios.post.mockResolvedValue({ data: mockResponse })

      const result = await notificationsService.createNotification(
        notificationData
      )

      expect(axios.post).toHaveBeenCalledWith(
        `${API_URL}/notifications`,
        notificationData,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('throws error on failure', async () => {
      const notificationData = { userId: 'user123' }

      axios.post.mockRejectedValue({
        message: 'Server error',
        response: {
          status: 500,
          data: { detail: 'Internal server error' },
        },
      })

      await expect(
        notificationsService.createNotification(notificationData)
      ).rejects.toMatchObject({
        message: 'Server error',
      })
    })

    it('works without token', async () => {
      AsyncStorage.getItem.mockResolvedValue(null)

      const notificationData = { userId: 'user123' }
      axios.post.mockResolvedValue({ data: { _id: 'notif123' } })

      await notificationsService.createNotification(notificationData)

      expect(axios.post).toHaveBeenCalledWith(
        `${API_URL}/notifications`,
        notificationData,
        expect.objectContaining({
          headers: {},
        })
      )
    })
  })

  describe('getNotifications', () => {
    it('fetches notifications for a user', async () => {
      const mockNotifications = [
        {
          _id: 'notif1',
          userId: 'user123',
          message: 'Booking confirmed',
          read: false,
        },
        {
          _id: 'notif2',
          userId: 'user123',
          message: 'New message',
          read: true,
        },
      ]

      axios.get.mockResolvedValue({ data: mockNotifications })

      const result = await notificationsService.getNotifications('user123')

      expect(axios.get).toHaveBeenCalledWith(
        `${API_URL}/notifications?user_id=user123`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      )
      expect(result).toEqual(mockNotifications)
    })

    it('returns empty array when userId is missing', async () => {
      const result = await notificationsService.getNotifications()

      expect(axios.get).not.toHaveBeenCalled()
      expect(result).toEqual([])
    })

    it('returns empty array on error', async () => {
      axios.get.mockRejectedValue(new Error('Network error'))

      const result = await notificationsService.getNotifications('user123')

      expect(result).toEqual([])
    })

    it('works without token', async () => {
      AsyncStorage.getItem.mockResolvedValue(null)

      axios.get.mockResolvedValue({ data: [] })

      await notificationsService.getNotifications('user123')

      expect(axios.get).toHaveBeenCalledWith(
        `${API_URL}/notifications?user_id=user123`,
        expect.objectContaining({
          headers: {},
        })
      )
    })
  })

  describe('markNotificationAsRead', () => {
    it('marks a notification as read', async () => {
      const mockResponse = {
        _id: 'notif123',
        read: true,
      }

      axios.patch.mockResolvedValue({ data: mockResponse })

      const result = await notificationsService.markNotificationAsRead(
        'notif123'
      )

      expect(axios.patch).toHaveBeenCalledWith(
        `${API_URL}/notifications/notif123`,
        {},
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('returns undefined when notificationId is missing', async () => {
      const result = await notificationsService.markNotificationAsRead()

      expect(axios.patch).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })

    it('throws error on failure', async () => {
      axios.patch.mockRejectedValue({
        message: 'Not found',
        response: { status: 404 },
      })

      await expect(
        notificationsService.markNotificationAsRead('notif123')
      ).rejects.toMatchObject({
        message: 'Not found',
      })
    })

    it('works without token', async () => {
      AsyncStorage.getItem.mockResolvedValue(null)

      axios.patch.mockResolvedValue({ data: { _id: 'notif123' } })

      await notificationsService.markNotificationAsRead('notif123')

      expect(axios.patch).toHaveBeenCalledWith(
        `${API_URL}/notifications/notif123`,
        {},
        expect.objectContaining({
          headers: {},
        })
      )
    })
  })
})
