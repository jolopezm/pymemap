import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as reviewService from '../../api/review-service'
import { API_URL } from '../../config/api'

jest.mock('axios')
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}))
jest.mock('../../config/api', () => ({
  API_URL: 'https://pymemap-production-306f.up.railway.app',
}))

describe('review-service', () => {
  const mockToken = 'mock-token-123'

  beforeEach(() => {
    jest.clearAllMocks()
    AsyncStorage.getItem.mockResolvedValue(mockToken)
  })

  describe('createReview', () => {
    it('creates a new review', async () => {
      const reviewData = {
        businessId: 'biz123',
        userId: 'user123',
        rating: 5,
        comment: 'Great service!',
      }
      const mockResponse = {
        _id: 'review123',
        ...reviewData,
        createdAt: '2025-11-22T10:00:00Z',
      }

      axios.post.mockResolvedValue({ data: mockResponse })

      const result = await reviewService.createReview(reviewData)

      expect(axios.post).toHaveBeenCalledWith(
        `${API_URL}/reviews/`,
        reviewData,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('works without token', async () => {
      AsyncStorage.getItem.mockResolvedValue(null)

      const reviewData = { businessId: 'biz123', rating: 4 }
      axios.post.mockResolvedValue({ data: { _id: 'review123' } })

      await reviewService.createReview(reviewData)

      expect(axios.post).toHaveBeenCalledWith(
        `${API_URL}/reviews/`,
        reviewData,
        expect.objectContaining({
          headers: {},
        })
      )
    })

    it('throws error on validation failure', async () => {
      axios.post.mockRejectedValue({
        response: {
          status: 400,
          data: { message: 'Rating is required' },
        },
      })

      await expect(
        reviewService.createReview({ businessId: 'biz123' })
      ).rejects.toMatchObject({
        response: { status: 400 },
      })
    })
  })

  describe('getReviewsByBusiness', () => {
    it('fetches reviews for a business', async () => {
      const mockReviews = [
        {
          _id: 'review1',
          businessId: 'biz123',
          rating: 5,
          comment: 'Excellent!',
        },
        {
          _id: 'review2',
          businessId: 'biz123',
          rating: 4,
          comment: 'Very good',
        },
      ]

      axios.get.mockResolvedValue({ data: mockReviews })

      const result = await reviewService.getReviewsByBusiness('biz123')

      expect(axios.get).toHaveBeenCalledWith(
        `${API_URL}/reviews/business/biz123`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      )
      expect(result).toEqual(mockReviews)
    })

    it('encodes special characters in businessId', async () => {
      axios.get.mockResolvedValue({ data: [] })

      await reviewService.getReviewsByBusiness('biz/123')

      expect(axios.get).toHaveBeenCalledWith(
        `${API_URL}/reviews/business/biz%2F123`,
        expect.any(Object)
      )
    })

    it('works without token', async () => {
      AsyncStorage.getItem.mockResolvedValue(null)

      axios.get.mockResolvedValue({ data: [] })

      await reviewService.getReviewsByBusiness('biz123')

      expect(axios.get).toHaveBeenCalledWith(
        `${API_URL}/reviews/business/biz123`,
        expect.objectContaining({
          headers: {},
        })
      )
    })

    it('throws error on failure', async () => {
      axios.get.mockRejectedValue({
        response: {
          status: 404,
          data: { message: 'Business not found' },
        },
      })

      await expect(
        reviewService.getReviewsByBusiness('nonexistent')
      ).rejects.toMatchObject({
        response: { status: 404 },
      })
    })
  })
})
