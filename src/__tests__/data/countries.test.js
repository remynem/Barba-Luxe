import { describe, it, expect } from 'vitest'
import { COUNTRIES, getCountryByCode, getCountryByDial } from '../../data/countries.js'

describe('COUNTRIES dataset', () => {
  it('has at least 40 entries', () => {
    expect(COUNTRIES.length).toBeGreaterThanOrEqual(40)
  })

  it('every entry has all required fields', () => {
    for (const c of COUNTRIES) {
      expect(c.code,  `${c.code}: missing code`).toBeTruthy()
      expect(c.fr,    `${c.code}: missing fr name`).toBeTruthy()
      expect(c.en,    `${c.code}: missing en name`).toBeTruthy()
      expect(c.dial,  `${c.code}: missing dial code`).toBeTruthy()
      expect(c.flag,  `${c.code}: missing flag`).toBeTruthy()
    }
  })

  it('all ISO codes are exactly 2 uppercase letters', () => {
    for (const c of COUNTRIES) {
      expect(c.code).toMatch(/^[A-Z]{2}$/)
    }
  })

  it('all dial codes start with +', () => {
    for (const c of COUNTRIES) {
      expect(c.dial).toMatch(/^\+/)
    }
  })

  it('all flag values are emoji (length >= 2 chars for regional indicator pairs)', () => {
    for (const c of COUNTRIES) {
      // Regional indicator symbol letters come in pairs — spread gives 2 chars
      expect([...c.flag].length).toBeGreaterThanOrEqual(2)
    }
  })

  it('ISO codes are unique', () => {
    const codes = COUNTRIES.map(c => c.code)
    const unique = new Set(codes)
    expect(unique.size).toBe(codes.length)
  })

  it('Belgium (BE) is the first entry (priority country)', () => {
    expect(COUNTRIES[0].code).toBe('BE')
  })

  it('all country names are non-empty strings', () => {
    for (const c of COUNTRIES) {
      expect(typeof c.fr).toBe('string')
      expect(c.fr.trim().length).toBeGreaterThan(0)
      expect(typeof c.en).toBe('string')
      expect(c.en.trim().length).toBeGreaterThan(0)
    }
  })
})

describe('getCountryByCode', () => {
  it('returns the correct country for a known code', () => {
    const be = getCountryByCode('BE')
    expect(be).not.toBeNull()
    expect(be.code).toBe('BE')
    expect(be.dial).toBe('+32')
  })

  it('returns the correct country for FR', () => {
    const fr = getCountryByCode('FR')
    expect(fr.en).toBe('France')
  })

  it('returns null for an unknown code', () => {
    expect(getCountryByCode('ZZ')).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(getCountryByCode('')).toBeNull()
  })
})

describe('getCountryByDial', () => {
  it('returns a country for +32', () => {
    const c = getCountryByDial('+32')
    expect(c).not.toBeNull()
    expect(c.dial).toBe('+32')
  })

  it('returns null for an unknown dial code', () => {
    expect(getCountryByDial('+999')).toBeNull()
  })

  it('returns first match when multiple countries share a dial code (e.g. +1)', () => {
    // Both US and CA share +1 — should return the first listed entry
    const c = getCountryByDial('+1')
    expect(c).not.toBeNull()
    expect(c.dial).toBe('+1')
  })
})
