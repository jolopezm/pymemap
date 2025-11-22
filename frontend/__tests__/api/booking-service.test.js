import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as bookingService from '../../api/booking-service'
import { invalidateCache } from '../../utils/cache'
import { API_URL } from '../../config/api'

// Mock dependencies
jest.mock('axios')
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}))
jest.mock('../../utils/cache', () => ({
  invalidateCache: jest.fn(),
  getCachedOrFetch: jest.fn((key, fetchFn) => fetchFn()),
  TTL: { SHORT: 180000 },
}))
jest.mock('../../utils/logger', () => ({
  log: jest.fn(),
  error: jest.fn(),
}))
jest.mock('../../config/api', () => ({
  API_URL: 'https://pymemap-production-306f.up.railway.app',
}))

describe('booking-service', () => {
  const mockToken = 'mock-token-123'

  beforeEach(() => {
    jest.clearAllMocks()
    AsyncStorage.getItem.mockResolvedValue(mockToken)
  })

  describe('getBusinessAvailability', () => {
    it('fetches availability for a business and month', async () => {
      const mockAvailability = [
        { date: '2025-11-25', available: true },
        { date: '2025-11-26', available: true },
      ]

      axios.get.mockResolvedValue({ data: mockAvailability })

      const result = await bookingService.getBusinessAvailability(
        'biz123',
        2025,
        11
      )

      expect(axios.get).toHaveBeenCalledWith(
        `${API_URL}/bookings/business/biz123/availability/2025/11`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      )
      expect(result).toEqual(mockAvailability)
    })

    it('returns empty array on error', async () => {
      axios.get.mockRejectedValue(new Error('Network error'))

      const result = await bookingService.getBusinessAvailability(
        'biz123',
        2025,
        11
      )

      expect(result).toEqual([])
    })
  })

  describe('getAvailableSlots', () => {
    it('fetches available time slots for a date', async () => {
      const mockSlots = [
        { time: '09:00', available: true },
        { time: '10:00', available: true },
        { time: '11:00', available: false },
      ]

      axios.get.mockResolvedValue({ data: mockSlots })

      const result = await bookingService.getAvailableSlots(
        'biz123',
        '2025-11-25'
      )

      expect(axios.get).toHaveBeenCalledWith(
        `${API_URL}/bookings/business/biz123/availability/date/2025-11-25/slots`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      )
      expect(result).toEqual(mockSlots)
    })

    it('throws error on failure', async () => {
      axios.get.mockRejectedValue(new Error('Slots not found'))

      await expect(
        bookingService.getAvailableSlots('biz123', '2025-11-25')
      ).rejects.toThrow('Slots not found')
    })
  })

  describe('createBooking', () => {
    it('creates a new booking', async () => {
      const bookingData = {
        businessId: 'biz123',
        date: '2025-11-25',
        time: '10:00',
        service: 'Haircut',
      }

      const mockResponse = {
        _id: 'booking123',
        ...bookingData,
        status: 'pending',
      }

      axios.post.mockResolvedValue({ data: mockResponse })
      invalidateCache.mockResolvedValue(undefined)

      const result = await bookingService.createBooking(bookingData)

      expect(axios.post).toHaveBeenCalledWith(
        `${API_URL}/bookings/`,
        bookingData,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('invalidates cache after creating booking', async () => {
      const bookingData = { businessId: 'biz123', date: '2025-11-25' }

      axios.post.mockResolvedValue({ data: { _id: 'booking123' } })

      await bookingService.createBooking(bookingData)

      expect(invalidateCache).toHaveBeenCalledWith('my_bookings')
      expect(invalidateCache).toHaveBeenCalledWith('all_my_business_bookings')
    })

    it('throws error on booking conflict', async () => {
      const bookingData = { businessId: 'biz123', date: '2025-11-25' }

      axios.post.mockRejectedValue({
        response: {
          status: 409,
          data: { message: 'Slot already booked' },
        },
      })

      await expect(
        bookingService.createBooking(bookingData)
      ).rejects.toMatchObject({
        response: { status: 409 },
      })
    })
  })

  describe('confirmBooking', () => {
    it('confirms a booking', async () => {
      const mockResponse = {
        _id: 'booking123',
        status: 'confirmed',
      }

      axios.patch.mockResolvedValue({ data: mockResponse })

      const result = await bookingService.confirmBooking('booking123')

      expect(axios.patch).toHaveBeenCalledWith(
        `${API_URL}/bookings/booking123/confirm`,
        {},
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('invalidates cache after confirming', async () => {
      axios.patch.mockResolvedValue({ data: { _id: 'booking123' } })

      await bookingService.confirmBooking('booking123')

      expect(invalidateCache).toHaveBeenCalledWith('my_bookings')
      expect(invalidateCache).toHaveBeenCalledWith('all_my_business_bookings')
    })
  })

  describe('rejectBooking', () => {
    it('rejects a booking', async () => {
      const mockResponse = {
        _id: 'booking123',
        status: 'rejected',
      }

      axios.patch.mockResolvedValue({ data: mockResponse })

      const result = await bookingService.rejectBooking('booking123')

      expect(axios.patch).toHaveBeenCalledWith(
        `${API_URL}/bookings/booking123/reject`,
        {},
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getMyBookings', () => {
    it('fetches user bookings', async () => {
      const mockBookings = [
        { _id: 'booking1', status: 'confirmed' },
        { _id: 'booking2', status: 'pending' },
      ]

      axios.get.mockResolvedValue({ data: mockBookings })

      const result = await bookingService.getMyBookings()

      expect(axios.get).toHaveBeenCalledWith(
        `${API_URL}/bookings/my-bookings`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      )
      expect(result).toEqual(mockBookings)
    })
  })

  describe('getBusinessBookings', () => {
    it('fetches bookings for a business', async () => {
      const mockBookings = [
        { _id: 'booking1', businessId: 'biz123' },
        { _id: 'booking2', businessId: 'biz123' },
      ]

      axios.get.mockResolvedValue({ data: mockBookings })

      const result = await bookingService.getBusinessBookings('biz123')

      expect(axios.get).toHaveBeenCalledWith(
        `${API_URL}/bookings/business/biz123/bookings`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      )
      expect(result).toEqual(mockBookings)
    })

    it('returns empty array on error', async () => {
      axios.get.mockRejectedValue(new Error('Not found'))

      const result = await bookingService.getBusinessBookings('biz123')

      expect(result).toEqual([])
    })
  })

  describe('getAllMyBusinessBookings', () => {
    it('fetches all bookings for user businesses', async () => {
      const mockBookings = [
        { _id: 'booking1', businessId: 'biz1' },
        { _id: 'booking2', businessId: 'biz2' },
      ]

      axios.get.mockResolvedValue({ data: mockBookings })

      const result = await bookingService.getAllMyBusinessBookings()

      expect(axios.get).toHaveBeenCalledWith(
        `${API_URL}/bookings/my-business-bookings`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      )
      expect(result).toEqual(mockBookings)
    })
  })

  describe('setBusinessAvailability', () => {
    it('sets availability for a business', async () => {
      const availabilityData = {
        schedule: [
          { day: 'Monday', hours: [{ start: '09:00', end: '17:00' }] },
          { day: 'Tuesday', hours: [{ start: '09:00', end: '17:00' }] },
        ],
      }

      const mockResponse = {
        businessId: 'biz123',
        ...availabilityData,
      }

      axios.post.mockResolvedValue({ data: mockResponse })

      const result = await bookingService.setBusinessAvailability(
        'biz123',
        availabilityData
      )

      expect(axios.post).toHaveBeenCalledWith(
        `${API_URL}/bookings/business/biz123/availability`,
        availabilityData,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('throws error on invalid availability data', async () => {
      axios.post.mockRejectedValue({
        response: {
          status: 400,
          data: { message: 'Invalid schedule format' },
        },
      })

      await expect(
        bookingService.setBusinessAvailability('biz123', {})
      ).rejects.toMatchObject({
        response: { status: 400 },
      })
    })
  })

  describe('verifyBookingCode', () => {
    it('verifies a booking with confirmation code', async () => {
      const mockResponse = {
        _id: 'booking123',
        status: 'verified',
        verifiedAt: '2025-11-25T10:00:00Z',
      }

      axios.patch.mockResolvedValue({ data: mockResponse })

      const result = await bookingService.verifyBookingCode('booking123', '1234')

      expect(axios.patch).toHaveBeenCalledWith(
        `${API_URL}/bookings/booking123/verify-code`,
        { code: '1234' },
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('invalidates cache after verifying code', async () => {
      axios.patch.mockResolvedValue({ data: { _id: 'booking123' } })

      await bookingService.verifyBookingCode('booking123', '1234')

      expect(invalidateCache).toHaveBeenCalledWith('my_bookings')
      expect(invalidateCache).toHaveBeenCalledWith('all_my_business_bookings')
    })

    it('throws error on invalid code', async () => {
      axios.patch.mockRejectedValue({
        response: {
          status: 400,
          data: { message: 'Invalid verification code' },
        },
      })

      await expect(
        bookingService.verifyBookingCode('booking123', 'wrong')
      ).rejects.toMatchObject({
        response: { status: 400 },
      })
    })
  })
})
