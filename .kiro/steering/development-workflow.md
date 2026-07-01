# Development Workflow

## Getting Started

1. Ensure Docker is installed.
2. Copy `.env.example` to `.env` (or run `make setup`).
3. Run `make run` to start the Docker containers.

## Running the App

| Command | Description |
|---------|-------------|
| `make run` / `make up` | Start Docker containers (app + Redis) |
| `make d-compose` | Start in detached mode |
| `make bash` | Open a shell inside the running container |
| `make down` | Stop containers |
| `make restart` | Restart the node container |
| `make clean` | Remove gitignored files (keeps .env and .idea) |

## Access Points

- **http://localhost:3000** — BrowserSync (hot reload)
- **http://localhost:3052** — Direct Express app
- **http://localhost:3001** — BrowserSync UI

## Asset Pipeline

Assets are compiled with Gulp:

- **SCSS** → `app/assets/scss/` compiled to `public/assets/css/*.min.css`
- **JavaScript** → `app/assets/js/` uglified to `public/assets/js/*.min.js`
- **Images** → `app/assets/images/` copied to `public/assets/images/`
- **Files** → `app/assets/files/` copied to `public/assets/files/`

Commands:
- `npm run build` — One-off production build (runs `gulp build`)
- `npm run dev` — Gulp watch + Nodemon for development (runs inside container)

## Docker

- Development uses multi-stage Dockerfile (`dev` target) with Nodemon.
- Production uses `build-prod` target with `npm prune --production`.
- Docker Compose mounts source directories for live reloading.
- Redis container (`bitnami/redis`) runs alongside the app.

## Production Testing Locally

```bash
make build-prod
make run-prod
```

## Authentication

- Set `OAUTH_SKIP_AUTH=true` in `.env` to bypass authentication locally.
- When auth is enabled, requires `OAUTH_CLIENT_ID`, `OAUTH_TENANT_ID`, `OAUTH_CLIENT_SECRET`, and `EXPRESS_SESSION_SECRET`.

## Deployment

- Deployed to Kubernetes on Cloud Platform via GitHub Actions.
- Deployment manifests are in `deploy/production/`.
- CI/CD workflows are in `.github/workflows/`.
