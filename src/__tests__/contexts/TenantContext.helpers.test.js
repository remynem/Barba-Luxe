/**
 * Unit tests for TenantContext pure helper functions.
 * These are the functions that are exported and can be tested in isolation.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  getStock,
  applyCartToInventory,
  appendAuditLog,
  readAuditLog,
  localizeProducts,
  resolveImg,
} from '../../contexts/TenantContext.jsx'

// ── getStock ──────────────────────────────────────────────────────────────────
describe('getStock', () => {
  const tenant = {
    inventory: { 1: 10, 2: 0, 3: 5 },
    products:  [{ id: 4, stock: 8 }, { id: 5 }],
  }

  it('returns stock from inventory map when present', () => {
    expect(getStock(1, tenant)).toBe(10)
    expect(getStock(2, tenant)).toBe(0)  // out of stock
    expect(getStock(3, tenant)).toBe(5)
  })

  it('returns stock from product object when not in inventory map', () => {
    expect(getStock(4, tenant)).toBe(8)
  })

  it('returns null when product has no stock field', () => {
    expect(getStock(5, tenant)).toBe(null)
  })

  it('returns null when product does not exist', () => {
    expect(getStock(99, tenant)).toBe(null)
  })

  it('returns inventory value (0) over product stock', () => {
    const t = {
      inventory: { 4: 0 },        // inventory says OOS
      products:  [{ id: 4, stock: 8 }], // product says 8
    }
    expect(getStock(4, t)).toBe(0) // inventory wins
  })

  it('handles null/undefined tenant gracefully', () => {
    expect(getStock(1, null)).toBe(null)
    expect(getStock(1, undefined)).toBe(null)
  })

  it('handles missing inventory map', () => {
    expect(getStock(4, { products: [{ id: 4, stock: 3 }] })).toBe(3)
  })
})

// ── applyCartToInventory ──────────────────────────────────────────────────────
describe('applyCartToInventory', () => {
  const tenant = {
    inventory: { 1: 10, 2: 3, 3: 0 },
  }

  it('decrements stock for each cart item', () => {
    const cart   = [{ id: 1, qty: 2 }, { id: 2, qty: 1 }]
    const result = applyCartToInventory(cart, tenant)
    expect(result[1]).toBe(8)
    expect(result[2]).toBe(2)
  })

  it('clamps at 0 — never goes negative', () => {
    const cart   = [{ id: 2, qty: 10 }] // buying 10 but only 3 in stock
    const result = applyCartToInventory(cart, tenant)
    expect(result[2]).toBe(0)
  })

  it('does not decrement when stock is null (unlimited)', () => {
    const tenantNoInventory = { products: [{ id: 5 }] }
    const cart   = [{ id: 5, qty: 2 }]
    const result = applyCartToInventory(cart, tenantNoInventory)
    expect(result[5]).toBeUndefined()
  })

  it('returns a new object — does not mutate tenant.inventory', () => {
    const cart   = [{ id: 1, qty: 1 }]
    const result = applyCartToInventory(cart, tenant)
    expect(result).not.toBe(tenant.inventory)
    expect(tenant.inventory[1]).toBe(10) // original unchanged
  })

  it('already-zero stock stays at 0', () => {
    const cart   = [{ id: 3, qty: 1 }]
    const result = applyCartToInventory(cart, tenant)
    expect(result[3]).toBe(0)
  })

  it('handles empty cart', () => {
    const result = applyCartToInventory([], tenant)
    expect(result).toEqual(tenant.inventory)
  })
})

// ── appendAuditLog / readAuditLog ─────────────────────────────────────────────
describe('appendAuditLog / readAuditLog', () => {
  beforeEach(() => { localStorage.clear() })
  afterEach(() => { localStorage.clear() })

  it('readAuditLog returns empty array when nothing stored', () => {
    expect(readAuditLog()).toEqual([])
  })

  it('appendAuditLog stores an entry', () => {
    appendAuditLog('save', { keys: ['shopName'] })
    const log = readAuditLog()
    expect(log).toHaveLength(1)
    expect(log[0].action).toBe('save')
    expect(log[0].detail).toEqual({ keys: ['shopName'] })
    expect(log[0].ts).toBeTruthy()
  })

  it('entries are prepended (newest first)', () => {
    appendAuditLog('login')
    appendAuditLog('save')
    const log = readAuditLog()
    expect(log[0].action).toBe('save')  // newest first
    expect(log[1].action).toBe('login')
  })

  it('caps log at 200 entries', () => {
    for (let i = 0; i < 210; i++) appendAuditLog('order')
    expect(readAuditLog()).toHaveLength(200)
  })

  it('works with default empty detail', () => {
    appendAuditLog('logout')
    const [entry] = readAuditLog()
    expect(entry.detail).toEqual({})
  })
})

// ── localizeProducts ──────────────────────────────────────────────────────────
describe('localizeProducts', () => {
  const products = [
    {
      id: 1, name: 'Ambre Noir', name_en: 'Black Amber',
      tagline: 'Accroche FR', tagline_en: 'Hook EN',
      desc: 'Desc FR', desc_en: 'Desc EN',
      type: 'Légère', type_en: 'Light',
      scent: 'Boisé', scent_en: 'Woody',
      img: '',
    },
    {
      id: 2, name: 'Sans EN', img: '',
    },
  ]

  it('returns French fields when lang=fr', () => {
    const result = localizeProducts(products, 'fr')
    expect(result[0].name).toBe('Ambre Noir')
    expect(result[0].tagline).toBe('Accroche FR')
    expect(result[0].desc).toBe('Desc FR')
    expect(result[0].type).toBe('Légère')
    expect(result[0].scent).toBe('Boisé')
  })

  it('returns English fields when lang=en', () => {
    const result = localizeProducts(products, 'en')
    expect(result[0].name).toBe('Black Amber')
    expect(result[0].tagline).toBe('Hook EN')
    expect(result[0].desc).toBe('Desc EN')
    expect(result[0].type).toBe('Light')
    expect(result[0].scent).toBe('Woody')
  })

  it('falls back to FR when EN field is missing', () => {
    const result = localizeProducts(products, 'en')
    expect(result[1].name).toBe('Sans EN') // no name_en, uses name
  })
})

// ── resolveImg ────────────────────────────────────────────────────────────────
describe('resolveImg', () => {
  it('returns empty string for falsy input', () => {
    expect(resolveImg('')).toBe('')
    expect(resolveImg(null)).toBe('')
    expect(resolveImg(undefined)).toBe('')
  })

  it('returns URLs unchanged', () => {
    expect(resolveImg('https://example.com/img.jpg')).toBe('https://example.com/img.jpg')
    expect(resolveImg('/static/img.jpg')).toBe('/static/img.jpg')
    expect(resolveImg('data:image/png;base64,abc')).toBe('data:image/png;base64,abc')
  })

  it('falls through to the raw value for unknown keys', () => {
    // Unknown key — not in IMGS map — returns the key itself
    const result = resolveImg('unknown-key')
    expect(typeof result).toBe('string')
  })
})
