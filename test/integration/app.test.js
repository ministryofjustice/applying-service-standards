const request = require('supertest')

// Inject express-session mock into require.cache.
// vi.mock() does not reliably intercept express-session in this Vitest/CJS setup,
// so we use require.cache injection which works with the CJS module system.
const expressSessionPath = require.resolve('express-session')
const mockSessionFn = vi.fn((config) => {
  return (req, res, next) => next()
})
mockSessionFn.Store = class Store {}
mockSessionFn.Cookie = class Cookie {}
mockSessionFn.Session = class Session {}
mockSessionFn.MemoryStore = class MemoryStore {}

delete require.cache[expressSessionPath]
require.cache[expressSessionPath] = {
  id: expressSessionPath,
  filename: expressSessionPath,
  loaded: true,
  exports: mockSessionFn
}

// Mock other external dependencies via vi.mock
vi.mock('ioredis', () => {
  const MockRedis = vi.fn(() => ({
    on: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    quit: vi.fn(),
    status: 'ready'
  }))
  return { default: MockRedis, __esModule: false }
})

vi.mock('contentful', () => ({
  createClient: vi.fn(() => ({
    getEntries: vi.fn().mockResolvedValue({ items: [], total: 0 })
  }))
}))

vi.mock('notifications-node-client', () => ({
  NotifyClient: class MockNotifyClient {
    constructor() {}
    sendEmail() { return Promise.resolve({}) }
  }
}))

describe('Security configuration', () => {
  describe('Helmet middleware', () => {
    it('applies Helmet security headers to responses', async () => {
      const app = require('../../index')
      const res = await request(app).get('/robots.txt')

      // Helmet sets various security headers
      expect(res.headers['x-content-type-options']).toBe('nosniff')
      expect(res.headers).toHaveProperty('x-frame-options')
      expect(res.headers).toHaveProperty('x-dns-prefetch-control')
    })
  })

  describe('Auth disabled (OAUTH_SKIP_AUTH is "true")', () => {
    it('does not set trust proxy when auth is disabled', () => {
      const app = require('../../index')
      expect(app.get('trust proxy')).not.toBe(1)
    })

    it('does not apply session middleware when auth is disabled', async () => {
      const app = require('../../index')
      const res = await request(app).get('/robots.txt')

      // No session cookie should be set when auth is disabled
      const setCookieHeader = res.headers['set-cookie']
      const hasSessionCookie = setCookieHeader
        ? setCookieHeader.some((c) => c.includes('connect.sid'))
        : false
      expect(hasSessionCookie).toBe(false)
    })
  })
})
