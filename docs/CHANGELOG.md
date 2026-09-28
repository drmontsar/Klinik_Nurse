# Changelog

## 2026-09-28 — Angular migration

- Replaced React/Vite UI with Angular 22.2 standalone components, signals, and forms.
- Retained API/demo repositories, clinical types, NEWS2 preview, existing device storage keys, and Dexie command schema.
- Added fresh-session organization selection, matching-session queue replay, and distinct device-queued versus server-confirmed notices.
- Added Angular production service worker for app assets and updated the deployment artifact path.
- Verified medication confirmation, persisted dose/unit/route, draft reload, incomplete observations, offline replay, and embedded handover in the connected Chrome check.
- Updated runtime, module, handover, and setup documentation.

## 2026-09-25

- Connected the Nurse queue to authenticated platform encounter and task projections.
- Added API patient, task, and vitals repositories with an explicit `/nurse/?demo=1` mode.
- Added single-command observation and medication administration flows with server versions.
- Configured the `/nurse/` base, PWA scope, and gateway-compatible API proxy.

## 2026-03-28

- Created the initial `KliniK Nurse` React/Vite/PWA scaffold.
- Added the first working `Nurse Task Board` screen.
- Added typed clinical models for patients, vitals, nurse tasks, and medication administration.
- Added mock repositories for patients, tasks, and vitals.
- Added browser persistence for nurse tasks and vitals.
- Added NEWS2 calculation with incomplete-vitals protection.
- Added medication confirmation flow, defer flow, and escalate flow.
- Added project documentation: `README.md`, architecture notes, module notes, and handover guide.
- Added `.gitignore` for safe git pushes.
- Added GitHub Pages deployment workflow.
- Updated Vite static-hosting base configuration for page deployment.
- Retuned the UI to a calmer, lighter clinical palette with muted accent colors and softer visual emphasis.
- Replaced the module-heavy hero copy with a nurse-facing `Klinik-N` brand header.
- Consolidated all mock patient seed data into `src/data/patients/mockPatients.ts` while keeping repository usage unchanged.
- Moved the connection status into a compact top-right indicator.
- Reordered the screen to prioritize active tasks and task completion workspace above the patient roster.
- Added a lower-priority ward roster section for quick patient reference after task work.
- Added a queue-first nurse workspace with bottom-tab mobile navigation and a left-rail desktop shell.
- Added a persistent selected-patient context bar to reduce wrong-patient documentation risk.
- Added quick nursing note templates with autosave-by-patient in browser storage.
- Added inline vitals recheck alerts, mobile-friendly numeric inputs, and a `Same as last visit` shortcut.
- Refined filters so queue and patient-roster views stay patient-first instead of showing task-only controls.
- Strengthened the `Klinik-N` wordmark contrast so the header branding reads clearly on the soft background.
- Added active-state highlighting to the selected-patient quick actions so `Open tasks`, `Record vitals`, and `Open notes` visibly track the current view.
