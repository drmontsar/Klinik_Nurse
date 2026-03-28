# Handover Guide

## Read This First

If you are taking over this codebase, read these files in this order:

1. `CLAUDE.md`
2. `README.md`
3. `docs/ARCHITECTURE.md`
4. `docs/MODULE_NURSE_TASK_BOARD.md`
5. `src/hooks/useNurseTaskBoard.ts`
6. `src/screens/NurseTaskBoardScreen.tsx`
7. `src/repositories/index.ts`

## What Exists Today

- A greenfield React/Vite nurse app scaffold
- A first working nurse task board
- Mock surgical oncology patients
- Mock nurse tasks
- Repository-backed data access
- NEWS2 calculation and vitals capture
- Medication confirmation flow
- Defer and escalate actions with audit trail
- PWA build configuration

## What Does Not Exist Yet

- real event-bus driven task generation
- authentication and role isolation
- backend sync
- API repositories
- automated tests
- production deployment

## Most Important Logic To Understand

### The Nurse Board Is Not A Generic Todo App

The current module is shaped around clinical execution. The important logic is not just "display tasks", it is:

- surface the right patient context
- preserve medication confirmation safety
- preserve NEWS2 completeness rules
- preserve auditability when work is deferred or escalated

### The Hook Is The Current Module Brain

`src/hooks/useNurseTaskBoard.ts` is the single most important file in the current module because it coordinates:

- loading
- filters
- task selection
- repository actions
- vitals workflow
- medication workflow

### Repositories Are The Swappable Layer

Do not make screens or hooks read mock data directly. If you bypass repositories, you make the eventual move to local-first sync or backend APIs harder.

## Safe Next Steps

The cleanest next engineering slice is:

1. introduce clinical event types
2. derive nurse tasks from `NoteConfirmed` and `OrderPlaced`
3. keep the current board UI
4. replace static task seeding with projection logic

That keeps the product philosophy intact without rewriting the UI.

## Documentation Update Checklist

When you change code, update documentation in the same change:

- update `README.md` if setup, run commands, or project purpose changed
- update `docs/ARCHITECTURE.md` if the app shape or data flow changed
- update `docs/MODULE_NURSE_TASK_BOARD.md` if nurse workflow changed
- update `docs/CHANGELOG.md` for structural or user-facing changes
- update `CLAUDE.md` build status if module completion status changed

## Practical Commands

```bash
npm install
npm run dev
npm run build
```
