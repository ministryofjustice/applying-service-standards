/**
 * Creates a mock Contentful client with configurable getEntries responses.
 *
 * @param {Object} [responses={}] - Map of content_type to response objects.
 *   Each key is a content_type string, and each value is the resolved response
 *   (e.g. { items: [...], total: 1 }).
 * @returns {Object} A mock Contentful client with a vi.fn() getEntries method.
 *
 * @example
 * const client = createContentfulMock({
 *   homepage: { items: [{ fields: { title: 'Home' } }], total: 1 },
 *   basic: { items: [], total: 0 }
 * })
 */
function createContentfulMock(responses = {}) {
  return {
    getEntries: vi.fn().mockImplementation((params = {}) => {
      const contentType = params.content_type
      const response = responses[contentType] || { items: [], total: 0 }
      return Promise.resolve(response)
    })
  }
}

module.exports = { createContentfulMock }
