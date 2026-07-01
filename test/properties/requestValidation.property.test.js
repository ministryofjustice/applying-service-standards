// Feature: vulnerability-remediation, Property 1: Path traversal detection
const fc = require('fast-check')
const path = require('node:path')
const { validatePath } = require('../../middleware/request-validation')

/**
 * Validates: Requirements 3.1, 3.2
 *
 * Property: For any request path string, validatePath returns 400 if and only if
 * path.normalize(reqPath).includes('.."). Otherwise it calls next().
 */
describe('Property: Path traversal detection', () => {
  function createMockRes () {
    const res = {}
    res.status = vi.fn().mockReturnValue(res)
    res.send = vi.fn().mockReturnValue(res)
    return res
  }

  it('returns 400 iff normalised path contains ".."', () => {
    fc.assert(
      fc.property(fc.string(), (inputPath) => {
        const req = { path: inputPath }
        const res = createMockRes()
        const next = vi.fn()

        validatePath(req, res, next)

        const normalised = path.normalize(inputPath)
        const containsTraversal = normalised.includes('..')

        if (containsTraversal) {
          // Requirement 3.1: returns 400 and does not call next
          return (
            res.status.mock.calls.length === 1 &&
            res.status.mock.calls[0][0] === 400 &&
            res.send.mock.calls.length === 1 &&
            res.send.mock.calls[0][0] === 'Bad request' &&
            next.mock.calls.length === 0
          )
        } else {
          // Requirement 3.2: calls next and does not set status
          return (
            next.mock.calls.length === 1 &&
            res.status.mock.calls.length === 0 &&
            res.send.mock.calls.length === 0
          )
        }
      }),
      { numRuns: 100 }
    )
  })
})
