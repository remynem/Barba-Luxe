import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import Analytics, { trackPageView } from '../../components/Analytics.jsx'

beforeEach(() => {
  localStorage.clear()
  // Clean up injected scripts
  document.querySelectorAll('#bl-analytics-plausible, #bl-analytics-ga4').forEach(el => el.remove())
  delete window.plausible
  delete window.gtag
  delete window.dataLayer
})

describe('Analytics', () => {
  it('renders nothing (null)', () => {
    const { container } = render(<Analytics tenant={{}} />)
    expect(container.firstChild).toBeNull()
  })

  it('does not load scripts when consent is not accepted', () => {
    localStorage.setItem('bl_cookie_consent', 'rejected')
    render(<Analytics tenant={{ analytics: { provider: 'plausible', plausibleDomain: 'test.be' } }} />)
    expect(document.getElementById('bl-analytics-plausible')).toBeNull()
  })

  it('does not load scripts when provider is null', () => {
    localStorage.setItem('bl_cookie_consent', 'accepted')
    render(<Analytics tenant={{ analytics: { provider: null } }} />)
    expect(document.getElementById('bl-analytics-plausible')).toBeNull()
    expect(document.getElementById('bl-analytics-ga4')).toBeNull()
  })

  it('loads Plausible script when consent accepted and provider=plausible', () => {
    localStorage.setItem('bl_cookie_consent', 'accepted')
    render(
      <Analytics
        tenant={{ analytics: { provider: 'plausible', plausibleDomain: 'barbaluxe.be' } }}
      />
    )
    const script = document.getElementById('bl-analytics-plausible')
    expect(script).toBeTruthy()
    expect(script.dataset.domain).toBe('barbaluxe.be')
    expect(script.src).toContain('plausible.io')
  })

  it('loads GA4 script when consent accepted and provider=ga4', () => {
    localStorage.setItem('bl_cookie_consent', 'accepted')
    render(
      <Analytics
        tenant={{ analytics: { provider: 'ga4', ga4Id: 'G-TESTID123' } }}
      />
    )
    const script = document.getElementById('bl-analytics-ga4')
    expect(script).toBeTruthy()
    expect(script.src).toContain('G-TESTID123')
  })

  it('does not double-load Plausible on re-render', () => {
    localStorage.setItem('bl_cookie_consent', 'accepted')
    const tenant = { analytics: { provider: 'plausible', plausibleDomain: 'barbaluxe.be' } }
    const { rerender } = render(<Analytics tenant={tenant} />)
    rerender(<Analytics tenant={tenant} />)
    expect(document.querySelectorAll('#bl-analytics-plausible')).toHaveLength(1)
  })
})

describe('trackPageView', () => {
  it('calls window.plausible when available', () => {
    window.plausible = vi.fn()
    trackPageView('products')
    expect(window.plausible).toHaveBeenCalledWith('pageview', { props: { page: 'products' } })
  })

  it('calls window.gtag when available', () => {
    window.gtag = vi.fn()
    trackPageView('checkout')
    expect(window.gtag).toHaveBeenCalledWith('event', 'page_view', { page_title: 'checkout' })
  })

  it('is safe to call when neither plausible nor gtag exist', () => {
    expect(() => trackPageView('home')).not.toThrow()
  })
})
