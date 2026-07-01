// Mock contentful to prevent real client creation when contentController is required
vi.mock('contentful', () => ({
  createClient: vi.fn(() => ({
    getEntries: vi.fn()
  }))
}))

const { cleanUpHtml, convertFilesize, getExtension, getLinkedContent, getSidebarNavigation } = require('../../../app/controllers/contentController')

describe('cleanUpHtml', () => {
  it('removes empty <p></p> tags', () => {
    expect(cleanUpHtml('<p></p>')).toBe('')
  })

  it('removes <p><br></p> sequences within content', () => {
    expect(cleanUpHtml('<p>Hello</p><p><br></p><p>World</p>')).toBe('Hello</p><p>World')
  })

  it('strips leading and trailing <p></p> wrapper tags', () => {
    expect(cleanUpHtml('<p>Hello world</p>')).toBe('Hello world')
  })

  it('trims whitespace and strips wrapper p tags', () => {
    expect(cleanUpHtml('  <p>content</p>  ')).toBe('content')
  })

  it('removes empty p tags while preserving content between paragraphs', () => {
    expect(cleanUpHtml('<p>First</p><p></p><p>Second</p>')).toBe('First</p><p>Second')
  })
})

describe('convertFilesize', () => {
  it('returns "1 MB" for 1048576 bytes', () => {
    expect(convertFilesize(1048576)).toBe('1 MB')
  })

  it('returns "1 kB" for 1024 bytes', () => {
    expect(convertFilesize(1024)).toBe('1 kB')
  })

  it('returns "500 B" for 500 bytes', () => {
    expect(convertFilesize(500)).toBe('500 B')
  })

  it('returns "1 GB" for 1073741824 bytes', () => {
    expect(convertFilesize(1073741824)).toBe('1 GB')
  })
})

describe('getExtension', () => {
  it('returns uppercase extension from a filename', () => {
    expect(getExtension('document.pdf')).toBe('PDF')
  })

  it('returns uppercase extension preserving already-uppercase input', () => {
    expect(getExtension('image.PNG')).toBe('PNG')
  })

  it('returns the last extension for multi-dot filenames', () => {
    expect(getExtension('archive.tar.gz')).toBe('GZ')
  })
})

describe('getLinkedContent', () => {
  it('returns linkedContent type with slug-based URL when entry has linkedContent field', () => {
    const entry = {
      fields: {
        linkedContent: {
          fields: { slug: 'test-page' }
        }
      }
    }

    expect(getLinkedContent(entry)).toEqual({
      type: 'linkedContent',
      url: '/test-page'
    })
  })

  it('returns linkedAsset type with url, filesize, filetype, and updatedDate when entry has linkedAsset field', () => {
    const entry = {
      fields: {
        linkedAsset: {
          sys: { updatedAt: '2024-01-15T10:00:00Z' },
          fields: {
            file: {
              url: '//assets.ctfassets.net/doc.pdf',
              details: { size: 1048576 }
            }
          }
        }
      }
    }

    expect(getLinkedContent(entry)).toEqual({
      type: 'linkedAsset',
      url: '//assets.ctfassets.net/doc.pdf',
      filesize: '1 MB',
      filetype: 'PDF',
      updatedDate: '15 January 2024'
    })
  })

  it('returns externalLink type with external URL when entry has externalLink field', () => {
    const entry = {
      fields: {
        externalLink: 'https://example.com/resource'
      }
    }

    expect(getLinkedContent(entry)).toEqual({
      type: 'externalLink',
      url: 'https://example.com/resource'
    })
  })
})

describe('getSidebarNavigation', () => {
  it('returns array of { title, slug } objects for flat links', () => {
    const nav = {
      fields: {
        links: [
          { fields: { title: 'Service standard', slug: 'service-standard' } },
          { fields: { title: 'User research', slug: 'user-research' } }
        ]
      }
    }

    expect(getSidebarNavigation(nav)).toEqual([
      { title: 'Service standard', slug: 'service-standard' },
      { title: 'User research', slug: 'user-research' }
    ])
  })

  it('returns objects with heading and sublinks array for grouped links', () => {
    const nav = {
      fields: {
        links: [
          {
            fields: {
              heading: 'Standards',
              links: [
                { fields: { title: 'Standard 1', slug: 'standard-1' } },
                { fields: { title: 'Standard 2', slug: 'standard-2' } }
              ]
            }
          }
        ]
      }
    }

    expect(getSidebarNavigation(nav)).toEqual([
      {
        heading: 'Standards',
        sublinks: [
          { title: 'Standard 1', slug: 'standard-1' },
          { title: 'Standard 2', slug: 'standard-2' }
        ]
      }
    ])
  })
})
