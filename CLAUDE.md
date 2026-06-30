# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a warehouse management system (система складского учета) for a vitamin/supplement reseller. The codebase is an npm workspace monorepo with five packages:

| Package | Description |
|---|---|
| `server` | Express 5 + MongoDB REST API |
| `web` | React 19 + Vite admin SPA |
| `client` | React Native / Expo mobile app |
| `interfaces` | Shared TypeScript interfaces (consumed by all packages) |
| `config` | Shared constants — doc types, statuses, status-transition rules |
| `sinc` | One-shot CLI tool: reads an Excel file and bulk-imports data via the API |

## Commands

All commands run from the repo root unless noted.

### Development
```bash
npm run server        # Start server in dev mode (tsc-watch + nodemon)
npm run web           # Start Vite dev server for the web SPA
npm run client        # Start Expo (mobile client)
npm run sinc          # Build + run Excel-import tool (requires sinc/.env)
```

### Building
```bash
npm run web:build     # Production build of the web SPA
npm run sinc:build    # Build the sinc CLI tool
```

### Testing
```bash
npm run test:server   # Run server tests with Vitest
npm run test:web      # Run web tests with Vitest
```

Run a single test file:
```bash
cd server && npx vitest run tests/DocService.test.ts
cd web    && npx vitest run test/formatDateTime.test.ts
```

### Linting
```bash
cd web && npm run lint   # ESLint (only the web package has lint configured)
```

## Architecture

### Shared packages (`interfaces/` and `config/`)

These are the backbone of type-safety across the monorepo. Both server and web/client import from them directly via path aliases:
- `@warehouse/interfaces` → `interfaces/index.ts`
- `@warehouse/config` → `config/index.ts`

`config/DocStatus.ts` is especially important: it defines the complete document state machine — allowed status arrays per document type and `STATUS_TRANSITIONS_*` maps that `StatusService` enforces at runtime.

### Server (`server/src/`)

Standard layered architecture: `routes → controllers → services → models`.

Path aliases (defined in `server/tsconfig.json` and mirrored in `server/vitest.config.ts`):
- `@models`, `@controllers`, `@services`, `@routes`, `@middlewares`

**Key design pattern — `StatusService`**: All document status transitions flow through `StatusService.updateStatus()`. This method:
1. Looks up allowed next statuses from `STATUS_TRANSITIONS_*` config.
2. Dispatches to a private handler for the specific doc type.
3. The handler applies side effects (inventory mutations, batch creation, transaction records, account ledger entries) before saving the document.

Reversing any transition (cancelling) explicitly undoes those side effects — batches are deleted, inventory counters are rolled back, transactions are purged.

**Inventory model**: Inventory is tracked per `(batchId, warehouseId)`. Quantities are split into `quantityAvailable` and `quantityReserved`. FIFO ordering is enforced by sorting batches on `expirationDate` before reserving or writing off.

**Document types and their lifecycles**:
- `Incoming` — goods received; on `Delivered`: creates `Batch`, `Inventory`, and `Transaction` records.
- `Outgoing` — goods shipped out; uses `Reserved` → `Shipped` → `Completed` path.
- `OrderOut` — customer order; reservation (`InProgress`) and write-off (`Completed`) are managed by `StatusService`.
- `OrderIn` — supplier order; status changes only (no inventory side-effects yet).
- `Transfer` — inter-warehouse movement; status changes only.

All routes except `/api/auth` require JWT Bearer authentication (`authMiddleware`). The token carries `userId` and `role`; `adminMiddleware` is available for admin-only routes.

**Server env vars required** (`.env` in `server/`):
- `BD_NAME_WAREHOUSE` — MongoDB database name
- `BD_TOKEN` — MongoDB connection string
- `JWT_SECRET` — JWT signing secret
- `PORT` (optional, defaults to 3000)
- `CORS_ORIGINS` (optional, defaults to `http://localhost:5173,http://localhost:3001`)

### Web SPA (`web/src/`)

React Router v7 with data-router pattern (loaders + actions). Route configuration lives in `web/src/routes/routeConfig.tsx`. All protected routes wrap their loaders with `protectedLoader()` from `web/src/utils/auth.ts`, which redirects to `/login` on missing or expired token.

Auth state is stored in `localStorage` (`@auth_token`, `@user`). The `AuthProvider` context (`web/src/component/Screens/AuthScreen/AuthContext.tsx`) manages login/logout.

All API calls go through `web/src/api/fetchApi.ts`, which reads `VITE_SERVER` from the environment to build the base URL `${VITE_SERVER}/api/<endpoint>`. On a 401 response it clears localStorage and navigates to `/login`.

**Web env vars required**:
- `VITE_SERVER` — base URL of the backend (e.g. `http://localhost:3000`)

### Mobile client (`client/src/`)

Expo / React Native app. Navigation uses React Navigation with a drawer + nested stack navigators. State management uses Redux Toolkit (`clientSlice`). Screens mirror the web SPA: Docs, Orders, Clients, Products, Stock.

### Sinc tool (`sinc/src/`)

Reads `../iHerbРасчетЗатрат.xlsx` (relative to `sinc/`), authenticates against the API, then synchronises suppliers, categories (mapped from Excel brands), and products. Failed rows are written to a dated Excel error file. Requires `sinc/.env` with `SINC_EMAIL` and `SINC_PASSWORD`.

## Key Conventions

- **All source is TypeScript with strict mode.** Server uses `"module": "nodenext"` — local imports must include `.js` extensions even for `.ts` files.
- **Interfaces are type-only (`export type *`)**. Never add implementation code to the `interfaces/` package.
- **Status transitions must go through `StatusService.updateStatus()`** — do not mutate `doc.docStatus` directly elsewhere.
- **FIFO inventory allocation**: always sort batches by `expirationDate` ascending before reserving or writing off stock.
- **Tests use Vitest** with `vi.mock('@models', ...)` to stub Mongoose models. Mirror this pattern for new service tests.
- The codebase is primarily in Russian (variable names, comments, UI text). Keep that language for domain-level naming; TypeScript identifiers may be in English.
