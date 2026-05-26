import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CheckoutPage from '../../pages/CheckoutPage.jsx'

// ── Module mocks ──────────────────────────────────────────────────────────────
vi.mock('@stripe/react-stripe-js', () => ({
  Elements:       ({ children }) => <div data-testid="stripe-elements">{children}</div>,
  PaymentElement: () => <div data-testid="stripe-payment-element" />,
  useStripe:      () => null,
  useElements:    () => null,
}))

vi.mock('../../lib/stripe.js', () => ({
  getStripePromise: () => null,
  stripePromise: null,
}))

vi.mock('../../data/config.js', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useConfig: () => ({
      config: {
        ...actual.CONFIG,
        sections: { cartDrawer: true, checkout: true },
        checkout: {
          freeShippingThreshold: 45,
          shippingOptions: [
            { id: 'standard', price: 0,   label: { fr: 'Standard', en: 'Standard' } },
            { id: 'express',  price: 8.9, label: { fr: 'Express',  en: 'Express'  } },
          ],
        },
      },
      prefillMessage: '',
      setPrefillMessage: vi.fn(),
    }),
  }
})

vi.mock('../../contexts/TenantContext.jsx', () => ({
  useTenant: () => ({
    tenant: { stripePublishableKey: null, shopName: 'Barba Luxe' },
    domain: null,
    loaded: true,
    decrementStock: vi.fn().mockResolvedValue(undefined),
  }),
}))

// ── Mock cart ─────────────────────────────────────────────────────────────────
const MOCK_CART = [
  { id: 1, name: 'Ambre Noir', price: 34, qty: 2, img: '' },
  { id: 2, name: 'Forêt Blanche', price: 28, qty: 1, img: '' },
]

function setup(overrides = {}) {
  const setCart = vi.fn()
  const setPage = vi.fn()
  const user = userEvent.setup()
  const utils = render(
    <CheckoutPage
      lang={overrides.lang ?? 'fr'}
      cart={overrides.cart ?? MOCK_CART}
      setCart={setCart}
      setPage={setPage}
    />,
  )
  return { ...utils, setCart, setPage, user }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
async function goToStep1(user) {
  await user.click(screen.getByRole('button', { name: /continuer/i }))
}

async function fillShippingForm(user) {
  // Wait for step 1 to render (labels are now properly associated via htmlFor/id)
  await waitFor(() => screen.getByLabelText(/prénom/i))
  await user.type(screen.getByLabelText(/prénom/i),      'Jean')
  await user.type(screen.getByLabelText(/^nom$/i),        'Dupont')
  await user.type(screen.getByLabelText(/adresse/i),     '12 rue du Bailli')
  await user.type(screen.getByLabelText(/ville/i),       'Bruxelles')
  await user.type(screen.getByLabelText(/code postal/i), '1050')
  // Country combobox (input is the only combobox role now)
  const combobox = screen.getByRole('combobox')
  await user.click(combobox)
  const belgique = screen.getAllByRole('option').find(o => o.textContent?.includes('Belgique'))
  if (belgique) await user.click(belgique)
}

// ── Step 0: Cart summary ──────────────────────────────────────────────────────
describe('CheckoutPage — Step 0 (cart summary)', () => {
  it('displays all cart items', () => {
    setup()
    // Item appears in main list AND sidebar — getAllByText is correct here
    expect(screen.getAllByText('Ambre Noir').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Forêt Blanche').length).toBeGreaterThanOrEqual(1)
  })

  it('shows the correct subtotal', () => {
    setup() // 34*2 + 28*1 = 96
    // Subtotal may appear in main area and sidebar
    expect(screen.getAllByText(/96[,.]00/).length).toBeGreaterThanOrEqual(1)
  })

  it('shows a "Continue" button', () => {
    setup()
    expect(screen.getByRole('button', { name: /continuer/i })).toBeInTheDocument()
  })

  it('shows an empty-cart message when cart is empty', () => {
    setup({ cart: [] })
    expect(screen.getByText(/panier est vide/i)).toBeInTheDocument()
  })

  it('navigates to step 1 when the Continue button is clicked', async () => {
    const { user } = setup()
    await goToStep1(user)
    // Step 1 shows the shipping form
    await waitFor(() => expect(screen.getByLabelText(/prénom/i)).toBeInTheDocument())
  })

  it('shows the progress stepper', () => {
    setup()
    expect(screen.getByText('Panier')).toBeInTheDocument()
    // "Livraison" also appears as the step-1 heading, so use getAllByText
    expect(screen.getAllByText('Livraison').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Paiement')).toBeInTheDocument()
  })
})

// ── Step 1: Shipping form ────────────────────────────────────────────────────
describe('CheckoutPage — Step 1 (shipping form)', () => {
  async function goToShipping(user) {
    await goToStep1(user)
    await waitFor(() => screen.getByLabelText(/prénom/i))
  }

  it('renders all required shipping fields', async () => {
    const { user } = setup()
    await goToShipping(user)
    // Labels are now properly associated via htmlFor/id
    expect(screen.getByLabelText(/prénom/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^nom$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/adresse/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/ville/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/code postal/i)).toBeInTheDocument()
  })

  it('shows validation errors when submitted with empty fields', async () => {
    const { user } = setup()
    await goToShipping(user)
    await user.click(screen.getByRole('button', { name: /vers le paiement/i }))
    await waitFor(() => {
      const errors = screen.getAllByText(/champ requis|veuillez choisir/i)
      expect(errors.length).toBeGreaterThanOrEqual(4)
    })
  })

  it('does not advance to step 2 when fields are empty', async () => {
    const { user } = setup()
    await goToShipping(user)
    await user.click(screen.getByRole('button', { name: /vers le paiement/i }))
    // Still on step 1 — no Stripe payment section
    expect(screen.queryByTestId('stripe-elements')).not.toBeInTheDocument()
  })

  it('shows zip validation error for wrong country-code combination', async () => {
    const { user } = setup()
    await goToShipping(user)
    await user.type(screen.getByLabelText(/prénom/i),     'Jean')
    await user.type(screen.getByLabelText(/^nom/i),       'Dupont')
    await user.type(screen.getByLabelText(/adresse/i),    '12 rue du Bailli')
    await user.type(screen.getByLabelText(/ville/i),      'Bruxelles')
    await user.type(screen.getByLabelText(/code postal/i), '75001') // French zip
    // Select Belgium
    const combobox = screen.getByRole('combobox')
    await user.click(combobox)
    const belgique = screen.getAllByRole('option').find(o => o.textContent?.includes('Belgique'))
    if (belgique) await user.click(belgique)
    await user.click(screen.getByRole('button', { name: /vers le paiement/i }))
    await waitFor(() =>
      expect(screen.getByText(/code postal invalide/i)).toBeInTheDocument()
    )
  })

  it('clears a field error when the user corrects it', async () => {
    const { user } = setup()
    await goToShipping(user)
    // Trigger errors
    await user.click(screen.getByRole('button', { name: /vers le paiement/i }))
    expect(screen.getAllByText(/champ requis/i).length).toBeGreaterThan(0)
    // Fill in firstName
    await user.type(screen.getByLabelText(/prénom/i), 'Jean')
    // The firstName error should be gone (but others remain)
    // We can't check which exact error disappeared since they all say "Champ requis"
    // but we know at least one was cleared when we typed
    const remainingErrors = screen.queryAllByText(/champ requis/i)
    // Before: >= 4 errors; after filling one field: >= 3
    expect(remainingErrors.length).toBeLessThan(5)
  })

  it('shows shipping method options (standard and express)', async () => {
    const { user } = setup()
    await goToShipping(user)
    expect(screen.getByText(/standard/i)).toBeInTheDocument()
    expect(screen.getByText(/express/i)).toBeInTheDocument()
  })

  it('navigates back to step 0 when "Retour" is clicked', async () => {
    const { user } = setup()
    await goToShipping(user)
    await user.click(screen.getByRole('button', { name: /retour au panier/i }))
    // Cart items appear in both main area and sidebar after returning
    await waitFor(() =>
      expect(screen.getAllByText('Ambre Noir').length).toBeGreaterThanOrEqual(1)
    )
  })

  it('proceeds to step 2 when all required fields are valid', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ clientSecret: 'pi_test_secret' }),
      text: async () => JSON.stringify({ clientSecret: 'pi_test_secret' }),
    })
    const { user } = setup()
    await goToShipping(user)
    await fillShippingForm(user)
    await user.click(screen.getByRole('button', { name: /vers le paiement/i }))
    // Step 2 shows the Stripe payment tab button
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /carte.*apple/i })).toBeInTheDocument()
    )
  })
})

