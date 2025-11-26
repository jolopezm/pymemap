import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as businessService from '../../api/business-service'
import { invalidateCache, getCachedOrFetch } from '../../utils/cache'
import { API_URL } from '../../config/api'

// Mock dependencies
jest.mock('axios')
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}))
jest.mock('../../utils/cache', () => ({
  invalidateCache: jest.fn(),
  getCachedOrFetch: jest.fn((key, fetchFn) => fetchFn()),
  setCache: jest.fn(),
  TTL: { MEDIUM: 300000 },
}))
jest.mock('../../utils/logger', () => ({
  log: jest.fn(),
  error: jest.fn(),
}))
jest.mock('../../config/api', () => ({
  API_URL: 'https://pymemap-production-306f.up.railway.app',
}))

global.fetch = jest.fn()
global.FormData = jest.fn(() => ({
  append: jest.fn(),
}))

describe('business-service', () => {
  const mockToken = 'mock-token-123'

  beforeEach(() => {
    jest.clearAllMocks()
    AsyncStorage.getItem.mockResolvedValue(mockToken)
  })

  describe('getBusiness', () => {
    it('fetches all businesses when no id provided', async () => {
      const mockBusinesses = [
        { _id: 'biz1', name: 'Barber Shop', category: 'salon' },
        { _id: 'biz2', name: 'Spa Center', category: 'wellness' },
      ]

      getCachedOrFetch.mockImplementation((key, fetchFn) => fetchFn())
      axios.get.mockResolvedValue({ data: mockBusinesses })

      const result = await businessService.getBusiness()

      expect(axios.get).toHaveBeenCalledWith(
        `${API_URL}/business/`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      )
      expect(result).toEqual(mockBusinesses)
    })

    it('finds business by _id', async () => {
      const mockBusinesses = [
        { _id: 'biz1', name: 'Barber Shop' },
        { _id: 'biz2', name: 'Spa Center' },
      ]

      getCachedOrFetch.mockImplementation((key, fetchFn) => fetchFn())
      axios.get.mockResolvedValue({ data: mockBusinesses })

      const result = await businessService.getBusiness('biz1')

      expect(result).toEqual({ _id: 'biz1', name: 'Barber Shop' })
    })

    it('finds business by name (case insensitive)', async () => {
      const mockBusinesses = [
        { _id: 'biz1', name: 'Barber Shop' },
        { _id: 'biz2', name: 'Spa Center' },
      ]

      getCachedOrFetch.mockImplementation((key, fetchFn) => fetchFn())
      axios.get.mockResolvedValue({ data: mockBusinesses })

      const result = await businessService.getBusiness('barber shop')

      expect(result).toEqual({ _id: 'biz1', name: 'Barber Shop' })
    })

    it('returns null when business not found', async () => {
      const mockBusinesses = [{ _id: 'biz1', name: 'Barber Shop' }]

      getCachedOrFetch.mockImplementation((key, fetchFn) => fetchFn())
      axios.get.mockResolvedValue({ data: mockBusinesses })

      const result = await businessService.getBusiness('nonexistent')

      expect(result).toBeNull()
    })

    it('throws error on fetch failure', async () => {
      getCachedOrFetch.mockImplementation((key, fetchFn) => fetchFn())
      axios.get.mockRejectedValue(new Error('Network error'))

      await expect(businessService.getBusiness()).rejects.toThrow(
        'Network error'
      )
    })
  })

  describe('createBusiness', () => {
    it('creates a new business', async () => {
      const businessData = {
        name: 'New Barber',
        category: 'salon',
        address: '123 Main St',
      }

      const mockResponse = {
        _id: 'biz123',
        ...businessData,
        owner: 'user123',
      }

      axios.post.mockResolvedValue({ data: mockResponse })

      const result = await businessService.createBusiness(businessData)

      expect(axios.post).toHaveBeenCalledWith(
        `${API_URL}/business`,
        businessData,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('invalidates cache after creating business', async () => {
      const businessData = { name: 'New Business' }
      axios.post.mockResolvedValue({ data: { _id: 'biz123' } })

      await businessService.createBusiness(businessData)

      expect(invalidateCache).toHaveBeenCalledWith('business_list')
    })

    it('throws error on validation failure', async () => {
      axios.post.mockRejectedValue({
        response: {
          status: 400,
          data: { message: 'Name is required' },
        },
      })

      await expect(
        businessService.createBusiness({})
      ).rejects.toMatchObject({
        response: { status: 400 },
      })
    })
  })

  describe('requestService', () => {
    it('requests a service', async () => {
      const serviceData = {
        businessId: 'biz123',
        description: 'Need a haircut',
      }

      const mockResponse = {
        _id: 'service123',
        ...serviceData,
        status: 'pending',
      }

      axios.post.mockResolvedValue({ data: mockResponse })

      const result = await businessService.requestService(serviceData)

      expect(axios.post).toHaveBeenCalledWith(
        `${API_URL}/business/request-service`,
        serviceData,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getServices', () => {
    it('fetches all services', async () => {
      const mockServices = [
        { _id: 'svc1', name: 'Haircut', price: 25 },
        { _id: 'svc2', name: 'Massage', price: 50 },
      ]

      axios.get.mockResolvedValue({ data: mockServices })

      const result = await businessService.getServices()

      expect(axios.get).toHaveBeenCalledWith(
        `${API_URL}/business/services`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      )
      expect(result).toEqual(mockServices)
    })
  })

  describe('deleteService', () => {
    it('deletes a service', async () => {
      const mockResponse = { message: 'Service deleted' }

      axios.delete.mockResolvedValue({ data: mockResponse })

      const result = await businessService.deleteService('svc123')

      expect(axios.delete).toHaveBeenCalledWith(
        `${API_URL}/business/services/svc123`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('updateServiceStatus', () => {
    it('updates service status', async () => {
      const mockResponse = {
        _id: 'svc123',
        state: 'active',
      }

      axios.patch.mockResolvedValue({ data: mockResponse })

      const result = await businessService.updateServiceStatus(
        'svc123',
        'active'
      )

      expect(axios.patch).toHaveBeenCalledWith(
        `${API_URL}/business/services/svc123/status`,
        { state: 'active' },
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('requestPayment', () => {
    it('requests payment for a service', async () => {
      const mockResponse = {
        _id: 'svc123',
        requested_price: 75,
      }

      axios.patch.mockResolvedValue({ data: mockResponse })

      const result = await businessService.requestPayment('svc123', 75)

      expect(axios.patch).toHaveBeenCalledWith(
        `${API_URL}/business/services/svc123/request-payment`,
        { requested_price: 75 },
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('payService', () => {
    it('pays for a service', async () => {
      const mockResponse = {
        _id: 'svc123',
        payment_status: 'paid',
      }

      axios.post.mockResolvedValue({ data: mockResponse })

      const result = await businessService.payService('svc123')

      expect(axios.post).toHaveBeenCalledWith(
        `${API_URL}/business/services/svc123/pay`,
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

  describe('uploadBusinessPicture', () => {
    it('uploads a business picture', async () => {
      const imageUri = 'file:///path/to/image.jpg'
      const filename = 'business-pic.jpg'
      const businessId = 'biz123'

      const mockBlob = new Blob(['image data'], { type: 'image/jpeg' })
      global.fetch
        .mockResolvedValueOnce({ blob: () => Promise.resolve(mockBlob) })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ picture_url: 'https://cdn.example.com/pic.jpg' }),
        })

      const result = await businessService.uploadBusinessPicture(
        businessId,
        imageUri,
        filename
      )

      expect(global.fetch).toHaveBeenCalledWith(imageUri)
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_URL}/business/upload-pictures/${businessId}`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      )
      expect(result).toEqual({ picture_url: 'https://cdn.example.com/pic.jpg' })
    })

    it('invalidates cache after uploading picture', async () => {
      const mockBlob = new Blob(['image data'])
      global.fetch
        .mockResolvedValueOnce({ blob: () => Promise.resolve(mockBlob) })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ picture_url: 'url' }),
        })

      await businessService.uploadBusinessPicture('biz123', 'file://img.jpg', 'img.jpg')

      expect(invalidateCache).toHaveBeenCalledWith('business_list')
      expect(invalidateCache).toHaveBeenCalledWith('business_biz123')
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
        businessService.uploadBusinessPicture('biz123', 'file://img.jpg', 'img.jpg')
      ).rejects.toThrow('File too large')
    })
  })

  describe('updateBusiness', () => {
    it('updates business data', async () => {
      const updateData = { name: 'Updated Name', phone: '555-1234' }
      const mockResponse = {
        _id: 'biz123',
        ...updateData,
      }

      axios.patch.mockResolvedValue({ data: mockResponse })

      const result = await businessService.updateBusiness('biz123', updateData)

      expect(axios.patch).toHaveBeenCalledWith(
        `${API_URL}/business/biz123`,
        updateData,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('invalidates cache after update', async () => {
      axios.patch.mockResolvedValue({ data: { _id: 'biz123' } })

      await businessService.updateBusiness('biz123', { name: 'New Name' })

      expect(invalidateCache).toHaveBeenCalledWith('business_list')
      expect(invalidateCache).toHaveBeenCalledWith('business_biz123')
    })
  })

  describe('updateBusinessLocation', () => {
    it('updates business location', async () => {
      const mockResponse = {
        _id: 'biz123',
        latitude: 40.7128,
        longitude: -74.006,
      }

      axios.patch.mockResolvedValue({ data: mockResponse })

      const result = await businessService.updateBusinessLocation(
        'biz123',
        40.7128,
        -74.006
      )

      expect(axios.patch).toHaveBeenCalledWith(
        `${API_URL}/business/biz123/location`,
        { latitude: 40.7128, longitude: -74.006 },
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('invalidates cache after location update', async () => {
      axios.patch.mockResolvedValue({ data: { _id: 'biz123' } })

      await businessService.updateBusinessLocation('biz123', 40.7128, -74.006)

      expect(invalidateCache).toHaveBeenCalledWith('business_list')
      expect(invalidateCache).toHaveBeenCalledWith('business_biz123')
    })
  })

  describe('getNearbyBusinesses', () => {
    it('fetches nearby businesses', async () => {
      const mockBusinesses = [
        { _id: 'biz1', name: 'Close Barber', distance: 0.5 },
        { _id: 'biz2', name: 'Near Spa', distance: 2.3 },
      ]

      axios.get.mockResolvedValue({ data: mockBusinesses })

      const result = await businessService.getNearbyBusinesses(
        40.7128,
        -74.006,
        5
      )

      expect(axios.get).toHaveBeenCalledWith(
        `${API_URL}/business/nearby`,
        expect.objectContaining({
          params: { latitude: 40.7128, longitude: -74.006, radius_km: 5 },
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      )
      expect(result).toEqual(mockBusinesses)
    })

    it('uses default radius of 10km', async () => {
      axios.get.mockResolvedValue({ data: [] })

      await businessService.getNearbyBusinesses(40.7128, -74.006)

      expect(axios.get).toHaveBeenCalledWith(
        `${API_URL}/business/nearby`,
        expect.objectContaining({
          params: expect.objectContaining({ radius_km: 10 }),
        })
      )
    })
  })
})
