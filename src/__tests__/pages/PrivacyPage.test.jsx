/**
 * PrivacyPage smoke tests — render, hydration, language.
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PrivacyPage from '../../pages/PrivacyPage.jsx'

vi.mock('../../data/config.js', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useConfig: () => ({ config: { sections: {} } }) }
})

vi.mock('../../contexts/TenantContext.jsx', () => ({
  useTenant: () => ({
    tenant: {
      shopName: 'Test Shop',
      analytics: { provider: 'plausible', plausibleDomain: 'test.be' },
      legal: {
        companyName: 'Test Shop SPRL',
        email: 'test@example.com',
        address: 'Rue Test 1, 1000 Bruxelles',
        vatNumber: 'BE 0123.456.789',
      },
    },
  }),
}))

vi.mock('../../components/Footer.jsx', () => ({
  default: () => <footer data-testid="footer" />,
}))

describe('PrivacyPage', () => {
  it('renders the French privacy page', () => {
    render(<PrivacyPage lang="fr" setPage={vi.fn()} />)
    expect(screen.getByText(/politique de confidentialité/i)).toBeInTheDocument()
  })

  it('renders the English privacy page', () => {
    render(<PrivacyPage lang="en" setPage={vi.fn()} />)
    expect(screen.getByText(/privacy policy/i)).toBeInTheDocument()
  })

  it('hydrates shop name from tenant', () => {
    render(<PrivacyPage lang="fr" setPage={vi.fn()} />)
    // The hydrated company name should appear in the page
    expect(screen.getByText(/test shop sprl/i)).toBeInTheDocument()
  })

  it('hydrates email from tenant', () => {
    const { container } = render(<PrivacyPage lang="fr" setPage={vi.fn()} />)
    expect(container.textContent).toContain('test@example.com')
  })

  it('shows Plausible analytics text when provider=plausible', () => {
    render(<PrivacyPage lang="fr" setPage={vi.fn()} />)
    expect(screen.getByText(/plausible analytics/i)).toBeInTheDocument()
  })

  it('calls setPage when back button is clicked', () => {
    const setPage = vi.fn()
    render(<PrivacyPage lang="fr" setPage={setPage} />)
    fireEvent.click(screen.getByRole('button', { name: /retour/i }))
    expect(setPage).toHaveBeenCalledWith('home')
  })

  it('shows DPO section', () => {
    render(<PrivacyPage lang="fr" setPage={vi.fn()} />)
    expect(screen.getByText(/délégué à la protection/i)).toBeInTheDocument()
  })

  it('shows records of processing activities section', () => {
    render(<PrivacyPage lang="fr" setPage={vi.fn()} />)
    expect(screen.getByText(/registre des activités/i)).toBeInTheDocument()
  })
})
