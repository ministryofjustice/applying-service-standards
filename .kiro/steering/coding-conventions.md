# Coding Conventions

## JavaScript

- Use **CommonJS modules** (`require` / `module.exports`). Do not use ES module syntax.
- No TypeScript — this is a pure JavaScript project.
- No linter or formatter is configured. Follow existing code style.
- Use `const` for variables that are not reassigned, `let` otherwise. Avoid `var`.
- Use JSDoc comments for function documentation (see `contentController.js` for examples).

## Naming Conventions

- **Route handlers**: Prefix GET handlers with `g_`, e.g. `g_home`, `g_page`, `g_search`.
- **Files**: Use camelCase for JS files (e.g. `contentController.js`, `pageIndex.js`).
- **Views**: Use kebab-case for template files (e.g. `login-screen.html`, `cookie-policy.html`).
- **SCSS partials**: Prefix with underscore (e.g. `_banner.scss`, `_cards.scss`).

## Express Patterns

- Routes are defined in `app/routes/` and mounted in `index.js`.
- Controllers live in `app/controllers/` and export handler functions.
- Middleware lives in the root `middleware/` directory for shared concerns.
- Auth-specific middleware lives in `app/auth/middleware`.

## Templates (Nunjucks)

- Templates use `.html` file extension, not `.njk`.
- Use template inheritance: `{% extends "layouts/..." %}` with content blocks.
- Use GOV.UK component macros: `{% from 'govuk/components/.../macro.njk' import ... %}`.
- Use DfE frontend component macros where available.
- CSS class naming follows GOV.UK patterns: `govuk-*` for GOV.UK components, `dfe-*` for DfE-specific styles.

## Error Handling

- Catch errors in async controllers and log with `console.error`.
- Return appropriate HTTP status codes (404, 500).
- Render `error.html` for error pages.

## Environment Variables

- All configuration is via environment variables (see `.env.example`).
- Never commit `.env` — it is gitignored.
- Use `process.env.VAR_NAME` with fallback defaults where appropriate.
