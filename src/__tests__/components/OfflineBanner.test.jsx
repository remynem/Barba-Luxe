import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import OfflineBanner from '../../components/OfflineBanner.jsx'

function setOnline(value) {
  Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => value })
}

describe('OfflineBanner', () => {
  afterEach(() => {
    setOnline(true)
  })

  it('renders nothing when the browser is online', () => {
    setOnline(true)
    const { container } = render(<OfflineBanner lang="fr" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the banner when the browser is offline', () => {
    setOnline(false)
    render(<OfflineBanner lang="fr" />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('shows French text by default', () => {
    setOnline(false)
    render(<OfflineBanner lang="fr" />)
    expect(screen.getByText(/connexion internet/i)).toBeInTheDocument()
  })

  it('shows English text when lang="en"', () => {
    setOnline(false)
    render(<OfflineBanner lang="en" />)
    expect(screen.getByText(/no internet connection/i)).toBeInTheDocument()
  })

  it('has aria-live="assertive" for immediate screen reader announcement', () => {
    setOnline(false)
    render(<OfflineBanner />)
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive')
  })
})
