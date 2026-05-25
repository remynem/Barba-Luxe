import '@testing-library/jest-dom'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Auto-cleanup after each test
afterEach(() => {
  cleanup()
})

// ── Global browser API mocks ──────────────────────────────────────────────────

// IntersectionObserver (used by useReveal)
global.IntersectionObserver = vi.fn(() => ({
  observe:    vi.fn(),
  unobserve:  vi.fn(),
  disconnect: vi.fn(),
}))

// scrollTo — not implemented in happy-dom
global.scrollTo = vi.fn()
window.scrollTo = vi.fn()

// matchMedia — not implemented in happy-dom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// navigator.onLine default — tests that need offline state will set it explicitly
Object.defineProperty(navigator, 'onLine', {
  configurable: true,
  get: () => true,
})

// localStorage — happy-dom implements it, but keep it clean between tests
beforeEach(() => {
  localStorage.clear()
})
