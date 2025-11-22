import logger from '../../utils/logger'

// Mock console methods
const originalConsole = { ...console }

describe('Logger Utility', () => {
  beforeEach(() => {
    console.log = jest.fn()
    console.warn = jest.fn()
    console.error = jest.fn()
  })

  afterEach(() => {
    console.log = originalConsole.log
    console.warn = originalConsole.warn
    console.error = originalConsole.error
  })

  describe('log method', () => {
    it('logs messages to console', () => {
      logger.log('Test message')
      expect(console.log).toHaveBeenCalled()
    })

    it('logs multiple arguments', () => {
      logger.log('Message', { data: 'test' }, 123)
      expect(console.log).toHaveBeenCalled()
    })

    it('handles undefined and null', () => {
      logger.log(undefined)
      logger.log(null)
      expect(console.log).toHaveBeenCalledTimes(2)
    })
  })

  describe('warn method', () => {
    it('logs warnings to console', () => {
      logger.warn('Warning message')
      expect(console.warn).toHaveBeenCalled()
    })

    it('logs warning objects', () => {
      logger.warn({ type: 'warning', message: 'test' })
      expect(console.warn).toHaveBeenCalled()
    })
  })

  describe('error method', () => {
    it('logs errors to console', () => {
      logger.error('Error message')
      expect(console.error).toHaveBeenCalled()
    })

    it('logs error objects', () => {
      const error = new Error('Test error')
      logger.error(error)
      expect(console.error).toHaveBeenCalled()
    })

    it('logs error with additional context', () => {
      logger.error('Error:', { code: 500, message: 'Server error' })
      expect(console.error).toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('handles empty strings', () => {
      logger.log('')
      expect(console.log).toHaveBeenCalled()
    })

    it('handles complex objects', () => {
      const complexObj = {
        nested: {
          deep: {
            value: 'test'
          }
        },
        array: [1, 2, 3]
      }
      logger.log(complexObj)
      expect(console.log).toHaveBeenCalled()
    })

    it('handles circular references gracefully', () => {
      const circular = { name: 'test' }
      circular.self = circular
      
      expect(() => logger.log(circular)).not.toThrow()
    })
  })
})
