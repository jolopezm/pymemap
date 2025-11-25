jest.mock('@react-native-async-storage/async-storage', () => ({
  multiRemove: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
}))

import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  clearAllCache,
  clearAuthCache,
  clearDataCache,
  getCacheInfo,
  getCacheStatus,
} from '../../utils/cache-manager'

global.Blob = class Blob {
  constructor(parts) {
    this.size = parts.reduce((acc, part) => acc + part.length, 0)
  }
}

describe('cache-manager', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('clearAllCache', () => {
    it('removes all cache keys', async () => {
      const mockKeys = ['key1', 'key2']
      AsyncStorage.getAllKeys.mockResolvedValue(mockKeys)
      AsyncStorage.multiRemove.mockResolvedValue(undefined)

      const result = await clearAllCache()

      expect(result).toBe(true)
    })

    it('returns false on error', async () => {
      AsyncStorage.multiRemove.mockRejectedValue(new Error('Storage error'))

      const result = await clearAllCache()

      expect(result).toBe(false)
    })
  })

  describe('clearAuthCache', () => {
    it('removes only auth-related keys', async () => {
      AsyncStorage.multiRemove.mockResolvedValue(undefined)

      const result = await clearAuthCache()

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        '@user_data',
        '@auth_token',
        '@auth_data',
        'user',
        'token',
        'authData',
      ])
      expect(result).toBe(true)
    })

    it('returns false on error', async () => {
      AsyncStorage.multiRemove.mockRejectedValue(new Error('Auth clear error'))

      const result = await clearAuthCache()

      expect(result).toBe(false)
    })
  })

  describe('clearDataCache', () => {
    it('removes only data cache keys', async () => {
      AsyncStorage.multiRemove.mockResolvedValue(undefined)

      const result = await clearDataCache()

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        '@chats_data',
        '@other_users_data',
        '@chats_cache_timestamp',
        '@services_data',
        '@services_cache_timestamp',
        '@notifications_data',
        '@notifications_cache_timestamp',
        'notifications',
      ])
      expect(result).toBe(true)
    })

    it('returns false on error', async () => {
      AsyncStorage.multiRemove.mockRejectedValue(new Error('Data clear error'))

      const result = await clearDataCache()

      expect(result).toBe(false)
    })
  })

  describe('getCacheInfo', () => {
    it('returns cache information', async () => {
      const mockKeys = [
        '@user_data',
        '@chats_data',
        'other_key',
        '@services_data',
      ]

      const mockItems = [
        ['@user_data', JSON.stringify({ name: 'John' })],
        ['@chats_data', JSON.stringify({ chats: [] })],
        ['@services_data', JSON.stringify({ services: [] })],
      ]

      AsyncStorage.getAllKeys.mockResolvedValue(mockKeys)
      AsyncStorage.multiGet.mockResolvedValue(mockItems)

      const result = await getCacheInfo()

      expect(result).toHaveProperty('totalItems')
      expect(result).toHaveProperty('totalSize')
      expect(result).toHaveProperty('totalSizeKB')
      expect(result).toHaveProperty('totalSizeMB')
      expect(result).toHaveProperty('items')
      expect(result.totalItems).toBe(3)
      expect(Array.isArray(result.items)).toBe(true)
    })

    it('calculates sizes correctly', async () => {
      const data = JSON.stringify({ test: 'data' })
      const mockItems = [['@user_data', data]]

      AsyncStorage.getAllKeys.mockResolvedValue(['@user_data'])
      AsyncStorage.multiGet.mockResolvedValue(mockItems)

      const result = await getCacheInfo()

      expect(result.items[0]).toHaveProperty('key', '@user_data')
      expect(result.items[0]).toHaveProperty('size')
      expect(result.items[0]).toHaveProperty('sizeKB')
    })

    it('handles empty cache', async () => {
      AsyncStorage.getAllKeys.mockResolvedValue(['other_key'])
      AsyncStorage.multiGet.mockResolvedValue([])

      const result = await getCacheInfo()

      expect(result.totalItems).toBe(0)
      expect(result.items).toEqual([])
    })

    it('returns null on error', async () => {
      AsyncStorage.getAllKeys.mockRejectedValue(new Error('Keys error'))

      const result = await getCacheInfo()

      expect(result).toBeNull()
    })
  })

  describe('getCacheStatus', () => {
    it('returns cache status when data exists', async () => {
      const mockTimestamp = Date.now() - 5 * 60 * 1000 // 5 minutes ago
      const mockData = JSON.stringify({ test: 'data' })

      AsyncStorage.multiGet.mockResolvedValue([
        ['@data_key', mockData],
        ['@timestamp_key', mockTimestamp.toString()],
      ])

      const result = await getCacheStatus('@data_key', '@timestamp_key')

      expect(result.exists).toBe(true)
      expect(result).toHaveProperty('cacheAge')
      expect(result).toHaveProperty('cacheAgeMinutes')
      expect(result).toHaveProperty('lastUpdate')
      expect(result.cacheAgeMinutes).toBe(5)
    })

    it('returns exists false when data does not exist', async () => {
      AsyncStorage.multiGet.mockResolvedValue([
        ['@data_key', null],
        ['@timestamp_key', null],
      ])

      const result = await getCacheStatus('@data_key', '@timestamp_key')

      expect(result.exists).toBe(false)
    })

    it('returns exists false when only timestamp missing', async () => {
      AsyncStorage.multiGet.mockResolvedValue([
        ['@data_key', 'some data'],
        ['@timestamp_key', null],
      ])

      const result = await getCacheStatus('@data_key', '@timestamp_key')

      expect(result.exists).toBe(false)
    })

    it('returns exists false when only data missing', async () => {
      AsyncStorage.multiGet.mockResolvedValue([
        ['@data_key', null],
        ['@timestamp_key', Date.now().toString()],
      ])

      const result = await getCacheStatus('@data_key', '@timestamp_key')

      expect(result.exists).toBe(false)
    })

    it('handles error', async () => {
      AsyncStorage.multiGet.mockRejectedValue(new Error('Status error'))

      const result = await getCacheStatus('@data_key', '@timestamp_key')

      expect(result.exists).toBe(false)
      expect(result.error).toBe('Status error')
    })

    it('formats lastUpdate as ISO string', async () => {
      const mockTimestamp = 1700000000000
      const expectedISO = new Date(mockTimestamp).toISOString()

      AsyncStorage.multiGet.mockResolvedValue([
        ['@data_key', 'data'],
        ['@timestamp_key', mockTimestamp.toString()],
      ])

      const result = await getCacheStatus('@data_key', '@timestamp_key')

      expect(result.lastUpdate).toBe(expectedISO)
    })
  })
})
