# AGENTS.md

BarberOS is an appointment-booking app for barbershops. Only the backend exists so far; there is no frontend.

## Commands (run from `Backend/`)

```bash
npm install
npm run dev      # tsx watch src/server.ts
npm run build    # tsc -> dist/ (the only typecheck)
npm start        # node dist/server.js
```

- There are no test, lint, or format scripts, and no CI. Don't invent them; verify changes with `npm run build`.
- `.env` is read from the current working directory (`import "dotenv/config"`), so run npm from `Backend/`, not the repo root.

## Current state: mostly scaffolding

- `src/app.ts` only exposes `GET /api/health`. `express.json()` and CORS are commented out — POST bodies are not parsed until you enable that middleware.
- `modules/users/*`, `shared/db/connection.ts`, and every `shared/middleware/*` file are comment-only placeholders describing intended behavior. Implementing a feature means replacing those comments and mounting the router in `app.ts`.
- Env vars are validated with Zod at startup in `src/config/env.ts`; invalid values call `process.exit(1)`. Only `PORT` and `NODE_ENV` exist today.

## Conventions

- One directory per feature under `src/modules/<name>/` with `routes.ts`, `controller.ts`, `service.ts` (HTTP parsing → business logic/DB). Code used by multiple modules goes in `src/shared/`; single-module code stays in that module.
- Middleware order in `app.ts`: routes, then `notFound`, then `errorHandler` last (the 4-arg signature is required).
- In Express 5, async errors propagate automatically; don't add try/catch to every controller.
- Timestamps must be stored in UTC and converted to the shop's timezone only for display/calculation.
- Comments, README, and API error messages are in Spanish; keep new ones consistent.
- `tsconfig` is strict with `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`, and emits CommonJS (`"type": "commonjs"`) despite `module: nodenext` — use extensionless relative imports.

See `README.md` for setup details and the module layout.
