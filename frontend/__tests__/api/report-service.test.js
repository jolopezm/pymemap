import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as reportService from '../../api/report-service'
import { API_URL } from '../../config/api'

jest.mock('axios')
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}))
jest.mock('../../config/api', () => ({
  API_URL: 'https://pymemap-production-306f.up.railway.app',
}))

describe('report-service', () => {
  const mockToken = 'mock-token-123'

  beforeEach(() => {
    jest.clearAllMocks()
    AsyncStorage.getItem.mockResolvedValue(mockToken)
  })

  describe('createReport', () => {
    it('creates a new report', async () => {
      const reportData = {
        type: 'inappropriate_content',
        targetId: 'biz123',
        targetType: 'business',
        reason: 'Offensive content',
        reporterId: 'user123',
      }
      const mockResponse = {
        _id: 'report123',
        ...reportData,
        status: 'pending',
        createdAt: '2025-11-22T10:00:00Z',
      }

      axios.post.mockResolvedValue({ data: mockResponse })

      const result = await reportService.createReport(reportData)

      expect(axios.post).toHaveBeenCalledWith(
        `${API_URL}/reports/`,
        reportData,
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

      const reportData = {
        type: 'spam',
        targetId: 'review123',
      }
      axios.post.mockResolvedValue({ data: { _id: 'report123' } })

      await reportService.createReport(reportData)

      expect(axios.post).toHaveBeenCalledWith(
        `${API_URL}/reports/`,
        reportData,
        expect.objectContaining({
          headers: {},
        })
      )
    })

    it('throws error on validation failure', async () => {
      axios.post.mockRejectedValue({
        response: {
          status: 400,
          data: { message: 'Report type is required' },
        },
      })

      await expect(
        reportService.createReport({ targetId: 'biz123' })
      ).rejects.toMatchObject({
        response: { status: 400 },
      })
    })

    it('throws error on server error', async () => {
      axios.post.mockRejectedValue({
        response: {
          status: 500,
          data: { message: 'Internal server error' },
        },
      })

      await expect(
        reportService.createReport({ type: 'spam' })
      ).rejects.toMatchObject({
        response: { status: 500 },
      })
    })
  })

  describe('getReports', () => {
    it('fetches all reports', async () => {
      const mockReports = [
        {
          _id: 'report1',
          type: 'spam',
          targetId: 'biz123',
          status: 'pending',
        },
        {
          _id: 'report2',
          type: 'inappropriate_content',
          targetId: 'review456',
          status: 'resolved',
        },
      ]

      axios.get.mockResolvedValue({ data: mockReports })

      const result = await reportService.getReports()

      expect(axios.get).toHaveBeenCalledWith(
        `${API_URL}/reports/`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      )
      expect(result).toEqual(mockReports)
    })

    it('works without token', async () => {
      AsyncStorage.getItem.mockResolvedValue(null)

      axios.get.mockResolvedValue({ data: [] })

      await reportService.getReports()

      expect(axios.get).toHaveBeenCalledWith(
        `${API_URL}/reports/`,
        expect.objectContaining({
          headers: {},
        })
      )
    })

    it('throws error on failure', async () => {
      axios.get.mockRejectedValue({
        response: {
          status: 403,
          data: { message: 'Forbidden' },
        },
      })

      await expect(reportService.getReports()).rejects.toMatchObject({
        response: { status: 403 },
      })
    })

    it('returns empty array when server returns empty', async () => {
      axios.get.mockResolvedValue({ data: [] })

      const result = await reportService.getReports()

      expect(result).toEqual([])
    })
  })
})
