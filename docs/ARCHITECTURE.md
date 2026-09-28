# Nurse architecture

## Runtime

Angular 22.2 standalone `AppComponent` is bootstrapped by `src/main.ts`. Signals hold screen state and computed task/patient selections. Angular forms provide native input validation; global CSS is in `src/styles.css`.

`src/repositories/index.ts` selects API repositories by default or explicit synthetic demo repositories. The existing framework-independent types, clinical calculation, demo data, and repositories remain in use. React components, hooks, entry points, and standalone Vite configuration were removed.

## Connected flow

1. `platformSession.bootstrap()` reads the verified identity and Nurse/Admin membership, selects an authorized organization if necessary, and gets a ward assignment.
2. API repositories load encounters and task projections through the same-origin gateway.
3. Bedside actions send a command UUID and expected server version. Backend authorization, version checks, idempotency, and NEWS2 calculation remain authoritative.
4. UI reports server acceptance, failure, or device-queued state distinctly, then refreshes current projections.

Clinical identities are derived by the server. Demo clinician labels are not trusted authorship.

## Device state

- `OfflineQueue` retains the existing Dexie database `klinik-nurse-<identity>-<organization>-v1` and command schema.
- Pending commands replay on reconnect only when current identity and organization match. HTTP 401/403/409 moves a command to `needs_review`.
- Device note drafts use identity/organization-specific keys in connected mode and the existing draft key in demo mode.
- API-mode last observations are an in-memory convenience, not a replacement for the server chart. Demo repositories retain their existing localStorage records.
- Angular service worker caches the production shell only. It does not cache private API responses. Loading an uncached ward while fully offline still requires a connection.

## Safety rules

Medication confirmation is explicit and resets when selecting a task. Vitals start unrecorded; missing values remain null and an incomplete assessment has no complete NEWS2 score. Drafts are labeled unsigned. Repository failures are shown and do not silently switch to synthetic data.

Handover is a button in the Nurse application backed by the shared session/item/acknowledgment APIs. Acknowledgments name the exact reviewed item version.

## Build boundary

`angular.json` uses the Angular application builder, `/nurse/` base and service worker scope, and port 5173 for development. Production assets are in `dist/klinik-nurse/browser/`. API proxy rules preserve the browser Origin; connected development should use the gateway at port 8080.
