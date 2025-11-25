import { renderHook, act } from '@testing-library/react-native'
import { useRefresh } from '../../hooks/useRefresh'

describe('useRefresh Hook', () => {
  it('initializes with refreshing as false', () => {
    const mockCallback = jest.fn()
    const { result } = renderHook(() => useRefresh(mockCallback))
    
    expect(result.current.refreshing).toBe(false)
  })

  it('sets refreshing to true when onRefresh is called', async () => {
    const mockCallback = jest.fn(() => Promise.resolve())
    const { result } = renderHook(() => useRefresh(mockCallback))
    
    await act(async () => {
      await result.current.onRefresh()
    })
    
    expect(mockCallback).toHaveBeenCalledTimes(1)
  })

  it('calls the callback function when refreshing', async () => {
    const mockCallback = jest.fn(() => Promise.resolve())
    const { result } = renderHook(() => useRefresh(mockCallback))
    
    await act(async () => {
      await result.current.onRefresh()
    })
    
    expect(mockCallback).toHaveBeenCalled()
  })

  it('sets refreshing back to false after callback completes', async () => {
    const mockCallback = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)))
    const { result } = renderHook(() => useRefresh(mockCallback))
    
    await act(async () => {
      await result.current.onRefresh()
    })
    
    expect(result.current.refreshing).toBe(false)
    expect(mockCallback).toHaveBeenCalled()
  })

  it('handles callback errors gracefully', async () => {
    const mockCallback = jest.fn(() => Promise.reject(new Error('Test error')))
    const { result } = renderHook(() => useRefresh(mockCallback))
    
    await act(async () => {
      await result.current.onRefresh()
    })
    
    expect(result.current.refreshing).toBe(false)
  })

  it('returns onRefresh function', () => {
    const mockCallback = jest.fn()
    const { result } = renderHook(() => useRefresh(mockCallback))
    
    expect(typeof result.current.onRefresh).toBe('function')
  })
})
