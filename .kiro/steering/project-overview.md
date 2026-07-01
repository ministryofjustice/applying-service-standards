# Project Overview

This is **Apply the Service Standard** — a Node.js web application for Justice Digital (Ministry of Justice) that provides guidance on applying the Government Service Standard.

## Tech Stack

- **Runtime**: Node.js 23 (Alpine Docker image)
- **Framework**: Express.js 4.x
- **Templating**: Nunjucks (.html file extension)
- **CMS**: Contentful (headless CMS, content fetched via Delivery API)
- **CSS**: SCSS compiled via Gulp, using GOV.UK Frontend 5.x and DfE Frontend 2.x design systems
- **JavaScript**: Vanilla JS (no framework), minified via Gulp/Uglify
- **Build Tool**: Gulp 5.x
- **Auth**: Microsoft Entra ID (Azure AD) via @azure/msal-node
- **Session**: express-session with Redis store (connect-redis + ioredis)
- **Search**: Lunr.js for client-side search indexing
- **Notifications**: GOV.UK Notify
- **Containerization**: Docker + Docker Compose
- **Deployment**: Kubernetes on Cloud Platform, GitHub Actions CI/CD

## Project Structure

```
index.js                    → Main Express app (routing, middleware, Nunjucks setup)
app/config.js               → App configuration from environment variables
app/auth-config.js          → MSAL/Entra ID configuration
app/auth/                   → Auth middleware and provider
app/routes/                 → Express routers
app/controllers/            → Route handlers
app/views/                  → Nunjucks templates
app/views/layouts/          → Base layout templates
app/views/partials/         → Reusable template partials
app/views/demo/             → Contentful-driven page templates
app/assets/                 → Source SCSS, JS, images
middleware/                 → Shared middleware (Contentful client, page indexing, validation)
public/                     → Built/compiled assets (Gulp output, gitignored)
deploy/                     → Kubernetes deployment manifests
bin/                        → Shell scripts (Docker entrypoint)
```

## Key Integrations

- **Contentful**: Content is managed in Contentful and fetched at request time. Content types include `homepage`, `basic`, and `landing` pages.
- **GOV.UK Notify**: Used for feedback email notifications.
- **Microsoft Entra ID**: OAuth2 login for internal users. Can be disabled with `OAUTH_SKIP_AUTH=true`.
- **Redis**: Used as session store in production. Docker Compose includes a Redis service.
