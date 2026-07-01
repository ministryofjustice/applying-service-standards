---
inclusion: fileMatch
fileMatchPattern: "**/*.html,**/*.scss"
---

# GOV.UK and DfE Design System Patterns

## Frontend Libraries

This project uses two design system libraries:
- **GOV.UK Frontend 5.x** — Core UK government design system
- **DfE Frontend 2.x** — Department for Education extensions

## Template Structure

Templates extend base layouts and use blocks:

```html
{% extends "layouts/main.html" %}

{% set pageName = "Page Title" %}
{% set pageDescription = "Description for meta tags" %}

{% block content %}
  <!-- Page content here -->
{% endblock %}
```

## Available Layouts

- `layouts/main.html` — Authenticated layout with full header/footer
- `layouts/main--logged-out.html` — Unauthenticated layout (login screen)
- `layouts/homepage.html` — Homepage-specific layout

## Component Usage

Import GOV.UK macros:
```html
{% from 'govuk/components/button/macro.njk' import govukButton %}
{% from 'govuk/components/input/macro.njk' import govukInput %}
```

Import DfE macros:
```html
{% from 'header/macro.njk' import header %}
```

## CSS Class Conventions

- `govuk-heading-xl`, `govuk-heading-l`, `govuk-heading-m` — Headings
- `govuk-body`, `govuk-body-l` — Body text
- `govuk-grid-row`, `govuk-grid-column-*` — Grid layout
- `govuk-width-container` — Page width container
- `govuk-main-wrapper` — Main content wrapper
- `govuk-link`, `govuk-link--no-visited-state` — Links
- `govuk-list` — Lists
- `govuk-!-margin-bottom-*` — Spacing utilities
- `dfe-page-hero` — DfE hero section
- `dfe-card`, `dfe-card-container` — DfE card components
- `dfe-card-link--header` — DfE card header links

## Accessibility

- All pages must include `lang="en"` on the `<html>` element.
- Main content area uses `role="main"` and `id="main-content"`.
- Use `govuk-visually-hidden` for screen reader-only text.
- Follow GOV.UK accessibility guidelines for all components.

## Static Assets

- CSS is served from `/assets/css/app.min.css`
- JS bundles: `/assets/js/all.min.js`, `/assets/js/dfefrontend.min.js`, `/assets/js/govuk/govuk-frontend.min.min.js`
- GOV.UK Frontend JS is initialised with `import { initAll } from '...'` as a module script.
