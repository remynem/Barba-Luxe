import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useOnline } from '../../hooks/useOnline.js'

describe('useOnline', () => {
  beforeEach(() => {
    // Default: online
    Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => true })
  })

  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => true })
  })

  it('returns true when navigator.onLine is true', () => {
    const { result } = renderHook(() => useOnline())
    expect(result.current).toBe(true)
  })

  it('returns false when navigator.onLine is false', () => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => false })
    const { result } = renderHook(() => useOnline())
    expect(result.current).toBe(false)
  })

  it('switches to false when the browser fires an offline event', () => {
    const { result } = renderHook(() => useOnline())
    expect(result.current).toBe(true)

    act(() => {
      window.dispatchEvent(new Event('offline'))
    })

    expect(result.current).toBe(false)
  })

  it('switches back to true when the browser fires an online event', () => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => false })
    const { result } = renderHook(() => useOnline())
    expect(result.current).toBe(false)

    act(() => {
      window.dispatchEvent(new Event('online'))
    })

    expect(result.current).toBe(true)
  })

  it('removes event listeners on unmount (no memory leaks)', () => {
    const addSpy    = vi.spyOn(window, 'addEventListener')
    const removeSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() => useOnline())

    const onlineListeners  = addSpy.mock.calls.filter(([e]) => e === 'online')
    const offlineListeners = addSpy.mock.calls.filter(([e]) => e === 'offline')
    expect(onlineListeners.length).toBeGreaterThanOrEqual(1)
    expect(offlineListeners.length).toBeGreaterThanOrEqual(1)

    unmount()

    const removedOnline  = removeSpy.mock.calls.filter(([e]) => e === 'online')
    const removedOffline = removeSpy.mock.calls.filter(([e]) => e === 'offline')
    expect(removedOnline.length).toBeGreaterThanOrEqual(1)
    expect(removedOffline.length).toBeGreaterThanOrEqual(1)

    addSpy.mockRestore()
    removeSpy.mockRestore()
  })
})
