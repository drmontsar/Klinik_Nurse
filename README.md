# KliniK Nurse

KliniK Nurse is the nurse-facing bedside execution surface for the KliniK clinical platform. The current implementation is an offline-friendly, queue-first nurse workspace focused on structured task execution, fast vitals capture, medication confirmation, quick note drafting, and audit-safe defer/escalate actions.

## Current Status

- `Module 1.2 — Nurse Task Board` has started.
- The current app is mock-first and repository-backed.
- The first working slice is built around Ward 3 surgical oncology patients.
- The current patient seed data is consolidated in one file and remains isolated behind repositories for an easier later database swap.
- The main workflow now opens on a nurse queue with a persistent selected-patient context bar and a five-tab workspace shell.

## Tech Stack

- `React 18`
- `TypeScript`
- `Vite`
- `vite-plugin-pwa`
- Inline styles with shared constants in `src/constants/colors.ts`
- Mock repositories plus browser `localStorage` persistence

## Run The Project

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

## Push To Git

The repository is now safe to push as-is. The `.gitignore` excludes dependencies, local build output, editor noise, and local environment files.

Typical first push:

```bash
git init
git add .
git commit -m "Initial KliniK Nurse scaffold"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

## Deploy To GitHub Pages

This repo includes a GitHub Actions workflow at `.github/workflows/deploy-pages.yml`.

After pushing to GitHub:

1. Open the repository on GitHub.
2. Go to `Settings -> Pages`.
3. Under `Build and deployment`, choose `GitHub Actions`.
4. Push to `main` or run the workflow manually from the `Actions` tab.

The workflow will:

- install dependencies with `npm ci`
- build the Vite app
- publish the `dist/` folder to GitHub Pages

Note:

- `vite.config.ts` now uses `base: './'` so the build works safely on static page hosting.
- If you later add client-side routing beyond the single root screen, we should add a dedicated SPA fallback strategy for Pages too.

## Documentation Map

- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md): system shape, data flow, and safety rules
- [`docs/MODULE_NURSE_TASK_BOARD.md`](./docs/MODULE_NURSE_TASK_BOARD.md): nurse task board behavior and module logic
- [`docs/HANDOVER.md`](./docs/HANDOVER.md): what a new engineer should read first
- [`docs/CHANGELOG.md`](./docs/CHANGELOG.md): dated record of structural and product changes
- [`CLAUDE.md`](./CLAUDE.md): product philosophy and engineering rules

## Documentation Rule

Documentation is part of the definition of done in this repository. When behavior, architecture, or workflow logic changes, the matching document in `docs/` must be updated in the same change.
