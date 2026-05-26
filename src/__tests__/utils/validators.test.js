import { describe, it, expect } from 'vitest'
import {
  isValidEmail,
  isValidPhone,
  isValidZip,
  validateShipping,
  validateContact,
  validatePayment,
} from '../../utils/validators.js'

// ─── isValidEmail ─────────────────────────────────────────────────────────────
describe('isValidEmail', () => {
  it('accepts standard email addresses', () => {
    expect(isValidEmail('user@example.com')).toBe(true)
    expect(isValidEmail('remy+tag@ish-group.eu')).toBe(true)
    expect(isValidEmail('a@b.co')).toBe(true)
  })

  it('rejects missing @ sign', () => {
    expect(isValidEmail('userexample.com')).toBe(false)
  })

  it('rejects missing domain', () => {
    expect(isValidEmail('user@')).toBe(false)
  })

  it('rejects missing TLD (single part after @)', () => {
    expect(isValidEmail('user@localhost')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(isValidEmail('')).toBe(false)
  })

  it('rejects whitespace-only string', () => {
    expect(isValidEmail('   ')).toBe(false)
  })

  it('trims leading/trailing whitespace before checking', () => {
    expect(isValidEmail('  user@example.com  ')).toBe(true)
  })
})

// ─── isValidPhone ─────────────────────────────────────────────────────────────
describe('isValidPhone', () => {
  it('accepts 6-digit minimum', () => {
    expect(isValidPhone('123456')).toBe(true)
  })

  it('accepts 15-digit maximum', () => {
    expect(isValidPhone('123456789012345')).toBe(true)
  })

  it('accepts formatted numbers with spaces and dashes', () => {
    expect(isValidPhone('04 75 12 34 56')).toBe(true)
    expect(isValidPhone('02-500-1234')).toBe(true)
  })

  it('accepts numbers with parentheses', () => {
    expect(isValidPhone('(02) 500 1234')).toBe(true)
  })

  it('rejects fewer than 6 digits', () => {
    expect(isValidPhone('12345')).toBe(false)
  })

  it('rejects more than 15 digits', () => {
    expect(isValidPhone('1234567890123456')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(isValidPhone('')).toBe(false)
  })

  it('rejects null / undefined', () => {
    expect(isValidPhone(null)).toBe(false)
    expect(isValidPhone(undefined)).toBe(false)
  })
})

// ─── isValidZip ───────────────────────────────────────────────────────────────
describe('isValidZip', () => {
  describe('Belgium (BE)', () => {
    it('accepts 4-digit zip', () => {
      expect(isValidZip('1050', 'BE')).toBe(true)
      expect(isValidZip('9000', 'BE')).toBe(true)
    })
    it('rejects 5-digit zip', () => {
      expect(isValidZip('10500', 'BE')).toBe(false)
    })
    it('rejects letters', () => {
      expect(isValidZip('10AB', 'BE')).toBe(false)
    })
  })

  describe('France (FR)', () => {
    it('accepts 5-digit zip', () => {
      expect(isValidZip('75001', 'FR')).toBe(true)
    })
    it('rejects 4-digit zip', () => {
      expect(isValidZip('7500', 'FR')).toBe(false)
    })
  })

  describe('United Kingdom (GB)', () => {
    it('accepts standard UK postcodes', () => {
      expect(isValidZip('SW1A 1AA', 'GB')).toBe(true)
      expect(isValidZip('EC1A1BB', 'GB')).toBe(true)
      expect(isValidZip('W1A 0AX', 'GB')).toBe(true)
    })
    it('rejects plain numeric', () => {
      expect(isValidZip('12345', 'GB')).toBe(false)
    })
  })

  describe('Netherlands (NL)', () => {
    it('accepts 4 digits + 2 letters', () => {
      expect(isValidZip('1234AB', 'NL')).toBe(true)
      expect(isValidZip('1234 AB', 'NL')).toBe(true)
    })
    it('rejects 4 digits only', () => {
      expect(isValidZip('1234', 'NL')).toBe(false)
    })
  })

  describe('United States (US)', () => {
    it('accepts 5-digit zip', () => {
      expect(isValidZip('90210', 'US')).toBe(true)
    })
    it('accepts ZIP+4 format', () => {
      expect(isValidZip('90210-1234', 'US')).toBe(true)
    })
    it('rejects 4-digit zip', () => {
      expect(isValidZip('9021', 'US')).toBe(false)
    })
  })

  describe('Switzerland (CH)', () => {
    it('accepts 4-digit zip', () => {
      expect(isValidZip('8001', 'CH')).toBe(true)
    })
  })

  describe('unknown country code', () => {
    it('accepts any non-empty string for unknown countries', () => {
      expect(isValidZip('ANYTHING', 'XX')).toBe(true)
      expect(isValidZip('12345', 'XX')).toBe(true)
    })
    it('rejects empty string', () => {
      expect(isValidZip('', 'XX')).toBe(false)
    })
  })

  it('rejects empty zip for any country', () => {
    expect(isValidZip('', 'BE')).toBe(false)
    expect(isValidZip(null, 'BE')).toBe(false)
  })
})

// ─── validateShipping ────────────────────────────────────────────────────────
describe('validateShipping', () => {
  const validFr = {
    firstName: 'Jean',
    lastName: 'Dupont',
    address: 'Rue de la Loi 1',
    city: 'Bruxelles',
    zip: '1000',
    country: 'BE',
    phone: '',
    email: '',
  }

  it('returns empty object for fully valid Belgian shipment', () => {
    expect(validateShipping(validFr, 'fr')).toEqual({})
  })

  it('reports all missing required fields', () => {
    const errs = validateShipping(
      { firstName: '', lastName: '', address: '', city: '', zip: '', country: '' },
      'fr',
    )
    expect(errs).toHaveProperty('firstName')
    expect(errs).toHaveProperty('lastName')
    expect(errs).toHaveProperty('address')
    expect(errs).toHaveProperty('city')
    expect(errs).toHaveProperty('zip')
    expect(errs).toHaveProperty('country')
  })

  it('returns English messages when lang is en', () => {
    const errs = validateShipping(
      { firstName: '', lastName: '', address: '', city: '', zip: '', country: '' },
      'en',
    )
    expect(errs.firstName).toBe('Required field')
  })

  it('returns French messages when lang is fr', () => {
    const errs = validateShipping(
      { firstName: '', lastName: '', address: '', city: '', zip: '', country: '' },
      'fr',
    )
    expect(errs.firstName).toBe('Champ requis')
  })

  it('reports invalid zip for the selected country', () => {
    const errs = validateShipping(
      { ...validFr, zip: '75001' }, // French zip in Belgium — invalid for BE
      'fr',
    )
    expect(errs.zip).toMatch(/invalide|invalid/i)
  })

  it('does not report zip error when zip is valid for country', () => {
    const errs = validateShipping({ ...validFr, zip: '75001', country: 'FR' }, 'fr')
    expect(errs.zip).toBeUndefined()
  })

  it('reports country error when country is empty', () => {
    const errs = validateShipping({ ...validFr, country: '' }, 'fr')
    expect(errs.country).toBeTruthy()
  })

  it('validates optional phone only when filled in', () => {
    // Valid phone — no error
    expect(validateShipping({ ...validFr, phone: '0475123456' }, 'fr').phone).toBeUndefined()
    // Invalid phone (too short) — error
    expect(validateShipping({ ...validFr, phone: '123' }, 'fr').phone).toBeTruthy()
    // Empty phone — no error (it's optional)
    expect(validateShipping({ ...validFr, phone: '' }, 'fr').phone).toBeUndefined()
  })

  it('validates optional email only when filled in', () => {
    expect(validateShipping({ ...validFr, email: 'ok@test.com' }, 'fr').email).toBeUndefined()
    expect(validateShipping({ ...validFr, email: 'bad-email' }, 'fr').email).toBeTruthy()
    expect(validateShipping({ ...validFr, email: '' }, 'fr').email).toBeUndefined()
  })
})

// ─── validateContact ─────────────────────────────────────────────────────────
describe('validateContact', () => {
  const valid = { name: 'Alice', email: 'alice@test.com', message: 'Hello there!' }

  it('returns empty object for valid input', () => {
    expect(validateContact(valid, 'fr')).toEqual({})
  })

  it('requires name', () => {
    expect(validateContact({ ...valid, name: '' }, 'fr')).toHaveProperty('name')
  })

  it('requires email', () => {
    expect(validateContact({ ...valid, email: '' }, 'fr')).toHaveProperty('email')
  })

  it('rejects malformed email', () => {
    const errs = validateContact({ ...valid, email: 'notanemail' }, 'fr')
    expect(errs.email).toBeTruthy()
  })

  it('requires message', () => {
    expect(validateContact({ ...valid, message: '' }, 'fr')).toHaveProperty('message')
  })

  it('rejects message shorter than 10 characters', () => {
    const errs = validateContact({ ...valid, message: 'Hi' }, 'fr')
    expect(errs.message).toBeTruthy()
  })

  it('accepts message of exactly 10 characters', () => {
    const errs = validateContact({ ...valid, message: '1234567890' }, 'fr')
    expect(errs.message).toBeUndefined()
  })

  it('returns English error messages when lang is en', () => {
    const errs = validateContact({ ...valid, name: '' }, 'en')
    expect(errs.name).toBe('Required field')
  })
})

// ─── validatePayment ─────────────────────────────────────────────────────────
describe('validatePayment', () => {
  const futureYear = (new Date().getFullYear() % 100) + 2
  const valid = {
    name: 'Jean Dupont',
    number: '4242 4242 4242 4242',
    expiry: `12/${String(futureYear).padStart(2, '0')}`,
    cvv: '123',
  }

  it('returns empty object for valid card', () => {
    expect(validatePayment(valid, 'fr')).toEqual({})
  })

  it('requires cardholder name', () => {
    expect(validatePayment({ ...valid, name: '' }, 'fr')).toHaveProperty('name')
  })

  it('rejects card number with fewer than 16 digits', () => {
    expect(validatePayment({ ...valid, number: '4242 4242 4242' }, 'fr')).toHaveProperty('number')
  })

  it('rejects card number with non-digits', () => {
    expect(validatePayment({ ...valid, number: '4242 4242 4242 ABCD' }, 'fr')).toHaveProperty('number')
  })

  it('rejects invalid expiry format', () => {
    expect(validatePayment({ ...valid, expiry: '1234' }, 'fr')).toHaveProperty('expiry')
    expect(validatePayment({ ...valid, expiry: '13/25' }, 'fr')).toHaveProperty('expiry')
  })

  it('rejects expired card', () => {
    const lastYear = (new Date().getFullYear() % 100) - 1
    const errs = validatePayment({ ...valid, expiry: `01/${String(lastYear).padStart(2, '0')}` }, 'fr')
    expect(errs.expiry).toBeTruthy()
  })

  it('rejects CVV not exactly 3 digits', () => {
    expect(validatePayment({ ...valid, cvv: '12' }, 'fr')).toHaveProperty('cvv')
    expect(validatePayment({ ...valid, cvv: '1234' }, 'fr')).toHaveProperty('cvv')
    expect(validatePayment({ ...valid, cvv: 'abc' }, 'fr')).toHaveProperty('cvv')
  })
})
