import { calculateDistance, calculateBusinessDistances } from '../../utils/geolocation'

describe('Geolocation Utils', () => {
  describe('calculateDistance', () => {
    it('calculates distance between two coordinates', () => {
      const distance = calculateDistance(40.7128, -74.0060, 34.0522, -118.2437)
      expect(distance).toBeGreaterThan(0)
      expect(distance).toBeLessThan(6000) // Should be around 3935-5500 km depending on calculation
    })

    it('returns 0 for same coordinates', () => {
      const distance = calculateDistance(40.7128, -74.0060, 40.7128, -74.0060)
      expect(distance).toBe(0)
    })

    it('handles negative coordinates', () => {
      const distance = calculateDistance(-33.8688, 151.2093, -34.6037, -58.3816)
      expect(distance).toBeGreaterThan(0)
    })

    it('calculates consistent distance for same coordinates', () => {
      const distance1 = calculateDistance(40.7128, -74.0060, 40.7589, -73.9851)
      const distance2 = calculateDistance(40.7128, -74.0060, 40.7589, -73.9851)
      
      expect(distance1).toBe(distance2)
    })

    it('returns small distance for nearby coordinates', () => {
      const distance = calculateDistance(40.7128, -74.0060, 40.7138, -74.0070)
      expect(distance).toBeLessThan(1) // Less than 1 km
    })
  })

  describe('calculateBusinessDistances', () => {
    const mockBusinesses = [
      { id: '1', name: 'Business 1', latitude: 40.7128, longitude: -74.0060 },
      { id: '2', name: 'Business 2', latitude: 40.7589, longitude: -73.9851 },
      { id: '3', name: 'Business 3', latitude: 40.7489, longitude: -73.9680 },
    ]

    const userCoords = { latitude: 40.7128, longitude: -74.0060 }

    it('adds distance to each business', () => {
      const result = calculateBusinessDistances(mockBusinesses, userCoords)
      
      expect(result).toHaveLength(3)
      result.forEach(business => {
        expect(business).toHaveProperty('distance')
        expect(typeof business.distance).toBe('number')
      })
    })

    it('returns original businesses array if userCoords is null', () => {
      const result = calculateBusinessDistances(mockBusinesses, null)
      expect(result).toEqual(mockBusinesses)
    })

    it('returns empty array if businesses is empty', () => {
      const result = calculateBusinessDistances([], userCoords)
      expect(result).toEqual([])
    })

    it('preserves all business properties', () => {
      const result = calculateBusinessDistances(mockBusinesses, userCoords)
      
      // Check that all businesses are present (order might change)
      const resultIds = result.map(b => b.id).sort()
      const originalIds = mockBusinesses.map(b => b.id).sort()
      expect(resultIds).toEqual(originalIds)
      
      // Check all businesses have their original properties
      result.forEach(business => {
        const original = mockBusinesses.find(b => b.id === business.id)
        expect(business.name).toBe(original.name)
        expect(business).toHaveProperty('distance')
      })
    })

    it('calculates correct distance for first business (same location)', () => {
      const result = calculateBusinessDistances(mockBusinesses, userCoords)
      expect(result[0].distance).toBe(0)
    })

    it('calculates different distances for different businesses', () => {
      const result = calculateBusinessDistances(mockBusinesses, userCoords)
      const distances = result.map(b => b.distance)
      const uniqueDistances = new Set(distances)
      
      expect(uniqueDistances.size).toBeGreaterThan(1)
    })
  })
})
