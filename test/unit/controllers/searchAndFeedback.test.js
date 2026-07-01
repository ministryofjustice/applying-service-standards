const request = require('supertest')

// Set up the contentful mock BEFORE loading the app
const mockGetEntries = vi.fn().mockResolvedValue({ items: [], total: 0 })
const contentfulModulePath = require.resolve('../../../middleware/contentful')

// Inject mock into require.cache before any app modules load it
delete require.cache[contentfulModulePath]
require.cache[contentfulModulePath] = {
  id: contentfulModulePath,
  filename: contentfulModulePath,
  loaded: true,
  exports: { getEntries: mockGetEntries }
}

// Mock ioredis, connect-redis, notifications-node-client for index.js
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
  RedisStore: class MockRedisStore {
    constructor() {}
    get(sid, cb) { cb && cb(null, null) }
    set(sid, session, cb) { cb && cb(null) }
    destroy(sid, cb) { cb && cb(null) }
    touch(sid, session, cb) { cb && cb(null) }
  }
}))

vi.mock('notifications-node-client', () => ({
  NotifyClient: class MockNotifyClient {
    constructor() {}
    sendEmail() { return Promise.resolve({}) }
  }
}))

// Now load the app — it will use our mocked contentful client
const app = require('../../../index')

describe('Search route handler (GET /search)', () => {
  beforeEach(() => {
    mockGetEntries.mockReset()
  })

  it('queries Contentful with the search term and returns 200 with rendered results', async () => {
    mockGetEntries.mockImplementation((params) => {
      if (params.content_type === 'basic' && params.query === 'accessibility') {
        return Promise.resolve({
          items: [{
            fields: {
              title: 'Accessibility Guidelines',
              slug: 'accessibility-guidelines',
              parent: null,
              description: 'Guidelines for making services accessible'
            }
          }],
          total: 1
        })
      }
      return Promise.resolve({ items: [], total: 0 })
    })

    const response = await request(app).get('/search?searchterm=accessibility')

    expect(response.status).toBe(200)
    expect(mockGetEntries).toHaveBeenCalledWith(
      expect.objectContaining({
        query: 'accessibility',
        content_type: 'basic'
      })
    )
  })
})

describe('Feedback route handler (POST /submit-feedback)', () => {
  it('returns 200 when feedback_form_input is provided', async () => {
    const response = await request(app)
      .post('/submit-feedback')
      .send({ feedback_form_input: 'Great service' })

    expect(response.status).toBe(200)
  })
})

describe('Helpful feedback route handler (POST /form-response/helpful)', () => {
  it('returns JSON with success true when response field is provided', async () => {
    const response = await request(app)
      .post('/form-response/helpful')
      .send({ response: 'yes' })
      .set('Content-Type', 'application/json')

    expect(response.status).toBe(200)
    expect(response.body).toEqual(
      expect.objectContaining({ success: true })
    )
  })
})
