// Feature: vulnerability-remediation, Property 3: HTML cleanup invariants
// Feature: vulnerability-remediation, Property 4: File size format
// Feature: vulnerability-remediation, Property 5: Extension extraction
const fc = require('fast-check')

vi.mock('contentful', () => ({
  createClient: vi.fn(() => ({
    getEntries: vi.fn()
  }))
}))

const { cleanUpHtml, convertFilesize, getExtension } = require('../../app/controllers/contentController')

/**
 * Validates: Requirements 4.1
 *
 * Property 3: For any HTML string, cleanUpHtml output:
 * - Never contains <p></p> or <p><br></p>
 * - Never starts with <p> (as a wrapper)
 * - Never ends with </p> (as a wrapper)
 * - Has no leading/trailing whitespace
 */
describe('Property 3: HTML cleanup invariants', () => {
  it('output never contains empty paragraph tags, never starts/ends with wrapper <p>/<\/p>, and has no leading/trailing whitespace', () => {
    fc.assert(
      fc.property(fc.string(), (html) => {
        const result = cleanUpHtml(html)

        // Never contains empty <p></p>
        const hasEmptyP = /<p>\s*<\/p>/.test(result)

        // Never contains <p><br></p> variants
        const hasBrP = /<p>(\s*<br\s*\/?>\s*)<\/p>/.test(result)

        // Never starts with <p> as wrapper
        const startsWithP = /^\s*<p>/.test(result)

        // Never ends with </p> as wrapper
        const endsWithP = /<\/p>\s*$/.test(result)

        // Has no leading/trailing whitespace
        const hasSurroundingWhitespace = result !== result.trim()

        return (
          !hasEmptyP &&
          !hasBrP &&
          !startsWithP &&
          !endsWithP &&
          !hasSurroundingWhitespace
        )
      }),
      { numRuns: 100 }
    )
  })
})

/**
 * Validates: Requirements 4.2
 *
 * Property 4: For any positive integer byte value, convertFilesize returns
 * a string matching the pattern "{number} {unit}" where unit is one of
 * B, kB, MB, GB, or TB.
 */
describe('Property 4: File size format', () => {
  it('output matches pattern "{number} {unit}" for all positive integers', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1099511627776 }),
        (size) => {
          const result = convertFilesize(size)
          const validUnits = ['B', 'kB', 'MB', 'GB', 'TB']
          const pattern = /^(\d+\.?\d*)\s+(B|kB|MB|GB|TB)$/
          const match = result.match(pattern)

          if (!match) return false

          const number = parseFloat(match[1])
          const unit = match[2]

          return number > 0 && validUnits.includes(unit)
        }
      ),
      { numRuns: 100 }
    )
  })
})

/**
 * Validates: Requirements 4.3
 *
 * Property 5: For any string containing at least one dot, getExtension returns
 * the substring after the last dot, uppercased.
 */
describe('Property 5: Extension extraction', () => {
  it('output is the substring after the last dot, uppercased, for all URLs with at least one dot', () => {
    fc.assert(
      fc.property(
        fc.tuple(fc.string(), fc.string({ minLength: 1 })).map(([prefix, ext]) => prefix + '.' + ext),
        (url) => {
          const result = getExtension(url)
          const expected = url.split('.').pop().toUpperCase()

          return result === expected
        }
      ),
      { numRuns: 100 }
    )
  })
})
