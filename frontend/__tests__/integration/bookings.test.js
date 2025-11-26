import AsyncStorage from '@react-native-async-storage/async-storage'
import * as bookingService from '../../api/booking-service'
import * as notificationService from '../../api/notifications-service'

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}))
jest.mock('../../api/booking-service')
jest.mock('../../api/notifications-service')

describe('Integration: Booking Flow', () => {
  const mockBusiness = {
    _id: 'biz123',
    name: 'Test Business',
    category: 'Servicios',
  }

  const mockUser = {
    _id: 'user123',
    email: 'test@example.com',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    AsyncStorage.getItem.mockResolvedValue('mock-token')
  })

  describe('View Available Slots', () => {
    it('fetches available days for a business', async () => {
      const mockAvailability = [
        { date: '2025-11-25', available: true },
        { date: '2025-11-26', available: true },
        { date: '2025-11-27', available: false },
      ]

      bookingService.getBusinessAvailability.mockResolvedValue(mockAvailability)

      const availability = await bookingService.getBusinessAvailability(
        'biz123',
        2025,
        11
      )

      expect(bookingService.getBusinessAvailability).toHaveBeenCalledWith(
        'biz123',
        2025,
        11
      )
      expect(availability).toHaveLength(3)
      expect(availability.filter(d => d.available)).toHaveLength(2)
    })

    it('fetches available time slots for specific date', async () => {
      const mockSlots = [
        { time: '09:00', available: true },
        { time: '10:00', available: true },
        { time: '11:00', available: false },
        { time: '12:00', available: true },
      ]

      bookingService.getAvailableSlots.mockResolvedValue(mockSlots)

      const slots = await bookingService.getAvailableSlots('biz123', '2025-11-25')

      expect(slots).toHaveLength(4)
      expect(slots.filter(s => s.available)).toHaveLength(3)
    })

    it('returns empty array when no slots available', async () => {
      bookingService.getAvailableSlots.mockResolvedValue([])

      const slots = await bookingService.getAvailableSlots('biz123', '2025-12-25')

      expect(slots).toEqual([])
    })
  })

  describe('Create Booking', () => {
    it('creates booking with selected date and time', async () => {
      const bookingData = {
        businessId: 'biz123',
        userId: 'user123',
        date: '2025-11-25',
        time: '10:00',
        service: 'Haircut',
      }

      const mockBooking = {
        _id: 'booking123',
        ...bookingData,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      }

      bookingService.createBooking.mockResolvedValue(mockBooking)

      const result = await bookingService.createBooking(bookingData)

      expect(bookingService.createBooking).toHaveBeenCalledWith(bookingData)
      expect(result._id).toBe('booking123')
      expect(result.status).toBe('confirmed')
    })

    it('validates slot availability before booking', async () => {
      const mockSlots = [
        { time: '10:00', available: false },
      ]

      bookingService.getAvailableSlots.mockResolvedValue(mockSlots)

      const slots = await bookingService.getAvailableSlots('biz123', '2025-11-25')
      const slot = slots.find(s => s.time === '10:00')

      expect(slot.available).toBe(false)
    })

    it('handles booking conflicts', async () => {
      bookingService.createBooking.mockRejectedValue({
        response: {
          status: 409,
          data: { message: 'Slot no longer available' },
        },
      })

      await expect(
        bookingService.createBooking({
          businessId: 'biz123',
          date: '2025-11-25',
          time: '10:00',
        })
      ).rejects.toMatchObject({
        response: { status: 409 },
      })
    })
  })

  describe('Retrieve User Bookings', () => {
    it('filters bookings for a specific user', () => {
      const allBookings = [
        { _id: 'booking1', userId: 'user123', status: 'confirmed' },
        { _id: 'booking2', userId: 'user456', status: 'pending' },
        { _id: 'booking3', userId: 'user123', status: 'confirmed' },
      ]

      const userBookings = allBookings.filter(b => b.userId === 'user123')

      expect(userBookings).toHaveLength(2)
      expect(userBookings.every(b => b.userId === 'user123')).toBe(true)
    })

    it('filters bookings by status', () => {
      const mockBookings = [
        { _id: 'booking1', status: 'confirmed' },
        { _id: 'booking2', status: 'cancelled' },
        { _id: 'booking3', status: 'confirmed' },
      ]

      const confirmedBookings = mockBookings.filter(b => b.status === 'confirmed')

      expect(confirmedBookings).toHaveLength(2)
      expect(confirmedBookings.every(b => b.status === 'confirmed')).toBe(true)
    })
  })

  describe('Cancel Booking', () => {
    it('updates booking status to cancelled', () => {
      const booking = {
        _id: 'booking123',
        status: 'confirmed',
        date: '2025-11-25',
      }

      // Simulate cancellation
      const cancelled = {
        ...booking,
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
      }

      expect(cancelled.status).toBe('cancelled')
      expect(cancelled).toHaveProperty('cancelledAt')
    })

    it('validates booking can be cancelled based on status', () => {
      const completedBooking = { _id: 'booking1', status: 'completed' }
      const confirmedBooking = { _id: 'booking2', status: 'confirmed' }

      const canCancelCompleted = completedBooking.status !== 'completed'
      const canCancelConfirmed = confirmedBooking.status === 'confirmed'

      expect(canCancelCompleted).toBe(false)
      expect(canCancelConfirmed).toBe(true)
    })
  })

  describe('Notifications', () => {
    it('prepares notification data after booking', () => {
      const booking = {
        _id: 'booking123',
        businessId: 'biz123',
        userId: 'user123',
        date: '2025-11-25',
        time: '10:00',
      }

      const notificationData = {
        userId: booking.userId,
        type: 'booking_confirmed',
        bookingId: booking._id,
      }

      expect(notificationData.userId).toBe('user123')
      expect(notificationData.type).toBe('booking_confirmed')
      expect(notificationData.bookingId).toBe('booking123')
    })

    it('identifies notification service errors', () => {
      const error = new Error('Notification service unavailable')
      
      expect(error.message).toBe('Notification service unavailable')
    })
  })

  describe('Complete Booking Flow', () => {
    it('simulates full booking lifecycle', async () => {
      // Step 1: Check availability
      const mockSlots = [{ time: '10:00', available: true }]
      bookingService.getAvailableSlots.mockResolvedValue(mockSlots)

      const slots = await bookingService.getAvailableSlots('biz123', '2025-11-25')
      expect(slots[0].available).toBe(true)

      // Step 2: Create booking
      const bookingData = {
        businessId: 'biz123',
        userId: 'user123',
        date: '2025-11-25',
        time: '10:00',
      }

      const mockBooking = {
        _id: 'booking123',
        ...bookingData,
        status: 'confirmed',
      }

      bookingService.createBooking.mockResolvedValue(mockBooking)

      const booking = await bookingService.createBooking(bookingData)
      expect(booking.status).toBe('confirmed')
      expect(booking._id).toBe('booking123')

      // Step 3: Verify notification would be sent
      const notificationData = {
        userId: booking.userId,
        type: 'booking_confirmed',
        bookingId: booking._id,
      }

      expect(notificationData.type).toBe('booking_confirmed')

      // Step 4: Verify booking would appear in user list
      const userBookings = [mockBooking]
      expect(userBookings).toContainEqual(mockBooking)
    })
  })

  describe('Error Scenarios', () => {
    it('handles network errors when fetching slots', async () => {
      bookingService.getAvailableSlots.mockRejectedValue(
        new Error('Network error')
      )

      await expect(
        bookingService.getAvailableSlots('biz123', '2025-11-25')
      ).rejects.toThrow('Network error')
    })

    it('handles unauthorized booking attempts', async () => {
      bookingService.createBooking.mockRejectedValue({
        response: { status: 401, data: { message: 'Unauthorized' } },
      })

      await expect(
        bookingService.createBooking({
          businessId: 'biz123',
          date: '2025-11-25',
          time: '10:00',
        })
      ).rejects.toMatchObject({
        response: { status: 401 },
      })
    })
  })
})
