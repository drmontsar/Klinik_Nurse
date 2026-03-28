# Architecture

## Purpose

This document explains how the current codebase is structured, how data moves through the app, and which product rules are already enforced in code.

## Core Principles

- Clinical-first workflow: the UI is built around bedside execution, not generic task management.
- Structured data only: vitals, tasks, medication confirmations, and patient context are typed.
- Offline-friendly behavior: the board can continue functioning from browser storage.
- Audit-friendly actions: task completion, defer, and escalate actions append to an audit trail.
- Repository abstraction: screens and hooks do not read mock data directly.

## Current Runtime Flow

1. `src/main.tsx` boots the React app.
2. `src/App.tsx` renders `NurseTaskBoardScreen`.
3. `src/screens/NurseTaskBoardScreen.tsx` composes the module UI.
4. `src/hooks/useNurseTaskBoard.ts` owns loading, filtering, selection, and nurse actions.
5. The hook talks to repositories exported from `src/repositories/index.ts`.
6. The active repositories are currently mock implementations.
7. Mock repositories read from mock data and persist nurse actions to `localStorage`.

## Directory Guide

- `src/components/nurse/`
  Nurse-task-board UI pieces such as filters, cards, detail panel, vitals form, and medication form.
- `src/components/shared/`
  Shared UI primitives such as loading, error, offline, and NEWS2 badges.
- `src/constants/`
  Colors, config, and NEWS2 thresholds.
- `src/data/`
  Mock patients and mock nurse tasks.
- `src/hooks/`
  Board logic and browser online/offline state.
- `src/repositories/`
  Interfaces, implementations, and the repository entry point.
- `src/screens/`
  Screen-level composition. Right now the app has one main screen.
- `src/types/`
  Domain contracts for patients, vitals, tasks, and medication administration.
- `src/utils/`
  Pure functions such as NEWS2 calculation and latency simulation.

## Current Data Sources

### Patients

- Source: `src/data/patients/mockPatients.ts`
- Repository: `MockPatientRepository`
- Current behavior:
  returns a NEWS2-sorted patient list
  supports reading by id
  supports NEWS2 updates after full vitals capture
  keeps all ward patient seed data in one file while preserving the same repository contract for a later real database

### Nurse Tasks

- Source: `src/data/nurseTasks/mockNurseTasks.ts`
- Repository: `MockNurseTaskRepository`
- Current behavior:
  seeds the task board with mock tasks
  persists task status and audit changes to `localStorage`
  sorts tasks by urgency and due time

### Vitals

- Source: browser `localStorage`
- Repository: `MockVitalsRepository`
- Current behavior:
  stores structured vitals entries
  exposes latest vitals by patient
  supports NEWS2 updates in the nurse board flow

## Action Flows

### Start Task

- Triggered from the detail panel when a task is still `pending`
- Repository appends an audit entry with status `in-progress`

### Complete Generic Task

- Used for nursing and investigation follow-up tasks
- Optional note is captured
- Repository appends a `completed` audit entry

### Record Vitals

- Nurse enters only numeric-or-null vitals values
- `calculateNEWS2` validates completeness
- Incomplete vitals do not produce a final NEWS2 score
- Complete vitals are saved
- Patient NEWS2 is updated
- The originating task is marked `completed`

### Administer Medication

- The nurse must explicitly confirm bedside checks
- Medication confirmation is never implicit
- The task is only completed after confirmation

### Defer Or Escalate

- A reason is mandatory
- The task status changes
- An audit entry is appended

## Safety Logic Already Enforced

- NEWS2 cannot silently compute from partial vitals.
- Vitals in app state are numbers or `null`, not arbitrary strings.
- Medication administration requires explicit confirmation.
- Task actions append to an audit trail rather than overwriting history.

## Current Limitations

- Tasks are still seeded from static mock data, not generated from real clinical events.
- There is no authentication flow yet.
- There is no backend sync yet.
- There are no automated tests yet.
- The app is still a single-screen module scaffold.

## Documentation Maintenance

Update this document whenever:

- repository wiring changes
- a new data source is added
- task generation logic changes
- safety-critical logic changes
- a new screen or major module is introduced
