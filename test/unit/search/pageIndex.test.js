const cheerio = require('cheerio')
const lunr = require('lunr')

// Mock page-index-additions to isolate unit tests
vi.mock('../../../middleware/page-index-additions', () => ({
  additionalIndices: {},
  alternativeSpelling: {},
  indexBlacklist: []
}))

// Mock axios since PageIndex requires it (but we don't use it in these tests)
vi.mock('axios')

const PageIndex = require('../../../middleware/pageIndex')

describe('PageIndex', () => {
  let pageIndex

  beforeEach(() => {
    pageIndex = new PageIndex({})
  })

  describe('indexPageNormal', () => {
    it('stores a document with correct url, title, h2, h3, description, and extra fields', () => {
      const html = `
        <html>
          <head><title>Test Page Title</title></head>
          <body>
            <div id="main-content">
              <h2>Section One</h2>
              <h2>Section Two</h2>
              <h3>Sub Section A</h3>
            </div>
          </body>
        </html>
      `
      const $ = cheerio.load(html)
      const url = '/test-page'
      const description = 'A test page description'

      pageIndex.indexPageNormal($, url, description)

      expect(pageIndex.docs).toHaveLength(1)

      const doc = pageIndex.docs[0]
      expect(doc).toHaveProperty('url', '/test-page')
      expect(doc).toHaveProperty('title', 'Test Page Title')
      expect(doc).toHaveProperty('h2')
      expect(doc.h2).toContain('Section One')
      expect(doc.h2).toContain('Section Two')
      expect(doc).toHaveProperty('h3')
      expect(doc.h3).toContain('Sub Section A')
      expect(doc).toHaveProperty('description', 'A test page description')
      expect(doc).toHaveProperty('extra', '')
    })
  })

  describe('parsePageHeadings', () => {
    it('only extracts headings from within #main-content', () => {
      const html = `
        <html>
          <body>
            <header>
              <h2>Header Heading</h2>
            </header>
            <div id="main-content">
              <h2>Main Heading One</h2>
              <h2>Main Heading Two</h2>
            </div>
            <footer>
              <h2>Footer Heading</h2>
            </footer>
          </body>
        </html>
      `
      const $ = cheerio.load(html)

      const headings = pageIndex.parsePageHeadings($, 'h2')

      expect(headings).toEqual(['Main Heading One', 'Main Heading Two'])
      expect(headings).not.toContain('Header Heading')
      expect(headings).not.toContain('Footer Heading')
    })
  })

  describe('search', () => {
    beforeEach(() => {
      // Index some test pages
      const page1Html = `
        <html>
          <head><title>Accessibility Guidelines</title></head>
          <body>
            <div id="main-content">
              <h2>WCAG Compliance</h2>
              <h3>Colour Contrast</h3>
            </div>
          </body>
        </html>
      `
      const page2Html = `
        <html>
          <head><title>User Research Methods</title></head>
          <body>
            <div id="main-content">
              <h2>Interviews</h2>
              <h3>Survey Design</h3>
            </div>
          </body>
        </html>
      `

      pageIndex.indexPageNormal(cheerio.load(page1Html), '/accessibility', 'Accessibility page')
      pageIndex.indexPageNormal(cheerio.load(page2Html), '/user-research', 'User research page')

      // Build the lunr index
      pageIndex.index = lunr((builder) => {
        builder.ref('url')
        builder.field('title')
        builder.field('h1')
        builder.field('h2')
        builder.field('h3')
        builder.field('extra')
        pageIndex.docs.forEach((doc) => builder.add(doc))
      })
    })

    it('returns result objects containing url, title, h2, h3, description, and extra fields for a matching query', () => {
      const results = pageIndex.search('accessibility')

      expect(results.length).toBeGreaterThan(0)

      results.forEach((result) => {
        expect(result).toHaveProperty('url')
        expect(result).toHaveProperty('title')
        expect(result).toHaveProperty('h2')
        expect(result).toHaveProperty('h3')
        expect(result).toHaveProperty('description')
        expect(result).toHaveProperty('extra')
      })
    })

    it('returns an empty array for an empty query', () => {
      const results = pageIndex.search('')

      expect(results).toEqual([])
    })

    it('returns an empty array for a non-matching query', () => {
      const results = pageIndex.search('xyznonexistentterm123')

      expect(results).toEqual([])
    })
  })
})
