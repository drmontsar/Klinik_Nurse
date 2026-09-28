# Engineer handover

The Nurse frontend is Angular 22.2. The backend remains NestJS and PostgreSQL. All clinical requests cross the HTTP API boundary.

## Read first

- `src/app.component.ts`, `src/app.component.html`: queue, selection, forms, drafts, and handover.
- `src/repositories/api/ApiRepositories.ts`: task projection and structured command payloads.
- `src/services/platformSession.ts`: membership, selected organization, CSRF, and matching-session replay.
- `src/services/offlineQueue.ts`: retained Dexie schema and retry states.
- `src/utils/calculateNEWS2.ts`: local preview; server remains authoritative.
- `src/repositories/mock/`: explicitly selected synthetic demo behavior.

React screens/hooks and the Vite app configuration no longer exist. Read [architecture](ARCHITECTURE.md) and [task board behavior](MODULE_NURSE_TASK_BOARD.md) for current runtime behavior.

## Local commands

Use Node 24.21.0 and pnpm 12.5.1. From this repository:

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm run ui
corepack pnpm run typecheck
corepack pnpm run build
```

Open `http://localhost:8080/nurse/` with the API and gateway running. See [project-wise setup](../../klinik-platform/docs/angular-setup.md). Swagger is separate at `/nurse/docs/`.

## Verified migration behavior

The connected Chrome check in the platform exercises explicit medication confirmation and its persisted dose/unit/route, draft persistence after reload, interrupted observation delivery with queued state and replay, incomplete server NEWS2, and opening embedded handover.

## Practical limits

Nurse notes are unsigned device drafts. Latest device observations in connected mode are held in memory. The offline queue preserves commands but is not a complete offline patient-chart cache. A conflict requiring review is never reported as completed. Future workflow additions should extend the existing API and repository boundary.