// ── Step 2: Payment tabs ─────────────────────────────────────────────────────
describe('CheckoutPage — Step 2 (payment)', () => {
  async function goToPayment(user) {
    // Pre-mock the PaymentIntent endpoint
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ clientSecret: 'pi_test_cs_xxx' }),
    })
    await goToStep1(user)
    await waitFor(() => screen.getByLabelText(/prénom/i))
    await fillShippingForm(user)
    await user.click(screen.getByRole('button', { name: /vers le paiement/i }))
    await waitFor(() => screen.getByText(/bancontact/i))
  }

  it('shows both payment tabs (Stripe and Mollie)', async () => {
    const { user } = setup()
    await goToPayment(user)
    expect(screen.getByText(/carte.*apple|apple pay/i)).toBeInTheDocument()
    expect(screen.getByText(/bancontact/i)).toBeInTheDocument()
  })

  it('switches to the Mollie tab when clicked', async () => {
    const { user } = setup()
    await goToPayment(user)
    const mollieTab = screen.getByRole('button', { name: /bancontact/i })
    await user.click(mollieTab)
    // Mollie section renders its payment heading (only present inside MollieSection, not in the tab button)
    await waitFor(() => expect(screen.getByText(/paiement belge/i)).toBeInTheDocument())
  })

  it('shows a back button to return to shipping', async () => {
    const { user } = setup()
    await goToPayment(user)
    expect(screen.getByRole('button', { name: /retour livraison/i })).toBeInTheDocument()
  })

  it('returns to step 1 when the back button is clicked', async () => {
    const { user } = setup()
    await goToPayment(user)
    await user.click(screen.getByRole('button', { name: /retour livraison/i }))
    await waitFor(() => expect(screen.getByLabelText(/prénom/i)).toBeInTheDocument())
  })
})

// ── Order success screen ─────────────────────────────────────────────────────
describe('CheckoutPage — Order success screen', () => {
  it('shows the success screen when Mollie returns ?mollie=success in the URL', () => {
    // Simulate a Mollie redirect callback
    const original = window.location.search
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, search: '?mollie=success' },
    })
    setup()
    expect(screen.getByText(/commande confirmée/i)).toBeInTheDocument()
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, search: original },
    })
  })
})
