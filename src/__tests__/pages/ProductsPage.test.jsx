/**
 * ProductsPage smoke tests — render, filters, stock badges, add to cart.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ProductsPage from '../../pages/ProductsPage.jsx'

// ── Mocks ─────────────────────────────────────────────────────────────────────
vi.mock('../../data/config.js', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useConfig: () => ({
      config: {
        sections: { products: true, productFilters: true, cartDrawer: true },
        features: { productViewToggle: false },
      },
    }),
  }
})

vi.mock('../../contexts/TenantContext.jsx', () => ({
  useTenant: () => ({
    tenant: {
      products: null,
      inventory: { 1: 5, 2: 0 },
    },
  }),
  localizeProducts: (_products, _lang) => _products,
  getStock: (id, tenant) => tenant?.inventory?.[id] ?? null,
}))

vi.mock('../../hooks/useReveal.js', () => ({ useReveal: () => {} }))

vi.mock('../../components/AdBanner.jsx', () => ({
  default: () => null,
}))

vi.mock('../../components/Footer.jsx', () => ({
  default: ({ lang, setPage }) => (
    <footer data-testid="footer" onClick={() => setPage('home')}>Footer</footer>
  ),
}))

vi.mock('../../data/translations.js', () => ({
  T: {
    fr: {
      products: {
        title: 'Notre Collection',
        subtitle: 'Des soins premium',
        addCart: 'Ajouter',
        added: 'Ajouté !',
        filters: [
          { id: 'all', label: 'Tous' },
          { id: 'light', label: 'Légère' },
        ],
        items: [
          { id: 1, name: 'Ambre Noir', price: 34, type: 'Légère', typeId: 'light', tagline: 'Tag 1', desc: 'Desc 1', scent: 'Boisé', img: '' },
          { id: 2, name: 'Forêt Blanche', price: 28, type: 'Nourrissante', typeId: 'nourishing', tagline: 'Tag 2', desc: 'Desc 2', scent: 'Frais', img: '' },
        ],
      },
    },
  },
}))

// ── Setup helper ──────────────────────────────────────────────────────────────
function setup(overrides = {}) {
  const addToCart = vi.fn()
  const setPage   = vi.fn()
  render(
    <ProductsPage
      lang={overrides.lang ?? 'fr'}
      addToCart={addToCart}
      setPage={setPage}
    />
  )
  return { addToCart, setPage }
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('ProductsPage', () => {
  beforeEach(() => { localStorage.clear() })

  it('renders the section title', () => {
    setup()
    expect(screen.getByText('Notre Collection')).toBeInTheDocument()
  })

  it('renders all products', () => {
    setup()
    expect(screen.getByText('Ambre Noir')).toBeInTheDocument()
    expect(screen.getByText('Forêt Blanche')).toBeInTheDocument()
  })

  it('renders the footer', () => {
    setup()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })

  it('renders filter buttons', () => {
    setup()
    expect(screen.getByRole('button', { name: /tous/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /légère/i })).toBeInTheDocument()
  })

  it('clicking a filter button marks it active', () => {
    setup()
    const filterBtn = screen.getByRole('button', { name: /légère/i })
    fireEvent.click(filterBtn)
    expect(filterBtn.className).toMatch(/active/)
  })

  it('shows "En stock" badge for products with stock > 3', () => {
    setup()
    // Product 1 has stock 5, Product 2 has stock 0
    expect(screen.getByText(/✓ En stock/i)).toBeInTheDocument()
  })

  it('shows "Rupture de stock" badge for out-of-stock products', () => {
    setup()
    // Product 2 has stock 0
    expect(screen.getByText(/✗ Rupture de stock/i)).toBeInTheDocument()
  })

  it('calls addToCart when add button is clicked for in-stock product', () => {
    const { addToCart } = setup()
    // First product (id=1) is in stock
    const addBtn = screen.getAllByRole('button', { name: /ajouter/i })[0]
    fireEvent.click(addBtn)
    expect(addToCart).toHaveBeenCalledTimes(1)
    expect(addToCart).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }))
  })

  it('disables the add button for out-of-stock products', () => {
    setup()
    // Product 2 is OOS — its button should be disabled
    const oosBtns = screen.getAllByRole('button', { name: /rupture de stock/i })
    expect(oosBtns.length).toBeGreaterThan(0)
    expect(oosBtns[0]).toBeDisabled()
  })

  it('shows prices', () => {
    setup()
    expect(screen.getByText('34')).toBeInTheDocument()
    expect(screen.getByText('28')).toBeInTheDocument()
  })
})
