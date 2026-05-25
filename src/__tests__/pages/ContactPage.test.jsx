import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContactPage from '../../pages/ContactPage.jsx'

// ── Module mocks ──────────────────────────────────────────────────────────────
vi.mock('../../data/config.js', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useConfig: () => ({
      config: {
        ...actual.CONFIG,
        sections: { ...actual.CONFIG.sections, contactMap: false, socialLinks: false },
      },
      prefillMessage: '',
      setPrefillMessage: vi.fn(),
    }),
  }
})

vi.mock('../../contexts/TenantContext.jsx', () => ({
  useTenant: () => ({ domain: null, tenant: {} }),
}))

vi.mock('../../hooks/useReveal.js', () => ({
  useReveal: vi.fn(),
}))

vi.mock('../../components/Footer.jsx', () => ({
  default: () => <footer data-testid="footer" />,
}))

// ── Test helpers ──────────────────────────────────────────────────────────────
function setup(lang = 'fr') {
  const user = userEvent.setup()
  const utils = render(<ContactPage lang={lang} setPage={vi.fn()} />)
  return { ...utils, user }
}

async function fillValidForm(user) {
  // Labels now have htmlFor="contact-name" etc — getByLabelText resolves via id
  await user.type(screen.getByLabelText(/votre nom/i),     'Alice Martin')
  await user.type(screen.getByLabelText(/votre email/i),   'alice@test.com')
  await user.type(screen.getByLabelText(/votre message/i), 'Bonjour, je voudrais des informations sur les produits.')
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('ContactPage', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn()
  })

  describe('form rendering', () => {
    it('renders the contact form in French', () => {
      setup('fr')
      expect(screen.getByRole('button', { name: /envoyer/i })).toBeInTheDocument()
    })

    it('renders the contact form in English', () => {
      setup('en')
      expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument()
    })
  })

  describe('client-side validation', () => {
    it('shows an error for empty name on submit', async () => {
      const { user } = setup()
      await user.click(screen.getByRole('button', { name: /envoyer/i }))
      // Multiple "Champ requis" may appear (name + email + message all empty)
      await waitFor(() =>
        expect(screen.getAllByText(/champ requis/i).length).toBeGreaterThanOrEqual(1)
      )
    })

    it('shows an error for invalid email format', async () => {
      const { user } = setup()
      await user.type(screen.getByLabelText(/votre nom/i),     'Alice')
      await user.type(screen.getByLabelText(/votre email/i),   'notanemail')
      await user.type(screen.getByLabelText(/votre message/i), 'Message long enough')
      await user.click(screen.getByRole('button', { name: /envoyer/i }))
      await waitFor(() => expect(screen.getByText(/email invalide/i)).toBeInTheDocument())
    })

    it('shows an error for message that is too short', async () => {
      const { user } = setup()
      await user.type(screen.getByLabelText(/votre nom/i),     'Alice')
      await user.type(screen.getByLabelText(/votre email/i),   'alice@test.com')
      await user.type(screen.getByLabelText(/votre message/i), 'Hi')
      await user.click(screen.getByRole('button', { name: /envoyer/i }))
      await waitFor(() => expect(screen.getByText(/trop court/i)).toBeInTheDocument())
    })

    it('does not call fetch when validation fails', async () => {
      const { user } = setup()
      await user.click(screen.getByRole('button', { name: /envoyer/i }))
      expect(fetch).not.toHaveBeenCalled()
    })

    it('clears the name error when user starts typing', async () => {
      const { user } = setup()
      // Trigger validation
      await user.click(screen.getByRole('button', { name: /envoyer/i }))
      await waitFor(() => expect(screen.getAllByText(/champ requis/i).length).toBeGreaterThan(0))
      const initialCount = screen.getAllByText(/champ requis/i).length
      // Start typing in name — the name error clears, but email/message errors remain
      await user.type(screen.getByLabelText(/votre nom/i), 'B')
      await waitFor(() =>
        expect(screen.getAllByText(/champ requis/i).length).toBeLessThan(initialCount)
      )
    })
  })

  describe('successful submission', () => {
    it('calls fetch with the form data when all fields are valid', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true }),
      })
      const { user } = setup()
      await fillValidForm(user)
      await user.click(screen.getByRole('button', { name: /envoyer/i }))
      await waitFor(() => expect(fetch).toHaveBeenCalled())
      const [url, opts] = fetch.mock.calls[0]
      expect(url).toBe('/api/contact')
      expect(opts.method).toBe('POST')
      const body = JSON.parse(opts.body)
      expect(body.name).toBe('Alice Martin')
      expect(body.email).toBe('alice@test.com')
    })

    it('shows the success state after a successful submission', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true }),
      })
      const { user } = setup()
      await fillValidForm(user)
      await user.click(screen.getByRole('button', { name: /envoyer/i }))
      await waitFor(() => expect(screen.getByText(/message envoyé/i)).toBeInTheDocument())
    })

    it('disables the submit button while sending', async () => {
      let resolve
      globalThis.fetch = vi.fn(() => new Promise(r => { resolve = r }))
      const { user } = setup()
      await fillValidForm(user)
      await user.click(screen.getByRole('button', { name: /envoyer/i }))
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /envoi/i })).toBeDisabled()
      )
      resolve({ ok: true, json: async () => ({ ok: true }) })
    })
  })

  describe('failed submission', () => {
    it('shows an error message when the API returns a non-OK response', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Server error' }),
      })
      const { user } = setup()
      await fillValidForm(user)
      await user.click(screen.getByRole('button', { name: /envoyer/i }))
      await waitFor(() => expect(screen.getByText(/envoi échoué/i)).toBeInTheDocument())
    })

    it('shows an error message when fetch throws (network error)', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network failure'))
      const { user } = setup()
      await fillValidForm(user)
      await user.click(screen.getByRole('button', { name: /envoyer/i }))
      await waitFor(() => expect(screen.getByText(/envoi échoué/i)).toBeInTheDocument())
    })
  })
})
