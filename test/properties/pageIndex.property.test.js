// Feature: vulnerability-remediation, Property 6: Search result structure
// Feature: vulnerability-remediation, Property 7: Heading extraction scoping
const fc = require('fast-check')
const cheerio = require('cheerio')
const lunr = require('lunr')

// Mock page-index-additions to isolate tests
vi.mock('../../middleware/page-index-additions', () => ({
  additionalIndices: {},
  alternativeSpelling: {},
  indexBlacklist: []
}))

// Mock axios since PageIndex requires it
vi.mock('axios')

const PageIndex = require('../../middleware/pageIndex')

/**
 * Validates: Requirements 7.1
 *
 * Property 6: For any set of indexed documents and any matching search query,
 * every result object returned by PageIndex.search() contains the fields:
 * url, title, h2, h3, description, and extra.
 */
describe('Property 6: Search result structure', () => {
  const docGen = fc.record({
    title: fc.string({ minLength: 3, maxLength: 50 }),
    url: fc.string({ minLength: 1, maxLength: 30 }).map(s => '/' + s.replace(/[^a-z0-9-]/gi, '')),
    h2Text: fc.string({ minLength: 1, maxLength: 30 }),
    h3Text: fc.string({ minLength: 1, maxLength: 30 }),
    description: fc.string({ minLength: 1, maxLength: 100 })
  })

  it('every search result contains url, title, h2, h3, description, and extra fields', () => {
    fc.assert(
      fc.property(
        fc.array(docGen, { minLength: 1, maxLength: 5 }),
        (docs) => {
          const pageIndex = new PageIndex({})

          // Index each generated document
          docs.forEach((doc) => {
            const html = `<html><head><title>${doc.title}</title></head><body><div id="main-content"><h2>${doc.h2Text}</h2><h3>${doc.h3Text}</h3></div></body></html>`
            const $ = cheerio.load(html)
            pageIndex.indexPageNormal($, doc.url, doc.description)
          })

          // Build lunr index
          pageIndex.index = lunr((builder) => {
            builder.ref('url')
            builder.field('title')
            builder.field('h1')
            builder.field('h2')
            builder.field('h3')
            builder.field('extra')
            pageIndex.docs.forEach((d) => builder.add(d))
          })

          // Use the title of the first doc as the search query
          const query = docs[0].title
          const results = pageIndex.search(query)

          // Every result must have all required fields
          const requiredFields = ['url', 'title', 'h2', 'h3', 'description', 'extra']
          return results.every((result) =>
            requiredFields.every((field) => Object.prototype.hasOwnProperty.call(result, field))
          )
        }
      ),
      { numRuns: 100 }
    )
  })
})

/**
 * Validates: Requirements 7.4
 *
 * Property 7: For any HTML document, parsePageHeadings only returns headings
 * within #main-content. Headings outside #main-content never appear in the results.
 */
describe('Property 7: Heading extraction scoping', () => {
  // Generate safe heading text (alphanumeric + spaces, no HTML special chars)
  const headingTextGen = fc.stringMatching(/^[a-zA-Z0-9 ]{1,20}$/)

  const htmlGen = fc.record({
    outsideHeadings: fc.array(headingTextGen, { minLength: 0, maxLength: 3 }),
    insideHeadings: fc.array(headingTextGen, { minLength: 0, maxLength: 5 })
  })

  it('parsePageHeadings only returns headings within #main-content', () => {
    fc.assert(
      fc.property(htmlGen, ({ outsideHeadings, insideHeadings }) => {
        const pageIndex = new PageIndex({})

        // Build HTML with headings both inside and outside #main-content
        const outsideH2s = outsideHeadings.map((h) => `<h2>${h}</h2>`).join('')
        const insideH2s = insideHeadings.map((h) => `<h2>${h}</h2>`).join('')

        const html = `<html><body><header>${outsideH2s}</header><div id="main-content">${insideH2s}</div><footer>${outsideH2s}</footer></body></html>`
        const $ = cheerio.load(html)

        const result = pageIndex.parsePageHeadings($, 'h2')

        // Result length must equal inside headings count
        if (result.length !== insideHeadings.length) return false

        // Each result must match the trimmed inside heading text
        const matches = result.every((heading, i) => heading === insideHeadings[i].trim())

        // No outside-only heading should appear in the results (compare trimmed values)
        const trimmedInsideHeadings = insideHeadings.map((h) => h.trim())
        const outsideOnly = outsideHeadings.filter((h) => !trimmedInsideHeadings.includes(h.trim()))
        const noOutside = outsideOnly.every((h) => !result.includes(h.trim()))

        return matches && noOutside
      }),
      { numRuns: 100 }
    )
  })
})
