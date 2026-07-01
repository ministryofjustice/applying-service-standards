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

describe('Homepage route handler (GET /)', () => {
  beforeEach(() => {
    mockGetEntries.mockReset()
  })

  it('calls Contentful with content_type "homepage" and renders the homepage template with 200 status', async () => {
    mockGetEntries.mockImplementation((params) => {
      if (params.content_type === 'homepage') {
        return Promise.resolve({
          items: [{
            fields: {
              title: 'Apply the Service Standard',
              description: {
                nodeType: 'document',
                data: {},
                content: [{
                  nodeType: 'paragraph',
                  data: {},
                  content: [{
                    nodeType: 'text',
                    value: 'Guidance for teams.',
                    marks: [],
                    data: {}
                  }]
                }]
              },
              sidebarBlocks: [{
                fields: {
                  heading: 'Service assessments',
                  description: 'Learn about service assessments',
                  linkedContent: {
                    fields: { slug: 'service-assessments' }
                  }
                }
              }]
            }
          }],
          total: 1
        })
      }
      if (params.content_type === 'basic') {
        return Promise.resolve({
          items: [{
            fields: {
              title: 'Standard 1',
              slug: 'standard-1',
              pageType: 'Service standard',
              description: 'Test description',
              content: {
                nodeType: 'document',
                data: {},
                content: [{
                  nodeType: 'paragraph',
                  data: {},
                  content: [{
                    nodeType: 'text',
                    value: 'Content',
                    marks: [],
                    data: {}
                  }]
                }]
              },
              serviceStandard: {
                fields: {
                  name: 'Understand users and their needs',
                  standardNumber: 1,
                  relevantJobRoles: [],
                  serviceManualUrl: 'https://example.com'
                }
              }
            }
          }],
          total: 1
        })
      }
      return Promise.resolve({ items: [], total: 0 })
    })

    const response = await request(app).get('/')

    expect(response.status).toBe(200)
    expect(response.text).toContain('Apply the Service Standard')
    // Verify the client was called with the homepage content_type
    expect(mockGetEntries).toHaveBeenCalledWith(
      expect.objectContaining({ content_type: 'homepage' })
    )
  })

  it('returns 500 without exposing error details when Contentful client throws', async () => {
    mockGetEntries.mockRejectedValue(new Error('Contentful API unavailable'))

    const response = await request(app).get('/')

    expect(response.status).toBe(500)
    expect(response.text).toContain('An error occurred while fetching the data.')
    expect(response.text).not.toContain('Contentful API unavailable')
  })
})

describe('Content page route handler (GET /:slug)', () => {
  beforeEach(() => {
    mockGetEntries.mockReset()
  })

  it('renders the basic page template with 200 when slug matches a basic content type', async () => {
    mockGetEntries.mockImplementation((params) => {
      if (params.content_type === 'basic') {
        return Promise.resolve({
          items: [{
            fields: {
              title: 'Test Basic Page',
              slug: 'test-basic-page',
              pageType: 'Service standard',
              description: 'A basic page description',
              content: {
                nodeType: 'document',
                data: {},
                content: [{
                  nodeType: 'paragraph',
                  data: {},
                  content: [{
                    nodeType: 'text',
                    value: 'Basic page content here.',
                    marks: [],
                    data: {}
                  }]
                }]
              },
              serviceStandard: {
                fields: {
                  name: 'Understand users and their needs',
                  standardNumber: 1,
                  relevantJobRoles: ['User researcher'],
                  serviceManualUrl: 'https://example.com/standard-1'
                }
              }
            }
          }],
          total: 1
        })
      }
      return Promise.resolve({ items: [], total: 0 })
    })

    const response = await request(app).get('/test-basic-page')

    expect(response.status).toBe(200)
    expect(response.text).toContain('Test Basic Page')
    expect(mockGetEntries).toHaveBeenCalledWith(
      expect.objectContaining({ content_type: 'basic', 'fields.slug': 'test-basic-page' })
    )
  })

  it('renders the landing page template with 200 when slug matches landing but not basic', async () => {
    mockGetEntries.mockImplementation((params) => {
      if (params.content_type === 'basic') {
        return Promise.resolve({ items: [], total: 0 })
      }
      if (params.content_type === 'landing') {
        return Promise.resolve({
          items: [{
            fields: {
              title: 'Test Landing Page',
              slug: 'test-landing-page',
              description: {
                nodeType: 'document',
                data: {},
                content: [{
                  nodeType: 'paragraph',
                  data: {},
                  content: [{
                    nodeType: 'text',
                    value: 'Landing page description.',
                    marks: [],
                    data: {}
                  }]
                }]
              }
            }
          }],
          total: 1
        })
      }
      return Promise.resolve({ items: [], total: 0 })
    })

    const response = await request(app).get('/test-landing-page')

    expect(response.status).toBe(200)
    expect(response.text).toContain('Test Landing Page')
    expect(mockGetEntries).toHaveBeenCalledWith(
      expect.objectContaining({ content_type: 'basic', 'fields.slug': 'test-landing-page' })
    )
    expect(mockGetEntries).toHaveBeenCalledWith(
      expect.objectContaining({ content_type: 'landing', 'fields.slug': 'test-landing-page' })
    )
  })

  it('returns 500 when slug matches neither basic nor landing content type', async () => {
    mockGetEntries.mockImplementation(() => {
      return Promise.resolve({ items: [], total: 0 })
    })

    const response = await request(app).get('/nonexistent-page')

    expect(response.status).toBe(500)
    expect(response.text).toContain('An error occurred while fetching the data.')
  })

  it('returns 500 without exposing error details when Contentful client throws', async () => {
    mockGetEntries.mockRejectedValue(new Error('Contentful connection timeout'))

    const response = await request(app).get('/any-page')

    expect(response.status).toBe(500)
    expect(response.text).toContain('An error occurred while fetching the data.')
    expect(response.text).not.toContain('Contentful connection timeout')
  })
})
