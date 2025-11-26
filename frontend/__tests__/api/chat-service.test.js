import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as chatService from '../../api/chat-service'
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
  warn: jest.fn(),
}))

describe('chat-service', () => {
  const mockToken = 'mock-token-123'

  beforeEach(() => {
    jest.clearAllMocks()
    AsyncStorage.getItem.mockResolvedValue(mockToken)
  })

  describe('createChat', () => {
    it('creates a new chat', async () => {
      const chatData = {
        participants: ['user1', 'user2'],
      }
      const mockResponse = {
        _id: 'chat123',
        ...chatData,
      }

      axios.post.mockResolvedValue({ data: mockResponse })

      const result = await chatService.createChat(chatData)

      expect(axios.post).toHaveBeenCalledWith(
        `${API_URL}/chat/`,
        chatData,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('throws error on failure', async () => {
      axios.post.mockRejectedValue({
        message: 'Network error',
        response: { status: 500, data: { detail: 'Server error' } },
      })

      await expect(
        chatService.createChat({ participants: [] })
      ).rejects.toMatchObject({
        message: 'Network error',
      })
    })
  })

  describe('getChats', () => {
    it('fetches chats for a user', async () => {
      const mockChats = [
        { _id: 'chat1', participants: ['user1', 'user2'] },
        { _id: 'chat2', participants: ['user1', 'user3'] },
      ]

      axios.get.mockResolvedValue({ data: mockChats })

      const result = await chatService.getChats('user1')

      expect(axios.get).toHaveBeenCalledWith(
        `${API_URL}/chat/?user_id=user1`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      )
      expect(result).toEqual(mockChats)
    })

    it('throws error when userId is missing', async () => {
      await expect(chatService.getChats()).rejects.toThrow(
        'userId is required to get chats'
      )
    })

    it('encodes special characters in userId', async () => {
      axios.get.mockResolvedValue({ data: [] })

      await chatService.getChats('user@example.com')

      expect(axios.get).toHaveBeenCalledWith(
        `${API_URL}/chat/?user_id=user%40example.com`,
        expect.any(Object)
      )
    })
  })

  describe('getChatByParticipants', () => {
    it('fetches chat by two participant IDs', async () => {
      const mockChat = {
        _id: 'chat123',
        participants: ['user1', 'user2'],
      }

      axios.get.mockResolvedValue({ data: mockChat })

      const result = await chatService.getChatByParticipants('user1', 'user2')

      expect(axios.get).toHaveBeenCalledWith(
        `${API_URL}/chat/participants?user1_id=user1&user2_id=user2`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      )
      expect(result).toEqual(mockChat)
    })

    it('returns null on 404', async () => {
      axios.get.mockRejectedValue({
        response: { status: 404 },
      })

      const result = await chatService.getChatByParticipants('user1', 'user2')

      expect(result).toBeNull()
    })

    it('throws error when user1Id is missing', async () => {
      await expect(
        chatService.getChatByParticipants(null, 'user2')
      ).rejects.toThrow('Both user IDs are required to get chat')
    })

    it('throws error when user2Id is missing', async () => {
      await expect(
        chatService.getChatByParticipants('user1', null)
      ).rejects.toThrow('Both user IDs are required to get chat')
    })
  })

  describe('sendMessage', () => {
    it('sends a message', async () => {
      const messageData = {
        chatId: 'chat123',
        senderId: 'user1',
        content: 'Hello!',
      }
      const mockResponse = {
        _id: 'msg123',
        ...messageData,
        timestamp: '2025-11-22T10:00:00Z',
      }

      axios.post.mockResolvedValue({ data: mockResponse })

      const result = await chatService.sendMessage(messageData)

      expect(axios.post).toHaveBeenCalledWith(
        `${API_URL}/chat/message`,
        messageData,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('throws error on failure', async () => {
      axios.post.mockRejectedValue({
        message: 'Bad request',
        response: { status: 400, data: { detail: 'Invalid message' } },
      })

      await expect(
        chatService.sendMessage({ chatId: 'chat123' })
      ).rejects.toMatchObject({
        message: 'Bad request',
      })
    })
  })

  describe('getMessages', () => {
    it('fetches messages for a chat', async () => {
      const mockMessages = [
        { _id: 'msg1', content: 'Hello', senderId: 'user1' },
        { _id: 'msg2', content: 'Hi!', senderId: 'user2' },
      ]

      axios.get.mockResolvedValue({ data: mockMessages })

      const result = await chatService.getMessages('chat123')

      expect(axios.get).toHaveBeenCalledWith(
        `${API_URL}/chat/messages?chat_id=chat123`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      )
      expect(result).toEqual(mockMessages)
    })

    it('throws error when chatId is missing', async () => {
      await expect(chatService.getMessages()).rejects.toThrow(
        'chatId is required to get messages'
      )
    })

    it('encodes special characters in chatId', async () => {
      axios.get.mockResolvedValue({ data: [] })

      await chatService.getMessages('chat/123')

      expect(axios.get).toHaveBeenCalledWith(
        `${API_URL}/chat/messages?chat_id=chat%2F123`,
        expect.any(Object)
      )
    })
  })

  describe('markChatAsRead', () => {
    it('marks a chat as read', async () => {
      const mockResponse = { success: true }

      axios.put.mockResolvedValue({ data: mockResponse })

      const result = await chatService.markChatAsRead('chat123', 'user1')

      expect(axios.put).toHaveBeenCalledWith(
        `${API_URL}/chat/chat/chat123/mark-as-read?user_id=user1`,
        {},
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
          timeout: 5000,
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('throws error when chatId is missing', async () => {
      await expect(
        chatService.markChatAsRead(null, 'user1')
      ).rejects.toThrow('chatId is required to mark chat as read')
    })

    it('throws error when userId is missing', async () => {
      await expect(
        chatService.markChatAsRead('chat123', null)
      ).rejects.toThrow('userId is required to mark chat as read')
    })

    it('throws error when chatId is empty string', async () => {
      await expect(
        chatService.markChatAsRead('  ', 'user1')
      ).rejects.toThrow('Invalid chatId: empty string')
    })

    it('throws error when userId is empty string', async () => {
      await expect(
        chatService.markChatAsRead('chat123', '  ')
      ).rejects.toThrow('Invalid userId: empty string')
    })

    it('returns null on 404 error', async () => {
      axios.put.mockRejectedValue({
        message: 'Not found',
        response: { status: 404, statusText: 'Not Found', data: {} },
        config: { url: 'test-url' },
      })

      const result = await chatService.markChatAsRead('chat123', 'user1')

      expect(result).toBeNull()
    })

    it('returns null on 500 error', async () => {
      axios.put.mockRejectedValue({
        message: 'Server error',
        response: { status: 500, statusText: 'Internal Server Error', data: {} },
        config: { url: 'test-url' },
      })

      const result = await chatService.markChatAsRead('chat123', 'user1')

      expect(result).toBeNull()
    })

    it('throws error on 400 with details', async () => {
      axios.put.mockRejectedValue({
        message: 'Bad request',
        response: {
          status: 400,
          statusText: 'Bad Request',
          data: { detail: 'Invalid request' },
        },
        config: { url: 'test-url' },
      })

      await expect(
        chatService.markChatAsRead('chat123', 'user1')
      ).rejects.toMatchObject({
        message: 'Bad request',
      })
    })
  })
})
