// Feature: vulnerability-remediation, Property 2: Auth path bypass
const fc = require('fast-check')

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

const { isAuthenticated } = require('../../app/auth/middleware')

/**
 * Validates: Requirements 3.5
 *
 * Property: For any request path starting with "/auth/" and any session state
 * (authenticated or not), isAuthenticated always calls next() without calling res.redirect.
 */
describe('Property: Auth path bypass', () => {
  const authPathGen = fc.string().map(s => '/auth/' + s)
  const sessionGen = fc.oneof(
    fc.constant({}),
    fc.constant({ isAuthenticated: true }),
    fc.constant({ isAuthenticated: false }),
    fc.constant({ isAuthenticated: undefined })
  )

  function createMockRes () {
    const res = {}
    res.redirect = vi.fn().mockReturnValue(res)
    return res
  }

  it('always calls next() and never redirects for any /auth/ path regardless of session state', () => {
    fc.assert(
      fc.property(authPathGen, sessionGen, (path, session) => {
        const req = { path, session }
        const res = createMockRes()
        const next = vi.fn()

        isAuthenticated(req, res, next)

        // Requirement 3.5: paths starting with /auth/ always bypass authentication
        return (
          next.mock.calls.length === 1 &&
          res.redirect.mock.calls.length === 0
        )
      }),
      { numRuns: 100 }
    )
  })
})
