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

vi.mock('connect-redis', () => ({
  RedisStore: class MockRedisStore { constructor () {} }
}))

vi.mock('express-session', () => {
  const fn = vi.fn(() => (req, res, next) => next())
  return { default: fn, __esModule: false }
})

const { isAuthenticated } = require('../../../app/auth/middleware')

function createMockRes () {
  const res = {}
  res.redirect = vi.fn().mockReturnValue(res)
  return res
}

describe('isAuthenticated middleware', () => {
  it('redirects to /auth/login-screen when session is not authenticated', () => {
    const req = { path: '/dashboard', session: {} }
    const res = createMockRes()
    const next = vi.fn()

    isAuthenticated(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith('/auth/login-screen')
    expect(next).not.toHaveBeenCalled()
  })

  it('calls next when session is authenticated', () => {
    const req = { path: '/dashboard', session: { isAuthenticated: true } }
    const res = createMockRes()
    const next = vi.fn()

    isAuthenticated(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.redirect).not.toHaveBeenCalled()
  })

  it('bypasses authentication and calls next for paths starting with /auth/', () => {
    const req = { path: '/auth/callback', session: {} }
    const res = createMockRes()
    const next = vi.fn()

    isAuthenticated(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.redirect).not.toHaveBeenCalled()
  })
})
