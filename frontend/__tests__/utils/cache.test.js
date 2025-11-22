jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  getAllKeys: jest.fn(),
  multiRemove: jest.fn(),
}))

import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  setCache,
  getCache,
  invalidateCache,
  clearAllCache,
  getCachedOrFetch,
  TTL,
} from '../../utils/cache'

describe('cache utils', () => {
  let mockDate

  beforeEach(() => {
    jest.clearAllMocks()
    mockDate = 1700000000000
    Date.now = jest.fn(() => mockDate)
    console.log = jest.fn()
    console.error = jest.fn()
  })

  describe('setCache', () => {
    it('saves data with timestamp and ttl', async () => {
      const key = 'test_key'
      const data = { name: 'John', age: 30 }

      await setCache(key, data)

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@pymemap_cache:test_key',
        JSON.stringify({
          data,
          timestamp: mockDate,
          ttl: 5 * 60 * 1000,
        })
      )
    })

    it('saves data with custom ttl', async () => {
      const key = 'test_key'
      const data = { value: 42 }
      const customTTL = 10 * 60 * 1000

      await setCache(key, data, customTTL)

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@pymemap_cache:test_key',
        JSON.stringify({
          data,
          timestamp: mockDate,
          ttl: customTTL,
        })
      )
    })

    it('handles save error', async () => {
      AsyncStorage.setItem.mockRejectedValue(new Error('Storage error'))

      await setCache('test', { data: 'test' })

      expect(console.error).toHaveBeenCalled()
    })
  })

  describe('getCache', () => {
    it('returns cached data if not expired', async () => {
      const data = { name: 'John' }
      const cacheData = {
        data,
        timestamp: mockDate - 2 * 60 * 1000, // 2 minutes ago
        ttl: 5 * 60 * 1000,
      }

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(cacheData))

      const result = await getCache('test_key')

      expect(result).toEqual(data)
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(
        '@pymemap_cache:test_key'
      )
    })

    it('returns null if cache is expired', async () => {
      const data = { name: 'John' }
      const cacheData = {
        data,
        timestamp: mockDate - 10 * 60 * 1000, // 10 minutes ago
        ttl: 5 * 60 * 1000, // 5 minutes TTL
      }

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(cacheData))

      const result = await getCache('test_key')

      expect(result).toBeNull()
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        '@pymemap_cache:test_key'
      )
    })

    it('returns null if cache does not exist', async () => {
      AsyncStorage.getItem.mockResolvedValue(null)

      const result = await getCache('nonexistent')

      expect(result).toBeNull()
    })

    it('returns null on parse error', async () => {
      AsyncStorage.getItem.mockResolvedValue('invalid json')

      const result = await getCache('test_key')

      expect(result).toBeNull()
      expect(console.error).toHaveBeenCalled()
    })

    it('handles storage error', async () => {
      AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'))

      const result = await getCache('test_key')

      expect(result).toBeNull()
    })
  })

  describe('invalidateCache', () => {
    it('removes cache item', async () => {
      await invalidateCache('test_key')

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        '@pymemap_cache:test_key'
      )
    })

    it('handles removal error', async () => {
      AsyncStorage.removeItem.mockRejectedValue(new Error('Remove error'))

      await invalidateCache('test_key')

      expect(console.error).toHaveBeenCalled()
    })
  })

  describe('clearAllCache', () => {
    it('removes all cache items', async () => {
      const mockKeys = [
        '@pymemap_cache:key1',
        '@pymemap_cache:key2',
        '@other_key',
        '@pymemap_cache:key3',
      ]

      AsyncStorage.getAllKeys.mockResolvedValue(mockKeys)

      await clearAllCache()

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        '@pymemap_cache:key1',
        '@pymemap_cache:key2',
        '@pymemap_cache:key3',
      ])
    })

    it('handles no cache items', async () => {
      AsyncStorage.getAllKeys.mockResolvedValue(['@other_key1', '@other_key2'])

      await clearAllCache()

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([])
    })

    it('handles error', async () => {
      AsyncStorage.getAllKeys.mockRejectedValue(new Error('Keys error'))

      await clearAllCache()

      expect(console.error).toHaveBeenCalled()
    })
  })

  describe('getCachedOrFetch', () => {
    it('returns cached data if available', async () => {
      const cachedData = { name: 'Cached' }
      const cacheData = {
        data: cachedData,
        timestamp: mockDate - 1 * 60 * 1000,
        ttl: 5 * 60 * 1000,
      }

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(cacheData))
      const fetchFunction = jest.fn()

      const result = await getCachedOrFetch('test_key', fetchFunction)

      expect(result).toEqual(cachedData)
      expect(fetchFunction).not.toHaveBeenCalled()
    })

    it('fetches data if cache is empty', async () => {
      const freshData = { name: 'Fresh' }

      AsyncStorage.getItem.mockResolvedValue(null)
      const fetchFunction = jest.fn().mockResolvedValue(freshData)

      const result = await getCachedOrFetch('test_key', fetchFunction)

      expect(result).toEqual(freshData)
      expect(fetchFunction).toHaveBeenCalled()
      expect(AsyncStorage.setItem).toHaveBeenCalled()
    })

    it('fetches data if cache is expired', async () => {
      const expiredCache = {
        data: { old: 'data' },
        timestamp: mockDate - 10 * 60 * 1000,
        ttl: 5 * 60 * 1000,
      }
      const freshData = { name: 'Fresh' }

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(expiredCache))
      AsyncStorage.removeItem.mockResolvedValue(undefined)
      const fetchFunction = jest.fn().mockResolvedValue(freshData)

      const result = await getCachedOrFetch('test_key', fetchFunction)

      expect(result).toEqual(freshData)
      expect(fetchFunction).toHaveBeenCalled()
    })

    it('uses custom ttl', async () => {
      const freshData = { name: 'Fresh' }
      const customTTL = TTL.LONG

      AsyncStorage.getItem.mockResolvedValue(null)
      const fetchFunction = jest.fn().mockResolvedValue(freshData)

      await getCachedOrFetch('test_key', fetchFunction, customTTL)

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@pymemap_cache:test_key',
        JSON.stringify({
          data: freshData,
          timestamp: mockDate,
          ttl: customTTL,
        })
      )
    })
  })

  describe('TTL constants', () => {
    it('has correct values', () => {
      expect(TTL.SHORT).toBe(1 * 60 * 1000)
      expect(TTL.MEDIUM).toBe(5 * 60 * 1000)
      expect(TTL.LONG).toBe(15 * 60 * 1000)
      expect(TTL.HOUR).toBe(60 * 60 * 1000)
      expect(TTL.DAY).toBe(24 * 60 * 60 * 1000)
    })
  })
})
