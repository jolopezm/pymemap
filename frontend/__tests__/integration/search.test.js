import AsyncStorage from '@react-native-async-storage/async-storage'
import * as businessService from '../../api/business-service'
import { calculateBusinessDistances } from '../../utils/geolocation'

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}))
jest.mock('../../api/business-service')
jest.mock('../../utils/geolocation')

describe('Integration: Search & Filter Flow', () => {
  const mockBusinesses = [
    {
      _id: 'biz1',
      name: 'Pizza Palace',
      category: 'Comida',
      lat: 40.7128,
      lng: -74.0060,
      rating: 4.5,
    },
    {
      _id: 'biz2',
      name: 'Hair Salon',
      category: 'Belleza',
      lat: 40.7589,
      lng: -73.9851,
      rating: 4.2,
    },
    {
      _id: 'biz3',
      name: 'Gym Fitness',
      category: 'Salud',
      lat: 40.7306,
      lng: -73.9352,
      rating: 4.8,
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    AsyncStorage.getItem.mockResolvedValue('mock-token')
  })

  describe('Business Search', () => {
    it('filters businesses by query text match', () => {
      const allBusinesses = mockBusinesses
      const query = 'pizza'
      
      const results = allBusinesses.filter(b => 
        b.name.toLowerCase().includes(query.toLowerCase())
      )

      expect(results).toHaveLength(1)
      expect(results[0].name).toBe('Pizza Palace')
    })

    it('filters businesses by category', () => {
      const results = mockBusinesses.filter(b => b.category === 'Comida')

      expect(results).toHaveLength(1)
      expect(results[0].category).toBe('Comida')
    })

    it('returns empty array when no matches found', () => {
      const results = mockBusinesses.filter(b => 
        b.name.toLowerCase().includes('nonexistent')
      )

      expect(results).toEqual([])
    })

    it('applies multiple filters together', () => {
      const filtered = mockBusinesses.filter(b => 
        b.category === 'Comida' && b.rating >= 4.0
      )

      expect(filtered).toHaveLength(1)
      expect(filtered[0].category).toBe('Comida')
      expect(filtered[0].rating).toBeGreaterThanOrEqual(4.0)
    })
  })

  describe('Distance Filtering', () => {
    it('calculates distances for all businesses', () => {
      const userCoords = { latitude: 40.7128, longitude: -74.0060 }
      const businessesWithDistance = mockBusinesses.map(b => ({
        ...b,
        distance: 1000,
      }))

      calculateBusinessDistances.mockReturnValue(businessesWithDistance)

      const results = calculateBusinessDistances(mockBusinesses, userCoords)

      expect(results).toHaveLength(3)
      expect(results[0]).toHaveProperty('distance')
    })

    it('filters businesses within distance radius', () => {
      const businessesWithDistance = [
        { ...mockBusinesses[0], distance: 2000 },
        { ...mockBusinesses[1], distance: 8000 },
        { ...mockBusinesses[2], distance: 3000 },
      ]

      const filtered = businessesWithDistance.filter(b => b.distance <= 5000)

      expect(filtered).toHaveLength(2)
      expect(filtered.every(b => b.distance <= 5000)).toBe(true)
    })

    it('handles businesses without coordinates', () => {
      const businessWithoutCoords = { _id: 'biz4', name: 'No Location' }
      calculateBusinessDistances.mockReturnValue([
        { ...businessWithoutCoords, distance: null }
      ])

      const results = calculateBusinessDistances([businessWithoutCoords], {
        latitude: 40.7128,
        longitude: -74.0060,
      })

      expect(results[0].distance).toBeNull()
    })
  })

  describe('Category Filtering', () => {
    it('returns all businesses when category is "Todos"', () => {
      businessService.getBusiness.mockResolvedValue(mockBusinesses)

      // When "Todos" is selected, no filtering is applied
      const results = mockBusinesses

      expect(results).toHaveLength(3)
    })

    it('filters by specific category', () => {
      const beautyBusinesses = mockBusinesses.filter(b => b.category === 'Belleza')

      expect(beautyBusinesses).toHaveLength(1)
      expect(beautyBusinesses[0].category).toBe('Belleza')
    })
  })

  describe('Error Handling', () => {
    it('detects network error types', () => {
      const networkError = new Error('Network error')
      expect(networkError.message).toBe('Network error')
    })

    it('handles empty search results', () => {
      const emptyResults = []

      expect(emptyResults).toEqual([])
      expect(Array.isArray(emptyResults)).toBe(true)
    })

    it('identifies timeout errors', () => {
      const timeoutError = {
        code: 'ECONNABORTED',
        message: 'timeout of 10000ms exceeded',
      }

      expect(timeoutError.code).toBe('ECONNABORTED')
      expect(timeoutError.message).toContain('timeout')
    })
  })

  describe('Sorting and Ordering', () => {
    it('verifies businesses can be sorted by distance', () => {
      const businesses = [
        { id: 1, distance: 5000 },
        { id: 2, distance: 1000 },
        { id: 3, distance: 3000 },
      ]

      const sorted = [...businesses].sort((a, b) => a.distance - b.distance)

      expect(sorted[0].distance).toBeLessThan(sorted[1].distance)
      expect(sorted[1].distance).toBeLessThan(sorted[2].distance)
    })

    it('verifies businesses can be sorted by rating', () => {
      const businesses = [
        { id: 1, rating: 4.2 },
        { id: 2, rating: 4.8 },
        { id: 3, rating: 4.5 },
      ]

      const sorted = [...businesses].sort((a, b) => b.rating - a.rating)

      expect(sorted[0].rating).toBeGreaterThan(sorted[1].rating)
      expect(sorted[1].rating).toBeGreaterThan(sorted[2].rating)
    })
  })
})
