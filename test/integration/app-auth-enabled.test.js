// Security configuration tests with auth ENABLED and HTTPS base URL.
// Environment variables are set BEFORE any app modules load since
// auth-config.js reads them at require time.

process.env.OAUTH_SKIP_AUTH = 'false'
process.env.OAUTH_CLIENT_ID = 'test-client-id'
process.env.OAUTH_TENANT_ID = 'test-tenant-id'
process.env.OAUTH_CLIENT_SECRET = 'test-client-secret'
process.env.EXPRESS_SESSION_SECRET = 'test-session-secret'
process.env.BASE_URL = 'https://example.com'

// Inject express-session mock via require.cache (vi.mock does not intercept it)
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

// Mock other external dependencies
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

vi.mock('@azure/msal-node', () => ({
  CryptoProvider: class MockCryptoProvider {
    constructor() {}
    base64Encode(str) { return Buffer.from(str).toString('base64') }
    base64Decode(str) { return Buffer.from(str, 'base64').toString() }
    generatePkceCodes() { return Promise.resolve({ verifier: 'v', challenge: 'c' }) }
  },
  ConfidentialClientApplication: class MockConfidentialClientApplication {
    constructor() {}
    getAuthCodeUrl() { return Promise.resolve('https://login.example.com') }
    acquireTokenByCode() { return Promise.resolve({}) }
    getTokenCache() { return { serialize: () => '', deserialize: () => {} } }
  },
  ResponseMode: { FORM_POST: 'form_post' },
}))

describe('Security configuration with auth enabled (HTTPS base URL)', () => {
  it('sets trust proxy to 1 when auth is enabled', () => {
    const app = require('../../index')
    expect(app.get('trust proxy')).toBe(1)
  })

  it('configures session cookies with httpOnly: true', () => {
    require('../../index')

    expect(mockSessionFn).toHaveBeenCalled()
    const sessionConfig = mockSessionFn.mock.calls[0][0]
    expect(sessionConfig.cookie.httpOnly).toBe(true)
  })

  it('configures session cookies with secure: true when BASE_URL starts with "https://"', () => {
    require('../../index')

    expect(mockSessionFn).toHaveBeenCalled()
    const sessionConfig = mockSessionFn.mock.calls[0][0]
    expect(sessionConfig.cookie.secure).toBe(true)
  })
})
