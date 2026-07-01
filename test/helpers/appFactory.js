const { createContentfulMock } = require('./contentfulMock')

// Module-level mocks — Vitest hoists vi.mock() calls from test files.
// When test files require this module, the mocks below must be declared
// in the test file itself (or via vi.mock with factory in the test).
// This module provides setupAppMocks() to be called from tests after
// they declare their own vi.mock() calls, and createTestApp() to get the app.

// Note: vi.mock() calls are hoisted to the top of the TEST file that contains
// them. For the factory pattern, test files should call vi.mock() at their
// top level and then use createTestApp() to get the app instance.

/**
 * Registers all necessary module mocks for the Express app.
 * Call this at the TOP LEVEL of your test file (not inside describe/it blocks).
 * Vitest will hoist these calls automatically.
 *
 * @example
 * // In your test file:
 * const { setupMocks, createTestApp } = require('../helpers/appFactory')
 * setupMocks()
 *
 * describe('my test', () => { ... })
 */
function setupMocks() {
  // Mock ioredis — auth middleware calls `new IORedis({...})`
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

  // Mock connect-redis — auth middleware destructures { RedisStore }
  vi.mock('connect-redis', () => ({
    RedisStore: class MockRedisStore {
      constructor() {}
      get(sid, cb) { cb && cb(null, null) }
      set(sid, session, cb) { cb && cb(null) }
      destroy(sid, cb) { cb && cb(null) }
      touch(sid, session, cb) { cb && cb(null) }
    }
  }))

  // Mock contentful — middleware/contentful.js calls contentful.createClient()
  vi.mock('contentful', () => ({
    createClient: vi.fn(() => ({
      getEntries: vi.fn().mockResolvedValue({ items: [], total: 0 })
    }))
  }))

  // Mock notifications-node-client — index.js creates new NotifyClient()
  vi.mock('notifications-node-client', () => ({
    NotifyClient: class MockNotifyClient {
      constructor() {}
      sendEmail() {
        return Promise.resolve({})
      }
    }
  }))
}

/**
 * Creates an isolated Express app instance with mocked external dependencies.
 * Requires that setupMocks() has been called at the top level of the test file.
 *
 * @param {Object} [options={}] - Configuration options.
 * @param {Object} [options.contentfulResponses={}] - Map of content_type to response
 *   objects passed to createContentfulMock. If provided, the contentful mock's
 *   getEntries will be reconfigured with these responses.
 * @returns {Object} The Express app instance (suitable for supertest).
 */
function createTestApp(options = {}) {
  const { contentfulResponses = {} } = options

  // If custom contentful responses are needed, update the mock client
  if (Object.keys(contentfulResponses).length > 0) {
    const mockClient = createContentfulMock(contentfulResponses)
    const contentful = require('contentful')
    contentful.createClient.mockReturnValue(mockClient)
  }

  // Require the app — mocks are already in place via vi.mock() hoisting
  const app = require('../../index')

  return app
}

module.exports = { setupMocks, createTestApp }
