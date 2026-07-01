---
inclusion: fileMatch
fileMatchPattern: "**/controllers/content*,**/routes/contentful*,**/middleware/contentful*"
---

# Contentful Integration Patterns

## Client Setup

The Contentful client is configured in `middleware/contentful.js` using environment variables:
- `CONTENTFUL_SPACE_ID` — The Contentful space identifier
- `CONTENTFUL_DELIVERY_API_TOKEN` — The Delivery API access token

## Content Types

The CMS uses these content types:
- **homepage** — Single entry for the homepage, contains sidebar blocks
- **basic** — Standard content pages (with pageType variants: "Service standard", "Delivery phase")
- **landing** — Landing/index pages with table of contents and sidebar navigation

## Controller Pattern

Content controllers in `app/controllers/contentController.js` follow this pattern:

1. Use `client.getEntries()` with `content_type` and field filters.
2. Set `include: 4` for deep reference resolution.
3. Extract and transform fields using helper functions.
4. Render appropriate template from `app/views/demo/`.

## Helper Functions

- `cleanUpHtml(html)` — Strips unnecessary `<p>` tags from rich text output
- `convertFilesize(size)` — Converts bytes to human-readable string
- `getExtension(url)` — Extracts file extension from URL
- `getLinkedContent(entry)` — Resolves linked content, assets, or external URLs
- `getSidebarNavigation(nav)` — Builds sidebar nav structure from navigation entries
- `getTableOfContents(toc)` — Builds table of contents from entries
- `getServiceStandardFields(entry)` — Extracts service standard metadata
- `getDeliveryPhaseFields(entry)` — Extracts delivery phase metadata
- `getHomepageFields(entry)` — Builds homepage data structure
- `getBasicPageFields(entry, pageType)` — Builds basic page data
- `getLandingPageFields(entry)` — Builds landing page data

## Rich Text Rendering

Rich text fields from Contentful are converted to HTML using `@contentful/rich-text-html-renderer`:
```javascript
const { documentToHtmlString } = require('@contentful/rich-text-html-renderer');
const html = cleanUpHtml(documentToHtmlString(entry.fields.content));
```

## Routing

The content router (`app/routes/contentful.js`) handles:
- `GET /` → Homepage (`contentController.g_home`)
- `GET /:parent?/:slug` → Dynamic pages (`contentController.g_page`)
- `GET /search` → Search (`searchController.g_search`)
