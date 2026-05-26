import { describe, it, expect, vi, beforeEach } from 'vitest'

// vi.hoisted() runs before vi.mock() hoisting — lets us share the spy reference
const mockSend = vi.hoisted(() => vi.fn())

vi.mock('resend', () => ({
  // Use function keyword so `new Resend()` works correctly
  Resend: vi.fn(function () {
    this.emails = { send: mockSend }
  }),
}))

vi.mock('../_kv.js', () => ({
  cors:             vi.fn(),
  getTenant:        vi.fn().mockResolvedValue(null), // no tenant
  createSession:    vi.fn(),
  validateSession:  vi.fn(),
  saveTenantKV:     vi.fn(),
  getCredentials:   vi.fn(),
  saveCredentials:  vi.fn(),
  encrypt:          vi.fn(),
  sha256:           vi.fn(),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────
function makeReq(method = 'POST', body = {}) {
  return { method, body, headers: {} }
}

function makeRes() {
  const res = { _status: 200, _json: null }
  res.status = vi.fn(code => { res._status = code; return res })
  res.json   = vi.fn(data  => { res._json   = data; return res })
  res.end    = vi.fn(()    => res)
  return res
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('POST /api/contact', () => {
  let handler

  beforeEach(async () => {
    vi.resetModules()
    mockSend.mockReset()
    // Set RESEND_API_KEY so the handler doesn't bail with 500
    process.env.RESEND_API_KEY = 'test_key'
    const mod = await import('../contact.js')
    handler = mod.default
  })

  describe('method guard', () => {
    it('returns 405 for GET requests', async () => {
      const res = makeRes()
      await handler(makeReq('GET'), res)
      expect(res.status).toHaveBeenCalledWith(405)
      expect(res._json.error).toMatch(/method/i)
    })

    it('returns 200 for OPTIONS (CORS preflight)', async () => {
      const res = makeRes()
      await handler(makeReq('OPTIONS'), res)
      expect(res.status).toHaveBeenCalledWith(200)
    })
  })

  describe('input validation', () => {
    it('returns 400 when name is missing', async () => {
      const res = makeRes()
      await handler(makeReq('POST', { email: 'a@b.com', message: 'Hello' }), res)
      expect(res._status).toBe(400)
      expect(res._json.error).toBeTruthy()
    })

    it('returns 400 when email is missing', async () => {
      const res = makeRes()
      await handler(makeReq('POST', { name: 'Alice', message: 'Hello' }), res)
      expect(res._status).toBe(400)
    })

    it('returns 400 when email is malformed', async () => {
      const res = makeRes()
      await handler(makeReq('POST', { name: 'Alice', email: 'notanemail', message: 'Hello' }), res)
      expect(res._status).toBe(400)
    })

    it('returns 400 when message is missing', async () => {
      const res = makeRes()
      await handler(makeReq('POST', { name: 'Alice', email: 'a@b.com' }), res)
      expect(res._status).toBe(400)
    })

    it('returns 400 when name is empty whitespace', async () => {
      const res = makeRes()
      await handler(makeReq('POST', { name: '   ', email: 'a@b.com', message: 'Hello' }), res)
      expect(res._status).toBe(400)
    })
  })

  describe('missing configuration', () => {
    it('returns 500 when RESEND_API_KEY is not set', async () => {
      delete process.env.RESEND_API_KEY
      const res = makeRes()
      await handler(
        makeReq('POST', { name: 'Alice', email: 'a@b.com', message: 'Hello there' }),
        res,
      )
      expect(res._status).toBe(500)
      expect(res._json.error).toMatch(/not configured|service/i)
    })
  })

  describe('successful send', () => {
    const validBody = { name: 'Alice', email: 'alice@test.com', message: 'Bonjour !' }

    it('returns 200 with { ok: true } on success', async () => {
      mockSend.mockResolvedValue({ id: 'msg_123' })
      const res = makeRes()
      await handler(makeReq('POST', validBody), res)
      expect(res._status).toBe(200)
      expect(res._json.ok).toBe(true)
    })

    it('calls Resend with the sender name and reply-to email', async () => {
      mockSend.mockResolvedValue({ id: 'msg_123' })
      const res = makeRes()
      await handler(makeReq('POST', validBody), res)
      expect(mockSend).toHaveBeenCalledOnce()
      const call = mockSend.mock.calls[0][0]
      expect(call.reply_to).toBe('alice@test.com')
      expect(call.subject).toContain('Alice')
    })

    it('includes the message body in the HTML email', async () => {
      mockSend.mockResolvedValue({ id: 'msg_123' })
      const res = makeRes()
      await handler(makeReq('POST', { ...validBody, message: 'Unique marker 9182' }), res)
      const html = mockSend.mock.calls[0][0].html
      expect(html).toContain('Unique marker 9182')
    })

    it('strips HTML tags from user input (XSS prevention)', async () => {
      mockSend.mockResolvedValue({ id: 'msg_123' })
      const res = makeRes()
      await handler(
        makeReq('POST', { name: '<script>evil()</script>', email: 'a@b.com', message: 'test message here' }),
        res,
      )
      const html = mockSend.mock.calls[0][0].html
      expect(html).not.toContain('<script>')
    })

    it('uses French language labels when lang is fr (default)', async () => {
      mockSend.mockResolvedValue({ id: 'msg_123' })
      const res = makeRes()
      await handler(makeReq('POST', { ...validBody, lang: 'fr' }), res)
      const html = mockSend.mock.calls[0][0].html
      expect(html).toContain('Nouveau message de contact')
    })

    it('uses English language labels when lang is en', async () => {
      mockSend.mockResolvedValue({ id: 'msg_123' })
      const res = makeRes()
      await handler(makeReq('POST', { ...validBody, lang: 'en' }), res)
      const html = mockSend.mock.calls[0][0].html
      expect(html).toContain('New contact message')
    })
  })

  describe('Resend failure', () => {
    it('returns 500 when Resend throws', async () => {
      mockSend.mockRejectedValue(new Error('Rate limited'))
      const res = makeRes()
      await handler(
        makeReq('POST', { name: 'Alice', email: 'a@b.com', message: 'Hello' }),
        res,
      )
      expect(res._status).toBe(500)
      expect(res._json.error).toMatch(/failed to send/i)
    })
  })
})
