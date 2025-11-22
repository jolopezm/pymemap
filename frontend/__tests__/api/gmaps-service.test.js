import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as gmapsService from '../../api/gmaps-service'
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
}))

describe('gmaps-service', () => {
  const mockToken = 'mock-token-123'

  beforeEach(() => {
    jest.clearAllMocks()
    AsyncStorage.getItem.mockResolvedValue(mockToken)
  })

  describe('fetchAddressSuggestions', () => {
    it('fetches address suggestions with default country', async () => {
      const mockSuggestions = [
        {
          description: '123 Main St, New York, NY',
          place_id: 'place123',
        },
        {
          description: '456 Broadway, New York, NY',
          place_id: 'place456',
        },
      ]

      axios.get.mockResolvedValue({ data: mockSuggestions })

      const result = await gmapsService.fetchAddressSuggestions('123 Main')

      expect(axios.get).toHaveBeenCalledWith(
        `${API_URL}/autocomplete/123%20Main`,
        expect.objectContaining({
          params: { country: 'us' },
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      )
      expect(result).toEqual(mockSuggestions)
    })

    it('fetches address suggestions with custom country', async () => {
      const mockSuggestions = [
        {
          description: 'Av. Libertador, Santiago, Chile',
          place_id: 'place789',
        },
      ]

      axios.get.mockResolvedValue({ data: mockSuggestions })

      const result = await gmapsService.fetchAddressSuggestions(
        'Libertador',
        'cl'
      )

      expect(axios.get).toHaveBeenCalledWith(
        `${API_URL}/autocomplete/Libertador`,
        expect.objectContaining({
          params: { country: 'cl' },
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      )
      expect(result).toEqual(mockSuggestions)
    })

    it('encodes special characters in input', async () => {
      axios.get.mockResolvedValue({ data: [] })

      await gmapsService.fetchAddressSuggestions('123 Main St, #5')

      expect(axios.get).toHaveBeenCalledWith(
        `${API_URL}/autocomplete/123%20Main%20St%2C%20%235`,
        expect.any(Object)
      )
    })

    it('works without token', async () => {
      AsyncStorage.getItem.mockResolvedValue(null)

      axios.get.mockResolvedValue({ data: [] })

      await gmapsService.fetchAddressSuggestions('test address')

      expect(axios.get).toHaveBeenCalledWith(
        `${API_URL}/autocomplete/test%20address`,
        expect.objectContaining({
          headers: {},
        })
      )
    })

    it('throws error on failure', async () => {
      axios.get.mockRejectedValue({
        message: 'API error',
        response: {
          status: 400,
          data: { message: 'Invalid input' },
        },
      })

      await expect(
        gmapsService.fetchAddressSuggestions('invalid')
      ).rejects.toMatchObject({
        message: 'API error',
      })
    })

    it('throws error on network failure', async () => {
      axios.get.mockRejectedValue(new Error('Network error'))

      await expect(
        gmapsService.fetchAddressSuggestions('test')
      ).rejects.toThrow('Network error')
    })

    it('handles empty input string', async () => {
      axios.get.mockResolvedValue({ data: [] })

      const result = await gmapsService.fetchAddressSuggestions('')

      expect(axios.get).toHaveBeenCalledWith(
        `${API_URL}/autocomplete/`,
        expect.any(Object)
      )
      expect(result).toEqual([])
    })

    it('handles unicode characters in input', async () => {
      axios.get.mockResolvedValue({ data: [] })

      await gmapsService.fetchAddressSuggestions('Calle José Martí')

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/autocomplete/'),
        expect.any(Object)
      )
    })
  })
})
